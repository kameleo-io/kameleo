---
order: -409
title: Start headless browsers
description: Run Chroma and Junglefox profiles in headless mode while keeping masking fidelity and avoiding common pitfalls.
permalink: /tutorials/starting-headless-browsers
---

In this tutorial you will launch Chroma (Chromium-based) and Junglefox (Firefox-based) profiles in headless mode, choose the correct flags, and balance performance with detection resilience.

## Prerequisites

- Completion of the [Quickstart](../01-getting-started/02-quickstart.md) guide
- ID of an existing profile that is currently stopped
- Local API running (default: <http://localhost:5050>)

## 1. Start Chroma headless

Use `--headless` for Chroma. Current Chroma builds map this to the modern headless mode automatically; you no longer need the historical `--headless=new` variant. If you need deeper Chromium implementation detail, see the official Chrome headless guide: <https://developer.chrome.com/docs/chromium/headless>.

+++ Python

```python
from kameleo.local_api_client.models import BrowserSettings

client.profile.start_profile(profile.id, BrowserSettings(
    arguments=[
        'headless'
    ]
))
print('Started Chroma headless')
```

+++ JavaScript

```javascript
await client.profile.startProfile(profile.id, {
    arguments: ["headless"],
});
console.log("Started Chroma headless");
```

+++ C#

```csharp
using System.Collections.Generic;
using Kameleo.LocalApiClient.Model;

await client.Profile.StartProfileAsync(profile.Id, new BrowserSettings
{
    Arguments = new List<string>
    {
        "headless"
    }
});
Console.WriteLine("Started Chroma headless");
```

+++

## 2. Start Junglefox headless

Firefox (Junglefox) uses the single-dash `-headless` flag. Keep arguments minimal; masking already supplies coordinated feature settings. For more background on Firefox headless behavior, consult Mozilla's article: <https://hacks.mozilla.org/2017/12/using-headless-mode-in-firefox/>.

+++ Python

```python
from kameleo.local_api_client.models import BrowserSettings

client.profile.start_profile(profile_id, BrowserSettings(
    arguments=[
        'headless'
    ]
))
print('Started Junglefox headless')
```

+++ JavaScript

```javascript
await client.profile.startProfile(profile.id, {
    arguments: ["headless"],
});
console.log("Started Junglefox headless");
```

+++ C#

```csharp
using System.Collections.Generic;
using Kameleo.LocalApiClient.Model;

await client.Profile.StartProfileAsync(profile.Id, new BrowserSettings
{
    Arguments = new List<string>
    {
        "headless"
    }
});
Console.WriteLine("Started Junglefox headless");
```

+++

## 3. More information

If you need to dive deeper into native browser headless capabilities or limitations, refer to the upstream documentation:

- Chromium headless: <https://developer.chrome.com/docs/chromium/headless>
- Firefox headless: <https://hacks.mozilla.org/2017/12/using-headless-mode-in-firefox/>
