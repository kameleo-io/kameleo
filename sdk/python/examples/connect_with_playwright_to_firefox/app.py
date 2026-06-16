from kameleo.local_api_client import KameleoLocalApiClient, JunglefoxHelper
from kameleo.local_api_client.models import CreateProfileRequest
from playwright.sync_api import sync_playwright
import time
import os

# This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
kameleo_port = os.getenv('KAMELEO_PORT', '5050')

client = KameleoLocalApiClient(endpoint=f'http://localhost:{kameleo_port}')
client.verify_engine_ready()

# Search Firefox fingerprints
fingerprints = client.fingerprint.search_fingerprints(
    device_type='desktop',
    browser_product='firefox',
)

# Create a new profile with recommended settings
# Choose one of the fingerprints
create_profile_request = CreateProfileRequest(
    fingerprint_id=fingerprints[0].id,
    name='connect with Playwright to Firefox example',
)
profile = client.profile.create_profile(create_profile_request)

# Start the Kameleo profile and connect with Playwright
browser_ws_endpoint = f'ws://localhost:{kameleo_port}/playwright/{profile.id}'
with sync_playwright() as playwright:
    # The Playwright framework can't connect to an already running Firefox instance directly.
    # The Kameleo SDK provides an executable (pw-bridge) that bridges this gap,
    # allowing Playwright to control the browser launched by Kameleo.
    context = playwright.firefox.launch_persistent_context(
        '',
        executable_path=JunglefoxHelper.get_bridge_path(),
        args=JunglefoxHelper.get_bridge_args(client, profile),
        no_viewport=True,
        timeout=90_000,
    )

    # Kameleo will open the a new page in the default browser context.
    # NOTE: We DO NOT recommend using multiple browser contexts, as this might interfere
    #       with Kameleo's browser fingerprint modification features.
    page = context.new_page()

    # Use any Playwright command to drive the browser
    # and enjoy full protection from bot detection products
    page.goto('https://wikipedia.org')
    page.click('[name=search]')
    page.keyboard.type('Chameleon')
    page.keyboard.press('Enter')

    # Wait for 5 seconds
    time.sleep(5)

    # Stop the browser by stopping the Kameleo profile
    client.profile.stop_profile(profile.id)
