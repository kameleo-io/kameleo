---
order: -301
title: Selenium
description: Automate Kameleo profiles with Selenium using explicit or auto start plus custom arguments, preferences, and full lifecycle control.
permalink: /integrations/selenium
---

Integrate Selenium WebDriver with Kameleo to automate browsing using realistic, spoofed browser fingerprints.

You can start a profile in two ways:

1. **Explicit start**: Create the profile via the Local API and call `startProfile`. Use this when you need custom command-line switches, proxy settings, flags, or advanced options.
2. **Auto-start**: Skip `startProfile`. When Selenium connects with the `kameleo:profileId` capability, Kameleo automatically starts the profile using defaults.

After either approach, you control the browser with normal Selenium commands, then clean up (stop / export / delete) the profile.

## Prerequisites

- Completion of the [Quickstart](../01-getting-started/02-quickstart.md) guide
- A Selenium-capable environment (Python, JavaScript, or C# with [Selenium libraries](https://www.selenium.dev/) installed)

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
    name='selenium explicit start example'
)
profile = client.profile.create_profile(create_req)
```

+++ JavaScript

```js
import { KameleoLocalApiClient } from "@kameleo/local-api-client";

const client = new KameleoLocalApiClient({ basePath: "http://localhost:5050" });
const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");
const createProfileRequest = { fingerprintId: fingerprints[0].id, name: "selenium explicit start example" };
const profile = await client.profile.createProfile(createProfileRequest);
```

+++ C#

```csharp
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;

var client = new KameleoLocalApiClient(new Uri("http://localhost:5050"));
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "chrome");
var createProfileRequest = new CreateProfileRequest(fingerprints[0].Id) { Name = "selenium explicit start example" };
var profile = await client.Profile.CreateProfileAsync(createProfileRequest);
```

+++

### 2. Start the profile (customization point)

Below are three common customization patterns. Pick one (or combine arguments + preferences) before connecting Selenium. The browser must be stopped and restarted to apply a different set.

1. Add command-line arguments (e.g. mute audio)
2. Pass extra Selenium options / capabilities (e.g. eager page load strategy)
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

### 3. Connect Selenium WebDriver

Point Selenium to `http://localhost:{port}/webdriver` and supply `kameleo:profileId`.

+++ Python

```python
from selenium import webdriver

options = webdriver.ChromeOptions()
options.set_capability('kameleo:profileId', profile.id)
driver = webdriver.Remote(
    command_executor='http://localhost:5050/webdriver',
    options=options
)
```

+++ JavaScript

```js
import { Builder } from "selenium-webdriver";

const webdriver = await new Builder()
    .usingServer("http://localhost:5050/webdriver")
    .withCapabilities({ "kameleo:profileId": profile.id, browserName: "Kameleo" })
    .build();
```

+++ C#

```csharp
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Remote;

var remoteUri = new Uri("http://localhost:5050/webdriver");
var chromeOptions = new ChromeOptions();
chromeOptions.AddAdditionalOption("kameleo:profileId", profile.Id.ToString());
var webdriver = new RemoteWebDriver(remoteUri, chromeOptions);
webdriver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(3);
```

+++

### 4. Run Selenium commands

+++ Python

```python
driver.get('https://google.com')
```

+++ JavaScript

```js
await webdriver.get("https://google.com");
```

+++ C#

```csharp
webdriver.Navigate().GoToUrl("https://google.com");
```

+++

## Option 2: Auto-start the profile (simpler)

Skip the explicit start call. Kameleo starts the profile automatically on the first WebDriver connection. Use this for quick scripts where default startup behavior is enough.

### 1. Create the profile (same as before, no start call later)

+++ Python

```python
from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest
from selenium import webdriver

client = KameleoLocalApiClient(endpoint='http://localhost:5050')
fps = client.fingerprint.search_fingerprints(device_type='desktop', browser_product='chrome')
profile = client.profile.create_profile(CreateProfileRequest(
    fingerprint_id=fps[0].id,
    name='selenium auto-start example'
))
```

+++ JavaScript

```js
import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import { Builder } from "selenium-webdriver";

const client = new KameleoLocalApiClient({ basePath: "http://localhost:5050" });
const fps = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");
const profile = await client.profile.createProfile({ fingerprintId: fps[0].id, name: "selenium auto-start example" });
```

+++ C#

```csharp
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Remote;

var client = new KameleoLocalApiClient(new Uri("http://localhost:5050"));
var fps = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "chrome");
var profile = await client.Profile.CreateProfileAsync(new CreateProfileRequest(fps[0].Id) { Name = "selenium auto-start example" });
```

+++

### 2. Connect (auto-start happens here)

+++ Python

```python
options = webdriver.ChromeOptions()
options.set_capability('kameleo:profileId', profile.id)
driver = webdriver.Remote(
    command_executor='http://localhost:5050/webdriver',
    options=options
)
driver.get('https://wikipedia.org')
```

+++ JavaScript

```js
const webdriver = await new Builder()
    .usingServer("http://localhost:5050/webdriver")
    .withCapabilities({ "kameleo:profileId": profile.id, browserName: "Kameleo" })
    .build();
await webdriver.get("https://wikipedia.org");
```

+++ C#

```csharp
var remoteUri = new Uri("http://localhost:5050/webdriver");
var chromeOptions = new ChromeOptions();
chromeOptions.AddAdditionalOption("kameleo:profileId", profile.Id.ToString());
var webdriver = new RemoteWebDriver(remoteUri, chromeOptions);
webdriver.Navigate().GoToUrl("https://wikipedia.org");
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

| Language   | Example repository link                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Python     | [Python code on GitHub](https://github.com/kameleo-io/local-api-examples/blob/master/python/connect_with_selenium/app.py)        |
| JavaScript | [JavaScript code on GitHub](https://github.com/kameleo-io/local-api-examples/blob/master/nodejs/connect_with_selenium/index.js)  |
| C#         | [C# code on GitHub](https://github.com/kameleo-io/local-api-examples/blob/master/dotnet-csharp/connect_with_selenium/Program.cs) |
