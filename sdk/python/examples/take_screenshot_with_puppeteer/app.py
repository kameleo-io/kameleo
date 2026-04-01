from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest
import asyncio
import pyppeteer
import random
import string
import os


async def main():
    # This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
    kameleo_port = os.getenv('KAMELEO_PORT', '5050')

    client = KameleoLocalApiClient(endpoint=f'http://localhost:{kameleo_port}')

    # Search Chrome fingerprints
    fingerprints = client.fingerprint.search_fingerprints(
        device_type='desktop',
        browser_product='chrome',
    )

    # Create a new profile with recommended settings for browser fingerprinting protection
    # Choose one of the Chrome fingerprints
    # You can setup here all of the profile options like WebGL
    create_profile_request = CreateProfileRequest(
        fingerprint_id=fingerprints[0].id,
        name='take screenshot example',
    )
    profile = client.profile.create_profile(create_profile_request)

    # Start the Kameleo profile and connect through CDP
    browser_ws_endpoint = f'ws://localhost:{kameleo_port}/puppeteer/{profile.id}'
    browser = await pyppeteer.launcher.connect(browserWSEndpoint=browser_ws_endpoint, defaultViewport=False)
    page = await browser.newPage()

    # Open a random page from wikipedia
    await page.goto('https://en.wikipedia.org/wiki/Special:Random')

    res = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))

    # Take screenshot
    await page.screenshot({'path': f'{res}.png', 'fullPage': True})

    # Stop the browser by stopping the Kameleo profile
    client.profile.stop_profile(profile.id)


asyncio.run(main())
