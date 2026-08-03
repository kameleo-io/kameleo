import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import path from "path";
import { cwd } from "process";
import { setTimeout } from "timers/promises";

// This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
const kameleoPort = process.env["KAMELEO_PORT"] ?? 5050;
const kameleoEngineUri = `http://localhost:${kameleoPort}`;

// Initialize the Kameleo client
const client = new KameleoLocalApiClient({ basePath: kameleoEngineUri });
await client.verifyEngineReady();

// Create a new profile with the default settings (note: the default can change in the future without notice, use it only for quick prototyping)
// You can find the default settings here: https://developer.kameleo.io/tutorials/filtering-fingerprints/
let profile = await client.profile.createProfile();

// export the profile to a given path
const exportPath = path.join(cwd(), "test.kameleo");

await client.profile.exportProfile(profile.id, {
    path: exportPath,
});
console.log("Profile has been exported to " + exportPath);

// You have to delete this profile if you want to import back
await client.profile.deleteProfile(profile.id);

// import the profile from the given url
profile = await client.profile.importProfile({
    path: exportPath,
});

// Start the profile
await client.profile.startProfile(profile.id);

// Wait for 10 seconds
await setTimeout(10_000);

// Stop the profile
await client.profile.stopProfile(profile.id);
