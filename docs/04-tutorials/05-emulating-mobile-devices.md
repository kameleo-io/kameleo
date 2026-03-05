---
order: -405
title: Emulate mobile devices
description: Create Android and iOS style mobile profiles with authentic fingerprints and automate them.
permalink: /tutorials/emulating-mobile-devices
---

Learn how to spin up a real mobile browser profile (iOS or Android), start it, tune the key mobile emulation options, and drive it with Selenium / WebDriver.

## Prerequisites

- Completion of the [Quickstart](../01-getting-started/02-quickstart.md) guide
- Kameleo app running locally (default `http://localhost:5050`)

## 1. Search for a mobile fingerprint

We query deviceType `mobile` and narrow to an iOS + Safari fingerprint (change to Android/Chrome if you prefer). Pick the first match for simplicity.

+++ Python

```python
fingerprints = client.fingerprint.search_fingerprints(
    device_type='mobile',
    os_family='ios',
    browser_product='safari'
)
fingerprint = fingerprints[0]
print('Selected fingerprint', fingerprint.id)
```

+++ JavaScript

```javascript
const fingerprints = await client.fingerprint.searchFingerprints("mobile", "ios", "safari");
const fingerprint = fingerprints[0];
console.log("Selected fingerprint", fingerprint.id);
```

+++ C#

```csharp
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;

var fingerprints = await client.Fingerprint.SearchFingerprintsAsync("mobile", "ios", "safari");
var fingerprint = fingerprints[0];
Console.WriteLine($"Selected fingerprint {fingerprint.Id}");
```

+++

## 2. Create the mobile profile

Create a profile from the chosen fingerprint. Kameleo will apply recommended settings automatically.

+++ Python

```python
from kameleo.local_api_client.models import CreateProfileRequest

create_req = CreateProfileRequest(
    fingerprint_id=fingerprint.id,
    name='automate mobile profiles on desktop example'
)
profile = client.profile.create_profile(create_req)
print('Created profile', profile.id)
```

+++ JavaScript

```javascript
const profile = await client.profile.createProfile({
    fingerprintId: fingerprint.id,
    name: "automate mobile profiles on desktop example",
});
console.log("Created profile", profile.id);
```

+++ C#

```csharp
var createProfileRequest = new CreateProfileRequest(fingerprint.Id)
{
    Name = "automate mobile profiles on desktop example",
};
var profile = await client.Profile.CreateProfileAsync(createProfileRequest);
Console.WriteLine($"Created profile {profile.Id}");
```

+++

## 3. Start the profile with additional options

When starting a mobile profile you can send Kameleo specific additionalOptions.

!!!tip Touch vs. mouse clicks
If your automation scripts hang after performing a click in a mobile profile, first try starting with disableTouchEmulation=true. Once stable, re‑enable touch emulation only if you specifically need touch events (e.g., gesture testing).
!!!

Key options covered here:

- **disableTouchEmulation (boolean):** If true, Kameleo will NOT enable Chrome touch emulation. Default behavior (option absent or false) enables touch events for a realistic mobile environment. Some automation frameworks (or test code written with desktop assumptions) may stall on clicks when touch emulation is active; setting this to true restores pure mouse semantics for reliability.
- **deviceScaleFactor (number, optional):** Overrides the device pixel ratio provided by the selected fingerprint. If omitted, the fingerprint’s native DPR is used (e.g., often 3 on newer iPhones, 2 on many Android devices, 1 on low‑density displays).

You can supply one or both via the additionalOptions array. Below we always disable touch emulation and (optionally) show how to force a different deviceScaleFactor.

+++ Python

```python
from kameleo.local_api_client.models import BrowserSettings, Preference

client.profile.start_profile(profile.id, BrowserSettings(
    additional_options=[
        Preference(key='disableTouchEmulation', value=True),
        # Preference(key='deviceScaleFactor', value=3),  # Uncomment to override the value coming from the fingerprint
    ]
))
print('Profile started (touch emulation disabled)')
```

+++ JavaScript

```javascript
await client.profile.startProfile(profile.id, {
    additionalOptions: [
        { key: "disableTouchEmulation", value: true },
        // { key: 'deviceScaleFactor', value: 3 }, // Uncomment to override the value coming from the fingerprint
    ],
});
console.log("Profile started (touch emulation disabled)");
```

+++ C#

```csharp
using System.Collections.Generic;

await client.Profile.StartProfileAsync(profile.Id, new BrowserSettings
{
    AdditionalOptions = new List<Preference>
    {
        new Preference("disableTouchEmulation", true),
        // new Preference("deviceScaleFactor", 3), // Uncomment to override the value coming from the fingerprint
    }
});
Console.WriteLine("Profile started (touch emulation disabled)");
```

+++

## 4. Automate with Selenium

Connect to the running browser and perform a simple Wikipedia search. The profile is already mobile: viewport metrics, user agent, and other signals reflect the selected fingerprint (and your optional overrides).

+++ Python

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

options = webdriver.ChromeOptions()
options.set_capability('kameleo:profileId', profile.id)
driver = webdriver.Remote(
    command_executor='http://localhost:5050/webdriver',
    options=options
)

driver.get('https://wikipedia.org')
driver.find_element(By.NAME, 'search').send_keys('Chameleon', Keys.ENTER)
WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, 'content')))
print('Title:', driver.title)
time.sleep(5)
client.profile.stop_profile(profile.id)
```

+++ JavaScript

```javascript
import { Builder, By, Key, until } from "selenium-webdriver";

const webdriver = await new Builder()
    .usingServer("http://localhost:5050/webdriver")
    .withCapabilities({ "kameleo:profileId": profile.id, browserName: "Kameleo" })
    .build();

await webdriver.get("https://wikipedia.org");
await webdriver.findElement(By.name("search")).sendKeys("Chameleon", Key.ENTER);
await webdriver.wait(until.elementLocated(By.id("content")));
console.log("Title:", await webdriver.getTitle());
await webdriver.sleep(5000);
await client.profile.stopProfile(profile.id);
```

+++ C#

```csharp
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Remote;
using System.Threading.Tasks;

var uri = new Uri("http://localhost:5050/webdriver");
var chromeOpts = new ChromeOptions();
chromeOpts.AddAdditionalOption("kameleo:profileId", profile.Id.ToString());
var driver = new RemoteWebDriver(uri, chromeOpts);
driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(3);

await driver.Navigate().GoToUrlAsync("https://wikipedia.org");
driver.FindElement(By.Name("search")).SendKeys("Chameleon");
driver.FindElement(By.Name("search")).SendKeys(Keys.Enter);
driver.FindElement(By.Id("content"));
Console.WriteLine("Title: " + driver.Title);
await Task.Delay(TimeSpan.FromSeconds(5));
await client.Profile.StopProfileAsync(profile.Id);
```

+++

## Troubleshooting

- Click actions hang or timeout: Start with disableTouchEmulation=true.
- Elements appear too large/small: Adjust deviceScaleFactor (try 1, 2, or 3).
- Site serves desktop layout: Confirm you selected a mobile fingerprint (deviceType mobile) and did not disable other mobile signals.
- WebDriver cannot connect: Ensure the profile actually started and that `/webdriver` endpoint matches the configured port.
