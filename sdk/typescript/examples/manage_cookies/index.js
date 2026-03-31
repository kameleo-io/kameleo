import { KameleoLocalApiClient } from "@kameleo/local-api-client";
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
    name: "manage cookies example",
};
const profile = await client.profile.createProfile(createProfileRequest);

// Start the Kameleo profile and connect to the profile using WebDriver protocol
const builder = new Builder().usingServer(`http://localhost:${kameleoPort}/webdriver`).withCapabilities({
    "kameleo:profileId": profile.id,
    browserName: "Kameleo",
});
const webdriver = await builder.build();

// Navigate to a site which give you cookies
await webdriver.get("https://www.nytimes.com");
await webdriver.sleep(5000);

await webdriver.get("https://whoer.net");
await webdriver.sleep(5000);

await webdriver.get("https://www.youtube.com");
await webdriver.sleep(5000);

// Stop the profile
await client.profile.stopProfile(profile.id);

// You can list all of your cookies
const cookieList = await client.cookie.listCookies(profile.id);
console.log("The cookies of the profile: ", cookieList);

// You can modify cookie or you can add new
const newCookie = cookieList[0];
newCookie.value = "123";
const cookiesArray = new Array(newCookie);
await client.cookie.addCookies(profile.id, cookiesArray);

// You can delete all cookies of the profile
await client.cookie.deleteCookies(profile.id);
