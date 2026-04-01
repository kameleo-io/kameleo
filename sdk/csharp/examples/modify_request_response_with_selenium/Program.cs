using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Remote;
using System;
using System.IO;
using System.Threading.Tasks;

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

// Start the Kameleo profile and connect using WebDriver protocol
var uri = new Uri($"http://localhost:{KameleoPort}/webdriver");
var opts = new ChromeOptions();
opts.AddAdditionalOption("kameleo:profileId", profile.Id.ToString());
var webdriver = new RemoteWebDriver(uri, opts);

// Set up network interceptor
var interceptor = webdriver.Manage().Network;
interceptor.NetworkRequestSent += Interceptor_NetworkRequestSent;
interceptor.NetworkResponseReceived += Interceptor_NetworkResponseReceived;

// Redirect from main to French Wikipedia home page
interceptor.AddRequestHandler(new NetworkRequestHandler
{
    RequestMatcher = request => request.Url?.Trim('/') == "https://www.wikipedia.org",
    RequestTransformer = request =>
    {
        Console.WriteLine("Changing url");
        request.Url = "https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal";
        return request;
    }
});

var svgBytes = File.ReadAllBytes("kameleo.svg");

// Replace Wikipedia's logo with Kameleo's logo
interceptor.AddRequestHandler(new NetworkRequestHandler
{
    RequestMatcher = request => request.Url?.Contains("wikipedia-wordmark-fr.svg") ?? false,
    ResponseSupplier = request =>
    {
        var response = new HttpResponseData
        {
            StatusCode = 200,
            Content = new HttpResponseContent(svgBytes),
            Url = request.Url,
            RequestId = request.RequestId
        };
        response.Headers.Add("Content-Type", "image/svg+xml");

        return response;
    }
});

await interceptor.StartMonitoring();

// Navigate to the main Wikipedia home page and observe that the French one is loaded
await webdriver.Navigate().GoToUrlAsync("https://www.wikipedia.org/");

await Task.Delay(10_000);

await interceptor.StopMonitoring();

// Stop the browser by stopping the Kameleo profile
await client.Profile.StopProfileAsync(profile.Id);

void Interceptor_NetworkRequestSent(object sender, NetworkRequestSentEventArgs e)
     => Console.WriteLine($"[{e.RequestMethod}] {e.RequestUrl}");

void Interceptor_NetworkResponseReceived(object sender, NetworkResponseReceivedEventArgs e)
    => Console.WriteLine($"[{e.ResponseStatusCode}] {e.ResponseUrl}");
