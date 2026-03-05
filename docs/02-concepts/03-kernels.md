---
order: -203
title: Kernels
description: Learn how Kameleo's multi-kernel architecture maps profiles to Chroma or Junglefox versions for security, stability, and fingerprint fidelity.
permalink: /concepts/kernels
---

A browser kernel is the rendering engine (Chroma, Junglefox) responsible for executing JavaScript, drawing pages, and exposing low‑level APIs that sophisticated bot‑detection scripts interrogate. Kernel version, therefore, is part of your fingerprint. Kameleo’s multikernel architecture lets every browsing profile run on the most suitable browser engine at any moment. By separating the application from its browser kernels and shipping each kernel independently, we can minimize fingerprint mismatches, react to upstream security patches within days, and keep profile start‑up snappy because the engine you need is already cached locally.

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

1. Read the profile’s target browser name and version (e.g., Chrome 126.0.x).
2. Enumerate local cache plus available remote kernel builds for that browser family.
3. Pick the best match: exact version if present; otherwise closest newer patch; otherwise closest older patch.
4. If the chosen kernel isn’t cached yet, download it once and store it for reuse.
5. Launch the kernel with the profile’s configuration (fingerprint details, proxy, command-line switches, etc.).

## Update cadence

Kernels ship separately from the GUI/CLI so you get:

- Faster security fixes
- Fewer full app updates
- Safe rollback (previous kernel kept until new one is validated)

We release new Chroma kernels within 5 days of each Stable Chrome release. Junglefox updates ship about every two months. Get release notifications on our [Telegram channel](https://t.me/kameleoapp) or the [Browser Kernel Releases](https://kameleo.io/browser-kernel-releases) page.

## Integrity & consistency

Common mismatch types this multi-kernel approach prevents:

- **JavaScript version drift:** UA says a newer Chrome/Firefox, but new JS / Intl APIs are missing.
- **CSS support gaps:** fingerprint claims :has() or container queries that the engine build does not yet implement.
- **Graphics anomalies:** reported version implies newer ANGLE / GPU caps than the shaders & renderer hashes expose.
- **Network / TLS stack skew:** cipher suite ordering or ALPN set belongs to an older release than the claimed version.

By selecting the exact or closest kernel, cross‑layer tests produce a coherent, low‑risk fingerprint.

## Parallelism

Multiple profiles can launch distinct kernel versions concurrently. Disk cache isolates binary sets; memory overhead scales mostly with active renderer processes.
