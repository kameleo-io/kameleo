---
order: -403
title: Using proxy servers
meta:
    description: Attach, test, update, rotate, and remove HTTP, HTTPS, SOCKS5, or SSH proxies on a Kameleo profile, including proxy bypass rules for trusted domains.
permalink: /tutorials/using-proxy-servers
---

You will create a new profile with a SOCKS5 proxy, verify that the proxy works, change it to an HTTP proxy, then remove the proxy entirely. The flow is identical across all SDKs; code samples are provided for Python, JavaScript, and C#.

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

fps = client.fingerprint.search_fingerprints(browser_product='chrome')
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
const fps = await client.fingerprint.searchFingerprints(undefined, undefined, "chrome"); // Fetch a Chrome fingerprint
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

## 2. Test the proxy connection

Check that the proxy you just attached actually works, before you start the browser. The profile keeps the credentials, so you only pass its id.

+++ Python

```python
result = client.profile.test_profile_proxy(profile.id)
print('Proxy test result:', result.result)
for step in result.steps:
    print(step.name, '->', 'ok' if step.successful else step.comment)
```

+++ JavaScript

```javascript
const result = await client.profile.testProfileProxy(profile.id);
console.log("Proxy test result:", result.result);
for (const step of result.steps) {
    console.log(step.name, "->", step.successful ? "ok" : step.comment);
}
```

+++ C#

```csharp
var result = await client.Profile.TestProfileProxyAsync(profile.Id);
Console.WriteLine($"Proxy test result: {result.Result}");
foreach (var step in result.Steps)
{
    Console.WriteLine($"{step.Name} -> {(step.Successful ? "ok" : step.Comment)}");
}
```

+++

### Interpret the result

The response carries an overall `result` and the list of `steps` that were executed.

| Result            | Meaning                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `success`         | Every step passed.                                                                                            |
| `partial_success` | The website was reachable over at least one of IPv4, IPv6, or DNS name, and the IP location lookup succeeded. |
| `failure`         | None of the connectivity checks succeeded.                                                                    |

Treat `partial_success` as usable but degraded. It commonly means the proxy has no IPv6 route, which is fine for most targets.

A `failure` result arrives as a `503` error response instead of a normal one, so the SDKs raise an exception rather than returning it. Wrap the call in a try/catch if you want to handle an unusable proxy yourself.

Each entry in `steps` carries a `step` identifier, a human-readable `name`, a `successful` flag, and a `comment` holding the error message when the step failed.

| Step             | Checks                                              |
| ---------------- | --------------------------------------------------- |
| `ssh_connection` | Connection to the proxy server. SSH proxies only.   |
| `direct_ping`    | Direct internet connectivity, bypassing the proxy.  |
| `direct_https`   | Direct HTTPS connectivity, bypassing the proxy.     |
| `proxy_ipv4`     | IPv4 connectivity through the proxy.                |
| `proxy_ipv6`     | IPv6 connectivity through the proxy.                |
| `proxy_website`  | HTTPS connectivity to a website through the proxy.  |
| `proxy_location` | Geographic location lookup of the proxy IP address. |

!!!tip Note
The `direct_*` steps do not use the proxy. When they fail there is a problem with your internet connection, not with the proxy.
!!!

### Test a proxy without a profile

You do not need a profile to run the test. Pass the connection settings directly when you want to check a proxy before committing to it, for example while picking a working one out of a pool. Nothing is stored and the response is identical to the one above.

+++ Python

```python
from kameleo.local_api_client.models import TestProxyRequest, ProxyChoice, Server

result = client.general.test_proxy(TestProxyRequest(
    proxy=ProxyChoice(
        value='socks5',
        extra=Server(host='1.2.3.4', port=1080, id='user', secret='pass')
    )
))
print('Proxy test result:', result.result)
```

+++ JavaScript

```javascript
const result = await client.general.testProxy({
    proxy: {
        value: "socks5",
        extra: { host: "1.2.3.4", port: 1080, id: "user", secret: "pass" },
    },
});
console.log("Proxy test result:", result.result);
```

+++ C#

```csharp
var request = new TestProxyRequest(new ProxyChoice(
    value: ProxyConnectionType.Socks5,
    extra: new Server(host: "1.2.3.4", port: 1080, id: "user", secret: "pass")
));

var result = await client.General.TestProxyAsync(request);
Console.WriteLine($"Proxy test result: {result.Result}");
```

+++

## 3. Update the proxy

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

## 4. Remove the proxy

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

