---
order: -406
title: Install browser extensions
description: Load, persist, update, and troubleshoot browser extensions in profiles.
permalink: /tutorials/install-browser-extensions
---

In this tutorial you will attach extensions to a profile at creation, add more later, and understand how persistence and compatibility work. Extensions can enhance automation (ad blocking, helper tooling) but must not conflict with fingerprint masking.

## Prerequisites

- Completion of the [Quickstart](../01-getting-started/02-quickstart.md) guide
- Kameleo app running locally (default `http://localhost:5050`)
- Local file paths to valid extension packages (`.crx` for Chromium, `.xpi` for Firefox)

!!!warning Avoid masking overlap
Do not install extensions that alter user agent, canvas, WebGL, timezone, or language. They may create inconsistencies versus Kameleo's coordinated fingerprint.
!!!

## 1. Add extensions at profile creation

+++ Python

```python
from kameleo_local_api_client import ProfileApi, Configuration, FingerprintApi
from kameleo_local_api_client.models import CreateProfileRequest

cfg = Configuration(host="http://localhost:5050")
fp_api = FingerprintApi(cfg)
profile_api = ProfileApi(cfg)

fp = fp_api.search_fingerprints(device_type='desktop', browser_product='chrome')[0]
profile = profile_api.create_profile(CreateProfileRequest(
        fingerprint_id=fp.id,
        name='with-extensions',
        extensions=["/Users/me/exts/uBlock.crx", "/Users/me/exts/helper.xpi"]
))
print('Created profile with extensions', profile.id)
```

+++ JavaScript

```javascript
import { FingerprintApi, ProfileApi } from "@kameleo/local-api";
const basePath = "http://localhost:5050";
const fpApi = new FingerprintApi({ basePath });
const profileApi = new ProfileApi({ basePath });

const fp = (await fpApi.searchFingerprints("desktop", undefined, "chrome"))[0];
const profile = await profileApi.createProfile({
    fingerprintId: fp.id,
    name: "with-extensions",
    extensions: ["/Users/me/exts/uBlock.crx", "/Users/me/exts/helper.xpi"],
});
console.log("Created profile", profile.id);
```

+++ C#

```csharp
using Kameleo.LocalApi;
using Kameleo.LocalApi.Apis;
using Kameleo.LocalApi.Models;

var cfg = new Configuration { BasePath = "http://localhost:5050" };
var fpApi = new FingerprintApi(cfg);
var profileApi = new ProfileApi(cfg);
var fp = (await fpApi.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "chrome"))[0];

var create = new CreateProfileRequest(
        fingerprintId: fp.Id,
        name: "with-extensions",
        extensions: new List<string> { "/Users/me/exts/uBlock.crx", "/Users/me/exts/helper.xpi" }
);
var profile = await profileApi.CreateProfileAsync(create);
Console.WriteLine($"Created profile {profile.Id}");
```

+++

## 2. Add extensions after creation

+++ Python

```python
from kameleo_local_api_client.models import UpdateProfileRequest
current = profile.extensions or []
update = UpdateProfileRequest(extensions=current + ["/Users/me/exts/newTool.crx"])
updated = profile_api.update_profile(profile.id, update_profile_request=update)
print('Extensions now:', updated.extensions)
```

+++ JavaScript

```javascript
const updated = await profileApi.updateProfile(profile.id, {
    extensions: [...(profile.extensions || []), "/Users/me/exts/newTool.crx"],
});
console.log("Extensions now", updated.extensions);
```

+++ C#

```csharp
var newList = profile.Extensions?.ToList() ?? new List<string>();
newList.Add("/Users/me/exts/newTool.crx");
var update = new UpdateProfileRequest(extensions: newList);
var updated = await profileApi.UpdateProfileAsync(profile.Id, update);
Console.WriteLine($"Extensions now: {string.Join(",", updated.Extensions)}");
```

+++

## 3. Persistence & export

- Extensions and their storage persist while the profile exists
- Exported profile archives (.kameleo) include installed extensions
- Importing the archive restores them automatically

## 4. Troubleshooting

| Issue                       | Resolution                                                       |
| --------------------------- | ---------------------------------------------------------------- |
| Extension missing on start  | Confirm path exists and has correct file extension (.crx/.xpi).  |
| Browser slow to launch      | Large extensions: remove unnecessary ones or profile separately. |
| Fingerprint mismatch alerts | Remove spoofing extensions that overlap with Kameleo masking.    |
