---
order: -303
title: Puppeteer
description: Use Puppeteer with Kameleo's Chroma kernel to run fingerprinted automation over WebSocket with explicit or auto start options.
permalink: /integrations/puppeteer
---

Integrate Puppeteer with Kameleo to automate browsing using realistic, spoofed browser fingerprints (Chroma kernel only).

You can start a profile in two ways:

1. **Explicit start**: Create the profile via the Local API and call `startProfile`. Use this when you need custom command-line switches, proxy settings, flags, or advanced options.
2. **Auto-start**: Skip `startProfile`. When Puppeteer connects with the WebSocket endpoint, Kameleo automatically starts the profile using defaults.

After either approach, you control the browser with normal Puppeteer commands, then clean up (stop / export / delete) the profile.

## Prerequisites

- Completion of the [Quickstart](../01-getting-started/02-quickstart.md) guide
- A Puppeteer-compatible environment (Python, JavaScript, or C# with [Puppeteer library](https://pptr.dev/) installed)

## Limitations & best practices

- Puppeteer works only with Chroma (Chromium-based) kernels.
- Do not add third-party stealth / fingerprint patches (puppeteer-extra-plugin-stealth, Canvas defenders, etc.). They can reduce masking quality.
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
    name='puppeteer explicit start example'
)
profile = client.profile.create_profile(create_req)
```

+++ JavaScript

```js
import { KameleoLocalApiClient } from "@kameleo/local-api-client";

const client = new KameleoLocalApiClient({ basePath: "http://localhost:5050" });
const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");
const createProfileRequest = { fingerprintId: fingerprints[0].id, name: "puppeteer explicit start example" };
const profile = await client.profile.createProfile(createProfileRequest);
```

+++ C#

```csharp
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;

var client = new KameleoLocalApiClient(new Uri("http://localhost:5050"));
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "chrome");
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id) { Name = "puppeteer explicit start example" };
var profile = await client.Profile.CreateProfileAsync(createProfileRequest);
```

+++

### 2. Start the profile (customization point)

Below are three common customization patterns. Pick one (or combine arguments + preferences) before connecting Puppeteer. The browser must be stopped and restarted to apply a different set.

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

### 3. Connect Puppeteer (Chroma only)

Use the WebSocket URL `ws://localhost:{port}/puppeteer/{profileId}` to connect.

+++ Python

```python
import pyppeteer

browser_ws_endpoint = f'ws://localhost:5050/puppeteer/{profile.id}'
browser = await pyppeteer.launcher.connect(browserWSEndpoint=browser_ws_endpoint, defaultViewport=False)
```

+++ JavaScript

```js
import puppeteer from "puppeteer";

const browserWSEndpoint = `ws://localhost:5050/puppeteer/${profile.id}`;
const browser = await puppeteer.connect({
    browserWSEndpoint,
    defaultViewport: null,
});
```

+++ C#

```csharp
using PuppeteerSharp;

var browserWsEndpoint = $"ws://localhost:5050/puppeteer/{profile.Id}";
var browser = await Puppeteer.ConnectAsync(new ConnectOptions
{
  BrowserWSEndpoint = browserWsEndpoint,
  DefaultViewport = null
});
```

+++

### 4. Run Puppeteer commands

+++ Python

```python
page = await browser.newPage()
await page.goto('https://google.com')
```

+++ JavaScript

```js
const page = await browser.newPage();
await page.goto("https://google.com");
```

+++ C#

```csharp
var page = await browser.NewPageAsync();
await page.GoToAsync("https://google.com");
```

+++

## Option 2: Auto-start the profile (simpler)

Skip the explicit start call. Kameleo starts the profile automatically on the first Puppeteer connection. Use this for quick scripts where default startup behavior is enough.

### 1. Create the profile (same as before, no start call later)

+++ Python

```python
from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest
import pyppeteer, asyncio

async def main():
    client = KameleoLocalApiClient(endpoint='http://localhost:5050')
    fps = client.fingerprint.search_fingerprints(device_type='desktop', browser_product='chrome')
    profile = client.profile.create_profile(CreateProfileRequest(
        fingerprint_id=fps[0].id,
        name='puppeteer auto-start example'
    ))

    browser_ws_endpoint = f'ws://localhost:5050/puppeteer/{profile.id}'
    browser = await pyppeteer.launcher.connect(browserWSEndpoint=browser_ws_endpoint, defaultViewport=False)
    page = await browser.newPage()
    await page.goto('https://wikipedia.org')

asyncio.run(main())
```

+++ JavaScript

```js
import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import puppeteer from "puppeteer";

const client = new KameleoLocalApiClient({ basePath: "http://localhost:5050" });
const fps = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");
const profile = await client.profile.createProfile({ fingerprintId: fps[0].id, name: "puppeteer auto-start example" });

const browserWSEndpoint = `ws://localhost:5050/puppeteer/${profile.id}`;
const browser = await puppeteer.connect({ browserWSEndpoint, defaultViewport: null });
const page = await browser.newPage();
await page.goto("https://wikipedia.org");
```

+++ C#

```csharp
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;
using PuppeteerSharp;

var client = new KameleoLocalApiClient(new Uri("http://localhost:5050"));
var fps = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "chrome");
var profile = await client.Profile.CreateProfileAsync(new CreateProfileRequest(fps[0].Id) { Name = "puppeteer auto-start example" });

var browserWsEndpoint = $"ws://localhost:5050/puppeteer/{profile.Id}";
var browser = await Puppeteer.ConnectAsync(new ConnectOptions { BrowserWSEndpoint = browserWsEndpoint, DefaultViewport = null });
var page = await browser.NewPageAsync();
await page.GoToAsync("https://wikipedia.org");
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

| Language   | Chroma kernel                                                                                                                     | Junglefox kernel |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Python     | [Python code on GitHub](https://github.com/kameleo-io/local-api-examples/blob/master/python/connect_with_puppeteer/app.py)        | Not supported    |
| JavaScript | [JavaScript code on GitHub](https://github.com/kameleo-io/local-api-examples/blob/master/nodejs/connect_with_puppeteer/index.js)  | Not supported    |
| C#         | [C# code on GitHub](https://github.com/kameleo-io/local-api-examples/blob/master/dotnet-csharp/connect_with_puppeteer/Program.cs) | Not supported    |
