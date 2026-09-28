---
order: -303
title: Puppeteer
meta:
    description: Automate Kameleo's Chroma browser profiles with Puppeteer over a WebSocket endpoint using explicit or auto-start connection options.
permalink: /integrations/puppeteer
---

Integrate Puppeteer with Kameleo to automate browsing using realistic, spoofed browser fingerprints (Chroma kernel only).

First create a profile, then choose how to start it:

1. **Auto-start**: Skip `startProfile`. When Puppeteer connects with the WebSocket endpoint, Kameleo automatically starts the profile using defaults.
2. **Explicit start**: Call `startProfile` before connecting. Use this when you need custom command-line switches, flags, or advanced options.

After either approach, you control the browser with normal Puppeteer commands, then clean up (stop / export / delete) the profile.

## Prerequisites

- Completion of the [Quickstart](../01-getting-started/02-quickstart.md) guide
- A Puppeteer-compatible environment (Python, JavaScript, or C# with [Puppeteer library](https://pptr.dev/) installed)

## Limitations & best practices

- Puppeteer works only with Chroma (Chromium-based) kernels.
- Do not add third-party stealth / fingerprint patches (puppeteer-extra-plugin-stealth, Canvas defenders, etc.). They can reduce masking quality.
- Use one browser context per profile. Create multiple Kameleo profiles instead of multiple contexts.

## Create a profile

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
    name='puppeteer example'
)
profile = client.profile.create_profile(create_req)
```

+++ JavaScript

```js
import { KameleoLocalApiClient } from "@kameleo/local-api-client";

const client = new KameleoLocalApiClient({ basePath: "http://localhost:5050" });
await client.verifyEngineReady();
const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");
const createProfileRequest = { fingerprintId: fingerprints[0].id, name: "puppeteer example" };
const profile = await client.profile.createProfile(createProfileRequest);
```

+++ C#

```csharp
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;

var client = new KameleoLocalApiClient(new Uri("http://localhost:5050"));
await client.VerifyEngineReadyAsync();
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "chrome");
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id) { Name = "puppeteer example" };
var profile = await client.Profile.CreateProfileAsync(createProfileRequest);
```

+++

## Option 1: Auto-start the profile (simpler)

Skip the explicit start call. Kameleo starts the profile automatically on the first Puppeteer connection. Use this for quick scripts where default startup behavior is enough.

### Connect Puppeteer (Chroma only)

Use the WebSocket URL `ws://localhost:{port}/puppeteer/{profileId}` to connect.

+++ Python

```python
from pyppeteer import connect

browser_ws_endpoint = f'ws://localhost:5050/puppeteer/{profile.id}'
browser = await connect(browserWSEndpoint=browser_ws_endpoint, defaultViewport=None)
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

## Option 2: Explicitly start the profile (customizable)

Use this when you must set advanced startup parameters. The example below shows a start with some custom settings.

### Start the profile (customization point)

Below are three common customization patterns. Pick one (or combine arguments + preferences) before connecting Puppeteer. The browser must be stopped and restarted to apply a different set.

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

After the profile starts, connect using the [same WebSocket steps as Option 1](#connect-puppeteer-chroma-only).

## Run Puppeteer commands

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

## Finish the session

Always stop the profile to persist its state. Optionally export it for backup or delete it to reclaim space.

!!!tip Note
Disconnect Puppeteer before stopping the profile. Disconnecting only detaches Puppeteer from the browser, so Kameleo can still shut it down cleanly.
!!!

### Stop, export, or delete

+++ Python

```python
import os
from kameleo.local_api_client.models import ExportProfileRequest

await browser.disconnect()
client.profile.stop_profile(profile.id)

export_path = f'{os.path.dirname(os.path.realpath(__file__))}/test.kameleo'
client.profile.export_profile(profile.id, body=ExportProfileRequest(path=export_path))

client.profile.delete_profile(profile.id)
```

+++ JavaScript

```js
await browser.disconnect();
await client.profile.stopProfile(profile.id);

await client.profile.exportProfile(profile.id, { body: { path: `${import.meta.dirname}/test.kameleo` } });

await client.profile.deleteProfile(profile.id);
```

+++ C#

```csharp
using Kameleo.LocalApiClient.Model;

// the `await using` statement ensures the proper disposal of the connection so no `browser.Disconnect()` is needed
await client.Profile.StopProfileAsync(profile.Id);

await client.Profile.ExportProfileAsync(profile.Id, new ExportProfileRequest(Path.Combine(Environment.CurrentDirectory, "test.kameleo")));

await client.Profile.DeleteProfileAsync(profile.Id);
```

+++

## Full examples on GitHub

| Language   | Chroma kernel                                                                                                                          | Junglefox kernel |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Python     | [Python code on GitHub](https://github.com/kameleo-io/kameleo/blob/master/sdk/python/examples/connect_with_puppeteer/app.py)           | Not supported    |
| JavaScript | [JavaScript code on GitHub](https://github.com/kameleo-io/kameleo/blob/master/sdk/typescript/examples/connect_with_puppeteer/index.js) | Not supported    |
| C#         | [C# code on GitHub](https://github.com/kameleo-io/kameleo/blob/master/sdk/csharp/examples/connect_with_puppeteer/Program.cs)           | Not supported    |
