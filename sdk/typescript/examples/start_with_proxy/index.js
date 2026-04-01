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
const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");

// Create a new profile with recommended settings
// Choose one of the Chrome fingerprints
/** @type {import("@kameleo/local-api-client").CreateProfileRequest} */
const createProfileRequest = {
    fingerprintId: fingerprints[0].id,
    name: "start with proxy example",
    proxy: {
        value: "socks5",
        extra: {
            host: process.env["PROXY_HOST"] ?? "<your_proxy_host>",
            port: Number(process.env["PROXY_PORT"] ?? 1080),
            id: process.env["PROXY_USERNAME"] ?? "<your_username>",
            secret: process.env["PROXY_PASSWORD"] ?? "<your_password>",
        },
    },
};
const profile = await client.profile.createProfile(createProfileRequest);

// Start the profile
await client.profile.startProfile(profile.id);

// Wait for 10 seconds
await setTimeout(10_000);

// Stop the profile
await client.profile.stopProfile(profile.id);
