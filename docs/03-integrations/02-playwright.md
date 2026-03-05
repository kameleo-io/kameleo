---
order: -302
title: Playwright
description: Integrate Playwright with Kameleo (Chroma & Junglefox) via explicit or auto start for fingerprinted, kernel-aware automated browsing.
permalink: /integrations/playwright
---

Integrate Playwright with Kameleo to automate browsing using realistic, spoofed browser fingerprints.

You can start a profile in two ways:

1. **Explicit start**: Create the profile via the Local API and call `startProfile`. Use this when you need custom command-line switches, proxy settings, flags, or advanced options.
2. **Auto-start**: Skip `startProfile`. When Playwright connects (Chroma via CDP; Junglefox via `pw-bridge`) with the WebSocket endpoint, Kameleo automatically starts the profile using defaults.

After either approach, you control the browser with normal Playwright commands, then clean up (stop / export / delete) the profile.

## Prerequisites

- Completion of the [Quickstart](../01-getting-started/02-quickstart.md) guide
- A Playwright-supported environment (Python, JavaScript, or C# with [Playwright library](https://playwright.dev/) installed)

!!!warning Playwright version alignment
Always verify and use the Playwright library version recommended for your current [Junglefox kernel release](https://kameleo.io/browser-kernel-releases). Mismatched versions can cause launch, connection, or protocol errors.
!!!

## Best practices

- Do not add third-party stealth / fingerprint patches (playwright-extra, Canvas defenders, etc.). They can reduce masking quality.
- Use one browser context per profile. Create multiple Kameleo profiles instead of multiple contexts.

## Option 1: Explicitly start the profile (customizable)

Use this when you must set advanced startup parameters. Example below show a start with some custom settings.

### 1. Create a profile

+++ Python

```python
from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest

client = KameleoLocalApiClient(endpoint='http://localhost:5050')

fingerprints = client.fingerprint.search_fingerprints(
    device_type='desktop',
    browser_product='chrome'
)

create_req = CreateProfileRequest(
    fingerprint_id=fingerprints[0].id,
    name='playwright explicit start example'
)
profile = client.profile.create_profile(create_req)
```

+++ JavaScript

```js
import { KameleoLocalApiClient } from "@kameleo/local-api-client";

const client = new KameleoLocalApiClient({ basePath: "http://localhost:5050" });
const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");
const createProfileRequest = { fingerprintId: fingerprints[0].id, name: "playwright explicit start example" };
const profile = await client.profile.createProfile(createProfileRequest);
```

+++ C#

```csharp
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;

var client = new KameleoLocalApiClient(new Uri("http://localhost:5050"));
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "chrome");
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id) { Name = "playwright explicit start example" };
var profile = await client.Profile.CreateProfileAsync(createProfileRequest);
```

+++

### 2. Start the profile (customization point)

Below are three common customization patterns. Pick one (or combine arguments + preferences) before connecting Playwright. The browser must be stopped and restarted to apply a different set.

1. Add command-line arguments (e.g. mute audio)
2. Pass extra options / capabilities (e.g. disable background throttling)
3. Set native browser preferences (e.g. disable images)

+++ Python

```python
from kameleo.local_api_client.models import BrowserSettings, Preference

client.profile.start_profile(profile.id, BrowserSettings(
    arguments=["mute-audio"],
    additional_options=[
        Preference(key='pageLoadStrategy', value='eager'),
    ],
    preferences=[
        Preference(key='profile.managed_default_content_settings.images', value=2),
    ]
))
```

+++ JavaScript

```js
await client.profile.startProfile(profile.id, {
    browserSettings: {
        arguments: ["mute-audio"],
        additionalOptions: [{ key: "pageLoadStrategy", value: "eager" }],
        preferences: [{ key: "profile.managed_default_content_settings.images", value: 2 }],
    },
});
```

+++ C#

```csharp
using Kameleo.LocalApiClient.Model;

await client.Profile.StartProfileAsync(profile.Id, new BrowserSettings(
    arguments: new List<string> { "mute-audio" },
    additionalOptions: new List<Preference> {
        new Preference("pageLoadStrategy", "eager"),
    },
    preferences: new List<Preference> {
        new Preference("profile.managed_default_content_settings.images", 2),
    }
));
```

+++

### 3. Connect Playwright

Implementation differs by kernel.

#### Chroma kernel (Chromium, auto-start)

Connect over CDP WebSocket: `ws://localhost:{port}/playwright/{profileId}`

+++ Python

```python
from playwright.sync_api import sync_playwright

browser_ws_endpoint = f'ws://localhost:5050/playwright/{profile.id}'
with sync_playwright() as playwright:
    browser = playwright.chromium.connect_over_cdp(endpoint_url=browser_ws_endpoint)
```

+++ JavaScript

```js
import playwright from "playwright";

const browserWSEndpoint = `ws://localhost:5050/playwright/${profile.id}`;
const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint);
```

+++ C#

```csharp
using Microsoft.Playwright;

var browserWsEndpoint = $"ws://localhost:5050/playwright/{profile.Id}";
var playwright = await Playwright.CreateAsync();
var browser = await playwright.Chromium.ConnectOverCDPAsync(browserWsEndpoint);
```

+++

#### Junglefox kernel (Firefox, auto-start)

Playwright cannot attach to an already running Firefox instance, so use Kameleo's `pw-bridge` helper that translates commands.

+++ Python

```python
from playwright.sync_api import sync_playwright
from os import path

browser_ws_endpoint = f'ws://localhost:5050/playwright/{profile.id}'
with sync_playwright() as playwright:
    # On macOS use '/Applications/Kameleo.app/Contents/Resources/CLI/pw-bridge'
    pw_bridge_path = path.expandvars(r'%LOCALAPPDATA%\Programs\Kameleo\pw-bridge.exe')
    context = playwright.firefox.launch_persistent_context(
        '',
        executable_path=pw_bridge_path,
        args=[f'-target {browser_ws_endpoint}'],
        viewport=None)
```

+++ JavaScript

```js
import playwright from "playwright";

const browserWSEndpoint = `ws://localhost:5050/playwright/${profile.id}`;
// On macOS use "/Applications/Kameleo.app/Contents/Resources/CLI/pw-bridge"
const pwBridgePath = `${process.env["LOCALAPPDATA"]}\\Programs\\Kameleo\\pw-bridge.exe`;
const context = await playwright.firefox.launchPersistentContext("", {
    executablePath: pwBridgePath,
    args: [`-target ${browserWSEndpoint}`],
    viewport: null,
});
```

+++ C#

```csharp
using Microsoft.Playwright;

var browserWsEndpoint = $"ws://localhost:5050/playwright/{profile.Id}";
// On macOS use "/Applications/Kameleo.app/Contents/Resources/CLI/pw-bridge"
var pwBridgePath = Path.Combine(
    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
    "Programs", "Kameleo", "pw-bridge.exe");
var playwright = await Playwright.CreateAsync();
var context = await playwright.Firefox.LaunchPersistentContextAsync("", new BrowserTypeLaunchPersistentContextOptions
{
    ExecutablePath = pwBridgePath,
    Args = new List<string> { $"-target {browserWsEndpoint}" },
    ViewportSize = null,
});
```

+++

### 4. Run Playwright commands

Use standard Playwright APIs.

#### Chroma kernel

+++ Python

```python
context = browser.contexts[0]
page = context.new_page()
page.goto('https://google.com')
```

+++ JavaScript

```js
const context = browser.contexts()[0];
const page = await context.newPage();
await page.goto("https://google.com");
```

+++ C#

```csharp
var context = browser.Contexts[0];
var page = await context.NewPageAsync();
await page.GotoAsync("https://google.com");
```

+++

#### Junglefox kernel

+++ Python

```python
page = context.new_page()
page.goto('https://google.com')
```

+++ JavaScript

```js
const page = await context.newPage();
await page.goto("https://google.com");
```

+++ C#

```csharp
var page = await context.NewPageAsync();
await page.GotoAsync("https://google.com");
```

+++

!!!warning Warning
Do not modify browser or network settings via Playwright; configure them with Kameleo before starting the profile.
!!!

## Option 2: Auto-start the profile (simpler)

Skip the explicit start call. Kameleo starts the profile automatically on the first Playwright connection. Use this for quick scripts where default startup behavior is enough.

### 1. Create the profile (same as before, no start call later)

+++ Python

```python
from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest
from playwright.sync_api import sync_playwright

client = KameleoLocalApiClient(endpoint='http://localhost:5050')
fps = client.fingerprint.search_fingerprints(device_type='desktop', browser_product='chrome')
profile = client.profile.create_profile(CreateProfileRequest(
    fingerprint_id=fps[0].id,
    name='playwright auto-start example'
))
```

+++ JavaScript

```js
import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import playwright from "playwright";

const client = new KameleoLocalApiClient({ basePath: "http://localhost:5050" });
const fps = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");
const profile = await client.profile.createProfile({ fingerprintId: fps[0].id, name: "playwright auto-start example" });
```

+++ C#

```csharp
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;
using Microsoft.Playwright;

var client = new KameleoLocalApiClient(new Uri("http://localhost:5050"));
var fps = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "chrome");
var profile = await client.Profile.CreateProfileAsync(new CreateProfileRequest(fps[0].Id) { Name = "playwright auto-start example" });
```

+++

### 2. Connect (auto-start happens here)

Implementation differs by kernel. When you connect, the profile starts automatically.

#### Chroma kernel (Chromium)

+++ Python

```python
browser_ws_endpoint = f'ws://localhost:5050/playwright/{profile.id}'
with sync_playwright() as playwright:
    browser = playwright.chromium.connect_over_cdp(endpoint_url=browser_ws_endpoint)
    context = browser.contexts[0]
    page = context.new_page()
    page.goto('https://wikipedia.org')
