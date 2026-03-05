---
order: -407
title: Pass command-line switches
description: Safely add extra Chromium / Firefox command-line switches when starting a profile without weakening fingerprint masking.
permalink: /tutorials/passing-command-line-switches
---

In this tutorial you will add extra command-line switches to Chroma and Junglefox launches while keeping the coordinated fingerprint intact and avoiding blocked or redundant flags.

!!!tip Note
You can't set the start page by passing a URL as an argument. Use the `startPage` property when creating or updating the profile; only pass feature flags as command-line switches.
!!!

## Prerequisites

- Completion of the [Quickstart](../01-getting-started/02-quickstart.md) guide
- An existing profile
- Local API running (default: <http://localhost:5050>)

## 1. Launch a profile with extra arguments

Start a profile while adding a couple of benign switches.

+++ Python

```python
from kameleo.local_api_client.models import BrowserSettings

client.profile.start_profile(profile_id, BrowserSettings(
        arguments=[
            'disable-notifications',
            'mute-audio'
        ]
))
print('Started profile with custom arguments')
```

+++ JavaScript

```javascript
await client.profile.startProfile(profile.id, {
    arguments: ["disable-notifications", "mute-audio"],
});
console.log("Started profile with custom arguments");
```

+++ C#

```csharp
await client.Profile.StartProfileAsync(profile.Id, new BrowserSettings
{
    Arguments = new List<string>
    {
        "disable-notifications",
        "mute-audio"
    }
});
Console.WriteLine("Started profile with custom arguments");
```

+++

If any supplied switch is blacklisted, Kameleo returns an error explaining which argument is incompatible.

## 2. Blacklisted switches

Some native browser switches are blocked to preserve fingerprint integrity and avoid conflicts. See the full list: [Blacklisted browser switches](../05-reference/06-blacklisted-browser-switches.md).

## 3. Full references

For comprehensive lists of native browser command line options, see:

- Chroma: <https://peter.sh/experiments/chromium-command-line-switches/>
- Junglefox: <https://wiki.mozilla.org/Firefox/CommandLineOptions>
