import dotenv from "dotenv";
import path from "path";

import { env, envNumberOptional, envOptional } from "./utils/common.ts";

dotenv.config({ path: path.resolve(import.meta.dirname, ".env"), quiet: true });

// Core settings
export const KAMELEO_VERSION = envOptional("KAM_VERSION") ?? "4.4.0";
export const KAMELEO_PORT = envNumberOptional("KAM_PORT") ?? 5051;
export const KAMELEO_VERBOSE = envOptional("KAM_VERBOSE");
export const KAMELEO_KERNELS = envOptional("KAM_KERNELS_OVERRIDE")
    ?.split(/[,;\s]+/)
    .map((kernel) => kernel.trim());

// Credentials
export const KAMELEO_EMAIL = env("KAM_EMAIL");
export const KAMELEO_PASSWORD = env("KAM_PASSWORD");

// Proxy
export const PROXY_USERNAME = env("PROXY_USERNAME");
export const PROXY_PASSWORD = env("PROXY_PASSWORD");

// Artifactory / Nexus
export const ARTIFACTORY_HOSTNAME = env("ARTIFACTORY_HOSTNAME");
export const ARTIFACTORY_USERNAME = env("ARTIFACTORY_USERNAME");
export const ARTIFACTORY_PASSWORD = env("ARTIFACTORY_PASSWORD");
export const ARTIFACT_URL_OVERRIDES = envOptional("ARTIFACT_URL_OVERRIDES")
    ?.split(/[,;\s]+/)
    .map((artifact) => artifact.trim());

// Playwright runtime settings
export const PLAYWRIGHT_RETRIES = envNumberOptional("PW_RETRIES") ?? (process.env.CI ? 2 : 0);
export const PLAYWRIGHT_WORKERS = envNumberOptional("PW_WORKERS") ?? (process.env.CI ? 4 : 1);
