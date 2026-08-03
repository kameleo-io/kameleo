---
order: -203
title: Kernels
meta:
    description: Learn how Kameleo's multi-kernel architecture maps browser fingerprints to Chroma or Junglefox kernel versions for security, stability, and fidelity.
permalink: /concepts/kernels
---

A browser kernel (Chroma or Junglefox) is the component that executes JavaScript, draws pages, and exposes the low‑level browser APIs that sophisticated bot‑detection scripts interrogate. Kernel version, therefore, is part of your fingerprint. Kameleo’s multi-kernel architecture lets every browsing profile run on the most suitable kernel at any moment. By separating the Kameleo Engine from its kernels and shipping each kernel independently, we can minimize fingerprint mismatches, react to upstream security patches within days, and keep profile start‑up snappy because the kernel you need is already cached locally.

!!!tip Latest kernel releases
For the always up-to-date list of shipped Chroma and Junglefox kernel versions, see the [Browser Kernel Releases](https://kameleo.io/browser-kernel-releases) page.
!!!

## Kernel mapping

| Fingerprint    | Kernel    | Note                                             |
| -------------- | --------- | ------------------------------------------------ |
| Chrome         | Chroma    | Natively supported                               |
| Edge           | Chroma    | Natively supported                               |
| Firefox        | Junglefox | Natively supported                               |
| Safari         | Chroma    | WebKit-based kernels are not currently supported |
| iOS Safari     | Chroma    | Emulated through Chroma's mobile device mode     |
| Android Chrome | Chroma    | Emulated through Chroma's mobile device mode     |

## Selection logic

1. Read the profile’s target browser name and version (e.g., Chrome 145.0.x).
2. Enumerate local cache plus available remote kernel builds for that browser family.
3. Pick the best match: exact version if present; otherwise closest newer patch; otherwise closest older patch.
4. If the chosen kernel isn’t cached yet, download it once and store it for reuse.
5. Launch the kernel with the profile’s configuration (fingerprint details, proxy, command-line switches, etc.).

You can trigger this selection and download step explicitly ahead of time, so the browser launches immediately when you start the profile instead of waiting for an implicit kernel download.

Example:

+++ Python

```python
kernel = client.profile.install_profile_kernel(profile.id)
```

+++ JavaScript

```js
const kernel = await client.profile.installProfileKernel(profile.id);
```

+++ C#

```csharp
var kernel = await client.Profile.InstallProfileKernelAsync(profile.Id);
```

+++

## Update cadence

Kernels ship separately from the GUI and the Engine so you get:

- Faster security fixes
- Fewer full app updates
- Safe rollback (previous kernel kept until new one is validated)

We release new Chroma kernels within 5 days of each Stable Chrome release. Junglefox updates ship about every two months. Get release notifications on our [Telegram channel](https://t.me/kameleoapp) or the [Browser Kernel Releases](https://kameleo.io/browser-kernel-releases) page.

## Integrity & consistency

Common mismatch types this multi-kernel approach prevents:

- **JavaScript version drift:** UA says a newer Chrome/Firefox, but new JS / Intl APIs are missing.
- **CSS support gaps:** fingerprint claims :has() or container queries that the browser kernel does not yet implement.
- **Graphics anomalies:** reported version implies newer ANGLE / GPU caps than the shaders & renderer hashes expose.
- **Network / TLS stack skew:** cipher suite ordering or ALPN set belongs to an older release than the claimed version.

By selecting the exact or closest kernel, cross‑layer tests produce a coherent, low‑risk fingerprint.

## Parallelism

Multiple profiles can launch distinct kernel versions concurrently. Disk cache isolates binary sets; memory overhead scales mostly with active renderer processes.
