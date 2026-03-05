---
order: -404
title: Import & export cookies
description: Create, modify, and remove all cookies of a Kameleo profile safely using the SDK.
permalink: /tutorials/import-export-cookies
---

In this tutorial you will learn how to list, add, update, and delete cookies of a Kameleo browser profile using the Local API SDKs. This lets you preserve or reset authenticated sessions programmatically.

## Prerequisites

- Completion of the [Quickstart](../01-getting-started/02-quickstart.md) guide
- Kameleo app running locally (`http://localhost:5050`)

!!!warning Sensitive data
Cookies can contain session IDs, refresh tokens, or tracking data. Never store them unencrypted or commit them to source control. Limit file system permissions.
!!!

## 1. Create & start a profile, then gather cookies

Navigate a few high‑traffic sites to accumulate cookies, then stop the profile so you can manipulate them. Cookies can be listed, modified, or deleted only after the profile is terminated.

+++ Python

```python
from kameleo.local_api_client.models import CreateProfileRequest, CookieRequest
from selenium import webdriver
import time, os

fingerprints = client.fingerprint.search_fingerprints(device_type='desktop', browser_product='firefox')
profile = client.profile.create_profile(CreateProfileRequest(fingerprint_id=fingerprints[0].id, name='cookie tutorial'))

opts = webdriver.FirefoxOptions()
opts.set_capability('kameleo:profileId', profile.id)
driver = webdriver.Remote(command_executor=f"http://localhost:{os.getenv('KAMELEO_PORT', '5050')}/webdriver", options=opts)

for url in ['https://www.nytimes.com', 'https://whoer.net', 'https://www.youtube.com']:
    driver.get(url)
    time.sleep(5)

client.profile.stop_profile(profile.id)
```

+++ JavaScript

```javascript
import { Builder } from "selenium-webdriver";

const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "firefox");
const profile = await client.profile.createProfile({ fingerprintId: fingerprints[0].id, name: "cookie tutorial" });

const webdriver = await new Builder()
    .usingServer(`http://localhost:5050/webdriver`)
    .withCapabilities({ "kameleo:profileId": profile.id, browserName: "Kameleo" })
    .build();

for (const url of ["https://www.nytimes.com", "https://whoer.net", "https://www.youtube.com"]) {
    await webdriver.get(url);
    await webdriver.sleep(5000);
}

await client.profile.stopProfile(profile.id);
```

+++ C#

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Kameleo.LocalApiClient.Model;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Remote;

var fps = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "firefox");
var profile = await client.Profile.CreateProfileAsync(new CreateProfileRequest(fps[0].Id) { Name = "cookie tutorial" });

var wdUri = new Uri("http://localhost:5050/webdriver");
var opts = new FirefoxOptions();
opts.AddAdditionalOption("kameleo:profileId", profile.Id.ToString());
var driver = new RemoteWebDriver(wdUri, opts);

foreach (var url in new[] { "https://www.nytimes.com", "https://whoer.net", "https://www.youtube.com" }) {
    await driver.Navigate().GoToUrlAsync(url); await Task.Delay(5000);
}

await client.Profile.StopProfileAsync(profile.Id);
```

+++

## 2. List cookies

Listing lets you choose which cookie to update or duplicate.

+++ Python

```python
cookie_list = client.cookie.list_cookies(profile.id)
for c in cookie_list[:5]:
  print(c.domain, c.name, c.value[:20])
```

+++ JavaScript

```javascript
const cookieList = await client.cookie.listCookies(profile.id);
cookieList.slice(0, 5).forEach((c) => console.log(c.domain, c.name, c.value.substring(0, 20)));
```

+++ C#

```csharp
var cookieList = await client.Cookie.ListCookiesAsync(profile.Id);
var limit = Math.Min(5, cookieList.Count);
for (var i = 0; i < limit; i++)
{
  var c = cookieList[i];
  var preview = c.Value.Length > 20 ? c.Value.Substring(0, 20) : c.Value;
  Console.WriteLine($"{c.Domain} {c.Name} {preview}");
}
```

+++

## 3. Add a new cookie

Ensure domain/path match the target site you will later visit; secure/httponly/samesite settings should reflect the intended usage.

+++ Python

```python
new_cookie = CookieRequest(
    domain='.example.com', name='custom_flag', value='enabled', path='/', secure=True,
    http_only=False, host_only=False, same_site='Lax'
)
client.cookie.add_cookies(profile.id, [new_cookie])
print('Added new cookie custom_flag')
```

+++ JavaScript

```javascript
const newCookie = {
    domain: ".example.com",
    name: "custom_flag",
    value: "enabled",
    path: "/",
    secure: true,
    httpOnly: false,
    hostOnly: false,
    sameSite: "Lax",
};
await client.cookie.addCookies(profile.id, [newCookie]);
console.log("Added new cookie custom_flag");
```

+++ C#

```csharp
var addCookie = new CookieRequest(domain: ".example.com", name: "custom_flag", path: "/", value: "enabled")
{
    Secure = true,
    HttpOnly = false,
    HostOnly = false,
    SameSite = "Lax"
};
await client.Cookie.AddCookiesAsync(profile.Id, new List<CookieRequest> { addCookie });
Console.WriteLine("Added new cookie custom_flag");
```

+++

## 4. Update an existing cookie

Select a cookie, modify its value, and re-add it via the same add API (it overwrites by name+domain+path).

+++ Python

```python
original = cookie_list[0]
updated = CookieRequest(domain=original.domain, name=original.name, path=original.path, value='123',
                        host_only=original.host_only, http_only=original.http_only, secure=original.secure,
                        same_site=original.same_site, expiration_date=original.expiration_date)
client.cookie.add_cookies(profile.id, [updated])
print(f'Updated cookie {original.name} -> 123')
```

+++ JavaScript

```javascript
const toUpdate = { ...cookieList[0] };
toUpdate.value = "123";
await client.cookie.addCookies(profile.id, [toUpdate]);
console.log(`Updated cookie ${toUpdate.name} -> 123`);
```

+++ C#

```csharp
var toUpdate = cookieList[0];
toUpdate.Value = "123";
var updateReq = new CookieRequest(toUpdate);
await client.Cookie.AddCookiesAsync(profile.Id, new List<CookieRequest> { updateReq });
Console.WriteLine($"Updated cookie {toUpdate.Name} -> 123");
```

+++

## 5. Delete all cookies

Use this to force a full logout / session reset while keeping other profile state (extensions, local storage, etc.).

+++ Python

```python
client.cookie.delete_cookies(profile.id)
print('Deleted all cookies')
```

+++ JavaScript

```javascript
await client.cookie.deleteCookies(profile.id);
console.log("Deleted all cookies");
```

+++ C#

```csharp
await client.Cookie.DeleteCookiesAsync(profile.Id);
Console.WriteLine("Deleted all cookies");
```

+++

## 6. (Optional) Restart to verify

Start the profile again and inspect cookies in DevTools or list them once more via the API; added values should appear (unless domain mismatch) and deletions should persist.
