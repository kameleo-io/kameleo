import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import fs from "fs";
import path from "path";
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
    name: "modify request response example",
};

const profile = await client.profile.createProfile(createProfileRequest);

// Start the Kameleo profile and connect with Playwright through CDP
const browserWSEndpoint = `ws://localhost:${kameleoPort}/playwright/${profile.id}`;
const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint);
const context = browser.contexts()[0];
const page = await context.newPage();
const svgBytes = await fs.promises.readFile(path.join(import.meta.dirname, "kameleo.svg"));

// Set up network interceptor, see: https://playwright.dev/docs/network
await page.route("**/*", async (route) => {
    const request = route.request();
    console.log(`[${request.method()}] ${request.url()}`);

    // Redirect from main to French Wikipedia home page
    if (request.url().replace(/\/$/, "") === "https://www.wikipedia.org") {
        console.log("Changing url");
        await route.fulfill({
            status: 302,
            headers: { Location: "https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal" },
        });
        return;
    }

    // Replace Wikipedia's logo with Kameleo's logo
    if (request.url().includes("wikipedia-wordmark-fr.svg")) {
        await route.fulfill({
            status: 200,
            body: svgBytes,
            headers: { "Content-Type": "image/svg+xml" },
        });
        return;
    }

    await route.continue();
});

// Navigate to the main Wikipedia home page and observe that the French one is loaded
await page.goto("https://www.wikipedia.org/");

// Wait for 10 seconds
await setTimeout(10_000);

// Stop the browser by stopping the Kameleo profile
await client.profile.stopProfile(profile.id);
