using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Remote;

// This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
if (!int.TryParse(Environment.GetEnvironmentVariable("KAMELEO_PORT"), out var KameleoPort))
{
    KameleoPort = 5050;
}

var client = new KameleoLocalApiClient(new Uri($"http://localhost:{KameleoPort}"));

// Search for a mobile fingerprints
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync("mobile", "ios", "safari");

// Create a new profile with automatic recommended settings
// Choose one of the fingerprints
// Kameleo launches mobile profiles with our Chroma browser
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id)
{
    Name = "automate mobile profiles on desktop example",
};

var profile = await client.Profile.CreateProfileAsync(createProfileRequest);

// Start the profile
await client.Profile.StartProfileAsync(profile.Id, new BrowserSettings()
{
    AdditionalOptions = new List<Preference>
    {
        // This allows you to click on elements using the cursor when emulating a touch screen in the browser.
        // If you leave this out, your script may time out after clicks and fail.
        new Preference("disableTouchEmulation", true),
    }
});

// Connect to the running browser instance using WebDriver
var uri = new Uri($"http://localhost:{KameleoPort}/webdriver");
var opts = new ChromeOptions();
opts.AddAdditionalOption("kameleo:profileId", profile.Id.ToString());
var webdriver = new RemoteWebDriver(uri, opts);
webdriver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(3);

// Use any WebDriver command to drive the browser
// and enjoy full protection from bot detection products
await webdriver.Navigate().GoToUrlAsync("https://wikipedia.org");
webdriver.FindElement(By.Name("search")).SendKeys("Chameleon");
webdriver.FindElement(By.Name("search")).SendKeys(Keys.Enter);
webdriver.FindElement(By.Id("content"));
var title = webdriver.Title;
Console.WriteLine($"The title is {title}");

await Task.Delay(TimeSpan.FromSeconds(5));

// Stop the browser by stopping the Kameleo profile
await client.Profile.StopProfileAsync(profile.Id);
