using System;
using System.Threading.Tasks;
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
if (!int.TryParse(Environment.GetEnvironmentVariable("KAMELEO_PORT"), out var KameleoPort))
{
    KameleoPort = 5050;
}

var client = new KameleoLocalApiClient(new Uri($"http://localhost:{KameleoPort}"));

// Search Chrome fingerprints
// Possible deviceType value: desktop, mobile
// Possible browserProduct value: chrome, firefox, edge, ...
// Possible osFamily values: windows, macos, linux, android, ios
// Examples of browserVersion values that limit the major version of the fingeprint: 135, >134, ...
// You can use empty parameters as well, Kameleo provides recent and varied fingerprints by default
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync("desktop", "windows", "chrome", ">134");

Console.WriteLine("Available fingerprints:");
foreach (var fingerprint in fingerprints)
{
    Console.WriteLine(
        $"{fingerprint.Os.Family} {fingerprint.Os.VarVersion} - {fingerprint.Browser.Product} {fingerprint.Browser.VarVersion}");
}

// Select a fingerprint
var selectedFingerprint = fingerprints[0];

Console.WriteLine(
    $"Selected fingerprint: {selectedFingerprint.Os.Family} {selectedFingerprint.Os.VarVersion} - " +
    $"{selectedFingerprint.Browser.Product} {selectedFingerprint.Browser.VarVersion}");

// Create a new profile with recommended settings using the selected Chrome fingerprints
// You can setup here all of the profile options like WebGL, password manager and start page
var createProfileRequest = new CreateProfileRequest(selectedFingerprint.Id)
{
    Name = "create profile example",
    Language = "es-ES",
    Webgl = WebglSpoofingType.Noise,
    WebglMeta = new(WebglMetaSpoofingType.Manual,
        new WebglMetaSpoofingOptions("Google Inc.", "ANGLE (Intel(R) HD Graphics 630 Direct3D11 vs_5_0 ps_5_0)")),
    PasswordManager = PasswordManagerType.Enabled,
    StartPage = "https://kameleo.io",
};

var profile = await client.Profile.CreateProfileAsync(createProfileRequest);

Console.WriteLine($"Id of the created profile: {profile.Id}");

// Start the profile
await client.Profile.StartProfileAsync(profile.Id);

// Wait for 10 seconds
await Task.Delay(10_000);

// Stop the profile
await client.Profile.StopProfileAsync(profile.Id);

// Duplicate the previously created profile
var duplicatedProfile = await client.Profile.DuplicateProfileAsync(profile.Id);

Console.WriteLine($"Profile '{duplicatedProfile.Name}' is created");

// Change every property that you want to update on the duplicated profile
// Send the update request and the response will be your updated profile
var updateProfileRequest = new UpdateProfileRequest()
{
    Name = "duplicate profile example",
    WebglMeta = new WebglMetaChoice(WebglMetaSpoofingType.Automatic)
};

// Send the update request and the response will be your updated profile
duplicatedProfile = await client.Profile.UpdateProfileAsync(duplicatedProfile.Id, updateProfileRequest);

// Start the profile
await client.Profile.StartProfileAsync(duplicatedProfile.Id);

// Wait for 10 seconds
await Task.Delay(10_000);

// Stop the profile
await client.Profile.StopProfileAsync(duplicatedProfile.Id);

// Delete original profile
// Profiles need to be deleted explicitly becase they are persisted so they are available after restarting Kameleo
await client.Profile.DeleteProfileAsync(profile.Id);
