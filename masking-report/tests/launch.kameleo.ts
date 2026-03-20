import { test as setup } from "@playwright/test";
import assert from "assert";
import { spawn } from "child_process";
import { existsSync } from "fs";
import { rm } from "fs/promises";
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
import { downloadFile, extractSevenZip, httpRequest, isWindows } from "../utils/common.ts";

setup("launch Kameleo CLI", async () => {
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

    // Wait for Kameleo to start and verify it's running (HTTP 200)
    const healthcheckUrl = `http://localhost:${KAMELEO_PORT}/general/healthcheck`;
    const deadline = Date.now() + 30_000;
    let lastError: unknown;

    while (Date.now() < deadline) {
        try {
            await httpRequest(healthcheckUrl);
            return;
        } catch (e) {
            lastError = e;
            await setTimeout(1_000);
        }
    }

    throw new Error(`Kameleo did not start within 30 seconds: ${String(lastError)}`);
});
