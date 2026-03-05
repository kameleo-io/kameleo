---
order: -402
title: Manage profiles
description: Create, start, update, duplicate, export, and delete browser profiles safely.
permalink: /tutorials/managing-profiles
---

In this tutorial you will walk through the full lifecycle of a browser profile: search a fingerprint, create a profile, start and stop it, update settings (add a proxy), duplicate via export/import, and finally delete it when no longer needed.

## Prerequisites

- Completion of the [Quickstart](../01-getting-started/02-quickstart.md) guide
- Kameleo app running locally (`http://localhost:5050`)

## 1. Search a fingerprint

Pick a recent desktop Chrome fingerprint (adjust filters as needed). Limit filtering at first, then narrow.

+++ Python

```python
fps = client.fingerprint.search_fingerprints(device_type="desktop", browser_product="chrome")
fingerprint = fps[0]
print("Selected fingerprint", fingerprint.id)
```

+++ JavaScript

```javascript
const fps = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");
const fingerprint = fps[0];
console.log("Selected fingerprint", fingerprint.id);
```

+++ C#

```csharp
var fps = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "chrome");
var fingerprint = fps[0];
Console.WriteLine($"Selected fingerprint {fingerprint.Id}");
```

+++

## 2. Create the profile

Below is a full example showing every configurable field of the profile creation request. In real use you often only set `fingerprintId`, `name`, maybe `language`, `proxy`, and a couple of masking overrides. Leave any field out to accept the default inferred from the fingerprint.

!!!tip Full option reference
For the exhaustive list of allowed values, defaults, and schema details, consult the OpenAPI specification in the [API reference](../05-reference/02-api-reference.md).
!!!

+++ Python

```python
from kameleo.local_api_client.models import (
  CreateProfileRequest,
  TimezoneChoice, GeolocationChoice, ProxyChoice, Server, WebRtcChoice,
  ScreenChoice, ScreenSize, HardwareConcurrencyChoice, DeviceMemoryChoice,
  WebglMetaChoice, WebglMetaValue, TimezoneSpoofingType, GeolocationSpoofingType,
  WebRtcSpoofingType, ScreenSpoofingType, HardwareConcurrencySpoofingType,
  DeviceMemorySpoofingType, ProxyConnectionType, WebglMetaSpoofingType
)

# Full request showcasing every available field. Omit fields you don't need.
create_req = CreateProfileRequest(
  fingerprint_id=fingerprint.id,
  name='acct-main',
  folder_id=None,
  tags=['marketing', 'facebook'],
  canvas='intelligent',
  webgl='noise',
  webgl_meta=WebglMetaChoice(
    value=WebglMetaSpoofingType.MANUAL,
    extra=WebglMetaValue(vendor='Intel Inc.', renderer='Intel Iris OpenGL Engine')
  ),
  audio='noise',
  timezone=TimezoneChoice(value=TimezoneSpoofingType.MANUAL, extra='Europe/Berlin'),
  geolocation=GeolocationChoice(value=GeolocationSpoofingType.MANUAL, extra={'latitude': 52.52, 'longitude': 13.405, 'accuracy': 10}),
  proxy=ProxyChoice(value=ProxyConnectionType.HTTP, extra=Server(host='proxy.example', port=8000, id='user', secret='pass')),
  web_rtc=WebRtcChoice(value=WebRtcSpoofingType.MANUAL, extra={'localIp': '10.0.0.5', 'publicIp': '93.184.216.34'}),
  fonts='automatic',
  screen=ScreenChoice(value=ScreenSpoofingType.MANUAL, extra=ScreenSize(width=1920, height=1080)),
  hardware_concurrency=HardwareConcurrencyChoice(value=HardwareConcurrencySpoofingType.MANUAL, extra=8),
  device_memory=DeviceMemoryChoice(value=DeviceMemorySpoofingType.MANUAL, extra=8),
  language='en-US',
  start_page='https://whoer.net/',
  password_manager='enabled',
  extensions=['/absolute/path/extension.crx'],
  notes='I used this profile for affiliate marketing.',
  storage='local'
)

profile = client.profile.create_profile(create_req)
print('Created profile', profile.id)
```

+++ JavaScript

