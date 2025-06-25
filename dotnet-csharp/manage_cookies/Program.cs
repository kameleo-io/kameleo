using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Remote;

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
if (!int.TryParse(Environment.GetEnvironmentVariable("KAMELEO_PORT"), out var KameleoPort))
{
    KameleoPort = 5050;
}

var client = new KameleoLocalApiClient(new Uri($"http://localhost:{KameleoPort}"));

// Search a fingerprint
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "chrome");

// Create a new profile with recommended settings
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id)
{
    Name = "manage cookies example",
};

var profile = await client.Profile.CreateProfileAsync(createProfileRequest);

// Start the Kameleo profile and connect to it using WebDriver protocol
var uri = new Uri($"http://localhost:{KameleoPort}/webdriver");
var opts = new FirefoxOptions();
opts.AddAdditionalOption("kameleo:profileId", profile.Id.ToString());
var webdriver = new RemoteWebDriver(uri, opts);


// Navigate to a site which give you cookies
await webdriver.Navigate().GoToUrlAsync("https://www.nytimes.com");
await Task.Delay(5_000);

await webdriver.Navigate().GoToUrlAsync("https://whoer.net");
await Task.Delay(5_000);

await webdriver.Navigate().GoToUrlAsync("https://www.youtube.com");
await Task.Delay(5_000);

// Stop the profile
await client.Profile.StopProfileAsync(profile.Id);

// You can list all of your cookies
var cookieList = await client.Cookie.ListCookiesAsync(profile.Id);
Console.WriteLine("The cookies of the profile: ");
foreach (var cookie in cookieList)
{
    Console.WriteLine($"{cookie.Domain}, {cookie.Path}, {cookie.Name}");
}

// You can modify cookie or you can add new
var newCookie = cookieList[0];
newCookie.Value = "123";
var cookiesArray = new List<CookieRequest> { new CookieRequest(newCookie) };
await client.Cookie.AddCookiesAsync(profile.Id, cookiesArray);

// You can delete all cookies of the profile
await client.Cookie.DeleteCookiesAsync(profile.Id);
