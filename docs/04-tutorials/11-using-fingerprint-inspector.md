---
order: -411
title: Using Fingerprint Inspector
meta:
    description: Enable Fingerprint Inspector to watch a site's fingerprinting JavaScript calls live in your browser's DevTools.
permalink: /tutorials/using-fingerprint-inspector
---

Fingerprint Inspector helps you reverse engineer how a site fingerprints a profile's browser, by showing you which APIs it calls - for example reading canvas or WebGL output, audio data, or navigator properties. It works by capturing these calls inside the profile's browser and streaming them to a dedicated panel in DevTools, so you can validate that your masking setup behaves as expected or debug why a site treats a profile as suspicious. In this tutorial, you'll enable Fingerprint Inspector on a profile and read its live events in DevTools.

## Prerequisites

- Completion of the [Quickstart](../01-getting-started/02-quickstart.md) guide
- The Kameleo app running locally
- An existing Chroma profile (Junglefox profiles aren't supported yet)

## 1. Start a profile with Fingerprint Inspector enabled

Open the dashboard and locate the profile you want to inspect. Click its **three-dot** menu, then select **Fingerprint Inspector**.

The profile starts as usual, and its browser window opens with fingerprint inspection turned on.

## 2. Open the Fingerprint Inspector panel

The first time you start a profile this way, a short guide opens in a new tab explaining how to open DevTools. Follow it, or use these steps directly:

1. Open DevTools (`F12`, or `Ctrl+Shift+I` on Windows/Linux, `Cmd+Option+I` on macOS).
2. Select the **Fingerprint Inspector** tab. If you don't see it, click the **»** overflow arrow at the right end of the tab bar to reveal hidden panels.

The panel opens empty, ready to display events as the profile's browser makes fingerprinting-related calls.

## 3. Browse and read the results

Navigate to any website in the profile's browser window. As the page runs scripts that call fingerprinting-related APIs, matching rows appear in the panel in real time, each showing the timestamp, the API name, its parameters, and its return value.

Use the search box to filter events by name, category, or value, and click **Clear** to reset the list.

!!!tip Results are shared across tabs
The panel isn't scoped to the tab it was opened from. It shows fingerprinting calls from every open tab in the profile's browser, so it doesn't matter which tab you're on when you check it.
!!!

Events are tagged with a category so you can quickly tell which technique a site used, such as:

- Canvas and WebGL/WebGPU rendering output
- Audio processing
- Navigator properties (hardware, locale, user agent, and similar)
- Media devices, WebRTC, geolocation, Bluetooth, and speech voices
