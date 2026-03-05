---
order: -403
title: Using proxy servers
description: Add, update, rotate, and remove HTTP, HTTPS, SOCKS5, and SSH proxies on profiles.
permalink: /tutorials/using-proxy-servers
---

You will create a new profile with a SOCKS5 proxy, change it to an HTTP proxy, then remove the proxy entirely. The flow is identical across all SDKs; code samples are provided for Python, JavaScript, and C#.

## Prerequisites

- Completion of the [Quickstart](../01-getting-started/02-quickstart.md) guide
- Kameleo app is running locally (default API base URL: `http://localhost:5050`).
- Network access to the local API port (no firewall blocking 5050).
- Access to at least one working proxy server (HTTP, HTTPS, SOCKS5, or SSH) with host, port, and credentials if required.

## 1. Create a profile with a proxy

Select a fingerprint and attach a proxy at creation. Provide credentials only when required by your provider.

+++ Python

```python
from kameleo.local_api_client.models import CreateProfileRequest, ProxyChoice, Server

fps = client.fingerprint.search_fingerprints(device_type='desktop', browser_product='chrome')
profile = client.profile.create_profile(CreateProfileRequest(
    fingerprint_id=fps[0].id,
    name='proxy tutorial',
    proxy=ProxyChoice(
        value='socks5',
        extra=Server(host='1.2.3.4', port=1080, id='user', secret='pass')
    )
))
print('Created profile with proxy:', profile.id, profile.proxy.value)
```

+++ JavaScript

```javascript
// Assumes you created a local API client instance named `client`.
const fps = await client.fingerprint.searchFingerprints({ deviceType: "desktop", browserProduct: "chrome" }); // Fetch a Chrome desktop fingerprint
const profile = await client.profile.createProfile({
    fingerprintId: fps[0].id,
    name: "proxy tutorial",
    // ProxyChoice shape: { value: '<type>', extra: { host, port, id?, secret? } }
    proxy: {
        value: "socks5",
        extra: { host: "1.2.3.4", port: 1080, id: "user", secret: "pass" },
    },
});
console.log("Created profile with proxy", profile.id, profile.proxy?.value);
```

+++ C#

```csharp
using Kameleo.LocalApiClient;
using Kameleo.LocalApiClient.Model;

// Assumes you created a local API client instance named `client`.
var fps = client.Fingerprint.SearchFingerprints(deviceType: "desktop", browserProduct: "chrome"); // Fetch a Chrome desktop fingerprint

var create = new CreateProfileRequest(
    fingerprintId: fps[0].Id,
    name: "proxy tutorial",
    proxy: new ProxyChoice(value: ProxyConnectionType.Socks5, extra: new Server(host: "1.2.3.4", port: 1080, id: "user", secret: "pass"))
);
var profile = client.Profile.CreateProfile(create);
Console.WriteLine($"Created profile {profile.Id} with proxy {profile.Proxy?.Value}");
```

+++

Kameleo tests the proxy before launching the profile. If the test fails, the browser does not start.

## 2. Update the proxy

Stop the profile before changing proxy settings (rotation mid-session can cause network anomalies and is not supported).

+++ Python

```python
client.profile.stop_profile(profile.id)
updated = client.profile.update_profile(profile.id, update_profile_request={
    'proxy': ProxyChoice(value='http', extra=Server(host='proxy.host', port=8000))
})
print('Updated proxy to', updated.proxy.value)
```

+++ JavaScript

```javascript
await client.profile.stopProfile(profile.id);
const updated = await client.profile.updateProfile(profile.id, {
    proxy: {
        value: "http",
        extra: { host: "proxy.host", port: 8000 },
    },
});
console.log("Updated proxy to", updated.proxy?.value);
```

+++ C#

