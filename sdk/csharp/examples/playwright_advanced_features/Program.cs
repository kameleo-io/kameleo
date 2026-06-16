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

// Search Chrome fingerprints
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync(browserProduct: "chrome");

// Create a new profile with recommended settings
// for browser fingerprint protection
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id)
{
    Name = "Playwright advanced features example",
};

var profile = await client.Profile.CreateProfileAsync(createProfileRequest);

// Start the Kameleo profile and connect with Playwright through CDP
var browserWsEndpoint = $"ws://localhost:{KameleoPort}/playwright/{profile.Id}";
var playwright = await Playwright.CreateAsync();
var browser = await playwright.Chromium.ConnectOverCDPAsync(browserWsEndpoint, new() { NoDefaults = true, Timeout = 90_000 });

// It is recommended to work on the default context.
// NOTE: We DO NOT recommend using multiple browser contexts, as this might interfere
//       with Kameleo's browser fingerprint modification features.
var context = browser.Contexts[0];
var page = await context.NewPageAsync();

// --- page.AddInitScriptAsync ---
// Init scripts run before any page script executes, on every navigation.
// see: https://playwright.dev/dotnet/docs/api/class-page#page-add-init-script
await page.AddInitScriptAsync("window.customProperty = 'kameleo'");

await page.GotoAsync("https://wikipedia.org");

// --- page.EvaluateAsync ---
// runs a function in the browser context and returns the result to the host application
// see: https://playwright.dev/dotnet/docs/api/class-page#page-evaluate
var customProperty = await page.EvaluateAsync<string>("() => window.customProperty");

Console.WriteLine($"customProperty: {customProperty}"); // kameleo

// --- page.ExposeFunctionAsync ---
// makes a host application function callable from the browser's JavaScript context.
// see: https://playwright.dev/dotnet/docs/api/class-page#page-expose-function
await page.ExposeFunctionAsync("addNumbers", (int a, int b) => a + b);

var pageResult = await page.EvaluateAsync<int>("() => window.addNumbers(7, 3)");

Console.WriteLine($"addNumbers(7, 3): {pageResult}"); // 10

// --- Take a screenshot ---
// see: https://playwright.dev/dotnet/docs/api/class-page#page-screenshot
await page.ScreenshotAsync(new PageScreenshotOptions { Path = "screenshot.png", FullPage = true });
Console.WriteLine("Screenshot saved to: screenshot.png");

// --- Record a video ---
// You can record video by creating a new browser context with the recordVideo option.
// see: https://playwright.dev/dotnet/docs/api/class-browser#browser-new-context-option-record-video
var videoContext = await browser.NewContextAsync(new BrowserNewContextOptions
{
    RecordVideoDir = "videos",
});
var videoPage = await videoContext.NewPageAsync();
await videoPage.GotoAsync("https://wikipedia.org");
await Task.Delay(3_000);
await videoContext.CloseAsync();
var videoPath = await videoPage.Video!.PathAsync();
Console.WriteLine($"Video saved to: {videoPath}");

// Stop the browser by stopping the Kameleo profile
await client.Profile.StopProfileAsync(profile.Id);
