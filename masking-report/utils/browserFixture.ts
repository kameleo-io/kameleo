import { type BrowserSettings, KameleoLocalApiClient, type ProfileResponse, type ProxyChoice } from "@kameleo/local-api-client";
import { type BrowserContext, type BrowserContextOptions, test as base } from "@playwright/test";
import { randomInt } from "crypto";
import path from "path";

import { KAMELEO_PORT, KAMELEO_VERSION, PROXY_PASSWORD, PROXY_USERNAME } from "../config.ts";
import { generateVideoName, isWindows } from "./common.ts";

function getProxy(): ProxyChoice {
    if (!PROXY_USERNAME || !PROXY_PASSWORD) {
        throw new Error("PROXY_USERNAME and PROXY_PASSWORD environment variables must be set");
    }

    const sessionId = Array.from({ length: 6 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[randomInt(0, 36)]).join("");
    return {
        value: "http",
        extra: {
            host: "network.joinmassive.com",
            port: 65534,
            id: `${PROXY_USERNAME}-session-${sessionId}`,
            secret: PROXY_PASSWORD,
        },
    };
}

export interface ConfiguredContextOptions {
    useKameleo?: boolean;
    browserProduct: string;
    osFamily: string;
    deviceType: string;
    browserSettings?: BrowserSettings;
}

export const testWithConfiguredContext = base.extend<ConfiguredContextOptions>({
    deviceType: ["desktop", { option: true }],
    browserProduct: ["chrome", { option: true }],
    osFamily: [isWindows() ? "windows" : "macos", { option: true }],
    browserSettings: [undefined, { option: true }],
    useKameleo: [true, { option: true }],
    context: async ({ playwright, browserProduct, osFamily, deviceType, browserSettings, useKameleo }, use) => {
        // setup
        const kameleoClient = new KameleoLocalApiClient({ basePath: `http://localhost:${KAMELEO_PORT}` });
        let profile: ProfileResponse | undefined;
        let context: BrowserContext;

        const videoSize = { width: 1280, height: 720 };
        const viewportSize = videoSize;
        const commonContextOptions: BrowserContextOptions = {
            recordVideo: { dir: "videos", size: videoSize },
            viewport: viewportSize,
            locale: undefined,
        };

        if (useKameleo) {
            const fingerprints = await kameleoClient.fingerprint.searchFingerprints(deviceType, osFamily, browserProduct);
            profile = await kameleoClient.profile.createProfile({
                fingerprintId: fingerprints[0].id,
                proxy: getProxy(),
            });

            // Kameleo must be started before Playwright attaches to the browser context
            await kameleoClient.profile.startProfile(profile.id, browserSettings);
            const browserWSEndpoint = `ws://localhost:${KAMELEO_PORT}/playwright/${profile.id}`;

            if (browserProduct == "firefox") {
                const pwBridgePath = path.join(
                    `dist/cli/${KAMELEO_VERSION}`,
                    ...(isWindows() ? ["pw-bridge.exe"] : ["Kameleo.app", "Contents", "Resources", "CLI", "pw-bridge"]),
                );

                context = await playwright.firefox.launchPersistentContext("", {
                    ...commonContextOptions,
                    executablePath: pwBridgePath,
                    args: [`-target ${browserWSEndpoint}`],
                });
            } else {
                const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint);
                context = await browser.newContext(commonContextOptions);
            }
        } else {
            // Plain Playwright run without Kameleo (headful for debugging)
            const browserType = browserProduct === "firefox" ? playwright.firefox : playwright.chromium;
            const browser = await browserType.launch({ headless: false });
            context = await browser.newContext(commonContextOptions);
        }

        // execute
        await use(context);

        // teardown
        await context.close();

        if (profile) {
            try {
                await kameleoClient.profile.stopProfile(profile.id);
                await kameleoClient.profile.deleteProfile(profile.id);
            } catch {
                // ignore
            }
        }
    },
    page: async ({ page, browserProduct }, use, testInfo) => {
        // setup
        const video = page.video();

        await page.addInitScript(() => {
            // @ts-expect-error - Playwright binding will cause leak
            delete window.__playwright__binding__;
            // @ts-expect-error - Playwright binding will cause leak
            delete window.__pwInitScripts;
            // @ts-expect-error - Playwright builtins will cause leak
            delete window.__playwright_builtins__;
        });

        // execute
        await use(page);

        // teardown
        if (!page.isClosed()) {
            await page.close();
        }

        if (video) {
            const filename = generateVideoName(testInfo.title, browserProduct);

            await video.saveAs(`videos/${filename}`);
            await video.delete();
        }
    },
});

export { testWithConfiguredContext as test };
export * from "@playwright/test";
