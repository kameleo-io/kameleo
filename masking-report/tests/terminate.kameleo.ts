import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import { test as setup } from "@playwright/test";
import path from "path";

import { KAMELEO_PORT, KAMELEO_VERSION } from "../config.ts";
import { runCommand } from "../utils/common.ts";

setup("terminate Kameleo CLI", async () => {
    const kameleoClient = new KameleoLocalApiClient({ basePath: `http://localhost:${KAMELEO_PORT}` });
    await kameleoClient.general.terminateApplication();

    if (process.platform == "linux") {
        runCommand("docker", [
            "run",
            "--rm",
            "--entrypoint",
            "sh",
            "-v",
            `${path.resolve("dist/docker-data")}:/data`,
            "--user",
            "1001",
            `kameleo/kameleo-app:${KAMELEO_VERSION}`,
            "-c",
            "'rm -rf /data/*'",
        ]);
    }
});
