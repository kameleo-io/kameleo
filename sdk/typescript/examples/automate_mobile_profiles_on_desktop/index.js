import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import { Builder, By, Key, until } from "selenium-webdriver";

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
const kameleoPort = process.env["KAMELEO_PORT"] ?? 5050;
const kameleoCliUri = `http://localhost:${kameleoPort}`;

// Initialize the Kameleo client
const client = new KameleoLocalApiClient({
    basePath: kameleoCliUri,
});

// Search for mobile fingerprints that match specific criteria
// In this example, we are looking for iOS mobile profiles with Safari browser
const fingerprints = await client.fingerprint.searchFingerprints("mobile", "ios", "safari");

// Create a new profile with automatic recommended settings
// Choose one of the fingerprints
// Kameleo launches mobile profiles with our Chroma browser
/** @type {import("@kameleo/local-api-client").CreateProfileRequest} */
const createProfileRequest = {
    fingerprintId: fingerprints[0].id,
    name: "automate mobile profiles on desktop example",
};
const profile = await client.profile.createProfile(createProfileRequest);

// Start the newly created profile
// We disable touch emulation so that we can click on elements when emulating a mobile profile
await client.profile.startProfile(profile.id, {
    additionalOptions: [
        {
            key: "disableTouchEmulation",
            value: true,
        },
    ],
});

// Build the WebDriver for automating the mobile profile
// Configure it to use Kameleo WebDriver server
const builder = new Builder().usingServer(`${kameleoCliUri}/webdriver`).withCapabilities({
    "kameleo:profileId": profile.id,
    browserName: "Kameleo",
});
const webdriver = await builder.build();

// Automate the browser to perform a Wikipedia search and print the page title
await webdriver.get("https://wikipedia.org");
await webdriver.findElement(By.name("search")).sendKeys("Chameleon", Key.ENTER);
await webdriver.wait(until.elementLocated(By.id("content")));
const title = await webdriver.getTitle();
console.log(`The title is ${title}`);

// Wait for 5 seconds
await webdriver.sleep(5000);

// Stop the browser by stopping the Kameleo profile
await client.profile.stopProfile(profile.id);
