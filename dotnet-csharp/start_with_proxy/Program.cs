using System;
using System.Threading.Tasks;
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
if (!int.TryParse(Environment.GetEnvironmentVariable("KAMELEO_PORT"), out var KameleoPort))
{
    KameleoPort = 5050;
}

// Read proxy settings from environment variables or from code
var proxyHost = Environment.GetEnvironmentVariable("PROXY_HOST") ?? "<your_proxy_host>";
var proxyUsername = Environment.GetEnvironmentVariable("PROXY_USERNAME") ?? "<your_username>";
var proxyPassword = Environment.GetEnvironmentVariable("PROXY_PASSWORD") ?? "<your_password>";
if (!int.TryParse(Environment.GetEnvironmentVariable("PROXY_PORT"), out var proxyPort))
{
    proxyPort = 1080;
}

var client = new KameleoLocalApiClient(new Uri($"http://localhost:{KameleoPort}"));

// Search Firefox fingerprints
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync("desktop", null, "firefox");

// Create a new profile with recommended settings
// Choose one of the Firefox fingerprints
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id)
{
    Name = "start with proxy example",
    Proxy = new(ProxyConnectionType.Socks5, new Server(proxyHost, proxyPort, proxyUsername, proxyPassword))
};

var profile = await client.Profile.CreateProfileAsync(createProfileRequest);

// Start the profile
await client.Profile.StartProfileAsync(profile.Id);

// Wait for 10 seconds
await Task.Delay(10_000);

// Stop the profile
await client.Profile.StopProfileAsync(profile.Id);