```

+++ JavaScript

```js
const browserWSEndpoint = `ws://localhost:5050/playwright/${profile.id}`;
const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint);
const context = browser.contexts()[0];
const page = await context.newPage();
await page.goto("https://wikipedia.org");
```

+++ C#

```csharp
var browserWsEndpoint = $"ws://localhost:5050/playwright/{profile.Id}";
var playwright = await Playwright.CreateAsync();
var browser = await playwright.Chromium.ConnectOverCDPAsync(browserWsEndpoint);
var context = browser.Contexts[0];
var page = await context.NewPageAsync();
await page.GotoAsync("https://wikipedia.org");
```

+++

#### Junglefox kernel (Firefox)

Playwright cannot attach to an already running Firefox instance, so use the `pw-bridge` helper (auto-start triggers on first command relay).

+++ Python

```python
from os import path

browser_ws_endpoint = f'ws://localhost:5050/playwright/{profile.id}'
with sync_playwright() as playwright:
    # On macOS use '/Applications/Kameleo.app/Contents/Resources/CLI/pw-bridge'
    pw_bridge_path = path.expandvars(r'%LOCALAPPDATA%\Programs\Kameleo\pw-bridge.exe')
    context = playwright.firefox.launch_persistent_context(
        '',
        executable_path=pw_bridge_path,
        args=[f'-target {browser_ws_endpoint}'],
        viewport=None)
    page = context.new_page()
    page.goto('https://wikipedia.org')
