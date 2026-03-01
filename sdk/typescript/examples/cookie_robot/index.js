import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import randomInteger from "random-int";
import { Builder } from "selenium-webdriver";

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
const kameleoPort = process.env["KAMELEO_PORT"] ?? 5050;
const kameleoCliUri = `http://localhost:${kameleoPort}`;

// Initialize the Kameleo client
const client = new KameleoLocalApiClient({
    basePath: kameleoCliUri,
});

// Search one of the fingerprints
const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "firefox");

// Create a new profile with recommended settings
// Choose one of the fingerprints
/** @type {import("@kameleo/local-api-client").CreateProfileRequest} */
const createProfileRequest = {
    fingerprintId: fingerprints[0].id,
    name: "cookie robot example",
};
const profile = await client.profile.createProfile(createProfileRequest);

// Start the Kameleo profile and connect to the profile using WebDriver protocol
const builder = new Builder().usingServer(`http://localhost:${kameleoPort}/webdriver`).withCapabilities({
    "kameleo:profileId": profile.id,
    browserName: "Kameleo",
});
const webdriver = await builder.build();

const allSites = [
    "instagram.com",
    "linkedin.com",
    "ebay.com",
    "pinterest.com",
    "reddit.com",
    "cnn.com",
    "bbc.co.uk",
    "nytimes.com",
    "reuters.com",
    "theguardian.com",
    "foxnews.com",
];

// Select sites to collect cookies from
/** @type {string[]} */
const sitesToVisit = [];
while (sitesToVisit.length < 5) {
    const site = allSites[randomInteger(allSites.length - 1)];
    if (!sitesToVisit.includes(site)) {
        sitesToVisit.push(site);
    }
}

// Warm up profile by visiting the randomly selected sites
for (const site of sitesToVisit) {
    await webdriver.get(`https://${site}`);
    await webdriver.sleep(randomInteger(5000, 15000));
}

// Stop the profile
await client.profile.stopProfile(profile.id);
