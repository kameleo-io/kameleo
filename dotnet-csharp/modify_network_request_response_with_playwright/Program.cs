using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Playwright;
using System.Collections.Generic;

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
    Name = "modify request response example",
};

var profile = await client.Profile.CreateProfileAsync(createProfileRequest);

// Start the Kameleo profile and connect with Playwright through CDP
var browserWsEndpoint = $"ws://localhost:{KameleoPort}/playwright/{profile.Id}";
var playwright = await Playwright.CreateAsync();
var browser = await playwright.Chromium.ConnectOverCDPAsync(browserWsEndpoint);
var context = browser.Contexts[0];
var page = await context.NewPageAsync();
var svgBytes = File.ReadAllBytes("kameleo.svg");

// Set up network interceptor, see: https://playwright.dev/dotnet/docs/network
await page.RouteAsync("**/*", async route =>
{
    var request = route.Request;
    Console.WriteLine($"[{request.Method}] {request.Url}");

    // Redirect from main to French Wikipedia home page
    if (request.Url.TrimEnd('/') == "https://www.wikipedia.org")
    {
        Console.WriteLine("Changing url");
        await route.FulfillAsync(new RouteFulfillOptions
        {
            Status = 302,
            Headers = new Dictionary<string, string> { { "Location", "https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal" } }
        });
        return;
    }

    // Replace Wikipedia's logo with Kameleo's logo
    if (request.Url.Contains("wikipedia-wordmark-fr.svg"))
    {
        await route.FulfillAsync(new RouteFulfillOptions
        {
            Status = 200,
            BodyBytes = svgBytes,
            Headers = new Dictionary<string, string> { { "Content-Type", "image/svg+xml" } }
        });
        return;
    }

    await route.ContinueAsync();
});

// Navigate to the main Wikipedia home page and observe that the French one is loaded
await page.GotoAsync("https://www.wikipedia.org/");

await Task.Delay(10_000);

// Stop the browser by stopping the Kameleo profile
await client.Profile.StopProfileAsync(profile.Id);
