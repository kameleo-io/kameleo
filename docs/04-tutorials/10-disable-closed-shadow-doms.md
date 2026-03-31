---
order: -410
title: Disable closed Shadow DOMs
description: Open otherwise closed Shadow DOM roots in every page to simplify automation and scraping.
permalink: /tutorials/disable-closed-shadow-doms
---

This tutorial shows you how to force every closed Shadow DOM on visited pages to open so your automation code can query inside without custom execution contexts. You'll enable the `forceOpenShadowRoot` feature, start a profile, validate it works, and learn the trade‑offs.

## Prerequisites

- Completion of the [Quickstart](../01-getting-started/02-quickstart.md) guide
- Kameleo app is running locally (default API base URL: `http://localhost:5050`).

## Understand the feature

Modern web apps encapsulate DOM and styles in Shadow Roots. Closed shadow roots cannot be traversed via standard DOM APIs; you must call custom element methods. Kameleo can patch kernels to expose closed roots as if they were open, simplifying selectors for scraping, testing, and CAPTCHA widget handling.

!!!warning Side effects
Opening all closed roots may: (1) expose implementation details sites rely on staying private, (2) cause fragile selectors if a site later restructures components. Use only when you specifically need access closed roots.
!!!

## Option 1: Enable when starting a profile (SDKs)

Set `kameleo:forceOpenShadowRoot = true` in the browser start settings / request body when calling the start endpoint.

+++ Python

```python
from kameleo.local_api_client.models import BrowserSettings, Preference

# Assume an existing profile object or create one beforehand
client.profile.start_profile(profile.id, BrowserSettings(
    additional_options=[Preference(key='kameleo:forceOpenShadowRoot', value=True)]
))
print('Profile started with forced open shadow roots')
```

+++ JavaScript

```js
await client.profile.startProfile(profile.id, {
    additionalOptions: [{ key: "kameleo:forceOpenShadowRoot", value: true }],
});

console.log("Profile started with forced open shadow roots");
```

+++ C#

```csharp
using System.Collections.Generic;
using Kameleo.LocalApiClient.Model;

await client.Profile.StartProfileAsync(profile.Id, new BrowserSettings
{
    AdditionalOptions = new List<Preference> { new Preference("kameleo:forceOpenShadowRoot", true) }
});

Console.WriteLine("Profile started with forced open shadow roots");
```

+++

## Option 2: Enable through Selenium WebDriver capability

Add the custom capability `kameleo:forceOpenShadowRoot: true` (alongside `kameleo:profileId`).

+++ Python

```python
from selenium import webdriver

caps = {
    'kameleo:profileId': profile_id,  # existing profile id
    'kameleo:forceOpenShadowRoot': True,
    'browserName': 'Kameleo'
}
driver = webdriver.Remote(command_executor='http://localhost:5050/webdriver', desired_capabilities=caps)
```

+++ JavaScript

```js
import { Builder } from "selenium-webdriver";

const driver = await new Builder()
    .usingServer("http://localhost:5050/webdriver")
    .withCapabilities({
        "kameleo:profileId": profile.id,
        "kameleo:forceOpenShadowRoot": true,
        browserName: "Kameleo",
    })
    .build();
```

+++ C#

```csharp
using OpenQA.Selenium;
using OpenQA.Selenium.Remote;

var caps = new OpenQA.Selenium.Remote.DesiredCapabilities();
caps.SetCapability("kameleo:profileId", profileId);
caps.SetCapability("kameleo:forceOpenShadowRoot", true);
caps.SetCapability("browserName", "Kameleo");

var driver = new RemoteWebDriver(new Uri("http://localhost:5050/webdriver"), caps);
```

+++

## 5. Validate

1. Navigate to a site known to use closed shadow roots (e.g., Cloudflare Turnstile).
2. Open DevTools Console and run:

```js
// All shadow roots should be accessible
[...document.querySelectorAll("*")]
    .map((el) => el.shadowRoot)
    .filter((r) => r)
    .slice(0, 5);
```

If objects are returned for components that normally have closed roots, the feature works.

## 6. Troubleshooting

| Symptom                        | Resolution                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| No additional roots accessible | Ensure you passed the option at start; stopping/restarting is required for changes. |
| Slower initial page load       | Disable the option for profiles where it's not required.                            |
| Site scripts behave oddly      | Try without the feature; some code may depend on closed encapsulation.              |