```csharp
client.Profile.StopProfile(profile.Id);
var update = new UpdateProfileRequest(proxy: new ProxyChoice(
    value: ProxyConnectionType.Http,
    extra: new Server(host: "proxy.host", port: 8000)
));
var updated = client.Profile.UpdateProfile(profile.Id, update);
Console.WriteLine($"Updated proxy to {updated.Proxy?.Value}");
```

+++

## 3. Remove the proxy

Set the proxy to null (or omit the field) to revert to a direct connection.

+++ Python

```python
removed = client.profile.update_profile(profile.id, update_profile_request={ 'proxy': None })
print('Proxy removed, value now:', removed.proxy)
```

+++ JavaScript

```javascript
const removed = await client.profile.updateProfile(profile.id, { proxy: null });
console.log("Proxy removed, now:", removed.proxy);
```

+++ C#

```csharp
var removed = client.Profile.UpdateProfile(profile.Id, new UpdateProfileRequest(proxy: null));
Console.WriteLine($"Proxy removed: {(removed.Proxy == null ? "yes" : "no")}");
```

+++

## 4. Proxy bypass handling

Some destinations should never go through your proxy (internal services, CDN hosts served locally, monitoring endpoints). Configure a bypass list so those hosts connect directly while the rest of the traffic uses the proxy.

Kameleo automatically adds its own loopback endpoints. You only provide the additional hosts or CIDR ranges. The mechanism differs per browser engine:

- Chroma (Chromium based): supply an extra command-line switch: `proxy-bypass-list` with a semicolon-separated list.
- Junglefox (Firefox based): set the preference `network.proxy.no_proxies_on` with a comma-separated list.

### Chroma example

+++ Python

```python
from kameleo.local_api_client.models import BrowserSettings

client.profile.start_profile(profile_id, BrowserSettings(
    arguments=[
        'proxy-bypass-list=*.internal.local;192.168.0.0/16'
    ]
))
```

+++ JavaScript

```javascript
await profileApi.startProfileWithOptions(profile.id, {
    additionalOptions: {
        arguments: ["proxy-bypass-list=*.internal.local;192.168.0.0/16"],
    },
});
```

+++ C#

```csharp
var chromaStart = new StartProfileWithOptionsRequest(
    additionalOptions: new AdditionalOptions(
        arguments: new List<string>
        {
            "proxy-bypass-list=*.internal.local;192.168.0.0/16"
        }
    )
);
await profileApi.StartProfileWithOptionsAsync(profile.Id, chromaStart);
```

+++

### Junglefox example

+++ Python

```python
from kameleo.local_api_client.models import BrowserSettings, Preference

client.profile.start_profile(profile_id, BrowserSettings(
    preferences=[
        Preference(key='network.proxy.no_proxies_on', value='intranet.local,cdn.example.com:443')
    ]
))
```

+++ JavaScript

```javascript
await profileApi.startProfileWithOptions(profile.id, {
    additionalOptions: {
        preferences: {
            "network.proxy.no_proxies_on": "intranet.local;cdn.example.com:443",
        },
    },
});
```

+++ C#

```csharp
var junglefoxStart = new StartProfileWithOptionsRequest(
    additionalOptions: new AdditionalOptions(
        preferences: new Dictionary<string, object>
        {
            { "network.proxy.no_proxies_on", "intranet.local,cdn.example.com:443" }
        }
    )
);
await profileApi.StartProfileWithOptionsAsync(profile.Id, junglefoxStart);
```

+++

Guidelines:

- Keep the list minimal; every pattern incurs a small matching cost.
- Use CIDR for subnets instead of enumerating many hosts.
- Avoid bypassing domains that perform geo or security checks; you may expose differing IP behavior.
- Remember that bypass applies to all schemes (HTTP/HTTPS/WebSocket) for those hosts.

## 5. Best practices

- Match proxy country with fingerprint locale and language.
- Rotate failing residential proxies; monitor connection error rate.
- Keep a warm pool of tested proxies to reduce startup latency.
- Avoid switching IP mid-session to prevent extra security or re-auth challenges.
