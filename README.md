# Kameleo Local API Example Codes

With [Kameleo](https://kameleo.io), you can easily create multiple virtual browser profiles to work with multiple accounts. It helps you hide your actual timezone, geolocation, language, IP address and creates natural browser fingerprints to prevent detection by anti-bot systems. Kameleo is compatible with [Selenium](https://www.selenium.dev/), [Playwright](https://playwright.dev/), and [Puppeteer](https://pptr.dev/) frameworks for automating web scraping tasks. This repository shows useful and easy to understand examples written in Node.js, Python and .NET Core (C#) about web scraping and automated browsing with Kameleo Client.

## Features

- Stay completely undetected, so websites won’t be able to detect that you are using automation tools
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

## How to start examples

### 1. Start the Kameleo.CLI on your computer

```powershell
./Kameleo.CLI email="your@email.com" password="Pa$$w0rd"
```

### 2. Start the example code that you are interested in

- For projects located in the `nodejs` folder you must run `npm install` and then `npm start`.
- For projects located in the `python` folder you must run `pip install -r requirements.txt` and then `python app.py`.
- For project located in the `dotnet-csharp` folder just open the .csproj file using Visual Studio 2019 or later.

### 3. Check out Kameleo Help Center

If you are interested in more information about Kameleo, or have encountered an issue with using it, please check out our [Help Center](https://help.kameleo.io/).

### Examples index

| Folder                                          | Description                                                                                                                                                                            |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| automate_mobile_profiles_on_desktop             | This code shows you how to emulate a mobile device in Chroma browser. And how to drive it with Selenium or any other automation framework.                                             |
| basic_profile_operations                        | Shows basic profile operations with the Kameleo API, like finding the right fingerprint, creating profiles, duplicating them, modifying their spoofing options, launching the browser. |
| clean_workspace                                 | Delete the profiles in your Kameleo Workspace. Useful when migrating to Kameleo 3, in particular.                                                                                      |
| connect_with_playwright_to_chrome               | This code shows how to start a Chromium-based browser in Kameleo and automate tasks using the [Playwright](https://playwright.dev/) framework.                                         |
| connect_with_playwright_to_firefox              | This code illustrates how to start a Firefox in Kameleo and then automate actions using the [Playwright](https://playwright.dev/) framework.                                           |
| connect_with_puppeteer                          | This code illustrates how to start a Chromium based browser in Kameleo and then automate actions using the [Puppeteer](https://pptr.dev/) framework.                                   |
| connect_with_selenium                           | This code shows you how to launch a browser in Kameleo, perform actions using [Selenium](https://www.selenium.dev/) commands, and then close the browser.                              |
| cookie_robot                                    | Shows warming up the profile by visiting well-known sites so the browser has their cookies. This can make make the profile more trustworthy to other sites.                            |
| modify_network_request_response_with_playwright | Launch a Kameleo profile, intercept and modify the browser's network traffic with the [Playwright](https://playwright.dev/) framework.                                                 |
| manage_cookies                                  | Kameleo allows you to edit, modify or create cookies with just a few lines of code.                                                                                                    |
| profile_export_import                           | This is a quick example of saving and loading profiles to/from .kameleo files on your computer.                                                                                        |
| start_browser_with_additional_options           | Check out this example if you want to pass command-line arguments or extra [Selenium](https://www.selenium.dev/) capabilities when starting a browser.                                 |
| start_with_proxy                                | Kameleo makes it easy to use any HTTP, SOCKS, or SSH proxy. Check out these few lines of code to see how.                                                                              |
| take_screenshot_with_puppeteer                  | Shows launching a Kameleo profile and taking a screenshot of a website using the [Puppeteer](https://pptr.dev/) framework.                                                             |
| upgrade_profile                                 | If you reuse virtual browser profiles and you would like to update the spoofed browser version you should follow this example.                                                         |

- C# only
    - `file_upload_with_selenium` - Shows uploading a file to a website using the [Selenium](https://www.selenium.dev/) framework.
    - `modify_request_response_with_selenium` - Shows intercepting and modifying network communication by the browser using the [Selenium](https://www.selenium.dev/) framework.
- JavaScript only
    - `commonjs` - Shows how to use the Kameleo API with CommonJS modules (other examples are ESM)
