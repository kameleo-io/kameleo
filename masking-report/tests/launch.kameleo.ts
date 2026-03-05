import { test as setup } from "@playwright/test";
import assert from "assert";
import { spawn } from "child_process";
import { existsSync } from "fs";
import { rm } from "fs/promises";
import path from "path";
import { setTimeout } from "timers/promises";

import {
    ARTIFACTORY_HOSTNAME,
    ARTIFACTORY_PASSWORD,
    ARTIFACTORY_USERNAME,
    KAMELEO_EMAIL,
    KAMELEO_PASSWORD,
    KAMELEO_PORT,
    KAMELEO_VERBOSE,
    KAMELEO_VERSION,
} from "../config.ts";
import { downloadFile, extractSevenZip, httpRequest, isWindows } from "../utils/common.ts";

setup("launch Kameleo CLI", async () => {
    const baseDirectory = path.resolve(`dist/cli/${KAMELEO_VERSION}`);

    const cliPath = path.join(
        baseDirectory,
        ...(isWindows() ? ["Kameleo.CLI.exe"] : ["Kameleo.app", "Contents", "Resources", "CLI", "Kameleo.CLI"]),
    );
    const pwBridgePath = path.join(path.dirname(cliPath), isWindows() ? "pw-bridge.exe" : "pw-bridge");

    // Download and extract Kameleo if not already present
    if (!existsSync(cliPath) || !existsSync(pwBridgePath)) {
        assert.ok(ARTIFACTORY_HOSTNAME, "ARTIFACTORY_HOSTNAME environment variable is required");

        const artifactUrl =
            `https://${ARTIFACTORY_HOSTNAME}/repository/kamono-releases/` +
            (isWindows()
                ? `win-x64/${KAMELEO_VERSION}/client-stack-master-win-x64.7z`
                : `osx-arm64/${KAMELEO_VERSION}/Kameleo-osx-arm64.zip`);
        const artifactPath = path.resolve("dist/kameleo-artifact");

        await rm(artifactPath, { force: true });
        await rm(baseDirectory, { force: true, recursive: true });

        await downloadFile(artifactUrl, artifactPath, ARTIFACTORY_USERNAME, ARTIFACTORY_PASSWORD);
        extractSevenZip(artifactPath, baseDirectory);

        await rm(artifactPath, { force: true });

        assert.ok(existsSync(cliPath), `CLI executable not found at ${cliPath}`);
        assert.ok(existsSync(pwBridgePath), `pw-bridge executable not found at ${pwBridgePath}`);
    }

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
        },
    });

    // Wait for Kameleo to start and verify it's running (HTTP 200)
    const healthcheckUrl = `http://localhost:${KAMELEO_PORT}/general/healthcheck`;
    const deadline = Date.now() + 30_000;
    let lastError: unknown;

    while (Date.now() < deadline) {
        try {
            await httpRequest(healthcheckUrl);
            lastError = undefined;
            break;
        } catch (e) {
            lastError = e;
            await setTimeout(1_000);
        }
    }

    if (lastError) {
        throw new Error(`Kameleo did not start within 30 seconds: ${String(lastError)}`);
    }
});