```

+++ JavaScript

```js
// On macOS use "/Applications/Kameleo.app/Contents/Resources/CLI/pw-bridge"
const pwBridgePath = `${process.env["LOCALAPPDATA"]}\\Programs\\Kameleo\\pw-bridge.exe`;
const browserWSEndpoint = `ws://localhost:5050/playwright/${profile.id}`;
const context = await playwright.firefox.launchPersistentContext("", {
    executablePath: pwBridgePath,
    args: [`-target ${browserWSEndpoint}`],
    viewport: null,
});
const page = await context.newPage();
await page.goto("https://wikipedia.org");
```

+++ C#

```csharp
// On macOS use "/Applications/Kameleo.app/Contents/Resources/CLI/pw-bridge"
var pwBridgePath = Path.Combine(
    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
    "Programs", "Kameleo", "pw-bridge.exe");
var browserWsEndpoint = $"ws://localhost:5050/playwright/{profile.Id}";
var playwright = await Playwright.CreateAsync();
var context = await playwright.Firefox.LaunchPersistentContextAsync("", new BrowserTypeLaunchPersistentContextOptions
{
    ExecutablePath = pwBridgePath,
    Args = new List<string> { $"-target {browserWsEndpoint}" },
    ViewportSize = null,
});
var page = await context.NewPageAsync();
await page.GotoAsync("https://wikipedia.org");
```

+++

## Cleanup (stop, export, delete)

Always stop the profile to persist its state. Optionally export it for backup or delete it to reclaim space.

### Stop, export, or delete

+++ Python

```python
import os
from kameleo.local_api_client.models import ExportProfileRequest

client.profile.stop_profile(profile.id)

export_path = f'{os.path.dirname(os.path.realpath(__file__))}/test.kameleo'
client.profile.export_profile(profile.id, body=ExportProfileRequest(path=export_path))

client.profile.delete_profile(profile.id)
```

+++ JavaScript

```js
await client.profile.stopProfile(profile.id);

await client.profile.exportProfile(profile.id, { body: { path: `${import.meta.dirname}/test.kameleo` } });

await client.profile.deleteProfile(profile.id);
```

+++ C#

```csharp
using Kameleo.LocalApiClient.Model;

await client.Profile.StopProfileAsync(profile.Id);

await client.Profile.ExportProfileAsync(profile.Id, new ExportProfileRequest(Path.Combine(Environment.CurrentDirectory, "test.kameleo")));

await client.Profile.DeleteProfileAsync(profile.Id);
```

+++

## Full examples on GitHub

| Language   | Chroma kernel                                                                                                                                | Junglefox kernel                                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Python     | [Chroma Python Example](https://github.com/kameleo-io/local-api-examples/blob/master/python/connect_with_playwright_to_chrome/app.py)        | [Junglefox Python Example](https://github.com/kameleo-io/local-api-examples/blob/master/python/connect_with_playwright_to_firefox/app.py)        |
| JavaScript | [Chroma JS Example](https://github.com/kameleo-io/local-api-examples/blob/master/nodejs/connect_with_playwright_to_chrome/index.js)          | [Junglefox JS Example](https://github.com/kameleo-io/local-api-examples/blob/master/nodejs/connect_with_playwright_to_firefox/index.js)          |
| C#         | [Chroma C# Example](https://github.com/kameleo-io/local-api-examples/blob/master/dotnet-csharp/connect_with_playwright_to_chrome/Program.cs) | [Junglefox C# Example](https://github.com/kameleo-io/local-api-examples/blob/master/dotnet-csharp/connect_with_playwright_to_firefox/Program.cs) |
