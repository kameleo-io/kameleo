using System;
using System.Threading.Tasks;
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;
using PuppeteerSharp;

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
if (!int.TryParse(Environment.GetEnvironmentVariable("KAMELEO_PORT"), out var KameleoPort))
{
    KameleoPort = 5050;
}

var client = new KameleoLocalApiClient(new Uri($"http://localhost:{KameleoPort}"));

// Search Chrome fingerprints
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "chrome");

// Create a new profile with recommended settings
// for browser fingerprint protection
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id)
{
    Name = "connect with Puppeteer example",
};

var profile = await client.Profile.CreateProfileAsync(createProfileRequest);

// Start the Kameleo profile and connect through CDP
var browserWsEndpoint = $"ws://localhost:{KameleoPort}/puppeteer/{profile.Id}";
var browser = await Puppeteer.ConnectAsync(new ConnectOptions
{
    BrowserWSEndpoint = browserWsEndpoint,
    DefaultViewport = null
});
var page = await browser.NewPageAsync();

// Use any Puppeteer command to drive the browser
// and enjoy full protection from bot detection products
await page.GoToAsync("https://wikipedia.org");
await page.ClickAsync("[name=search]");
await page.Keyboard.TypeAsync("Chameleon");
await page.Keyboard.PressAsync("Enter");

// Wait for 5 seconds
await Task.Delay(5_000);

// Stop the browser by stopping the Kameleo profile
await client.Profile.StopProfileAsync(profile.Id);
