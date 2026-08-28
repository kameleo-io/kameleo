import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import { test as setup } from "@playwright/test";
import assert from "assert";
import { spawn } from "child_process";
import { existsSync } from "fs";
import { rm } from "fs/promises";
import path from "path";
import { setTimeout } from "timers/promises";

import { artifactory, kameleo } from "../config.ts";
import { downloadFile, extractSevenZip, isWindows, runCommand } from "../utils/common.ts";

setup("launch Kameleo Engine", async () => {
    if (kameleo.engineAlreadyRunning) {
        // nothing to do
    } else if (process.platform === "linux") {
        await launchKameleoDocker();
    } else {
        await launchKameleoLocal();
    }
    await kameleoHealthcheck();
});

async function launchKameleoLocal(): Promise<void> {
    let artifactUrl =
        `https://${artifactory.hostname}/repository/kamono-releases/` +
        (isWindows() ? `win-x64/${kameleo.version}/client-stack-master-win-x64.7z` : `osx-arm64/${kameleo.version}/Kameleo-osx-arm64.zip`);
    let artifactDirectoryName = kameleo.version;

    if (artifactory.urlOverrides) {
        const currentPlatform = isWindows() ? "win-x64" : "osx-arm64";
        const matchingArtifact = artifactory.urlOverrides.find((artifact) => artifact.includes(currentPlatform));
        assert.ok(
            matchingArtifact,
            `No matching artifact for ${currentPlatform} platform in ARTIFACT_URL_OVERRIDES artifacts: ${artifactory.urlOverrides.toString()}`,
        );
        artifactUrl = matchingArtifact;

        artifactDirectoryName = artifactUrl
            .replaceAll(currentPlatform, "")
            .slice(-30)
            .replace(/[^\w\d-]/g, "-")
            .toLowerCase();
    }

    const artifactsDirectory = "dist/engine";
    const baseDirectory = path.resolve(`${artifactsDirectory}/${artifactDirectoryName}`);
    const enginePath = path.join(
        baseDirectory,
        ...(isWindows() ? ["Kameleo.Engine.exe"] : ["Kameleo.app", "Contents", "Resources", "Engine", "Kameleo.Engine"]),
    );

    // Download and extract Kameleo if not already present
    if (!existsSync(enginePath)) {
        const artifactPath = path.resolve(`${artifactsDirectory}/kameleo-artifact`);

        await rm(artifactPath, { force: true });
        await rm(baseDirectory, { force: true, recursive: true });

        await downloadFile(artifactUrl, artifactPath, artifactory.username, artifactory.password);
        extractSevenZip(artifactPath, baseDirectory);

        await rm(artifactPath, { force: true });

        assert.ok(existsSync(enginePath), `Engine executable not found at ${enginePath}`);
    }

    const kernelOverrides = Object.fromEntries(
        (kameleo.kernelOverrides ?? []).map((kernel, index) => [`KernelOverrides__${index}`, kernel]),
    );

    // Launch the Kameleo Engine
    spawn(enginePath, {
        stdio: "inherit",
        shell: true,
        env: {
            PAT: kameleo.pat,
            LISTENINGPORT: kameleo.port.toString(),
            VERBOSE: kameleo.verbose,
            USERDIRECTORYOVERRIDE: baseDirectory,
            ...kernelOverrides,
        },
    });
}

// see: https://developer.kameleo.io/integrations/docker/
// eslint-disable-next-line @typescript-eslint/require-await
async function launchKameleoDocker(): Promise<void> {
    const kameleoDockerImage = `kameleo/kameleo-app:${kameleo.version}`;
    runCommand("docker", ["image", "pull", kameleoDockerImage]);

    const kernelOverrides = Object.fromEntries(
        (kameleo.kernelOverrides ?? []).map((kernel, index) => [`KernelOverrides__${index}`, kernel]),
    );

    spawn(
        "docker",
        [
            "run",
            "--rm",
            "-v",
            "kameleo-data:/data",
            "-p",
            `${kameleo.port}:5050`,
            "--shm-size=2g",
            "-e",
            `PAT=${kameleo.pat}`,
            "-e",
            `VERBOSE=${kameleo.verbose}`,
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
    const kameleoClient = new KameleoLocalApiClient({ basePath: `http://localhost:${kameleo.port}` });
    const deadline = Date.now() + 30_000;
    let lastError: unknown;

    while (Date.now() < deadline) {
        try {
            await kameleoClient.general.healthcheck();
            await kameleoClient.verifyEngineReady();
            return;
        } catch (e) {
            lastError = e;
            await setTimeout(1_000);
        }
    }

    throw new Error(`Kameleo did not start within 30 seconds: ${String(lastError)}`);
}
