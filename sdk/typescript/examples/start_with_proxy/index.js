import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import { setTimeout } from "timers/promises";

// This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
const kameleoPort = process.env["KAMELEO_PORT"] ?? 5050;
const kameleoEngineUri = `http://localhost:${kameleoPort}`;

// Initialize the Kameleo client
const client = new KameleoLocalApiClient({ basePath: kameleoEngineUri });
await client.verifyEngineReady();

// Search Chrome fingerprints
const fingerprints = await client.fingerprint.searchFingerprints(undefined, undefined, "chrome");

/** @type {import("@kameleo/local-api-client").ProxyChoice} */
const proxy = {
    value: "socks5",
    extra: {
        host: process.env["PROXY_HOST"] ?? "<your_proxy_host>",
        port: Number(process.env["PROXY_PORT"] ?? 1080),
        id: process.env["PROXY_USERNAME"] ?? "<your_username>",
        secret: process.env["PROXY_PASSWORD"] ?? "<your_password>",
    },
};

// Create a new profile with recommended settings
// Choose one of the Chrome fingerprints
/** @type {import("@kameleo/local-api-client").CreateProfileRequest} */
const createProfileRequest = {
    fingerprintId: fingerprints[0].id,
    name: "start with proxy example",
    proxy,
};
// Optional: test the proxy settings before creating a profile with them. Skip this step if you do not need it.
// An unusable proxy comes back as a 503 error response, so the call throws instead of returning a result.
try {
    const proxyTest = await client.general.testProxy({ proxy });
    console.log(`Proxy test result: ${proxyTest.result}`);
    for (const step of proxyTest.steps) {
        console.log(`  ${step.successful ? "OK  " : "FAIL"} ${step.name}${step.successful ? "" : ` (${step.comment})`}`);
    }
} catch {
    console.log("Proxy test failed, this proxy is not usable.");
}

const profile = await client.profile.createProfile(createProfileRequest);

// Optional: test the proxy stored on the profile, without sending the credentials again. Skip this step if you do not need it.
try {
    const profileProxyTest = await client.profile.testProfileProxy(profile.id);
    console.log(`Profile proxy test result: ${profileProxyTest.result}`);
} catch {
    console.log("Profile proxy test failed, this proxy is not usable.");
}

// Start the profile
await client.profile.startProfile(profile.id);

// Wait for 10 seconds
await setTimeout(10_000);

// Stop the profile
await client.profile.stopProfile(profile.id);
