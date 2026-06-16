import { JunglefoxHelper, KameleoLocalApiClient } from "@kameleo/local-api-client";
import playwright from "playwright";
import { setTimeout } from "timers/promises";

// This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
const kameleoPort = process.env["KAMELEO_PORT"] ?? 5050;
const kameleoEngineUri = `http://localhost:${kameleoPort}`;

// Initialize the Kameleo client
const client = new KameleoLocalApiClient({ basePath: kameleoEngineUri });
await client.verifyEngineReady();

// Search Firefox fingerprints
const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "firefox");

// Create a new profile with recommended settings
// for browser fingerprint protection
/** @type {import("@kameleo/local-api-client").CreateProfileRequest} */
const createProfileRequest = {
    fingerprintId: fingerprints[0].id,
    name: "connect with Playwright to Firefox example",
};

const profile = await client.profile.createProfile(createProfileRequest);

// Start the Kameleo profile and connect with Playwright

// The Playwright framework can't connect to an already running Firefox instance directly.
// The Kameleo SDK provides an executable (pw-bridge) that bridges this gap,
// allowing Playwright to control the browser launched by Kameleo.
const context = await playwright.firefox.launchPersistentContext("", {
    executablePath: JunglefoxHelper.getBridgePath(),
    args: JunglefoxHelper.getBridgeArgs(client, profile),
    viewport: null,
    timeout: 90_000,
});

// Kameleo will open the a new page in the default browser context.
// NOTE: We DO NOT recommend using multiple browser contexts, as this might interfere
//       with Kameleo's browser fingerprint modification features.
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
