import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import { setTimeout } from "timers/promises";

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
const kameleoPort = process.env["KAMELEO_PORT"] ?? 5050;
const kameleoCliUri = `http://localhost:${kameleoPort}`;

// Initialize the Kameleo client
const client = new KameleoLocalApiClient({
    basePath: kameleoCliUri,
});

// Search Chrome fingerprints
// Possible deviceType value: desktop, mobile
// Possible browserProduct value: chrome, firefox, edge, ...
// Possible osFamily values: windows, macos, linux, android, ios
// Examples of browserVersion values that limit the major version of the fingeprint: 135, >134, ...
// You can use empty parameters as well, Kameleo provides recent and varied fingerprints by default
const fingerprints = await client.fingerprint.searchFingerprints("desktop", "windows", "chrome", ">134");

// Create a new profile with recommended settings
// Choose one of the Chrome fingerprints
// You can setup here all of the profile options like WebGL, password manager and start page
/** @type {import("@kameleo/local-api-client").CreateProfileRequest} */
const createProfileRequest = {
    fingerprintId: fingerprints[0].id,
    name: "create profile example",
    language: "es-ES",
    webgl: "noise",
    webglMeta: {
        value: "manual",
        extra: {
            vendor: "Google Inc.",
            renderer: "ANGLE (Intel(R) HD Graphics 630 Direct3D11 vs_5_0 ps_5_0)",
        },
    },
    passwordManager: "enabled",
    startPage: "https://kameleo.io",
};
const profile = await client.profile.createProfile(createProfileRequest);

// Start the profile
await client.profile.startProfile(profile.id);

// Wait for 10 seconds
await setTimeout(10_000);

// Stop the profile
await client.profile.stopProfile(profile.id);

let duplicatedProfile = await client.profile.duplicateProfile(profile.id);
console.log(`Profile '${duplicatedProfile.name}' is just created`);

// Change every property that you want to update on the duplicated profile
// Send the update request and the response will be your updated profile
duplicatedProfile = await client.profile.updateProfile(duplicatedProfile.id, {
    name: "duplicate profile example",
});

// Start the profile
await client.profile.startProfile(duplicatedProfile.id);

// Wait for 10 seconds
await setTimeout(10_000);

// Stop the profile
await client.profile.stopProfile(duplicatedProfile.id);

// Delete original profile
// Profiles need to be deleted explicitly becase they are persisted so they are available after restarting Kameleo
await client.profile.deleteProfile(profile.id);
