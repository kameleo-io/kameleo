<img alt="Kameleo Anti-Detect Browser" src="https://billing.kameleo.io/app/themes/bootscore-child/img/logo/logo.png" width="300">

<h3>Automate browsers at scale. Stay undetected.</h3>

[![Discord](https://img.shields.io/discord/1248220613055877173?color=5865F2&label=Discord&logo=discord&logoColor=white)](https://discord.com/invite/vNqxWuDkS4)
[![GitHub stars](https://img.shields.io/github/stars/kameleo-io/kameleo?style=social)](https://github.com/kameleo-io/kameleo)
[![Latest Release](https://img.shields.io/github/v/release/kameleo-io/releases?color=2cd05e&label=Latest)](https://github.com/kameleo-io/releases/releases)
[![npm](https://img.shields.io/npm/v/%40kameleo%2Flocal-api-client?logo=npm)](https://www.npmjs.com/package/@kameleo/local-api-client)
[![PyPI](https://img.shields.io/pypi/v/kameleo.local-api-client?logo=python&logoColor=white)](https://pypi.org/project/kameleo.local-api-client/)
[![NuGet](https://img.shields.io/nuget/v/Kameleo.LocalApiClient?logo=nuget)](https://www.nuget.org/packages/Kameleo.LocalApiClient)

---

<div align="center">

**⭐ Star us if Kameleo helps you stay undetected!**

🆓 **[Free to try](https://billing.kameleo.io/my-account/get-app/?method_hint=register)** — no credit card required

</div>

---

Tired of stealth plugins that break every Chrome update? We handle fingerprint masking. You focus on your product.

## 🚀 Get started in 5 minutes

**1. [Download and install Kameleo](https://github.com/kameleo-io/releases/releases)**

**2. Install the SDK:**

```bash
# Python
pip install kameleo.local-api-client playwright

# JavaScript
npm install @kameleo/local-api-client playwright

# C# - Add NuGet packages
dotnet add package Kameleo.LocalApiClient
dotnet add package Microsoft.Playwright
```

**3. Run this code:**

<details open>
<summary><b>Python</b></summary>

```python
from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest
from playwright.sync_api import sync_playwright

client = KameleoLocalApiClient(endpoint='http://localhost:5050')

# Search for a Chrome fingerprint and create a profile
fingerprints = client.fingerprint.search_fingerprints(device_type='desktop', browser_product='chrome')
profile = client.profile.create_profile(CreateProfileRequest(fingerprint_id=fingerprints[0].id))

# Connect with Playwright and automate
with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(f'ws://localhost:5050/playwright/{profile.id}')
    page = browser.contexts[0].new_page()
    page.goto('https://example.com')  # You're undetectable ✓

client.profile.stop_profile(profile.id)
```

</details>

<details>
<summary><b>JavaScript</b></summary>

```javascript
import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import playwright from "playwright";

const client = new KameleoLocalApiClient({ basePath: 'http://localhost:5050' });

// Search for a Chrome fingerprint and create a profile
const fingerprints = await client.fingerprint.searchFingerprints('desktop', undefined, 'chrome');
const profile = await client.profile.createProfile({ fingerprintId: fingerprints[0].id });

// Connect with Playwright and automate
const browser = await playwright.chromium.connectOverCDP(`ws://localhost:5050/playwright/${profile.id}`);
const page = await browser.contexts()[0].newPage();
await page.goto('https://example.com');  // You're undetectable ✓

await client.profile.stopProfile(profile.id);
```

</details>

<details>
<summary><b>C#</b></summary>

```csharp
using Kameleo.LocalApiClient;
using Microsoft.Playwright;

var client = new KameleoLocalApiClient(new Uri("http://localhost:5050"));

// Search for a Chrome fingerprint and create a profile
var fingerprints = await client.Fingerprint.SearchFingerprintsAsync(deviceType: "desktop", browserProduct: "chrome");
var profile = await client.Profile.CreateProfileAsync(new(fingerprints[0].Id));

// Connect with Playwright and automate
var pw = await Playwright.CreateAsync();
var browser = await pw.Chromium.ConnectOverCDPAsync($"ws://localhost:5050/playwright/{profile.Id}");
var page = await browser.Contexts[0].NewPageAsync();
await page.GotoAsync("https://example.com");  // You're undetectable ✓

await client.Profile.StopProfileAsync(profile.Id);
```

</details>

**That's it. You're undetectable.** [Full documentation →](https://developer.kameleo.io/)

---

## 🎬 See it pass real detection tests

We test Kameleo weekly against real anti-bot services. Here's what it looks like:

<!-- TODO: Replace with actual video embeds -->
| Pixelscan ✓ | Cloudflare ✓ | CreepJS ✓ |
|-------------|--------------|-----------|
| ![Pixelscan](https://via.placeholder.com/280x180?text=Video+Coming+Soon) | ![Cloudflare](https://via.placeholder.com/280x180?text=Video+Coming+Soon) | ![CreepJS](https://via.placeholder.com/280x180?text=Video+Coming+Soon) |

**[View live transparency report →](https://kameleo.io/masking-audit)**

We automatically test against **7 detection services** every week: Pixelscan, Browserscan, CreepJS, Cloudflare, Adscore, and more. Check our [masking audit test source code](./packages/client-browser-tests/Tests/MaskingAuditTests/) for full transparency.

---

## 🆓 Generous free tier

Start building without a credit card:

| Feature | Free |
|---------|------|
| Concurrent browsers | 2 |
| Browser usage | 300 min/month |
| Cloud profiles | 100 |
| Team members | 3 |
| Fresh fingerprints | ✅ Unlimited |
| Selenium/Puppeteer/Playwright | ✅ |
| Credit card required | ❌ No |

**[Start free →](https://billing.kameleo.io/my-account/get-app/?method_hint=register)** | [View all plans →](https://kameleo.io/pricing)

---

## 💡 Why Kameleo?

Built for developers who want control.

### 🏠 On-premise

Your data stays on **your servers**. No per-request pricing. No vendor lock-in. Run on your own infrastructure, even air-gapped.

### 🔄 Always current

Stop chasing browser updates. We ship **Chroma kernels within 5 days** of every Chrome stable release. Junglefox every 2 months. Multikernel support lets you run multiple browser versions simultaneously.

### 🛠️ Your stack

Works with **Selenium, Puppeteer, and Playwright**. SDKs in **Python, JavaScript, and C#**. Docker-ready for cloud deployments.

---

## 📊 How we compare

| Feature | Kameleo | browser-use | Rebrowser | ScrapeNinja | Camoufox |
|---------|:-------:|:-----------:|:---------:|:-----------:|:--------:|
| Self-hosted | ✅ | ❌ Cloud | ❌ Cloud | ❌ Cloud | ✅ |
| Kernel updates | 5-day | N/A | N/A | N/A | Community |
| Free tier | ✅ Generous | Limited | Limited | Limited | ✅ |
| Frameworks | All 3 | Playwright | Playwright | ❌ | Playwright |
| SDKs | Py/JS/C# | Python | ❌ | ❌ | Python |
| macOS ARM | ✅ | ❌ | ❌ | N/A | ✅ |
| Per-request cost | ❌ | ✅ | ✅ | ✅ | ❌ |

---

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

---

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

---

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
- **Compliance** — Deploy in air-gapped environments for sensitive use cases

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

---

## 👥 Community & Support

- **Discord**: [Join Kameleo Insider](https://discord.com/invite/vNqxWuDkS4) — Tips, discussions, and direct support
- **Telegram**: [Subscribe to updates](https://t.me/kameleoapp)
- **Help Center**: [help.kameleo.io](https://help.kameleo.io/)
- **Developer Docs**: [developer.kameleo.io](https://developer.kameleo.io/)

**Found this useful? [⭐ Star us on GitHub!](https://github.com/kameleo-io/kameleo)**

---

## 📁 What's in this repo

| Directory | Description |
|-----------|-------------|
| [`/docs`](./docs) | Developer documentation source |
| [`/packages/client-browser-tests`](./packages/client-browser-tests/Tests/MaskingAuditTests/) | Masking audit tests against detection services |
| [Releases](https://github.com/kameleo-io/releases/releases) | Latest Kameleo downloads |

## 🤝 Contributing

We welcome contributions! Here's how you can help:

- **Improve documentation** — Found something unclear? Submit a PR to `/docs`
- **Add detection tests** — Know a bot detector we should test against? Check our [masking audit tests](./packages/client-browser-tests/Tests/MaskingAuditTests/)
- **Report issues** — [Open an issue](https://github.com/kameleo-io/kameleo/issues) for bugs or feature requests

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

Made with ❤️ by the [Kameleo Team](https://kameleo.io/about-us)

**[Website](https://kameleo.io)** · **[Documentation](https://developer.kameleo.io)** · **[Discord](https://discord.com/invite/vNqxWuDkS4)**

</div>
