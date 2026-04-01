using System;
using System.Linq;
using System.Threading.Tasks;
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
if (!int.TryParse(Environment.GetEnvironmentVariable("KAMELEO_PORT"), out var KameleoPort))
{
    KameleoPort = 5050;
}

var client = new KameleoLocalApiClient(new Uri($"http://localhost:{KameleoPort}"));

// Search for a Desktop fingerprint with Windows OS and Chrome browser
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync("desktop", "windows", "chrome");

// Find a fingerprint with the oldest available version of chrome
var fingerprint = fingerprints.OrderBy(preview => preview.Browser.Major).First();

// Create a new profile with recommended settings
// Choose one of the fingerprints
var createProfileRequest = new CreateProfileRequest(fingerprint.Id)
{
    Name = "upgrade profiles example",
};

var profile = await client.Profile.CreateProfileAsync(createProfileRequest);

Console.WriteLine(
    $"Profile's browser before update is: {profile.Fingerprint.Browser.Product} {profile.Fingerprint.Browser.VarVersion}");

// The fingerprint’s browser version will be updated if there is any available on our servers
profile = await client.Profile.UpgradeProfileKernelAsync(profile.Id);
Console.WriteLine(
    $"Profile's browser after update is: {profile.Fingerprint.Browser.Product} {profile.Fingerprint.Browser.VarVersion}");

// Start the profile
await client.Profile.StartProfileAsync(profile.Id);

// Wait for 5 seconds
await Task.Delay(5_000);

// Stop the profile
await client.Profile.StopProfileAsync(profile.Id);
