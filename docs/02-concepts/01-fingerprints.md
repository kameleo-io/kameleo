---
order: -201
title: Fingerprints
description: What fingerprints are and how they shape realistic browser profiles.
permalink: /concepts/fingerprints
---

A fingerprint is a real set of browser and device details (like user agent, OS, screen, GPU, languages) collected from an actual machine. Kameleo uses it to create a virtual browser profile whose values naturally belong together, instead of random mixes that look fake. Most fields come directly from the real sample; only a few dynamic parts are generated at creation to keep each profile unique. You can search through hundreds of thousands of fingerprints and filter by device type, platform, browser (and version), and language to quickly find the one you need.

## What a fingerprint includes

A fingerprint encapsulates a coherent set of attributes sourced from real telemetry and curated datasets:

- User agent (including build & patch numbers) aligned with engine capabilities
- Platform & OS metadata (e.g., Windows 11 64-bit, macOS 14, Android 14)
- Hardware exposure: device memory tiers, logical processor count buckets
- Rendering surfaces: WebGL vendor/renderer pairs, canvas entropy seeds
- Locale & languages (Accept-Language, navigator.language, time zone offset range)
- Screen & window metrics (resolution, color depth, pixel ratio)
- Media capabilities (audio/video codecs advertised via MSE / WebRTC)
- Browser feature switches / UA client hints (for versions that use them)

Kameleo rehydrates this data into a running profile and fills any intentionally mutable fields (like some WebRTC ICE candidates or WebGL noise) at profile creation time to maintain uniqueness.

## Why fingerprints matter

If you just randomize values you often end up with impossible mixes (like a GPU that never ships with that CPU, or a user agent claiming features that browser build doesn’t have). Detection systems notice these mismatches and lower trust. Real fingerprints keep related values in sync, so there are fewer red flags. That’s why Kameleo doesn’t let you manually change tightly linked fields like the user agent by itself - changing one piece would break the natural consistency and make the profile look fake.

## Filtering strategy

When searching fingerprints you can specify:

| Parameter      | Example                               | Notes                                            |
| -------------- | ------------------------------------- | ------------------------------------------------ |
| deviceType     | `desktop`, `mobile`                   | Impacts available screen sizes & input emulation |
| platform       | `windows`, `macos`, `ios`, `android`  | Maps to kernel and emulation mode                |
| browserProduct | `chrome`, `edge`, `firefox`, `safari` | Safari/iOS Safari emulate via Chroma mobile mode |
| browserVersion | `>137`, `=128`                        | Semantic comparator operators supported          |
| language       | `en-US`, `de`                         | Sets Accept-Language & navigator.language        |

Example:

+++ Python

```python
fps = await client.fingerprint.search_fingerprints(
    "desktop", "windows", "chrome", ">137"
)
```

+++ JavaScript

```js
const fps = await client.fingerprint.searchFingerprints("desktop", "windows", "chrome", ">137");
```

+++ C#

```csharp
var fps = await client.Fingerprint.SearchFingerprintsAsync(
    deviceType: "desktop",
    platform: "windows",
    browserProduct: "chrome",
    browserVersion: ">137");
```

+++

## Version alignment

Kernel versions are selected to match (or closely bracket) the fingerprint's browser version. If an exact build is unavailable, Kameleo chooses the nearest patched kernel ensuring feature parity without leaking mismatch signals.

## Reuse vs. rotation

Reuse a fingerprint when you want to keep a stable, long‑lived account or session identity. It is more efficient because you skip an extra fingerprint lookup and you keep behavioral and technical signals consistent over time. Even if you start multiple profiles from the same fingerprint at different moments, Kameleo still produces unique profiles: transient or noise fields (like some WebRTC candidates, canvas noise, minor entropy seeds) are freshly generated each time so they are not perfect clones.

Rotate (pick a different fingerprint) when you need a clearly separate identity: for parallel account farming, A/B testing isolated personas, or when a site starts assigning risk to the current profile. Avoid rotating too often without a reason - rapid unexplained changes in hardware/browser traits can itself look suspicious.

## Limitations

- Safari/WebKit fingerprints are emulated through Chroma's mobile emulation; certain WebKit-only APIs may not be identical.
- Rare legacy browsers are intentionally excluded to avoid improbable fingerprints.

## Best practices

- Align proxy geo with the fingerprint's locale/time zone for higher trust.
- Prefer mainstream, broadly deployed browser versions (current stable ± a few) over bleeding-edge or trailing versions.
- Let Kameleo manage user agent and platform fields; avoid overwriting them via automation scripts or page injections.
- Use realistic locale + time zone pairs (e.g., en-US + US zone); avoid improbable mixes.
  Keep window/screen sizes within typical ranges for the device type; avoid exotic resolutions.
