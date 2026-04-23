import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import { test as setup } from "@playwright/test";
import assert from "assert";
import { spawn } from "child_process";
import { existsSync } from "fs";
import { mkdir, rm } from "fs/promises";
import path from "path";
import { setTimeout } from "timers/promises";

import {
    ARTIFACT_URL_OVERRIDES,
    ARTIFACTORY_HOSTNAME,
    ARTIFACTORY_PASSWORD,
    ARTIFACTORY_USERNAME,
    KAMELEO_EMAIL,
    KAMELEO_KERNELS,
    KAMELEO_PASSWORD,
    KAMELEO_PORT,
    KAMELEO_VERBOSE,
    KAMELEO_VERSION,
} from "../config.ts";
import { downloadFile, extractSevenZip, isWindows, runCommand } from "../utils/common.ts";

setup("launch Kameleo CLI", async () => {
    if (process.platform == "linux") {
        await launchKameleoDocker();
    } else {
        await launchKameleoLocal();
    }
    await kameleoHealthcheck();
});

async function launchKameleoLocal(): Promise<void> {
    let artifactUrl =
        `https://${ARTIFACTORY_HOSTNAME}/repository/kamono-releases/` +
        (isWindows() ? `win-x64/${KAMELEO_VERSION}/client-stack-master-win-x64.7z` : `osx-arm64/${KAMELEO_VERSION}/Kameleo-osx-arm64.zip`);
    let artifactDirectoryName = KAMELEO_VERSION;

    if (ARTIFACT_URL_OVERRIDES) {
        const currentPlatform = isWindows() ? "win-x64" : "osx-arm64";
        const matchingArtifact = ARTIFACT_URL_OVERRIDES.find((artifact) => artifact.includes(currentPlatform));
        assert.ok(
            matchingArtifact,
            `No matching artifact for ${currentPlatform} platform in ARTIFACT_URL_OVERRIDES artifacts: ${ARTIFACT_URL_OVERRIDES.toString()}`,
        );
        artifactUrl = matchingArtifact;

        artifactDirectoryName = artifactUrl
            .replaceAll(currentPlatform, "")
            .slice(-30)
            .replace(/[^\w\d-]/g, "-")
            .toLowerCase();
    }

    const artifactsDirectory = "dist/cli";
    const baseDirectory = path.resolve(`${artifactsDirectory}/${artifactDirectoryName}`);
    const cliPath = path.join(
        baseDirectory,
        ...(isWindows() ? ["Kameleo.CLI.exe"] : ["Kameleo.app", "Contents", "Resources", "CLI", "Kameleo.CLI"]),
    );
    const pwBridgePath = path.join(path.dirname(cliPath), isWindows() ? "pw-bridge.exe" : "pw-bridge");

    // Download and extract Kameleo if not already present
    if (!existsSync(cliPath) || !existsSync(pwBridgePath)) {
        const artifactPath = path.resolve(`${artifactsDirectory}/kameleo-artifact`);

        await rm(artifactPath, { force: true });
        await rm(baseDirectory, { force: true, recursive: true });

        await downloadFile(artifactUrl, artifactPath, ARTIFACTORY_USERNAME, ARTIFACTORY_PASSWORD);
        extractSevenZip(artifactPath, baseDirectory);

        await rm(artifactPath, { force: true });

        assert.ok(existsSync(cliPath), `CLI executable not found at ${cliPath}`);
        assert.ok(existsSync(pwBridgePath), `pw-bridge executable not found at ${pwBridgePath}`);
    }

    const kernelOverrides = Object.fromEntries((KAMELEO_KERNELS ?? []).map((kernel, index) => [`KernelOverrides__${index}`, kernel]));

    // Launch Kameleo CLI
    spawn(cliPath, {
        stdio: "inherit",
        shell: true,
        env: {
            EMAIL: KAMELEO_EMAIL,
            PASSWORD: KAMELEO_PASSWORD,
            LISTENINGPORT: KAMELEO_PORT.toString(),
            VERBOSE: KAMELEO_VERBOSE,
            USERDIRECTORYOVERRIDE: baseDirectory,
            ...kernelOverrides,
        },
    });
}

async function launchKameleoDocker(): Promise<void> {
    const kameleoDockerImage = `kameleo/kameleo-app:${KAMELEO_VERSION}`;
    runCommand("docker", ["image", "pull", kameleoDockerImage]);

    // copy pw-bridge from docker image to host
    const pwBridgeDest = path.resolve("dist/linux-pw-bridge");
    if (!existsSync(pwBridgeDest)) {
        await mkdir(path.dirname(pwBridgeDest), { recursive: true });
        const containerId = runCommand("docker", ["create", kameleoDockerImage]).trim();
        try {
            runCommand("docker", ["cp", `${containerId}:/app/pw-bridge`, pwBridgeDest]);
        } finally {
            runCommand("docker", ["rm", containerId]);
        }
    }

    const kernelOverrides = Object.fromEntries((KAMELEO_KERNELS ?? []).map((kernel, index) => [`KernelOverrides__${index}`, kernel]));

    spawn(
        "docker",
        [
            "run",
            "--rm",
            "-p",
            `${KAMELEO_PORT}:5050`,
            "--shm-size=2g",
            "-e",
            `EMAIL=${KAMELEO_EMAIL}`,
            "-e",
            `PASSWORD=${KAMELEO_PASSWORD}`,
            "-e",
            `VERBOSE=${KAMELEO_VERBOSE}`,
            ...Object.entries(kernelOverrides)
                .map(([key, value]) => ["-e", `${key}=${value}`])
                .flat(),
            kameleoDockerImage,
        ],
        { stdio: "inherit" },
    );
}

async function kameleoHealthcheck(): Promise<void> {
    // Wait for Kameleo to start and verify it's running (HTTP 200)
    const kameleoClient = new KameleoLocalApiClient({ basePath: `http://localhost:${KAMELEO_PORT}` });
    const deadline = Date.now() + 30_000;
    let lastError: unknown;

    while (Date.now() < deadline) {
        try {
            await kameleoClient.general.healthcheck();
            return;
        } catch (e) {
            lastError = e;
            await setTimeout(1_000);
        }
    }

    throw new Error(`Kameleo did not start within 30 seconds: ${String(lastError)}`);
}
