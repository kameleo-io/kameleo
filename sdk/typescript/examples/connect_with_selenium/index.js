import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import { Builder, By, Key, until } from "selenium-webdriver";

// This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
const kameleoPort = process.env["KAMELEO_PORT"] ?? 5050;
const kameleoEngineUri = `http://localhost:${kameleoPort}`;

// Initialize the Kameleo client
const client = new KameleoLocalApiClient({ basePath: kameleoEngineUri });
await client.verifyEngineReady();

// Search one of the fingerprints
const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");

// Create a new profile with recommended settings
// Choose one of the fingerprints
/** @type {import("@kameleo/local-api-client").CreateProfileRequest} */
const createProfileRequest = {
    fingerprintId: fingerprints[0].id,
    name: "connect with Selenium example",
};

const profile = await client.profile.createProfile(createProfileRequest);

// Start the Kameleo profile and connect using WebDriver protocol
const builder = new Builder().usingServer(`${kameleoEngineUri}/webdriver`).withCapabilities({
    "kameleo:profileId": profile.id,
    browserName: "Kameleo",
});
const driver = await builder.build();

// Use any WebDriver command to drive the browser
// and enjoy full protection from bot detection products
await driver.get("https://wikipedia.org");
await driver.findElement(By.name("search")).sendKeys("Chameleon", Key.ENTER);
await driver.wait(until.elementLocated(By.id("content")));
const title = await driver.getTitle();
console.log(`The title is ${title}`);

// Wait for 5 seconds
await driver.sleep(5_000);

// Stop the browser by stopping the Kameleo profile
await client.profile.stopProfile(profile.id);