## 5. Configure proxy bypass (optional)

Some destinations do not need to go through your proxy. Bypassing them reduces proxy bandwidth usage and lowers costs. Common candidates include CDN hosts serving static assets (images, fonts, scripts), video streaming domains, and internal services. Configure a bypass list so those hosts connect directly while the rest of the traffic uses the proxy.

Kameleo automatically adds its own loopback endpoints. You only provide the additional hosts or CIDR ranges. The mechanism differs per kernel:

- Chroma: supply an extra command-line switch `--proxy-bypass-list` with a semicolon-separated list.
- Junglefox: set the preference `network.proxy.no_proxies_on` with a comma-separated list.

### Chroma example

+++ Python

```python
from kameleo.local_api_client.models import BrowserSettings

client.profile.start_profile(profile_id, BrowserSettings(
    arguments=[
        '--proxy-bypass-list=*.internal.local;192.168.0.0/16'
    ]
))
```

+++ JavaScript

```javascript
await client.profile.startProfile(profile.id, {
    arguments: ["--proxy-bypass-list=*.internal.local;192.168.0.0/16"],
});
```

+++ C#

```csharp
await client.Profile.StartProfileAsync(profile.Id, new BrowserSettings
{
    Arguments = ["--proxy-bypass-list=*.internal.local;192.168.0.0/16"]
});
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
await client.profile.startProfile(profile.id, {
    preferences: [{ key: "network.proxy.no_proxies_on", value: "intranet.local,cdn.example.com:443" }],
});
```

+++ C#

```csharp
await client.Profile.StartProfileAsync(profile.Id, new BrowserSettings
{
    Preferences = [new("network.proxy.no_proxies_on", "intranet.local,cdn.example.com:443")]
});
```

+++

Guidelines:

- Keep the list minimal; every pattern incurs a small matching cost.
- Use CIDR for subnets instead of enumerating many hosts.
- Avoid bypassing domains that perform geo or security checks; you may expose differing IP behavior.
- Remember that bypass applies to all schemes (HTTP/HTTPS/WebSocket) for those hosts.

## 6. Limit WebRTC to proxied TCP (optional)

Kameleo automatically masks your WebRTC IP address to match your proxy IP. However, WebRTC can still leak your real IP through non-proxied UDP connections because browsers do not route UDP traffic through HTTP/SOCKS proxies by default, and some proxy providers do not support UDP traffic at all.

To prevent IP leaks, configure the browser to only allow WebRTC connections over TCP that go through your proxy. The mechanism differs per kernel:

- Chroma: set the preference `webrtc.ip_handling_policy` to `disable_non_proxied_udp`.
- Junglefox: set the preference `media.peerconnection.ice.proxy_only` to `true`.

### Chroma example

+++ Python

```python
from kameleo.local_api_client.models import BrowserSettings, Preference

client.profile.start_profile(profile.id, BrowserSettings(
    preferences=[
        Preference(key="webrtc.ip_handling_policy", value="disable_non_proxied_udp")
    ]
))
```

+++ JavaScript

```javascript
await client.profile.startProfile(profile.id, {
    preferences: [{ key: "webrtc.ip_handling_policy", value: "disable_non_proxied_udp" }],
});
```

+++ C#

```csharp
await client.Profile.StartProfileAsync(profile.Id, new BrowserSettings
{
    Preferences = [new("webrtc.ip_handling_policy", "disable_non_proxied_udp")]
});
```

+++

See more details: [Chrome's WebRTC IP handling policy](https://chromeenterprise.google/policies/web-rtc-ip-handling/).

### Junglefox example

+++ Python

```python
from kameleo.local_api_client.models import BrowserSettings, Preference

client.profile.start_profile(profile.id, BrowserSettings(
    preferences=[
        Preference(key="media.peerconnection.ice.proxy_only", value=True)
    ]
))
```

+++ JavaScript

```javascript
await client.profile.startProfile(profile.id, {
    preferences: [{ key: "media.peerconnection.ice.proxy_only", value: true }],
});
```

+++ C#

```csharp
await client.Profile.StartProfileAsync(profile.Id, new BrowserSettings
{
    Preferences = [new("media.peerconnection.ice.proxy_only", true)]
});
```

+++

## 7. Best practices

- Match proxy country with fingerprint locale and language.
- Rotate failing residential proxies; monitor connection error rate.
- Keep a warm pool of tested proxies to reduce startup latency.
- Avoid switching IP mid-session to prevent extra security or re-auth challenges.
