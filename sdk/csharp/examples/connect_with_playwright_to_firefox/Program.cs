using System;
using System.Threading.Tasks;
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;
using Microsoft.Playwright;

// This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
if (!int.TryParse(Environment.GetEnvironmentVariable("KAMELEO_PORT"), out var KameleoPort))
{
    KameleoPort = 5050;
}

var client = new KameleoLocalApiClient(new Uri($"http://localhost:{KameleoPort}"));
await client.VerifyEngineReadyAsync();

// Search Firefox fingerprints
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "firefox");

// Create a new profile with recommended settings
// for browser fingerprint protection
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id)
{
    Name = "connect with Playwright to Firefox example",
};

var profile = await client.Profile.CreateProfileAsync(createProfileRequest);

// Start the Kameleo profile and connect with Playwright

// The Playwright framework can't connect to an already running Firefox instance directly.
// The Kameleo SDK provides an executable (pw-bridge) that bridges this gap,
// allowing Playwright to control the browser launched by Kameleo.
var playwright = await Playwright.CreateAsync();
var context = await playwright.Firefox.LaunchPersistentContextAsync("", new BrowserTypeLaunchPersistentContextOptions
{
    ExecutablePath = JunglefoxHelper.GetBridgePath(),
    Args = JunglefoxHelper.GetBridgeArgs(client, profile),
    ViewportSize = ViewportSize.NoViewport,
    Timeout = 90_000,
});

// Kameleo will open the a new page in the default browser context.
// NOTE: We DO NOT recommend using multiple browser contexts, as this might interfere
//       with Kameleo's browser fingerprint modification features.
var page = await context.NewPageAsync();

// Use any Playwright command to drive the browser
// and enjoy full protection from bot detection products
await page.GotoAsync("https://wikipedia.org");
await page.ClickAsync("[name=search]");
await page.Keyboard.TypeAsync("Chameleon");
await page.Keyboard.PressAsync("Enter");

// Wait for 5 seconds
await Task.Delay(5_000);

// Stop the browser by stopping the Kameleo profile
await client.Profile.StopProfileAsync(profile.Id);
