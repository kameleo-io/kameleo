import { defineConfig } from "@playwright/test";

import { PLAYWRIGHT_RETRIES, PLAYWRIGHT_WORKERS } from "./config.ts";
import type { ConfiguredContextOptions } from "./utils/browserFixture.ts";

/** @see https://playwright.dev/docs/test-configuration */
export default defineConfig<ConfiguredContextOptions>({
    testDir: "./tests",
    outputDir: "dist/test-results",
    fullyParallel: true,
    timeout: 120_000,
    forbidOnly: !!process.env.CI,
    retries: PLAYWRIGHT_RETRIES,
    workers: PLAYWRIGHT_WORKERS,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ["list"],
        ["html", { outputFolder: "dist/playwright-report", open: process.env.CI ? "never" : "always" }],
        ["junit", { outputFile: "dist/test-result.xml" }],
        ["json", { outputFile: "dist/test-result.json" }],
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        video: "on",
        actionTimeout: 15_000,
    },

    // see ConfiguredContextOptions for custom options
    projects: [
        // global setup & teardown
        {
            name: "launch Kameleo Engine",
            retries: 0,
            testMatch: "launch.kameleo.ts",
            teardown: "terminate Kameleo Engine",
        },
        {
            name: "terminate Kameleo Engine",
            testMatch: "terminate.kameleo.ts",
        },
        // actual browser tests
        {
            name: "Chroma",
            dependencies: ["launch Kameleo Engine"],
            use: { browserProduct: "chrome" },
        },
        {
            name: "Junglefox",
            dependencies: ["launch Kameleo Engine"],
            use: { browserProduct: "firefox" },
        },
        {
            name: "Chromium",
            testIgnore: ["launch.kameleo.ts", "terminate.kameleo.ts"],
            retries: 0,
            use: {
                channel: "chrome",
                useKameleo: false,
                browserProduct: "chromium",
            },
        },
    ],
});
