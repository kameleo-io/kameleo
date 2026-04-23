import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import { test as setup } from "@playwright/test";

import { KAMELEO_PORT } from "../config.ts";

setup("terminate Kameleo CLI", async () => {
    const kameleoClient = new KameleoLocalApiClient({ basePath: `http://localhost:${KAMELEO_PORT}` });
    await kameleoClient.general.terminateApplication();
});
