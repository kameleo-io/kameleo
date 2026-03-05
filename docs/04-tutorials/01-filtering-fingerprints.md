---
order: -401
title: Filter browser fingerprints
description: Search and filter up to 25 realistic fingerprints before creating a profile.
permalink: /tutorials/filtering-fingerprints
---

In this tutorial you will query the `SearchFingerprints` endpoint to retrieve candidate browser fingerprints, refine the results with filters (device type, OS family, browser product, version constraints), and pick one to use when creating a profile.

## Prerequisites

- Completion of the [Quickstart](../01-getting-started/02-quickstart.md) guide
- Kameleo app is running locally (default API base URL: `http://localhost:5050`).
- Network access to the local API port (no firewall blocking 5050).

## Parameter reference

The `SearchFingerprints` endpoint accepts these optional parameters (all are filters; omit to broaden results):

| Name             | Description                                                                                                   | Examples                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `deviceType`     | Device category. Accepts `desktop`, `mobile`. Comma-separated list allowed.                                   | `desktop`, `mobile`      |
| `osFamily`       | Operating system family. Accepts `windows`, `macos`, `linux`, `android`, `ios`. Comma-separated list allowed. | `windows`, `macos,linux` |
| `browserProduct` | Browser engine/product. Accepts `chrome`, `firefox`, `edge`, `safari`. Comma-separated list allowed.          | `chrome`, `chrome,edge`  |
| `browserVersion` | Version filter. Optional comparator + major number (`>135`, `<=137`, `=136`). No comparator means equality.   | `>135`, `136`, `<=137`   |

Notes:

- Multiple comma-separated values perform a logical OR per field.
- Unspecified fields broaden the search and may increase diversity.
- The API returns an array of `FingerprintPreview` objects (see [API reference](../05-reference/02-api-reference.md)). Each preview contains enough metadata for choosing a candidate; you supply its attributes when creating a profile.

## Basic search example

The endpoint always returns up to 25 matching items ordered by newest browser versions first. Repeating the same query yields a different random subset - cache or persist the one you pick if you need stability. Below you'll see how to fetch Windows Chrome fingerprints newer than version 135.

!!!warning API rate limits
Each fingerprint search request counts toward your API quota. Avoid rapid polling loops; broaden filters or cache previously retrieved candidates instead of re-querying repeatedly. See the [API rate limits](../05-reference/03-api-rate-limits.md) page for details.
!!!

+++ Python

```python
fingerprints = client.fingerprint.search_fingerprints(
    device_type="desktop",
    os_family="windows",
    browser_product="chrome",
    browser_version=">135",
)

if not fingerprints:
    print("No fingerprints found; broaden filters (remove version or add more osFamily values).")
else:
    fp = fingerprints[0]
    print(f"Picked fingerprint: {fp.browser.product} {fp.browser.version} on {fp.os.family}")
```

+++ JavaScript

```javascript
const fingerprints = await client.fingerprint.searchFingerprints(
    "desktop", // deviceType
    "windows", // osFamily
    "chrome", // browserProduct
    ">135", // browserVersion (comparator supported)
);

if (!fingerprints.length) {
    console.log("No fingerprints found; try removing the version constraint.");
} else {
    const fp = fingerprints[0];
    console.log(`Picked fingerprint: ${fp.browser.product} ${fp.browser.version} on ${fp.os.family}`);
}
```

+++ C#

```csharp
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync(
    "desktop", // deviceType
    "windows", // osFamily
    "chrome",  // browserProduct
    ">135"    // browserVersion
);

if (fingerprints.Count == 0)
{
    Console.WriteLine("No fingerprints found; loosen your filters.");
}
else
{
    var fp = fingerprints[0];
    Console.WriteLine($"Picked fingerprint: {fp.Browser.Product} {fp.Browser.VarVersion} on {fp.Os.Family}");
}
```

+++

## Picking quality candidates

Follow these guidelines:

- Align `osFamily`, proxy geo, and locale (e.g. `windows` + US proxy + `en-US`) for coherent targeting.
- Prefer current stable major versions (`chrome`, `edge`) unless you have a site-specific requirement.
- Avoid extremely old or rare combinations unless testing edge behavior.
- If you need mobile emulation, set `deviceType=mobile` and constrain `osFamily` to `android` or `ios` + a matching browser (Chrome for Android; Safari for iOS).

!!!tip Version filtering
Start broad: query without `browserVersion`, inspect results, then narrow (e.g. add `>135`). Empty list? Remove comparator or lower the version.
!!!

## Handling empty results

If a query returns zero fingerprints:

1. Remove the `browserVersion` filter.
2. Drop to a single value in multi-value fields to reduce mutually exclusive combinations.
3. Confirm spelling (`macos`, not `macOS`; `osFamily` not `platform`).
4. Try only `deviceType` first, then incrementally add filters.

Programmatically, detect empties and fallback to a broader search (e.g. call again without version).

## Advanced multi-value queries

You can OR values inside a parameter:

+++ Python

```python
fingerprints = client.fingerprint.search_fingerprints(
    device_type="desktop",
    os_family="windows,macos",
    browser_product="chrome,edge",
)
```

+++ JavaScript

```javascript
const fingerprints = await client.fingerprint.searchFingerprints("desktop", "windows,macos", "chrome,edge");
```

+++ C#

```csharp
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync(
    deviceType: "desktop",
    osFamily: "windows,macos",
    browserProduct: "chrome,edge"
);
```

+++
