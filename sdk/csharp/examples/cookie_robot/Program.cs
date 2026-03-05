using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Remote;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
if (!int.TryParse(Environment.GetEnvironmentVariable("KAMELEO_PORT"), out var KameleoPort))
{
    KameleoPort = 5050;
}

var client = new KameleoLocalApiClient(new Uri($"http://localhost:{KameleoPort}"));

// Search a fingerprint
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "firefox");

// Create a new profile with recommended settings
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id)
{
    Name = "cookie robot example",
};

var profile = await client.Profile.CreateProfileAsync(createProfileRequest);

// Start the Kameleo profile and connect to it using WebDriver protocol
var uri = new Uri($"http://localhost:{KameleoPort}/webdriver");
var opts = new FirefoxOptions();
opts.AddAdditionalOption("kameleo:profileId", profile.Id.ToString());
var webdriver = new RemoteWebDriver(uri, opts);

var allSites = new List<string>
{
    "instagram.com",
    "linkedin.com",
    "ebay.com",
    "pinterest.com",
    "reddit.com",
    "cnn.com",
    "bbc.co.uk",
    "nytimes.com",
    "reuters.com",
    "theguardian.com",
    "foxnews.com"
};

// Select sites to collect cookies from
var sitesToVisit = new List<string>();
while (sitesToVisit.Count < 5)
{
    var rndIndex = Random.Shared.Next(0, allSites.Count - 1);
    var site = allSites[rndIndex];

    if (!sitesToVisit.Contains(site))
    {
        sitesToVisit.Add(site);
    }
}

// Warm up profile by visiting the randomly selected sites
foreach (var site in sitesToVisit)
{
    // Navigate to the site
    await webdriver.Navigate().GoToUrlAsync($"https://{site}");

    // Wait for some random time
    await Task.Delay(Random.Shared.Next(5_000, 15_000));
}

// Stop the profile
await client.Profile.StopProfileAsync(profile.Id);
