import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import puppeteer from "puppeteer";
import randomstring from "randomstring";

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
const kameleoPort = process.env["KAMELEO_PORT"] ?? 5050;
const kameleoCliUri = `http://localhost:${kameleoPort}`;

// Initialize the Kameleo client
const client = new KameleoLocalApiClient({
    basePath: kameleoCliUri,
});

// Search Chrome fingerprints
// (Puppeteer won't work with Firefox you can use any Chromium based browser)
const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");

// Create a new profile with recommended settings
// for browser fingerprint protection
/** @type {import("@kameleo/local-api-client").CreateProfileRequest} */
const createProfileRequest = {
    fingerprintId: fingerprints[0].id,
    name: "take screenshot example",
};

const profile = await client.profile.createProfile(createProfileRequest);

// Start the Kameleo profile and connect through CDP
const browserWSEndpoint = `ws://localhost:${kameleoPort}/puppeteer/${profile.id}`;
const browser = await puppeteer.connect({
    browserWSEndpoint,
    defaultViewport: null,
});
const page = await browser.newPage();

// Use any Puppeteer command to drive the browser
// and enjoy full protection from bot detection products
await page.goto("https://en.wikipedia.org/wiki/Special:Random");

const fileName = randomstring.generate({ length: 12, charset: "alphabetic" });

// Take screenshot
await page.screenshot({
    path: `${fileName}.png`,
});

// Stop the browser by stopping the Kameleo profile
await client.profile.stopProfile(profile.id);
