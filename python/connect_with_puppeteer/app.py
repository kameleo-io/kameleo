from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest
import pyppeteer
import time
import asyncio
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

    # Create a new profile with recommended settings
    # Choose one of the fingerprints
    create_profile_request = CreateProfileRequest(
        fingerprint_id=fingerprints[0].id,
        name='connect with Puppeteer example',
    )
    profile = client.profile.create_profile(create_profile_request)

    # Start the Kameleo profile and connect through CDP
    browser_ws_endpoint = f'ws://localhost:{kameleo_port}/puppeteer/{profile.id}'
    browser = await pyppeteer.launcher.connect(browserWSEndpoint=browser_ws_endpoint, defaultViewport=False)
    page = await browser.newPage()

    # Use any Puppeteer command to drive the browser
    # and enjoy full protection from bot detection products
    await page.goto('https://wikipedia.org')
    await page.click('[name=search')
    await page.keyboard.type('Chameleon')
    await page.keyboard.press('Enter')

    # Wait for 5 seconds
    time.sleep(5)

    # Stop the browser by stopping the Kameleo profile
    client.profile.stop_profile(profile.id)


asyncio.run(main())
