import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import { setTimeout } from "timers/promises";

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
const kameleoPort = process.env["KAMELEO_PORT"] ?? 5050;
const kameleoCliUri = `http://localhost:${kameleoPort}`;

// Initialize the Kameleo client
const client = new KameleoLocalApiClient({
    basePath: kameleoCliUri,
});

// Search for a Desktop fingerprint with Windows OS and Chrome browser
const fingerprints = await client.fingerprint.searchFingerprints("desktop", "windows", "chrome");

// Find a fingerprint with the oldest available version of chrome
const fingerprint = fingerprints.sort((a, b) => (a.browser.major > b.browser.major ? 1 : -1))[0];

// Create a new profile with recommended settings
// Choose one of the fingerprints
/** @type {import("@kameleo/local-api-client").CreateProfileRequest} */
const createProfileRequest = {
    fingerprintId: fingerprint.id,
    name: "upgrade profiles example",
};
let profile = await client.profile.createProfile(createProfileRequest);

console.log(`Profile's browser before update is: ${profile.fingerprint.browser.product} ${profile.fingerprint.browser.version}`);

// The fingerprint’s browser version will be updated if there is any available on our servers
const upgradedProfile = await client.profile.upgradeProfileKernel(profile.id);
if (!upgradedProfile) {
    throw new Error("Update unsuccessful");
}
profile = upgradedProfile;
console.log(`Profile's browser after update is: ${profile.fingerprint.browser.product} ${profile.fingerprint.browser.version}`);

// Start the profile
await client.profile.startProfile(profile.id);

// Wait for 5 seconds
await setTimeout(5_000);

// Stop the profile
await client.profile.stopProfile(profile.id);
