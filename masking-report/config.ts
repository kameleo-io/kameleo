import dotenv from "dotenv";
import path from "path";

import { env, envNumberOptional, envOptional } from "./utils/common.ts";

dotenv.config({ path: path.resolve(import.meta.dirname, ".env"), quiet: true });

export const kameleo = {
    // Core settings
    get version(): string {
        return envOptional("KAM_VERSION") ?? "5.1.0";
    },
    get port(): number {
        return envNumberOptional("KAM_PORT") ?? 5050;
    },
    get verbose(): string {
        return envOptional("KAM_VERBOSE") ?? "1";
    },
    get kernelOverrides(): string[] | undefined {
        return envOptional("KAM_KERNELS_OVERRIDE")
            ?.split(/[,;\s]+/)
            .map((kernel) => kernel.trim());
    },
    get engineAlreadyRunning(): boolean {
        return !!envOptional("ENGINE_ALREADY_RUNNING");
    },
    // credentials
    get pat(): string {
        return env("KAM_PAT");
    },
};

// Proxy
export const proxy = {
    get username(): string {
        return env("PROXY_USERNAME");
    },
    get password(): string {
        return env("PROXY_PASSWORD");
    },
};

// Artifactory / Nexus
export const artifactory = {
    get hostname(): string {
        return env("ARTIFACTORY_HOSTNAME");
    },
    get repository(): string {
        return env("ARTIFACTORY_REPOSITORY");
    },
    get username(): string {
        return env("ARTIFACTORY_USERNAME");
    },
    get password(): string {
        return env("ARTIFACTORY_PASSWORD");
    },
    get urlOverrides(): string[] | undefined {
        return envOptional("ARTIFACT_URL_OVERRIDES")
            ?.split(/[,;\s]+/)
            .map((artifact) => artifact.trim());
    },
};

// Playwright runtime settings
export const playwright = {
    get retries(): number {
        return envNumberOptional("PW_RETRIES") ?? (process.env.CI ? 2 : 0);
    },
    get workers(): number {
        return envNumberOptional("PW_WORKERS") ?? (process.env.CI ? 4 : 1);
    },
};
