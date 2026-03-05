using System;
using System.Collections.Generic;
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
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "chrome");

// Create a new profile with recommended settings
// Choose one of the Chrome fingerprints
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id)
{
    Name = "start browser with additional options example",
};

var profile = await client.Profile.CreateProfileAsync(createProfileRequest);

// Provide additional settings for the webdriver when starting the browser
// Use this command to customize the browser process by adding command-line arguments
//  like '--mute-audio' or '--start-maximized'
//  or modify the native profile settings when starting the browser

// start the browser with the --mute-audio command line argument
await client.Profile.StartProfileAsync(profile.Id, new BrowserSettings
{
    Arguments = new List<string> { "mute-audio" }
});

// Wait for 10 seconds
await Task.Delay(10_000);

// Stop the profile
await client.Profile.StopProfileAsync(profile.Id);

// start the browser with an additional Selenum option
await client.Profile.StartProfileAsync(profile.Id, new BrowserSettings
{
    AdditionalOptions = new List<Preference> { new("pageLoadStrategy", "eager") }
});

// Wait for 10 seconds
await Task.Delay(10_000);

// Stop the profile
await client.Profile.StopProfileAsync(profile.Id);

// start the browser and also set a Chrome preference
await client.Profile.StartProfileAsync(profile.Id, new BrowserSettings
{
    Preferences = new List<Preference> { new("profile.managed_default_content_settings.images", 2), }
});

// Wait for 10 seconds
await Task.Delay(10_000);

// Stop the profile
await client.Profile.StopProfileAsync(profile.Id);
