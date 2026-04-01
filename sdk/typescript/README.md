# Kameleo SDK

You patched CDP, handled canvas, fixed WebGL — and still got blocked. Sound familiar?

Kameleo adapts automatically to anti-bot changes, so your browser operations keep looking like ordinary human traffic without daily maintenance. This is the TypeScript/JavaScript SDK for Kameleo's [Local API](https://developer.kameleo.io/reference/api-reference/), giving you programmatic control over browser profiles from your existing Playwright, Puppeteer, or Selenium automation.

## What you get

- **Always-current fingerprints** — Chroma (Chrome) kernels ship within 5 days of every Chrome stable release; no manual re-testing after updates
- **Engine-level masking** — canvas, WebGL, CDP signals, timezone, geolocation, and fonts patched at the C++ level, not via JS injection that detectors can unwind
- **Fingerprint diversity on demand** — run Chroma and Junglefox (Firefox) side-by-side; mix browser, OS, and device type per profile to avoid cross-domain pattern matching
- **Drop into your existing stack** — connect via Playwright, Puppeteer, or Selenium with no framework rewrite; SDKs also available for [Python](https://pypi.org/project/kameleo.local-api-client/) and [C#](https://www.nuget.org/packages/Kameleo.LocalApiClient)

## Quickstart

You'll need a Kameleo account to run the CLI — the free tier includes 2 concurrent browsers and no credit card is required. [Create a free account →](https://billing.kameleo.io/my-account/get-app/?method_hint=register)

### 1. Install Kameleo

```shell
# Windows
winget install Kameleo.App

# macOS
brew install --cask kameleo
```

### 2. Install the SDK

```shell
npm install @kameleo/local-api-client
```

### 3. Follow the quickstart guide

Everything from starting the CLI to connecting your first profile is covered in the [Kameleo Developer Center](https://developer.kameleo.io/getting-started/quickstart/).

## Integrations

Full guides with working examples for each framework:

- [Playwright →](https://developer.kameleo.io/integrations/playwright/)
- [Puppeteer →](https://developer.kameleo.io/integrations/puppeteer/)
- [Selenium →](https://developer.kameleo.io/integrations/selenium/)
- [Docker / headless →](https://developer.kameleo.io/integrations/docker/)

## More guides

- [Filter browser fingerprints](https://developer.kameleo.io/tutorials/filtering-fingerprints/)
- [Using proxy servers](https://developer.kameleo.io/tutorials/using-proxy-servers/)
- [Emulate mobile devices](https://developer.kameleo.io/tutorials/emulating-mobile-devices/)
- [Start headless browsers](https://developer.kameleo.io/tutorials/starting-headless-browsers/)
- [Import & export cookies](https://developer.kameleo.io/tutorials/import-export-cookies/)

## ⭐ Staying undetected? Star us on GitHub

If Kameleo keeps your browsers undetected, a ⭐ on [GitHub](https://github.com/kameleo-io/kameleo) helps us keep pace with anti-bot changes.

## API Reference

All endpoints with exhaustive descriptions and example values are on the [API reference](https://developer.kameleo.io/reference/api-reference/) page. Full IntelliSense support in VS Code — no extra package needed.

## License

This project is released under MIT License. Please refer to LICENSE.txt for more details.
