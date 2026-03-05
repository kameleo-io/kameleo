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
const browserWSEndpoint = `ws://localhost:${kameleoPort}/playwright/${profile.id}`;

// The Playwright framework is not designed to connect to already running
// browsers. To overcome this limitation, a tool bundled with Kameleo, named
// pw-bridge will bridge the communication gap between the running Firefox
// instance and this playwright script.
// The exact path to the bridge executable is subject to change
let pwBridgePath = process.env["PW_BRIDGE_PATH"];
if (!pwBridgePath && process.platform === "win32") {
    pwBridgePath = `${process.env["LOCALAPPDATA"]}\\Programs\\Kameleo\\pw-bridge.exe`;
} else if (!pwBridgePath && process.platform === "darwin") {
    pwBridgePath = "/Applications/Kameleo.app/Contents/Resources/CLI/pw-bridge";
}

const context = await playwright.firefox.launchPersistentContext("", {
    executablePath: pwBridgePath,
    args: [`-target ${browserWSEndpoint}`],
    viewport: null,
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
