import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import { test as setup } from "@playwright/test";

import { kameleo } from "../config.ts";

setup("terminate Kameleo Engine", async () => {
    if (kameleo.engineAlreadyRunning) return;

    const kameleoClient = new KameleoLocalApiClient({ basePath: `http://localhost:${kameleo.port}` });
    await kameleoClient.general.terminateApplication();
});
