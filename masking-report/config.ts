import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(import.meta.dirname, ".env"), quiet: true });

const env = (key: string): string | undefined => {
    const trimmed = process.env[key]?.trim();
    return trimmed === "" ? undefined : trimmed;
};

const requiredEnv = (key: string): string => {
    const value = env(key);
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};

const envNumber = (key: string, fallback: number): number => {
    const value = env(key);
    if (value) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
};

// Core settings
export const KAMELEO_VERSION = env("KAM_VERSION") ?? "4.2.1";
export const KAMELEO_PORT = envNumber("KAM_PORT", 5051);
export const KAMELEO_VERBOSE = env("KAM_VERBOSE");

// Credentials
export const KAMELEO_EMAIL = requiredEnv("KAM_EMAIL");
export const KAMELEO_PASSWORD = requiredEnv("KAM_PASSWORD");

// Proxy
export const PROXY_USERNAME = requiredEnv("PROXY_USERNAME");
export const PROXY_PASSWORD = requiredEnv("PROXY_PASSWORD");

// Artifactory / Nexus
export const ARTIFACTORY_HOSTNAME = requiredEnv("ARTIFACTORY_HOSTNAME");
export const ARTIFACTORY_USERNAME = requiredEnv("ARTIFACTORY_USERNAME");
export const ARTIFACTORY_PASSWORD = requiredEnv("ARTIFACTORY_PASSWORD");

// Playwright runtime settings
export const PLAYWRIGHT_RETRIES = envNumber("PW_RETRIES", process.env.CI ? 2 : 0);
export const PLAYWRIGHT_WORKERS = envNumber("PW_WORKERS", process.env.CI ? 6 : 1);