```javascript
// Full request showcasing every available field. Omit fields you don't need.
const profile = await client.profile.createProfile({
    fingerprintId: fingerprint.id,
    name: "acct-main",
    folderId: null,
    tags: ["marketing", "facebook"],
    canvas: "intelligent",
    webgl: "noise",
    webglMeta: { value: "manual", extra: { vendor: "Intel Inc.", renderer: "Intel Iris OpenGL Engine" } },
    audio: "noise",
    timezone: { value: "manual", extra: "Europe/Berlin" },
    geolocation: { value: "manual", extra: { latitude: 52.52, longitude: 13.405, accuracy: 10 } },
    proxy: { value: "http", extra: { host: "proxy.example", port: 8000, id: "user", secret: "pass" } },
    webRtc: { value: "manual", extra: { localIp: "10.0.0.5", publicIp: "93.184.216.34" } },
    fonts: "automatic",
    screen: { value: "manual", extra: { width: 1920, height: 1080 } },
    hardwareConcurrency: { value: "manual", extra: 8 },
    deviceMemory: { value: "manual", extra: 8 },
    language: "en-US",
    startPage: "https://whoer.net/",
    passwordManager: "enabled",
    extensions: ["/absolute/path/extension.crx"],
    notes: "I used this profile for affiliate marketing.",
    storage: "local",
});
console.log("Created profile", profile.id);
```

+++ C#

```csharp
using Kameleo.LocalApiClient.Model;

// Full request showcasing every available field. Omit fields you don't need.
var create = new CreateProfileRequest(
  fingerprintId: fingerprint.Id,
  name: "acct-main",
  folderId: null,
  tags: new List<string> { "marketing", "facebook" },
  canvas: CanvasSpoofingType.Intelligent,
  webgl: WebglSpoofingType.Noise,
  webglMeta: new WebglMetaChoice(WebglMetaSpoofingType.Manual, new WebglMetaValue(vendor: "Intel Inc.", renderer: "Intel Iris OpenGL Engine")),
  audio: AudioSpoofingType.Noise,
  timezone: new TimezoneChoice(TimezoneSpoofingType.Manual, extra: "Europe/Berlin"),
  geolocation: new GeolocationChoice(GeolocationSpoofingType.Manual, new GeolocationValue(latitude: 52.52, longitude: 13.405, accuracy: 10)),
  proxy: new ProxyChoice(ProxyConnectionType.Http, new Server(host: "proxy.example", port: 8000, id: "user", secret: "pass")),
  webRtc: new WebRtcChoice(WebRtcSpoofingType.Manual, new WebRtcSpoofingOptions(publicIp: "93.184.216.34")),
  fonts: FontSpoofingType.Automatic,
  screen: new ScreenChoice(ScreenSpoofingType.Manual, new ScreenSize(width: 1920, height: 1080)),
  hardwareConcurrency: new HardwareConcurrencyChoice(HardwareConcurrencySpoofingType.Manual, extra: 8),
  deviceMemory: new DeviceMemoryChoice(DeviceMemorySpoofingType.Manual, extra: 8),
  language: "en-US",
  startPage: "https://whoer.net/",
  passwordManager: PasswordManagerType.Enabled,
  extensions: new List<string> { "/absolute/path/extension.crx" },
  notes: "I used this profile for affiliate marketing.",
  storage: ProfileStorageLocation.Local
);

var profile = await client.Profile.CreateProfileAsync(create);
Console.WriteLine($"Created profile {profile.Id}");
```

+++

## 3. Start and stop the profile

Only start when you are ready to automate. Stop to free resources; the session state (cookies, storage) is preserved.

+++ Python

```python
client.profile.start_profile(profile.id)
print('Profile started')

client.profile.stop_profile(profile.id)
print('Profile stopped')
```

+++ JavaScript

```javascript
await client.profile.startProfile(profile.id);
console.log("Profile started");

await client.profile.stopProfile(profile.id);
console.log("Profile stopped");
```

+++ C#

```csharp
await client.Profile.StartProfileAsync(profile.Id);
Console.WriteLine("Profile started");

await client.Profile.StopProfileAsync(profile.Id);
Console.WriteLine("Profile stopped");
```

+++

## 4. Update settings (add a proxy)

Updates require the profile to be in a stopped (terminated) state. Attempting to change network settings while running can fail or cause instability.

+++ Python

```python
from kameleo.local_api_client.models import ProxyChoice, Server, UpdateProfileRequest, ProxyConnectionType

update_req = UpdateProfileRequest(proxy=ProxyChoice(value=ProxyConnectionType.HTTP, extra=Server(host='proxy.example', port=8000, id='u', secret='p')))
updated = client.profile.update_profile(profile.id, update_profile_request=update_req)
print('Proxy set to', updated.proxy.value)
```

+++ JavaScript

```javascript
const updated = await client.profile.updateProfile(profile.id, {
    proxy: { value: "http", extra: { host: "proxy.example", port: 8000, id: "u", secret: "p" } },
});
console.log("Proxy set to", updated.proxy?.value);
```

+++ C#

