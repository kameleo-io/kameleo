---
order: -302
title: Playwright
meta:
    description: Integrate Playwright with Kameleo's Chroma and Junglefox kernels via explicit or auto-start for fingerprinted, detection-resistant browser automation.
permalink: /integrations/playwright
---

Integrate Playwright with Kameleo to automate browsing using realistic, spoofed browser fingerprints.

First create a profile, then choose how to start it:

1. **Auto-start**: Skip `startProfile`. When Playwright connects with the WebSocket endpoint, Kameleo automatically starts the profile using defaults.
2. **Explicit start**: Call `startProfile` before connecting. Use this when you need custom command-line switches, flags, or advanced options.

After either approach, you control the browser with normal Playwright commands, then clean up (stop / export / delete) the profile.

## Prerequisites

- Completion of the [Quickstart](../01-getting-started/02-quickstart.md) guide
- A Playwright-supported environment (Python, JavaScript, or C# with [Playwright library](https://playwright.dev/) installed)

## Best practices

- Do not add third-party stealth / fingerprint patches (playwright-extra, Canvas defenders, etc.). They can reduce masking quality.
- Use one browser context per profile. Create multiple Kameleo profiles instead of multiple contexts.
- Verify and use the Playwright library version recommended for your current [Junglefox kernel release](https://kameleo.io/browser-kernel-releases). Mismatched versions can cause launch, connection, or protocol errors.

## Create a profile

The examples below create a Chroma profile. To use Junglefox, select a Firefox fingerprint instead.

+++ Python

```python
from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest

client = KameleoLocalApiClient(endpoint='http://localhost:5050')
client.verify_engine_ready()

fingerprints = client.fingerprint.search_fingerprints(
    device_type='desktop',
    browser_product='chrome'
)

create_req = CreateProfileRequest(
    fingerprint_id=fingerprints[0].id,
    name='playwright example'
)
profile = client.profile.create_profile(create_req)
```

+++ JavaScript

```js
import { KameleoLocalApiClient } from "@kameleo/local-api-client";

const client = new KameleoLocalApiClient({ basePath: "http://localhost:5050" });
await client.verifyEngineReady();
const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");
const createProfileRequest = { fingerprintId: fingerprints[0].id, name: "playwright example" };
const profile = await client.profile.createProfile(createProfileRequest);
```

+++ C#

```csharp
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;

var client = new KameleoLocalApiClient(new Uri("http://localhost:5050"));
await client.VerifyEngineReadyAsync();
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "chrome");
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id) { Name = "playwright example" };
var profile = await client.Profile.CreateProfileAsync(createProfileRequest);
```

+++

## Option 1: Auto-start the profile (simpler)

Skip the explicit start call. Kameleo starts the profile automatically on the first Playwright connection. Use this for quick scripts where default startup behavior is enough.

### Connect Playwright

Implementation differs by kernel. When you connect, the profile starts automatically.

#### Chroma kernel

Connect over CDP WebSocket: `ws://localhost:{port}/playwright/{profileId}`

+++ Python

```python
from playwright.sync_api import sync_playwright

browser_ws_endpoint = f'ws://localhost:5050/playwright/{profile.id}'
with sync_playwright() as playwright:
    browser = playwright.chromium.connect_over_cdp(endpoint_url=browser_ws_endpoint, timeout=90_000)
```

+++ JavaScript

```js
import playwright from "playwright";

const browserWSEndpoint = `ws://localhost:5050/playwright/${profile.id}`;
const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint, { noDefaults: true, timeout: 90_000 });
```

+++ C#

```csharp
using Microsoft.Playwright;

var browserWsEndpoint = $"ws://localhost:5050/playwright/{profile.Id}";
using var playwright = await Playwright.CreateAsync();
await using var browser = await playwright.Chromium.ConnectOverCDPAsync(browserWsEndpoint, new() { NoDefaults = true, Timeout = 90_000 });
```

+++

#### Junglefox kernel

Playwright cannot attach to an already running Firefox instance, so connect through the SDK-provided helper. For more details, see the [Playwright Bridge](../05-reference/10-playwright-bridge.md) reference.

+++ Python

```python
from playwright.sync_api import sync_playwright
from kameleo.local_api_client import JunglefoxHelper

with sync_playwright() as playwright:
    context = playwright.firefox.launch_persistent_context(
        '',
        executable_path=JunglefoxHelper.get_bridge_path(),
        args=JunglefoxHelper.get_bridge_args(client, profile),
        no_viewport=True,
        timeout=90_000,
    )
```

+++ JavaScript

```js
import playwright from "playwright";
import { JunglefoxHelper } from "@kameleo/local-api-client";

const context = await playwright.firefox.launchPersistentContext("", {
    executablePath: JunglefoxHelper.getBridgePath(),
    args: JunglefoxHelper.getBridgeArgs(client, profile),
    viewport: null,
    timeout: 90_000,
});
```

+++ C#

```csharp
using Microsoft.Playwright;

using var playwright = await Playwright.CreateAsync();
await using var context = await playwright.Firefox.LaunchPersistentContextAsync("", new BrowserTypeLaunchPersistentContextOptions
{
    ExecutablePath = JunglefoxHelper.GetBridgePath(),
    Args = JunglefoxHelper.GetBridgeArgs(client, profile),
    ViewportSize = ViewportSize.NoViewport,
    Timeout = 90_000,
});
```

+++

## Option 2: Explicitly start the profile (customizable)

Use this when you must set advanced startup parameters. The example below shows a start with some custom settings.

### Start the profile (customization point)

Below are three common customization patterns. Pick one (or combine arguments + preferences) before connecting Playwright. The browser must be stopped and restarted to apply a different set.

1. Add command-line arguments (e.g. mute audio)
2. Pass extra options / capabilities (e.g. disable background throttling)
3. Set native browser preferences (e.g. disable images)

+++ Python

```python
from kameleo.local_api_client.models import BrowserSettings, Preference

client.profile.start_profile(profile.id, BrowserSettings(
    arguments=["--mute-audio"],
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
        arguments: ["--mute-audio"],
        additionalOptions: [{ key: "pageLoadStrategy", value: "eager" }],
        preferences: [{ key: "profile.managed_default_content_settings.images", value: 2 }],
    },
});
```

+++ C#

```csharp
using Kameleo.LocalApiClient.Model;

