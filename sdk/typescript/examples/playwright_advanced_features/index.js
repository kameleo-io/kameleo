import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import playwright from "playwright";
import { setTimeout } from "timers/promises";

// This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
const kameleoPort = process.env["KAMELEO_PORT"] ?? 5050;
const kameleoEngineUri = `http://localhost:${kameleoPort}`;

// Initialize the Kameleo client
const client = new KameleoLocalApiClient({ basePath: kameleoEngineUri });
await client.verifyEngineReady();

// Search Chrome fingerprints
const fingerprints = await client.fingerprint.searchFingerprints(undefined, undefined, "chrome");

// Create a new profile with recommended settings
// for browser fingerprint protection
/** @type {import("@kameleo/local-api-client").CreateProfileRequest} */
const createProfileRequest = {
    fingerprintId: fingerprints[0].id,
    name: "Playwright advanced features example",
};

const profile = await client.profile.createProfile(createProfileRequest);

// Start the Kameleo profile and connect with Playwright through CDP
const browserWSEndpoint = `ws://localhost:${kameleoPort}/playwright/${profile.id}`;
const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint, { noDefaults: true, timeout: 90_000 });

// It is recommended to work on the default context.
// NOTE: We DO NOT recommend using multiple browser contexts, as this might interfere
//       with Kameleo's browser fingerprint modification features.
const context = browser.contexts()[0];
const page = await context.newPage();

// --- page.addInitScript ---
// Init scripts run before any page script executes, on every navigation.
// see: https://playwright.dev/docs/api/class-page#page-add-init-script
// @ts-expect-error - custom property
await page.addInitScript(() => (window.customProperty = "kameleo"));

await page.goto("https://wikipedia.org");

// --- page.evaluate ---
// runs a function in the browser context and returns the result to the host application
// see: https://playwright.dev/docs/api/class-page#page-evaluate
// @ts-expect-error - custom property
// eslint-disable-next-line
const customProperty = await page.evaluate(() => window.customProperty);

console.log("customProperty:", customProperty); // kameleo

// --- page.exposeFunction ---
// makes a host application function callable from the browser's JavaScript context.
// see: https://playwright.dev/docs/api/class-page#page-expose-function
await page.exposeFunction("addNumbers", (/**@type {number}*/ a, /**@type {number}*/ b) => a + b);

// @ts-expect-error - custom exposed function
// eslint-disable-next-line
const pageResult = await page.evaluate(() => window.addNumbers(7, 3));

console.log("addNumbers(7, 3):", pageResult); // 10

// --- Take a screenshot ---
// see: https://playwright.dev/docs/api/class-page#page-screenshot
await page.screenshot({ path: "screenshot.png", fullPage: true });
console.log("Screenshot saved to: screenshot.png");

// --- Record a video ---
// You can record video by creating a new browser context with the recordVideo option.
// see: https://playwright.dev/docs/api/class-browser#browser-new-context-option-record-video
const videoContext = await browser.newContext({ recordVideo: { dir: "videos" } });
const videoPage = await videoContext.newPage();
await videoPage.goto("https://wikipedia.org");
await setTimeout(3_000);
await videoContext.close();
const videoPath = await videoPage.video()?.path();
console.log("Video saved to:", videoPath);

// Stop the browser by stopping the Kameleo profile
await client.profile.stopProfile(profile.id);
