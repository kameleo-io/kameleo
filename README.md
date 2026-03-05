<!-- markdownlint-disable MD028 MD033 MD041 -->
<div align="center">
<img alt="Kameleo Anti-Detect Browser" src="./assets/logo.png" width="300">

<h3>Automate browsers at scale. Stop getting blocked.</h3>
<p>Self-hosted, always current, no per-request pricing</p>

[![Discord](https://img.shields.io/discord/1248220613055877173?color=5865F2&label=Discord&logo=discord&logoColor=white)](https://discord.com/invite/vNqxWuDkS4)
[![npm](https://img.shields.io/npm/v/%40kameleo%2Flocal-api-client?logo=npm)](https://www.npmjs.com/package/@kameleo/local-api-client)
[![PyPI](https://img.shields.io/pypi/v/kameleo.local-api-client?logo=python&logoColor=white)](https://pypi.org/project/kameleo.local-api-client/)
[![NuGet](https://img.shields.io/nuget/v/Kameleo.LocalApiClient?logo=nuget)](https://www.nuget.org/packages/Kameleo.LocalApiClient)

⭐ Detectors evolve daily. Star us to keep Kameleo one step ahead.
</div>

---

Manually maintaining fingerprint configurations that get detected within hours? Kameleo keeps pace with anti-bot systems automatically, so you stop firefighting and build your actual product.

<div align="center">
  <img src="./assets/demo.gif" alt="Blocked Without Kameleo. Undetected With Kameleo." width="650">
</div>

## ✅ Validated against real services

We run automated tests frequently. Here are the results with recordings of each run.

| Website | Playwright + Chromium | Playwright + Kameleo |
| --- | :---: | :---: |
| [Pixelscan](./masking-report/tests/sites/synthetic/pixelscan.spec.ts) | [▶️ Watch](./masking-report/videos/pixelscan-macos-chromium-260223053608.webm) | [▶️ Watch](./masking-report/videos/pixelscan-macos-chrome-260223053742.webm) |
| [BrowserScan](./masking-report/tests/sites/synthetic/browserscan.spec.ts) | [▶️ Watch](./masking-report/videos/browserscan-macos-chromium-260223053608.webm) | [▶️ Watch](./masking-report/videos/browserscan-macos-chrome-260223053751.webm) |
| [Brotector](./masking-report/tests/sites/synthetic/brotector.spec.ts) | [▶️ Watch](./masking-report/videos/brotector-macos-chromium-260223053538.webm) | [▶️ Watch](./masking-report/videos/brotector-macos-chrome-260223053706.webm) |
| [CreepJS](./masking-report/tests/sites/synthetic/creepjs.spec.ts) | [▶️ Watch](./masking-report/videos/creepjs-macos-chromium-260223053604.webm) | [▶️ Watch](./masking-report/videos/creepjs-macos-chrome-260223053746.webm) |
| [Bot Sannysoft](./masking-report/tests/sites/synthetic/bot-sannysoft.spec.ts) | [▶️ Watch](./masking-report/videos/sannysoft-macos-chromium-260223053538.webm) | [▶️ Watch](./masking-report/videos/sannysoft-macos-chrome-260223053741.webm) |
| [Cloudflare Turnstile](./masking-report/tests/sites/anti-bot/cloudflare-turnstile.spec.ts) | [▶️ Watch](./masking-report/videos/cloudflare-turnstile-macos-chromium-260223053512.webm) | [▶️ Watch](./masking-report/videos/cloudflare-turnstile-macos-chrome-260223053708.webm) |
| [Google Search](./masking-report/tests/sites/anti-bot/google.spec.ts) | [▶️ Watch](./masking-report/videos/google-macos-chromium-260223053510.webm) | [▶️ Watch](./masking-report/videos/google-macos-chrome-260223053722.webm) |

**[View masking report →](https://kameleo.io/masking-audit)**

## 💡 Why Kameleo?

Built for developers who want control.

### Predictable pricing at any scale

No per-request pricing. Your cost is fixed by the number of concurrent browsers — run 100 million requests a month and pay the same as running one million. At 40 concurrent browsers you know your cost on day one and at 10×. Competitors charge per API call, per minute, or per profile slot; here the economics stay in your control.

### Your data, your infrastructure

Your scraped data never leaves your servers. No vendor lock-in. Deploy on any machine: cloud VM, bare metal, or your own datacenter.

### Always current

Stop manually re-testing which fingerprint configuration still works this week. We ship **Chroma kernels within 5 days** of every Chrome stable release. Junglefox (Firefox-based) follows every 2 months. Multikernel support lets you run multiple browser versions simultaneously, no forced upgrades.

### Cloud-native by design

Docker images available for both Linux and Windows containers. Run headlessly at scale, deploy across multiple VMs, and integrate with your CI/CD pipeline. Linux container deployments are fully supported, Kameleo is not Windows-only.

### Your stack, unchanged

Works with **Selenium, Puppeteer, and Playwright** with no framework rewrite. SDKs in **Python, JavaScript, and C#**. Connect to your existing automation code in minutes.

## ✨ Features

- **Fingerprints from real devices, always current** — Millions of profiles sourced from real hardware, updated continuously. When anti-bot systems update, so do the fingerprints
- **Mobile browser profiles (Android & iOS)** — Engine-level spoofing of device signals, not a user-agent swap. Covers Chrome-on-Android and Safari-on-iOS
- **Multi-engine browser pool** — Run Chroma (Chrome) and Junglefox (Firefox) simultaneously to diversify fingerprints across targets
- **Persistent profiles and session warmup** — Reuse profiles, import/export cookies. Profiles behave like returning users, reducing block and shadow-ban risk
- **Proxy integration** — HTTP, HTTPS, SOCKS5, and SSH tunnel support. Geo-location and timezone auto-matched to your proxy IP
- **Headless mode** — UI-free sessions on Business plan and above; same fingerprint masking quality as headed mode
- **Docker & Linux containers** — Linux and Windows Docker images; horizontal scaling without Windows-only constraints
- **Multikernel — pin any browser version** — Run multiple Chroma and Junglefox versions side-by-side; upgrade on your schedule
- **No device limits** — Licensing is per concurrent browser, not per machine. Deploy across as many servers as your workload demands

## 📊 How we compare

### Anti-detect browsers

GUI-first tools built around manual workflows. If you're automating at scale, you'll be working against the grain.

| Feature | Kameleo | Multilogin | GoLogin |
| --------- | :-------: | :-----------: | :---------: |
| Chrome engine | ✅ Chroma | ✅ Mimic | ✅ Chromium-based |
| Firefox engine | ✅ Junglefox | ✅ Stealthfox | ❌ |
| Kernel update speed | ≤5 days | No SLA | No SLA |
| Pricing unit | Concurrent browsers | Profiles | Profiles |
| Typed SDK packages | ✅ Python / JS / C# | ❌ | ❌ |
| Automation frameworks | ✅ Selenium / Puppeteer / Playwright | ✅ Selenium / Puppeteer / Playwright | ✅ Selenium / Puppeteer |
| Headless mode | ✅ | ❌ | ✅ |
| Docker / container deployment | ✅ | ❌ | ❌ |
| Data stays on your servers | ✅ | ❌ | ❌ |
| Free tier | ✅ | ❌ | ✅ |

### Cloud-based web unlockers

Cloud-based scraping APIs: all requests routed through vendor infrastructure, costs tied to usage volume.

| Feature | Kameleo | Zyte | ScrapeNinja |
| --------- | :-------: | :-----------: | :---------: |
| Self-hosted | ✅ | ❌ | ❌ |
| Data stays on your infrastructure | ✅ | ❌ | ❌ |
| Per-request pricing | ❌ | ✅ | ✅ |
| Fixed concurrent-browser pricing | ✅ | ❌ | ❌ |
| Bring your own proxy | ✅ | ❌ | ❌ |
| Bring your own Playwright / Selenium / Puppeteer | ✅ | ❌ | ❌ |
| Local API + SDKs (Python / JS / C#) | ✅ | ❌ | ❌ |
| Docker / container deployment | ✅ | ❌ | ❌ |
| Free tier | ✅ | ❌ Trial only | ✅ 100 req/mo |

### Open source / community tools

Free to run, but the maintenance cost lands entirely on you — keeping up with every new fingerprinting vector, debugging breakage after Chrome updates, handling the issue backlog yourself.

| Feature | Kameleo | Camoufox | undetected-chromedriver / puppeteer-stealth |
| --------- | :-------: | :-----------: | :---------: |
| Commercial support | ✅ | ❌ | ❌ |
| Chrome engine | ✅ | ❌ | ✅ |
| Firefox engine | ✅ | ✅ | ❌ |
| Evasion method | ✅ C++ engine-level | C++ engine-level | ⚠️ Binary patch / JS injection |
| Multi-framework SDKs | ✅ Py / JS / C# | Python only | Py / JS |
| Mobile profiles | ✅ | ❌ | ❌ |
| Docker / container deployment | ✅ | ❌ | ❌ |
| Free to use | ✅ Free tier | ✅ Open source | ✅ Open source |

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

## 📂 Example Code

Working examples for every common scenario:

- [Python examples](sdk/python/examples/)
- [TypeScript examples](sdk/typescript/examples/)
- [C# examples](sdk/csharp/examples/)

## 🏆 Trusted by builders

> **"Kameleo's human-like browser automation and great fingerprint masking helped our customers with their scraping and automation projects."**
> — Pierluigi Vinciguerra, Co-Founder, Databoutique.com & The Web Scraping Club

> **"Kameleo keeps our scraping and automation users unblocked at scale: reliable, low-maintenance, and cost-effective."**
> — Jason Grad, Co-Founder of Massive

> **"Kameleo and Scrapoxy make scraping undetectable, fast and rock-solid — no bans, no downtime."**
> — Fabien Vauchelles, Creator of Scrapoxy

## 🚀 Start in minutes

Works with your existing Playwright, Puppeteer, or Selenium setup — no framework rewrite required.

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

await page.goto("https://example.com"); // Running undetected ✓
```

Also available in **[Python](https://developer.kameleo.io/integrations/playwright/)** and **[C#](https://developer.kameleo.io/integrations/playwright/)**. Supports **[Selenium](https://developer.kameleo.io/integrations/selenium/)**, **[Puppeteer](https://developer.kameleo.io/integrations/puppeteer/)**, and **[Playwright](https://developer.kameleo.io/integrations/playwright/)**.

## ❓ FAQ

<details>
<summary><b>Is this really free?</b></summary>

Yes! The free tier includes 2 concurrent browsers, 300 minutes of browser usage per month, and 100 cloud profiles. No credit card required to start.

</details>

<details>
<summary><b>Why on-premise instead of a cloud API?</b></summary>

- **Predictable cost at scale** — No per-request pricing. At 40 concurrent browsers you pay the same whether you run 1 million or 100 million requests that month
- **Data ownership** — Your scraped data never leaves your infrastructure
- **No scraping rate limits** — Only API calls to fetch fingerprints count against limits; your actual scraping traffic is unlimited
- **Compliance** — Deploy on-premise for sensitive or regulated workloads

</details>

<details>
<summary><b>How often are browsers updated?</b></summary>

We ship new Chroma kernels within **5 days** of every Chrome stable release. Junglefox (Firefox-based) is updated every **2 months**. With multikernel support, you can run multiple versions simultaneously.

</details>

<details>
<summary><b>How is this different from stealth plugins?</b></summary>

Stealth plugins patch browser APIs at the JavaScript level — detectable by anything that runs before your patches or inspects the JS environment itself. Kameleo patches at the C++ engine level inside Chroma and Junglefox, so the masking is applied before any JavaScript ever runs and cannot be unwound from the page context.

</details>

<details>
<summary><b>When should I use Junglefox instead of Chroma?</b></summary>

Junglefox (Firefox-based) is valuable for two reasons: fingerprint diversity and target-specific detection logic. Some anti-bot systems apply stricter heuristics to Chrome than Firefox, or vice versa. Running a mix of Chroma and Junglefox profiles diversifies your browser engine signature across a session fleet. Junglefox is also the right choice when a target actively distinguishes Chrome from Firefox in its bot-detection stack.

</details>

<details>
<summary><b>What about headless mode?</b></summary>

Headless mode is available on Business and Enterprise plans. It launches UI-free browser sessions to reduce resource overhead.

</details>

<details>
<summary><b>How stable is Kameleo for long-running production workloads?</b></summary>

Kameleo is deployed in production by teams running multi-day, high-volume scraping operations. The CLI is designed for unattended runs. If you hit a stability problem, open an issue or reach us on chat and our support team responds directly.

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
