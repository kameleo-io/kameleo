import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import { test as setup } from "@playwright/test";

import { KAMELEO_ENGINE_ALREADY_RUNNING, KAMELEO_PORT } from "../config.ts";

setup("terminate Kameleo Engine", async () => {
    if (KAMELEO_ENGINE_ALREADY_RUNNING) return;

    const kameleoClient = new KameleoLocalApiClient({ basePath: `http://localhost:${KAMELEO_PORT}` });
    await kameleoClient.general.terminateApplication();
});
