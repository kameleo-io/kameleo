import { test as setup } from "@playwright/test";

import { KAMELEO_PORT } from "../config.ts";
import { httpRequest } from "../utils/common.ts";

setup("terminate Kameleo CLI", async () => {
    await httpRequest(`http://localhost:${KAMELEO_PORT}/general/terminate`, "POST");
});
