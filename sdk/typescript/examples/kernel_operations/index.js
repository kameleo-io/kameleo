import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import { setTimeout } from "timers/promises";

// This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
const kameleoPort = process.env["KAMELEO_PORT"] ?? 5050;
const kameleoEngineUri = `http://localhost:${kameleoPort}`;

// Initialize the Kameleo client
const client = new KameleoLocalApiClient({ basePath: kameleoEngineUri });
await client.verifyEngineReady();

// Create a new profile with the default settings (note: the default can change in the future without notice, use it only for quick prototyping)
// You can find the default settings here: https://developer.kameleo.io/tutorials/filtering-fingerprints/
const profile = await client.profile.createProfile();
console.log(`New default profile has been created: [${profile.id}] '${profile.name}'`);

// Install the kernel that best suits the profile's fingerprint, downloading it if it's not already available locally
const kernel = await client.profile.installProfileKernel(profile.id);
console.log(`Kernel '${kernel.browser}' ${kernel.version} for ${kernel.platform} is installed`);

// Start the profile: since the kernel is already installed, the browser launches immediately
await client.profile.startProfile(profile.id);

// Wait for 5 seconds
await setTimeout(5_000);

// Stop the profile
await client.profile.stopProfile(profile.id);

// List all the kernels known to the Engine
const kernels = await client.kernel.listKernels();
console.log(`Kernels available on the server: ${kernels.length}`);

// Remove the kernel that we have just installed for the profile from the local file system
// Note: there might be multiple installed kernels, so we rely on the id returned by installProfileKernel instead of picking one from the list
await client.kernel.removeKernel(kernel.id);
console.log(`Kernel '${kernel.browser}' ${kernel.version} for ${kernel.platform} is removed`);

// Start the profile again
// Since the kernel has just been removed, the Engine has to download and install it implicitly before launching the browser,
// so this start procedure takes noticeably longer than the previous one
await client.profile.startProfile(profile.id);

// Wait for 5 seconds
await setTimeout(5_000);

// Stop the profile
await client.profile.stopProfile(profile.id);
