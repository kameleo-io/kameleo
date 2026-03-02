<!-- markdownlint-disable MD033 MD041 -->
<div align="center">
<img alt="Kameleo Anti-Detect Browser" src="./assets/logo.png" width="300">

<h3>Automate browsers at scale. Stay undetected.</h3>
<p>Self-hosted stealth browser infrastructure — Windows, macOS, and Docker</p>

[![Discord](https://img.shields.io/discord/1248220613055877173?color=5865F2&label=Discord&logo=discord&logoColor=white)](https://discord.com/invite/vNqxWuDkS4)
[![npm](https://img.shields.io/npm/v/%40kameleo%2Flocal-api-client?logo=npm)](https://www.npmjs.com/package/@kameleo/local-api-client)
[![PyPI](https://img.shields.io/pypi/v/kameleo.local-api-client?logo=python&logoColor=white)](https://pypi.org/project/kameleo.local-api-client/)
[![NuGet](https://img.shields.io/nuget/v/Kameleo.LocalApiClient?logo=nuget)](https://www.nuget.org/packages/Kameleo.LocalApiClient)

⭐ Detectors evolve daily. Star us to keep Kameleo one step ahead.
</div>

---

Tired of patching CDP leaks, WebRTC, canvas, and timezone — only to get blocked again? Kameleo handles the arms race. You focus on your product.

<div align="center">
  <img src="./assets/demo.gif" alt="Blocked Without Kameleo. Undetected With Kameleo." width="650">
</div>

## 🚀 Get started in 5 minutes

**1. Install Kameleo:**

```bash
# Windows
winget install Kameleo.App

# macOS
brew install --cask kameleo

# Docker (Linux & Windows containers available)
docker pull kameleo/kameleo-app:latest
```

**2. Install the SDK:**

```bash
npm install @kameleo/local-api-client playwright
```

**3. Run your code:**

```typescript
import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import { chromium } from "playwright";

const client = new KameleoLocalApiClient({ basePath: "http://localhost:5050" });

// Pick a real Chrome fingerprint and create a profile
const fingerprints = await client.fingerprint.searchFingerprints("desktop", undefined, "chrome");
const profile = await client.profile.createProfile({ fingerprintId: fingerprints[0].id });

// Connect with Playwright and automate
const browser = await chromium.connectOverCDP(`ws://localhost:5050/playwright/${profile.id}`);
const page = await browser.contexts()[0].newPage();
await page.goto("https://example.com"); // You're undetectable ✓
```

> Also available in **[Python](https://developer.kameleo.io/integrations/playwright/)** and **[C#](https://developer.kameleo.io/integrations/playwright/)**. Supports **[Selenium](https://developer.kameleo.io/integrations/selenium/)**, **[Puppeteer](https://developer.kameleo.io/integrations/puppeteer/)**, and **[Playwright](https://developer.kameleo.io/integrations/playwright/)**.

**That's it. You're undetectable.** [Full documentation →](https://developer.kameleo.io/)

## ✅ Verified against real detection services

We run automated tests every week against real anti-bot and fingerprint detection services. Here's how plain Chromium compares to Kameleo's Chroma:

<!-- TODO: Link each cell to a video recording of the test run -->
| Detection Service | Regular Chromium | Kameleo Chroma |
| --- | :---: | :---: |
| [Pixelscan](https://pixelscan.net/) | ❌ | ✅ |
| [BrowserScan](https://www.browserscan.net/) | ❌ | ✅ |
| [Brotector](https://ttlns.github.io/brotector/) | ❌ | ✅ |
| [CreepJS](https://abrahamjuliot.github.io/creepjs/) | ❌ | ✅ |
| [Bot Sannysoft](https://bot.sannysoft.com/) | ❌ | ✅ |
| [Cloudflare Turnstile](https://2captcha.com/demo/cloudflare-turnstile) | ❌ | ✅ |
| [Google](https://google.com/) | ❌ | ✅ |

**[View live transparency report →](https://kameleo.io/masking-audit)**

All test source code is open — check our [masking report tests](./masking-report/tests/sites/) for full transparency.

## 💡 Why Kameleo?

Built for developers who want control.

### On-premise

Your data stays on **your servers**. No per-request pricing. No vendor lock-in. Run on your own infrastructure.

### Always current

Stop chasing browser updates. We ship **Chroma kernels within 5 days** of every Chrome stable release. Junglefox every 2 months. Multikernel support lets you run multiple browser versions simultaneously.

### Your stack

Works with **Selenium, Puppeteer, and Playwright**. SDKs in **Python, JavaScript, and C#**. Docker-ready for cloud deployments.

## 📊 How we compare

| Feature | Kameleo | browser-use | Rebrowser | ScrapeNinja | Camoufox |
| --------- | :-------: | :-----------: | :---------: | :-----------: | :--------: |
| Self-hosted | ✅ | ❌ Cloud | ❌ Cloud | ❌ Cloud | ✅ |
| Chrome engine | ✅ Chroma | ❌ | ✅ | ✅ | ❌ |
| Firefox engine | ✅ Junglefox | ❌ | ❌ | ❌ | ✅ |
| Kernel updates | Frequent | N/A | N/A | N/A | Community |
| Free tier | ✅ Generous | Limited | Limited | Limited | ✅ |
| Frameworks | All 3 | Playwright | Playwright | ❌ | Playwright |
| SDKs | Py/JS/C# | Python | ❌ | ❌ | Python |
| Per-request cost | ❌ | ✅ | ✅ | ✅ | ❌ |

## ✨ Features

- **Fresh fingerprints** — Millions of real fingerprints from actual devices
- **Proxy integration** — HTTP, HTTPS, SOCKS5, SSH — residential, mobile, rotating
- **Mobile emulation** — Simulate Android & iOS from your desktop
- **Team management** — Role-based access, profile sharing, session locks
- **Cookie import/export** — Warm up profiles, transfer sessions
- **Headless mode** — UI-free browser sessions (Business+)
- **Docker support** — Scalable container deployments
- **No device limits** — Use as many machines as you want
- **Multikernel** — Run multiple Chroma & Junglefox versions simultaneously

## 🔌 Integrations

Connect with your favorite automation framework:

<details>
<summary><b>Selenium</b></summary>

```python
from selenium import webdriver

# Get the WebDriver URL from Kameleo
ws_endpoint = f'http://localhost:5050/webdriver/{profile.id}'
driver = webdriver.Remote(command_executor=ws_endpoint)

driver.get('https://example.com')
```

[Full Selenium guide →](https://developer.kameleo.io/03-integrations/01-selenium/)

</details>

<details>
<summary><b>Puppeteer</b></summary>

```javascript
import puppeteer from 'puppeteer';

const browser = await puppeteer.connect({
    browserWSEndpoint: `ws://localhost:5050/puppeteer/${profile.id}`,
});

const page = await browser.newPage();
await page.goto('https://example.com');
```

[Full Puppeteer guide →](https://developer.kameleo.io/03-integrations/03-puppeteer/)

</details>

<details>
<summary><b>Playwright</b></summary>

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(f'ws://localhost:5050/playwright/{profile.id}')
    page = browser.contexts[0].new_page()
    page.goto('https://example.com')
```

[Full Playwright guide →](https://developer.kameleo.io/03-integrations/02-playwright/)

</details>

## ❓ FAQ

<details>
<summary><b>Is this really free?</b></summary>

Yes! The free tier includes 2 concurrent browsers, 300 minutes of browser usage per month, and 100 cloud profiles. No credit card required to start.

</details>

<details>
<summary><b>Why on-premise instead of cloud API?</b></summary>

- **Data ownership** — Your scraped data never leaves your infrastructure
- **No per-request costs** — Run unlimited requests locally
- **No rate limits on scraping** — Only API calls to fetch fingerprints are rate-limited
- **Compliance** — Deploy on-premise for sensitive or regulated use cases

</details>

<details>
<summary><b>How often are browsers updated?</b></summary>

We ship new Chroma kernels within **5 days** of every Chrome stable release. Junglefox (Firefox-based) is updated every **2 months**. With multikernel support, you can run multiple versions simultaneously.

</details>

<details>
<summary><b>How is this different from stealth plugins?</b></summary>

Stealth plugins patch Puppeteer/Playwright after the fact. Kameleo uses custom-built browsers (Chroma and Junglefox) with fingerprint masking built into the browser engine itself. This provides deeper, more reliable protection.

</details>

<details>
<summary><b>What about headless mode?</b></summary>

Headless mode is available on Business and Enterprise plans. It launches UI-free browser sessions to reduce resource overhead.

</details>

## 🤝 Contributing

We welcome contributions! Here's how you can help:

- **Improve documentation** — Found something unclear? Submit a PR to `/docs`
- **Add detection tests** — Know a bot detector we should test against? Check our [masking report tests](./masking-report/tests/sites/)
- **Report issues** — [Open an issue](https://github.com/kameleo-io/kameleo/issues) for bugs or feature requests

---

<div align="center">

Made with ❤️ by the [Kameleo Team](https://kameleo.io/about-us)

**[Website](https://kameleo.io)** · **[Documentation](https://developer.kameleo.io)** · **[Discord](https://discord.com/invite/vNqxWuDkS4)**

</div>
