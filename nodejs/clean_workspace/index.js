import { KameleoLocalApiClient } from "@kameleo/local-api-client";

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
const kameleoPort = process.env["KAMELEO_PORT"] ?? 5050;
const kameleoCliUri = `http://localhost:${kameleoPort}`;

// Initialize the Kameleo client
const client = new KameleoLocalApiClient({
    basePath: kameleoCliUri,
});

const profiles = await client.profile.listProfiles();

for (const profile of profiles) {
    console.log(profile.name);
    await client.profile.deleteProfile(profile.id);
}

console.log(`${profiles.length} profiles deleted.`);