await client.Profile.StartProfileAsync(profile.Id, new BrowserSettings(
    arguments: new List<string> { "--mute-audio" },
    additionalOptions: new List<Preference> {
        new Preference("pageLoadStrategy", "eager"),
    },
    preferences: new List<Preference> {
        new Preference("profile.managed_default_content_settings.images", 2),
    }
));
```

+++

### Connect Playwright

Implementation differs by kernel.

#### Chroma kernel

+++ Python

```python
browser_ws_endpoint = f'ws://localhost:5050/playwright/{profile.id}'
with sync_playwright() as playwright:
    browser = playwright.chromium.connect_over_cdp(endpoint_url=browser_ws_endpoint, timeout=90_000)
    context = browser.contexts[0]
    page = context.new_page()
    page.goto('https://wikipedia.org')
```

+++ JavaScript

```js
const browserWSEndpoint = `ws://localhost:5050/playwright/${profile.id}`;
const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint, { noDefaults: true, timeout: 90_000 });
const context = browser.contexts()[0];
const page = await context.newPage();
await page.goto("https://wikipedia.org");
```

+++ C#

```csharp
var browserWsEndpoint = $"ws://localhost:5050/playwright/{profile.Id}";
using var playwright = await Playwright.CreateAsync();
await using var browser = await playwright.Chromium.ConnectOverCDPAsync(browserWsEndpoint, new() { NoDefaults = true, Timeout = 90_000 });
var context = browser.Contexts[0];
var page = await context.NewPageAsync();
await page.GotoAsync("https://wikipedia.org");
```

+++

#### Junglefox kernel

Playwright cannot attach to an already running Firefox instance, so connect through the SDK-provided helper. For more details, see the [Playwright Bridge](../05-reference/10-playwright-bridge.md) reference.

+++ Python

```python
from playwright.sync_api import sync_playwright
from kameleo.local_api_client import JunglefoxHelper

with sync_playwright() as playwright:
    context = playwright.firefox.launch_persistent_context(
        '',
        executable_path=JunglefoxHelper.get_bridge_path(),
        args=JunglefoxHelper.get_bridge_args(client, profile),
        no_viewport=True,
        timeout=90_000,
    )
    page = context.new_page()
    page.goto('https://wikipedia.org')
```

+++ JavaScript

```js
import playwright from "playwright";
import { JunglefoxHelper } from "@kameleo/local-api-client";

const context = await playwright.firefox.launchPersistentContext("", {
    executablePath: JunglefoxHelper.getBridgePath(),
    args: JunglefoxHelper.getBridgeArgs(client, profile),
    viewport: null,
    timeout: 90_000,
});
const page = await context.newPage();
await page.goto("https://wikipedia.org");
```

+++ C#

```csharp
using Microsoft.Playwright;

using var playwright = await Playwright.CreateAsync();
var context = await playwright.Firefox.LaunchPersistentContextAsync("", new BrowserTypeLaunchPersistentContextOptions
{
    ExecutablePath = JunglefoxHelper.GetBridgePath(),
    Args = JunglefoxHelper.GetBridgeArgs(client, profile),
    ViewportSize = ViewportSize.NoViewport,
    Timeout = 90_000,
});
var page = await context.NewPageAsync();
await page.GotoAsync("https://wikipedia.org");
```

+++

!!!warning Warning
Do not modify browser or network settings via Playwright; configure them with Kameleo before starting the profile.
!!!

## Run Playwright commands

Use standard Playwright APIs.

### Chroma kernel

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

### Junglefox kernel

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

## Finish the session

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

| Language   | Chroma kernel                                                                                                                             | Junglefox kernel                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Python     | [Chroma Python Example](https://github.com/kameleo-io/kameleo/blob/master/sdk/python/examples/connect_with_playwright_to_chrome/app.py)   | [Junglefox Python Example](https://github.com/kameleo-io/kameleo/blob/master/sdk/python/examples/connect_with_playwright_to_firefox/app.py)   |
| JavaScript | [Chroma JS Example](https://github.com/kameleo-io/kameleo/blob/master/sdk/typescript/examples/connect_with_playwright_to_chrome/index.js) | [Junglefox JS Example](https://github.com/kameleo-io/kameleo/blob/master/sdk/typescript/examples/connect_with_playwright_to_firefox/index.js) |
| C#         | [Chroma C# Example](https://github.com/kameleo-io/kameleo/blob/master/sdk/csharp/examples/connect_with_playwright_to_chrome/Program.cs)   | [Junglefox C# Example](https://github.com/kameleo-io/kameleo/blob/master/sdk/csharp/examples/connect_with_playwright_to_firefox/Program.cs)   |
