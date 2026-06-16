import {
    type BrowserSettings,
    JunglefoxHelper,
    KameleoLocalApiClient,
    type ProfileResponse,
    type ProxyChoice,
} from "@kameleo/local-api-client";
import { type BrowserContext, type BrowserContextOptions, test as base } from "@playwright/test";
import assert from "assert";
import { randomInt } from "crypto";

import { KAMELEO_PORT, PROXY_PASSWORD, PROXY_USERNAME } from "../config.ts";
import { generateVideoName } from "./common.ts";

function getProxy(): ProxyChoice {
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
    kameleoProxy?: ProxyChoice;
    browserSettings?: BrowserSettings;
}

export const testWithConfiguredContext = base.extend<ConfiguredContextOptions>({
    useKameleo: [true, { option: true }],
    browserProduct: ["chrome", { option: true }],
    osFamily: [process.platform == "win32" ? "windows" : process.platform == "darwin" ? "macos" : "linux", { option: true }],
    deviceType: ["desktop", { option: true }],
    kameleoProxy: [undefined, { option: true }],
    browserSettings: [undefined, { option: true }],
    context: async ({ playwright, browserProduct, osFamily, deviceType, browserSettings, useKameleo, kameleoProxy }, use, testInfo) => {
        // setup
        const kameleoClient = new KameleoLocalApiClient({ basePath: `http://localhost:${KAMELEO_PORT}` });
        let profile: ProfileResponse | undefined;
        let context: BrowserContext;

        const videoSize = { width: 1280, height: 720 };
        const commonContextOptions: BrowserContextOptions = {
            recordVideo: { dir: "videos", size: videoSize },
            // set for video recording here, set to null for the best anti-detect performance
            viewport: videoSize,
            locale: undefined,
        };

        if (useKameleo) {
            const fingerprints = await kameleoClient.fingerprint.searchFingerprints(deviceType, osFamily, browserProduct);
            assert.ok(fingerprints.length > 0, `no fingerprint was found for ${JSON.stringify({ deviceType, osFamily, browserProduct })}`);
            const fingerprintId = fingerprints[0].id;
            console.log(`using fingerprint ${fingerprintId} for test ${testInfo.title} - ${browserProduct} #${testInfo.retry + 1}`);

            profile = await kameleoClient.profile.createProfile({
                fingerprintId: fingerprintId,
                proxy: kameleoProxy ?? getProxy(),
            });

            // Kameleo must be started before Playwright attaches to the browser context
            await kameleoClient.profile.startProfile(profile.id, browserSettings);
            const browserWSEndpoint = `ws://localhost:${KAMELEO_PORT}/playwright/${profile.id}`;

            if (browserProduct == "firefox") {
                context = await playwright.firefox.launchPersistentContext("", {
                    ...commonContextOptions,
                    executablePath: JunglefoxHelper.getBridgePath(),
                    args: JunglefoxHelper.getBridgeArgs(kameleoClient, profile),
                    timeout: 90_000,
                });
            } else {
                const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint, {
                    timeout: 90_000,
                    noDefaults: true,
                });
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
