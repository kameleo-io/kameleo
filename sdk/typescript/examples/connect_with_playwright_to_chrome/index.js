import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import playwright from "playwright";
import { setTimeout } from "timers/promises";

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
const kameleoPort = process.env["KAMELEO_PORT"] ?? 5050;
const kameleoCliUri = `http://localhost:${kameleoPort}`;

// Initialize the Kameleo client
const client = new KameleoLocalApiClient({
    basePath: kameleoCliUri,
});

// Search Chrome fingerprints
const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");

// Create a new profile with recommended settings
// for browser fingerprint protection
/** @type {import("@kameleo/local-api-client").CreateProfileRequest} */
const createProfileRequest = {
    fingerprintId: fingerprints[0].id,
    name: "connect with Playwright to Chrome example",
};

const profile = await client.profile.createProfile(createProfileRequest);

// Start the Kameleo profile and connect with Playwright through CDP
const browserWSEndpoint = `ws://localhost:${kameleoPort}/playwright/${profile.id}`;
const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint);

// It is recommended to work on the default context.
// NOTE: We DO NOT recommend using multiple browser contexts, as this might interfere
//       with Kameleo's browser fingerprint modification features.
const context = browser.contexts()[0];
const page = await context.newPage();

// Use any Playwright command to drive the browser
// and enjoy full protection from bot detection products
await page.goto("https://wikipedia.org");
await page.click("[name=search]");
await page.keyboard.type("Chameleon");
await page.keyboard.press("Enter");

// Wait for 5 seconds
await setTimeout(5_000);

// Stop the browser by stopping the Kameleo profile
await client.profile.stopProfile(profile.id);
