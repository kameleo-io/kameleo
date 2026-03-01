# Kameleo Local API Client

With [Kameleo](https://kameleo.io), you can easily create multiple virtual browser profiles to work with multiple accounts. It helps you hide your actual timezone, geolocation, language, IP address and creates natural browser fingerprints to prevent detection by anti-bot systems. Kameleo is compatible with [Selenium](https://www.selenium.dev/), [Playwright](https://playwright.dev/), and [Puppeteer](https://pptr.dev/) frameworks for automating web scraping tasks. This JavaScript/TypeScript package provides convenient access to the [Local API](https://app.swaggerhub.com/apis/kameleo-team/kameleo-local-api/) REST interface of the Kameleo Client. See the [article](https://developer.kameleo.io/getting-started/quickstart/) in our knowledge base for Getting Started with Kameleo Automation.

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

> _For an overview of automating with Kameleo and which plan you need to access these features, see our [pricing page](https://kameleo.io/pricing)._

## Quickstart Guide

Most of our NodeJS examples use ESM modules with `import`, but you can also find a CommonJS example with `require` [here](https://github.com/kameleo-io/local-api-examples/blob/master/nodejs/commonjs/index.js).

### 1. Install package

```
npm install @kameleo/local-api-client
```

### 2. Start the Kameleo.CLI on your computer

```
./Kameleo.CLI email="your@email.com" password="Pa$$w0rd"
```

### 3. Start a browser with out-of-the-box fingerprinting protection

```javascript
import { KameleoLocalApiClient } from "@kameleo/local-api-client";

const client = new KameleoLocalApiClient();
const fingerprints = await client.fingerprint.searchFingerprints("desktop", null, "chrome");

// Create a new profile with recommended settings
// for browser fingerprinting protection
const createProfileRequest = { fingerprintId: fingerprints[0].id, name: "example profile" };
const profile = await client.profile.createProfile(createProfileRequest);

// Start the browser
await client.profile.startProfile(profile.id);

// At this point you can automate the browser with your favorite framework
```

## Automate Kameleo profiles with Selenium

Kameleo gives you the ability to control any supported browser using Selenium. It uses the WebDriver protocol, a W3C specification, and industry-standard to interact with a browser.

You need to import the official [Selenium library](https://www.npmjs.com/package/selenium-webdriver).

```javascript
import { Builder } from "selenium-webdriver";
```

```javascript
// Connect to the running browser instance using WebDriver
const kameleoPort = 5050;
const builder = new Builder().usingServer(`http://localhost:${kameleoPort}/webdriver`).withCapabilities({
    "kameleo:profileId": profile.id,
    browserName: "Kameleo",
});
const webdriver = await builder.build();

// Use any WebDriver command to drive the browser
// and enjoy full protection from bot detection products
await webdriver.get("https://google.com");
```

The full example can be found [here](https://github.com/kameleo-io/local-api-examples/blob/master/nodejs/connect_with_selenium/index.js).

## Automate Kameleo profiles with Puppeteer (Chromium-based)

Kameleo lets you control Chromium-based browsers (sorry Firefox fans) using the official [Puppeteer library](https://www.npmjs.com/package/puppeteer). In this simple example you can see how to connect to the browser that Kameleo starts.

You need to import the official [Puppeteer library](https://www.npmjs.com/package/puppeteer).

```javascript
import puppeteer from "puppeteer";
```

```javascript
// Connect to the browser through CDP
const kameleoPort = 5050;
const browserWSEndpoint = `ws://localhost:${kameleoPort}/puppeteer/${profile.id}`;
const browser = await puppeteer.connect({
    browserWSEndpoint,
    defaultViewport: null,
});
const page = await browser.newPage();

// Use any Puppeteer command to drive the browser
// and enjoy full protection from bot detection products
await page.goto("https://google.com");
```

The full example can be found [here](https://github.com/kameleo-io/local-api-examples/blob/master/nodejs/connect_with_puppeteer/index.js).

## Automate Kameleo profiles with Playwright

Kameleo allows you to control the browser with the official [Playwright library](https://www.npmjs.com/package/playwright). It works little bit different with Chromium-based browsers and Firefox, so we provide an example for both. Here we showcase how you can connect to the browser that is already started by Kameleo.

You need to import the official [Playwright library](https://www.npmjs.com/package/playwright).

```javascript
import playwright from "playwright";
```

You can find more details here: [Using Kameleo with Playwright framework - Kameleo Support Center](https://developer.kameleo.io/integrations/playwright/).

### Chromium-based profiles with Playwright

```javascript
// Connect to the browser with Playwright through CDP
const kameleoPort = 5050;
const browserWSEndpoint = `ws://localhost:${kameleoPort}/playwright/${profile.id}`;
const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint);
const context = browser.contexts()[0]; // It is recommended to work on the default context. New context will work in incognito mode without spoofing.
const page = await context.newPage();

// Use any Playwright command to drive the browser
// and enjoy full protection from bot detection products
await page.goto("https://google.com");
```

The full example can be found [here](https://github.com/kameleo-io/local-api-examples/blob/master/nodejs/connect_with_playwright_to_chrome/index.js).

### Firefox-based profiles with Playwright

```javascript
// Connect to the browser with Playwright
const kameleoPort = 5050;
const browserWSEndpoint = `ws://localhost:${kameleoPort}/playwright/${profile.id}`;

// The Playwright framework is not designed to connect to already running
// browsers. To overcome this limitation, a tool bundled with Kameleo, named
// pw-bridge will bridge the communication gap between the running Firefox
// instance and this playwright script.
// The exact path to the bridge executable is subject to change
let pwBridgePath = process.env.PW_BRIDGE_PATH;
if (!pwBridgePath && process.platform === "win32") {
    pwBridgePath = `${process.env.LOCALAPPDATA}\\Programs\\Kameleo\\pw-bridge.exe`;
} else if (!pwBridgePath && process.platform === "darwin") {
    pwBridgePath = "/Applications/Kameleo.app/Contents/Resources/CLI/pw-bridge";
}

const context = await playwright.firefox.launchPersistentContext("", {
    executablePath: pwBridgePath,
    args: [`-target ${browserWSEndpoint}`],
    viewport: null,
});

// Kameleo will open the a new page in the default browser context.
// NOTE: We DO NOT recommend using multiple browser contexts, as this might interfere
//       with Kameleo's browser fingerprint modification features.
const page = await context.newPage();

// Use any Playwright command to drive the browser
// and enjoy full protection from bot detection products
await page.goto("https://google.com");
```

The full example can be found [here](https://github.com/kameleo-io/local-api-examples/blob/master/nodejs/connect_with_playwright_to_firefox/index.js).

## Automate mobile profiles

Kameleo can emulate mobile devices with Chroma, our custom built Chromium variant.

```javascript
// Search for a mobile fingerprints
const fingerprints = await client.fingerprint.searchFingerprints("mobile", "ios", "safari");

// Create a new profile with automatic recommended settings
// Choose one of the fingerprints
// Kameleo launches mobile profiles with our Chroma browser
const createProfileRequest = { fingerprintId: fingerprints[0].id, name: "automate mobile profiles on desktop example" };
const profile = await client.profile.createProfile(createProfileRequest);

// Start the profile
await client.profile.startProfile(profile.id, {
    // This allows you to click on elements using the cursor when emulating a touch screen in the brower.
    // If you leave this out, your script may time out after clicks and fail.
    additionalOptions: [
        {
            key: "disableTouchEmulation",
            value: true,
        },
    ],
});

// At this point you can automate the browser with your favorite framework
```

The full example can be found [here](https://github.com/kameleo-io/local-api-examples/blob/master/nodejs/automate_mobile_profiles_on_desktop/index.js).

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

This package can be found on npm here: [@kameleo/local-api-client](https://www.npmjs.com/package/@kameleo/local-api-client?activeTab=readme).

## Endpoints

Available API endpoints with exhaustive descriptions and example values are documented on this [SwaggerHub](https://app.swaggerhub.com/apis/kameleo-team/kameleo-local-api/) page. This package has built-in [IntelliSense](https://code.visualstudio.com/docs/editor/intellisense) support in Visual Studio Code, no extra package installation needed.

## License

This project is released under MIT License. Please refer the LICENSE.txt for more details.