```csharp
var update = new UpdateProfileRequest(proxy: new ProxyChoice(ProxyConnectionType.Http, new Server(host: "proxy.example", port: 8000, id: "u", secret: "p")));
var updated = await client.Profile.UpdateProfileAsync(profile.Id, update);
Console.WriteLine($"Proxy set to {updated.Proxy?.Value}");
```

+++

## 5. Export and import (backup / restore)

Export creates a portable archive (.kameleo) of the existing profile (including settings, storage, cookies, history, bookmarks, extensions). Importing restores that exact profile (same profile ID). Import will fail if a profile with the same ID is already loaded.

!!!warning Import behavior
Export/Import preserves the original profile ID. To create a second independent copy with a new ID use the Duplicate method instead.
!!!

+++ Python

```python
# Ensure the profile is stopped, then back it up
from kameleo.local_api_client.models import ExportProfileRequest, ImportProfileRequest

client.profile.stop_profile(profile.id)
client.profile.export_profile(profile.id, export_profile_request=ExportProfileRequest(path='./acct-main.kameleo'))
print('Exported profile to acct-main.kameleo')

# Remove (or move to another machine) before restoring; import will fail if same ID is still loaded
client.profile.delete_profile(profile.id)
restored = client.profile.import_profile(import_profile_request=ImportProfileRequest(path='./acct-main.kameleo'))
print('Restored profile with SAME ID', restored.id)
```

+++ JavaScript

```javascript
// Stop, export, delete, then import to restore
await client.profile.stopProfile(profile.id);
await client.profile.exportProfile(profile.id, { path: "./acct-main.kameleo" });
console.log("Exported profile to acct-main.kameleo");

await client.profile.deleteProfile(profile.id);
const restored = await client.profile.importProfile({ path: "./acct-main.kameleo" });
console.log("Restored profile with SAME ID", restored.id);
```

+++ C#

```csharp
await client.Profile.StopProfileAsync(profile.Id);
await client.Profile.ExportProfileAsync(profile.Id, new ExportProfileRequest(path: "./acct-main.kameleo"));
Console.WriteLine("Exported profile to acct-main.kameleo");

await client.Profile.DeleteProfileAsync(profile.Id);
var restored = await client.Profile.ImportProfileAsync(new ImportProfileRequest(path: "./acct-main.kameleo"));
Console.WriteLine($"Restored profile with SAME ID {restored.Id}");
```

+++

## 6. Upgrade the profile (browser/kernel)

Keep profiles current to benefit from the latest browser security patches, modern TLS/cipher suites, and widely distributed real‑world fingerprints. Upgrading refreshes the profile's fingerprint to the newest matching browser version and (if applicable) switches to a better fitting kernel. The profile ID, local storage (cookies, history, etc.), and your settings remain; only the browser fingerprinting surface changes.

!!!warning Fingerprint changes
Upgrading alters the browser version and related fingerprint fields. If a site correlates prior visits with the old version, a sudden jump might look suspicious. Prefer upgrading right after creation or during a maintenance window, not mid critical automation flow.
!!!

+++ Python

```python
# Ensure the profile is stopped before upgrading
client.profile.stop_profile(profile.id)

upgraded = client.profile.upgrade_profile_kernel(profile.id)
print('Upgraded browser to', upgraded.fingerprint.browser.product, upgraded.fingerprint.browser.version)
```

+++ JavaScript

```javascript
// Make sure the profile is stopped first
await client.profile.stopProfile(profile.id);

const upgraded = await client.profile.upgradeProfileKernel(profile.id);
if (upgraded) {
    console.log("Upgraded browser to", upgraded.fingerprint.browser.product, upgraded.fingerprint.browser.version);
} else {
    console.log("Profile already up to date");
}
```

+++ C#

```csharp
// Stop the profile if it is running
await client.Profile.StopProfileAsync(profile.Id);

profile = await client.Profile.UpgradeProfileKernelAsync(profile.Id);
Console.WriteLine($"Browser after upgrade: {profile.Fingerprint.Browser.Product} {profile.Fingerprint.Browser.VarVersion}");
```

+++

## 7. Delete when finished

Remove profiles you no longer need to keep the workspace clean and reclaim disk space (profiles store cached browsing data, extensions, cookies, history, and other artifacts).

+++ Python

```python
client.profile.delete_profile(profile.id)
print('Deleted original profile')
```

+++ JavaScript

```javascript
await client.profile.deleteProfile(profile.id);
console.log("Deleted original profile");
```

+++ C#

```csharp
await client.Profile.DeleteProfileAsync(profile.Id);
Console.WriteLine("Deleted original profile");
```

+++
