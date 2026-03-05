# Kameleo Local API Client

With [Kameleo](https://kameleo.io), you can easily create multiple virtual browser profiles to work with multiple accounts. It helps you hide your actual timezone, geolocation, language, IP address and creates natural browser fingerprints to prevent detection by anti-bot systems. Kameleo is compatible with [Selenium](https://www.selenium.dev/), [Playwright](https://playwright.dev/), and [Puppeteer](https://pptr.dev/) frameworks for automating web scraping tasks. This Python package provides convenient access to the [Local API](https://app.swaggerhub.com/apis/kameleo-team/kameleo-local-api/) REST interface of the Kameleo Client. See the [article](https://developer.kameleo.io/getting-started/quickstart/) in our knowledge base for Getting Started with Kameleo Automation.

## Features

- Stay completely undetected, so websites won't be able to detect that you are using automation tools
- Start unlimited number of profiles with different natural browser fingerprints
- Use authenticated HTTP/SOCKS/SSH proxies in browsers
- Create isolated browsing environments simultaneously
- Use real browser profiles of Chrome, Firefox, Safari and Edge
- Edit, Import or Export browser cookies
- Modify WebRTC parameters
- Modify Geolocation settings
- Modify Timezone and Language settings
- Modify WebGL fingerprint
- Modify 2D Canvas fingerprint
- Modify Navigator properties
- Modify Screen resolution

> _For an overview of automating with Kameleo and which plan you need to access these features, see our [pricing page](https://kameleo.io/pricing)._

## Quickstart Guide

### 1. Install package

```
pip install kameleo.local_api_client
```

### 2. Start the Kameleo.CLI on your computer

```
./Kameleo.CLI email="your@email.com" password="Pa$$w0rd"
```

### 3. Start a browser with out-of-the-box fingerprinting protection

```python
from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest

client = KameleoLocalApiClient()
fingerprints = client.fingerprint.search_fingerprints(
    device_type='desktop',
    browser_product='chrome'
)

# Create a new profile with recommended settings
# for browser fingerprinting protection
create_profile_request = CreateProfileRequest(
    fingerprint_id=fingerprints[0].id,
    name='example profile')
profile = client.profile.create_profile(create_profile_request)

# Start the browser
client.profile.start_profile(profile.id)

# At this point you can automate the browser with your favorite framework
```

## Automate Kameleo profiles with Selenium

Kameleo gives you the ability to control any supported browser using Selenium. It uses the WebDriver protocol, a W3C specification, and industry-standard to interact with a browser.

You need to install the official [Selenium package](https://pypi.org/project/selenium/).

```python
from selenium import webdriver
```

```python
# Connect to the running browser instance using WebDriver
kameleo_port = 5050
options = webdriver.ChromeOptions()
options.set_capability('kameleo:profileId', profile.id)
driver = webdriver.Remote(
    command_executor=f'http://localhost:{kameleo_port}/webdriver',
    options=options
)

# Use any WebDriver command to drive the browser
# and enjoy full protection from bot detection products
driver.get('https://google.com')
```

The full example can be found [here](https://github.com/kameleo-io/local-api-examples/blob/master/python/connect_with_selenium/app.py).

## Automate Kameleo profiles with Puppeteer (Chromium-based)

Kameleo lets you control Chromium-based browsers (sorry Firefox fans) using the [Pyppeteer library](https://pypi.org/project/pyppeteer/). In this simple example you can see how to connect to the browser that Kameleo starts.

You need to import the [Pyppeteer library](https://pypi.org/project/pyppeteer/).

```python
import pyppeteer
```

```python
# Connect to the browser with Puppeteer through CDP
kameleo_port = 5050
browser_ws_endpoint = f'ws://localhost:{kameleo_port}/puppeteer/{profile.id}'
browser = await pyppeteer.launcher.connect(browserWSEndpoint=browser_ws_endpoint, defaultViewport=False)
page = await browser.newPage()

# Use any Playwright command to drive the browser
# and enjoy full protection from bot detection products
await page.goto('https://google.com')
```

The full example can be found [here](https://github.com/kameleo-io/local-api-examples/blob/master/python/connect_with_puppeteer/app.py).

## Automate Kameleo profiles with Playwright

Kameleo allows you to control the browser with the official [Playwright package](https://pypi.org/project/playwright/). It works little bit different with Chromium-based browsers and Firefox, so we provide an example for both. Here we showcase how you can connect to the browser that is already started by Kameleo.

You need to import the official [Playwright package](https://pypi.org/project/playwright/).

```python
import playwright
from playwright.sync_api import sync_playwright
```

You can find more details here: [Using Kameleo with Playwright framework – Kameleo Support Center](https://developer.kameleo.io/integrations/playwright/).

### Chromium-based profiles with Playwright

```python
# Connect to the browser with Playwright through CDP
kameleo_port = 5050
browser_ws_endpoint = f'ws://localhost:{kameleo_port}/playwright/{profile.id}'
with sync_playwright() as playwright:
    browser = playwright.chromium.connect_over_cdp(endpoint_url=browser_ws_endpoint)
    context = browser.contexts[0]
    page = context.new_page()

    # Use any Playwright command to drive the browser
    # and enjoy full protection from bot detection products
    page.goto('https://google.com')
```

The full example can be found [here](https://github.com/kameleo-io/local-api-examples/blob/master/python/connect_with_playwright_to_chrome/app.py).

### Firefox-based profiles with Playwright

```python
# Connect to the browser with Playwright
kameleo_port = 5050
browser_ws_endpoint = f'ws://localhost:{kameleo_port}/playwright/{profile.id}'
with sync_playwright() as playwright:
    # The Playwright framework is not designed to connect to already running
    # browsers. To overcome this limitation, a tool bundled with Kameleo, named
    # pw-bridge will bridge the communication gap between the running Firefox
    # instance and this playwright script.
    # The exact path to the bridge executable is subject to change
    pw_bridge_path = getenv('PW_BRIDGE_PATH')
    if pw_bridge_path == None and system() == 'Windows':
        pw_bridge_path = path.expandvars(r'%LOCALAPPDATA%\Programs\Kameleo\pw-bridge.exe')
    elif pw_bridge_path == None and system() == 'Darwin':
        pw_bridge_path = '/Applications/Kameleo.app/Contents/Resources/CLI/pw-bridge'
    context = playwright.firefox.launch_persistent_context(
        '',
        executable_path=pw_bridge_path,
        args=[f'-target {browser_ws_endpoint}'],
        viewport=None)

    # Kameleo will open the a new page in the default browser context.
    # NOTE: We DO NOT recommend using multiple browser contexts, as this might interfere
    #       with Kameleo's browser fingerprint modification features.
    page = context.new_page()

    # Use any Playwright command to drive the browser
    # and enjoy full protection from bot detection products
    page.goto('https://google.com')
```

The full example can be found [here](https://github.com/kameleo-io/local-api-examples/blob/master/python/connect_with_playwright_to_firefox/app.py).

## Automate mobile profiles

Kameleo can emulate mobile devices with Chroma, our custom built Chromium variant.

```python
# Search for a mobile fingerprints
fingerprints = client.fingerprint.search_fingerprints(
    device_type='mobile',
    os_family='ios',
    browser_product='safari'
)

# Create a new profile with automatic recommended settings
# Choose one of the fingerprints
# Kameleo launches mobile profiles with our Chroma browser
create_profile_request = CreateProfileRequest(
    fingerprint_id=fingerprints[0].id,
    name='automate mobile profiles on desktop example')
profile = client.profile.create_profile(create_profile_request)

# Start the profile
client.profile.start_profile(profile.id, BrowserSettings(
    # This allows you to click on elements using the cursor when emulating a touch screen in the browser.
    # If you leave this out, your script may time out after clicks and fail.
    additional_options=[
        Preference(key='disableTouchEmulation', value=True)
    ],
))

# At this point you can automate the browser with your favorite framework
```

The full example can be found [here](https://github.com/kameleo-io/local-api-examples/blob/master/python/automate_mobile_profiles_on_desktop/app.py).

## Example codes

[Several examples](https://github.com/kameleo-io/local-api-examples) have been prepared in a different repository to showcase the most interesting features. Feel free to create a pull request to add new example codes.

- Finding fingerprints
- Creating profiles with custom options
- Updating profiles with new settings
- How to start a profile
- Using Selenium with Local API
- Using Playwright with Kameleo
- Using Puppeteer with Kameleo
- How to emulate mobile devices
- Adding an HTTP, SOCKS or SSH proxy to profile
- Saving/Loading a browsing session to/from a .kameleo file
- Modify and Delete browser cookies
- Start profile with extra WebDriver capabilities
- How to duplicate virtual browser profiles
- Refresh the browser of the emulated profiles

> Note: _If you are interested in more information about Kameleo, or have encountered an issue with using it, please check out our [Help Center](https://help.kameleo.io/)._

## Package

This package can be found on PyPI here: [kameleo.local-api-client](https://pypi.org/project/kameleo.local-api-client/).

## Endpoints

Available API endpoints with exhaustive descriptions and example values are documented on this [SwaggerHub](https://app.swaggerhub.com/apis/kameleo-team/kameleo-local-api/) page. This package has built-in [IntelliSense](https://code.visualstudio.com/docs/editor/intellisense) support in Visual Studio Code, no extra package installation needed.

## License

This project is released under MIT License. Please refer the LICENSE.txt for more details.
