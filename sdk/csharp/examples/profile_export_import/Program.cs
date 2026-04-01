using System;
using System.IO;
using System.Threading.Tasks;
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
if (!int.TryParse(Environment.GetEnvironmentVariable("KAMELEO_PORT"), out var KameleoPort))
{
    KameleoPort = 5050;
}

var client = new KameleoLocalApiClient(new Uri($"http://localhost:{KameleoPort}"));

// Search a fingerprint
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop");

// Create a new profile with recommended settings
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id)
{
    Name = "profile export import example",
};

var profile = await client.Profile.CreateProfileAsync(createProfileRequest);

// export the profile to a given path
var exportPath = Path.Combine(Environment.CurrentDirectory, "test.kameleo");
await client.Profile.ExportProfileAsync(profile.Id, new ExportProfileRequest(exportPath));
Console.WriteLine("Profile has been exported to " + exportPath);

// You have to delete this profile if you want to import back
await client.Profile.DeleteProfileAsync(profile.Id);

// import the profile from the given url
profile = await client.Profile.ImportProfileAsync(
    new ImportProfileRequest(Path.Combine(Environment.CurrentDirectory, "test.kameleo")));

// Start the profile
await client.Profile.StartProfileAsync(profile.Id);

// Wait for 10 seconds
await Task.Delay(10_000);

// Stop the profile
await client.Profile.StopProfileAsync(profile.Id);
