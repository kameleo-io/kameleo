using System;
using System.Threading.Tasks;
using Kameleo.LocalApiClient;

// This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
if (!int.TryParse(Environment.GetEnvironmentVariable("KAMELEO_PORT"), out var KameleoPort))
{
    KameleoPort = 5050;
}

var client = new KameleoLocalApiClient(new Uri($"http://localhost:{KameleoPort}"));
await client.VerifyEngineReadyAsync();

// Create a new profile with the default settings (note: the default can change in the future without notice, use it only for quick prototyping)
// You can find the default settings here: https://developer.kameleo.io/tutorials/filtering-fingerprints/
var profile = await client.Profile.CreateProfileAsync();
Console.WriteLine($"New default profile has been created: [{profile.Id}] {profile.Name}");

// Install the kernel that best suits the profile's fingerprint, downloading it if it's not already available locally
var kernel = await client.Profile.InstallProfileKernelAsync(profile.Id);
Console.WriteLine($"Kernel '{kernel.Browser}' {kernel.VarVersion} for {kernel.Platform} is installed");

// Start the profile: since the kernel is already installed, the browser launches immediately
await client.Profile.StartProfileAsync(profile.Id);

// Wait for 5 seconds
await Task.Delay(5_000);

// Stop the profile
await client.Profile.StopProfileAsync(profile.Id);

// List all the kernels known to the Engine
var kernels = await client.Kernel.ListKernelsAsync();
Console.WriteLine($"Kernels available on the server: {kernels.Count}");

// Remove the kernel that we have just installed for the profile from the local file system
await client.Kernel.RemoveKernelAsync(kernel.Id);
Console.WriteLine($"Kernel '{kernel.Browser}' {kernel.VarVersion} for {kernel.Platform} is removed");

// Start the profile again
// Since the kernel has just been removed, the Engine has to download and install it implicitly before launching the browser,
// so this start procedure takes noticeably longer than the previous one
await client.Profile.StartProfileAsync(profile.Id);

// Wait for 5 seconds
await Task.Delay(5_000);

// Stop the profile
await client.Profile.StopProfileAsync(profile.Id);
