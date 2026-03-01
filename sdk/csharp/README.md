# Kameleo Local API Client

With [Kameleo](https://kameleo.io), you can easily create multiple virtual browser profiles to work with multiple accounts. It helps you hide your actual timezone, geolocation, language, IP address and creates natural browser fingerprints to prevent detection by anti-bot systems. Kameleo is compatible with [Selenium](https://www.selenium.dev/), [Playwright](https://playwright.dev/), and [Puppeteer](https://pptr.dev/) frameworks for automating web scraping tasks. This .NET Standard package provides convenient access to the [Local API](https://app.swaggerhub.com/apis/kameleo-team/kameleo-local-api/) REST interface of the Kameleo Client. See the [article](https://developer.kameleo.io/getting-started/quickstart/) in our knowledge base for Getting Started with Kameleo Automation.

## Features

- Stay completely undetected, so websites won't be able to detect that you are using automation tools
- Start unlimited number of profiles with different natural browser fingerprints
- Use authenticated HTTP/SOCKS/SSH proxies in browsers
- Create isolated browsing environments simultaneously
- Use real browser profiles of Chrome, Firefox, Safari and Edge
- Edit, Import or Export browser cookies
- Modify WebRTC parameters
- Modify Geolocation settings
- Modify Timezone and Language settings
- Modify WebGL fingerprint
- Modify 2D Canvas fingerprint
- Modify Navigator properties
- Modify Screen resolution

> Note: _You need [Automation package](https://kameleo.io/learn-more/automation/) of Kameleo to access the features described below._

## Quickstart Guide

### 1. Install by NuGet

```
dotnet add package Kameleo.LocalApiClient
```

### 2. Start the Kameleo.CLI on your computer

```
./Kameleo.CLI email="your@email.com" password="Pa$$w0rd"
```

### 3. Start a browser with out-of-the-box fingerprinting protection

```csharp
using System;
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;

const string KameleoBaseUrl = "http://localhost:5050";

var client = new KameleoLocalApiClient(new Uri(KameleoBaseUrl));

// Search Chrome fingerprints
var fingerprints = await client.SearchFingerprintsAsync(
    deviceType: "desktop",
    browserProduct: "chrome");

// Create a new profile with recommended settings
// for browser fingerprint protection
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id)
{
    Name = "example profile",
};

var profile = await client.CreateProfileAsync(createProfileRequest);

// Start the browser
await client.StartProfileAsync(profile.Id);

// At this point you can automate the browser with your favorite framework
```

## Automate Kameleo profiles with Selenium

Kameleo gives you the ability to control any supported browser using Selenium. It uses the WebDriver protocol, a W3C specification, and industry-standard to interact with a browser.

You need to install the official [Selenium package](https://www.nuget.org/packages/Selenium.WebDriver/).

```csharp
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Remote;
```

```csharp
const int KameleoPort = 5050;

// Connect to the running browser instance using WebDriver
var uri = new Uri($"http://localhost:{KameleoPort}/webdriver");
var opts = new ChromeOptions();
opts.AddAdditionalOption("kameleo:profileId", profile.Id.ToString());

var webdriver = new RemoteWebDriver(uri, opts);

// Use any WebDriver command to drive the browser
// and enjoy full protection from bot detection products
await webdriver.Navigate().GoToUrlAsync("https://google.com");
```

The full example can be found [here](https://github.com/kameleo-io/local-api-examples/blob/master/dotnet-csharp/connect_to_selenium/Program.cs).

## Automate Kameleo profiles with Puppeteer (Chromium-based)

Kameleo lets you control Chromium-based browsers (sorry Firefox fans) using the [PuppeteerSharp package](https://www.nuget.org/packages/PuppeteerSharp/). In this simple example you can see how to connect to the browser that Kameleo starts.

You need to import the [PuppeteerSharp](https://www.nuget.org/packages/PuppeteerSharp/).

```csharp
using PuppeteerSharp;
```

```csharp
// Connect to the browser through CDP
const int KameleoPort = 5050;

var browserWsEndpoint = $"ws://localhost:{KameleoPort}/puppeteer/{profile.Id}";
var browser = await Puppeteer.ConnectAsync(new ConnectOptions {
    BrowserWSEndpoint = browserWsEndpoint,
    DefaultViewport = null });

var page = await browser.NewPageAsync();

// Use any Puppeteer command to drive the browser
// and enjoy full protection from bot detection products
await page.GoToAsync("https://google.com");
```

The full example can be found [here](https://github.com/kameleo-io/local-api-examples/blob/master/dotnet-csharp/connect_with_puppeteer/Program.cs).

## Automate Kameleo profiles with Playwright

Kameleo allows you to control the browser with the official [Playwright package](https://www.nuget.org/packages/Microsoft.Playwright/). It works little bit different with Chromium-based browsers and Firefox, so we provide an example for both. Here we showcase how you can connect to the browser that is already started by Kameleo.

You need to import the official [Playwright package](https://www.nuget.org/packages/Microsoft.Playwright/).

```csharp
using Microsoft.Playwright;
```

You can find more details here: [Using Kameleo with Playwright framework – Kameleo Support Center](https://developer.kameleo.io/integrations/playwright/).

### Chromium-based profiles with Playwright

```csharp
// Connect to the browser with Playwright through CDP
const int KameleoPort = 5050;

var browserWsEndpoint = $"ws://localhost:{KameleoPort}/playwright/{profile.Id}";
var playwright = await Playwright.CreateAsync();
var browser = await playwright.Chromium.ConnectOverCDPAsync(browserWsEndpoint);

// It is recommended to work on the default context.
// NOTE: We DO NOT recommend using multiple browser contexts, as this might interfere
//       with Kameleo's browser fingerprint modification features.
var context = browser.Contexts[0];
var page = await context.NewPageAsync();

// Use any Playwright command to drive the browser
// and enjoy full protection from bot detection products
await page.GotoAsync("https://google.com");
```

The full example can be found [here](https://github.com/kameleo-io/local-api-examples/blob/master/dotnet-csharp/connect_with_playwright_to_chrome/Program.cs).

### Firefox-based profiles with Playwright

```csharp
// Connect to the browser with Playwright
const int KameleoPort = 5050;

var browserWsEndpoint = $"ws://localhost:{KameleoPort}/playwright/{profile.Id}";

// The Playwright framework is not designed to connect to already running
// browsers. To overcome this limitation, a tool bundled with Kameleo, named
// pw-bridge will bridge the communication gap between the running Firefox
// instance and this playwright script.
// The exact path to the bridge executable is subject to change.
var pwBridgePath = Environment.GetEnvironmentVariable("PW_BRIDGE_PATH");
if (pwBridgePath is null && OperatingSystem.IsWindows())
{
    var localAppDataFolder = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
    pwBridgePath = Path.Combine(localAppDataFolder, "Programs", "Kameleo", "pw-bridge.exe");
}
else if (pwBridgePath is null && OperatingSystem.IsMacOS())
{
    pwBridgePath = "/Applications/Kameleo.app/Contents/Resources/CLI/pw-bridge";
}

var playwright = await Playwright.CreateAsync();
var context = await playwright.Firefox.LaunchPersistentContextAsync("", new BrowserTypeLaunchPersistentContextOptions
{
 ExecutablePath = pwBridgePath,
 Args = new List<string> { $"-target {browserWsEndpoint}" },
 ViewportSize = null,
});

// Kameleo will open the a new page in the default browser context.
// NOTE: We DO NOT recommend using multiple browser contexts, as this might interfere
//       with Kameleo's browser fingerprint modification features.
var page = await context.NewPageAsync();

// Use any Playwright command to drive the browser
// and enjoy full protection from bot detection products
await page.GotoAsync("https://google.com");
```

The full example can be found [here](https://github.com/kameleo-io/local-api-examples/blob/master/dotnet-csharp/connect_with_playwright_to_firefox/Program.cs).

## Automate mobile profiles

Kameleo can emulate mobile devices with Chroma, our custom built Chromium variant.

```csharp
var fingerprints = await client.SearchFingerprintsAsync("mobile", "ios", "safari");

// Create a new profile with automatic recommended settings
// Choose one of the fingerprints
// Kameleo launches mobile profiles with our Chroma browser
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id)
{
    Name = "automate mobile profiles on desktop example",
};

var profile = await client.CreateProfileAsync(createProfileRequest);

// Start the profile with a couple of extra parameters, so Selenium automation can be done fluently
await client.StartProfileAsync(profile.Id, new BrowserSettings()
{
    AdditionalOptions = new List<Preference>
    {
        // This allows you to click on elements using the cursor when emulating a touch screen in the brower.
        // If you leave this out, your script may time out after clicks and fail.
        new Preference("disableTouchEmulation", true),
    }
});

// At this point you can automate the browser with your favorite framework
```

The full example can be found [here](https://github.com/kameleo-io/local-api-examples/blob/master/dotnet-csharp/automate_mobile_profiles_on_desktop/Program.cs).

## Example codes

[Several examples](https://github.com/kameleo-io/local-api-examples) have been prepared in a different repository to showcase the most interesting features. Feel free to create a pull request to add new example codes.

- Finding fingerprints
- Creating profiles with custom options
- Updating profiles with new settings
- How to start a profile
- Using Selenium with Local API
- Using Playwright with Kameleo
- Using Puppeteer with Kameleo
- How to emulate mobile devices
- Adding an HTTP, SOCKS or SSH proxy to profile
- Saving/Loading a browsing session to/from a .kameleo file
- Modify and Delete browser cookies
- Start profile with extra WebDriver capabilities
- How to duplicate virtual browser profiles
- Refresh the browser of the emulated profiles

> Note: _If you are interested in more information about Kameleo, or have encountered an issue with using it, please check out our [Help Center](https://help.kameleo.io/)._

## Package

This package can be found on NuGet Gallery here: [Kameleo.LocalApiClient](https://www.nuget.org/packages/Kameleo.LocalApiClient).

## Endpoints

Available API endpoints with exhaustive descriptions and example values are documented on this [SwaggerHub](https://app.swaggerhub.com/apis/kameleo-team/kameleo-local-api/) page. This package has built-in [IntelliSense](https://code.visualstudio.com/docs/editor/intellisense) support in Visual Studio Code, no extra package installation needed.

## License

This project is released under MIT License. Please refer the LICENSE.txt for more details.
