import dotenv from "dotenv";
import path from "path";

import { env, envNumberOptional, envOptional } from "./utils/common.ts";

dotenv.config({ path: path.resolve(import.meta.dirname, ".env"), quiet: true });

// Core settings
export const KAMELEO_VERSION = envOptional("KAM_VERSION") ?? "5.1.0";
export const KAMELEO_PORT = envNumberOptional("KAM_PORT") ?? 5050;
export const KAMELEO_VERBOSE = envOptional("KAM_VERBOSE") ?? "1";
export const KAMELEO_KERNELS = envOptional("KAM_KERNELS_OVERRIDE")
    ?.split(/[,;\s]+/)
    .map((kernel) => kernel.trim());
export const KAMELEO_ENGINE_ALREADY_RUNNING = !!envOptional("ENGINE_ALREADY_RUNNING");

// Credentials
export const KAMELEO_PAT = env("KAM_PAT");

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
