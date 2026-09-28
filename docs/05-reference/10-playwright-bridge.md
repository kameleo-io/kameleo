---
order: -510
title: Playwright Bridge
meta:
    description: Reference the Kameleo Playwright Bridge for Junglefox, including its purpose, fallback downloads, and target endpoint syntax.
permalink: /reference/playwright-bridge
---

The Playwright Bridge component is the compatibility executable used to connect Playwright scripts to a Junglefox profile. Playwright cannot attach directly to a running Junglefox browser instance. The `pw-bridge` executable accepts a Kameleo Playwright endpoint and provides the Firefox executable entry point expected by Playwright.

Kameleo SDK packages include `pw-bridge` and are the preferred source. The direct downloads below are fallbacks for environments that do not use a Kameleo SDK.

## Fallback downloads

| Platform | Architecture | Executable      | Download                                                                                 |
| -------- | ------------ | --------------- | ---------------------------------------------------------------------------------------- |
| Windows  | x64          | `pw-bridge.exe` | [Download for Windows x64](https://get.kameleo.io/pw-bridge/2.0.0/win-x64/pw-bridge.exe) |
| Linux    | x64          | `pw-bridge`     | [Download for Linux x64](https://get.kameleo.io/pw-bridge/2.0.0/linux-x64/pw-bridge)     |
| macOS    | arm64        | `pw-bridge`     | [Download for macOS arm64](https://get.kameleo.io/pw-bridge/2.0.0/osx-arm64/pw-bridge)   |

## Command-line interface

### Syntax

```text
pw-bridge -target ws://localhost:5050/playwright/{profileId}
```

### Arguments

| Argument  | Type          | Required | Default | Description                                         |
| --------- | ------------- | -------- | ------- | --------------------------------------------------- |
| `-target` | WebSocket URL | Yes      | None    | Kameleo Playwright endpoint for the target profile. |

## Related documentation

- [Integrate Playwright with Kameleo](../03-integrations/02-playwright.md)
