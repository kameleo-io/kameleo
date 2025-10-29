/* eslint-disable @typescript-eslint/no-require-imports */
const { KameleoLocalApiClient } = require("@kameleo/local-api-client");
const { setTimeout } = require("timers/promises");

void (async () => {
    // This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
    const kameleoPort = process.env["KAMELEO_PORT"] ?? 5050;

    const client = new KameleoLocalApiClient({
        basePath: `http://localhost:${kameleoPort}`,
    });

    // Search Chrome fingerprints
    const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");

    // Create a new profile with recommended settings
    /** @type {import("@kameleo/local-api-client").CreateProfileRequest} */
    const createProfileRequest = {
        fingerprintId: fingerprints[0].id,
        name: "CommonJS example",
        startPage: "https://kameleo.io",
    };
    const profile = await client.profile.createProfile(createProfileRequest);

    // Start the profile
    await client.profile.startProfile(profile.id);

    // Wait for 10 seconds
    await setTimeout(10_000);

    // Stop the profile
    await client.profile.stopProfile(profile.id);
})();
