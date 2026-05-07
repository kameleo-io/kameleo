from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest
from playwright.sync_api import sync_playwright
import os


# This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
kameleo_port = os.getenv('KAMELEO_PORT', '5050')

client = KameleoLocalApiClient(endpoint=f'http://localhost:{kameleo_port}')

# Search Chrome fingerprints
fingerprints = client.fingerprint.search_fingerprints(
    device_type='desktop',
    browser_product='chrome',
)

# Create a new profile with recommended settings
# for browser fingerprint protection
create_profile_request = CreateProfileRequest(
    fingerprint_id=fingerprints[0].id,
    name='Playwright advanced features example',
)
profile = client.profile.create_profile(create_profile_request)

# Start the Kameleo profile and connect with Playwright through CDP
browser_ws_endpoint = f'ws://localhost:{kameleo_port}/playwright/{profile.id}'
with sync_playwright() as playwright:
    browser = playwright.chromium.connect_over_cdp(endpoint_url=browser_ws_endpoint, timeout=90_000)

    # It is recommended to work on the default context.
    # NOTE: We DO NOT recommend using multiple browser contexts, as this might interfere
    #       with Kameleo's browser fingerprint modification features.
    context = browser.contexts[0]
    page = context.new_page()

    # --- page.add_init_script ---
    # Init scripts run before any page script executes, on every navigation.
    # see: https://playwright.dev/python/docs/api/class-page#page-add-init-script
    page.add_init_script("window.customProperty = 'kameleo'")

    page.goto('https://wikipedia.org')

    # --- page.evaluate ---
    # runs a function in the browser context and returns the result to the host application
    # see: https://playwright.dev/python/docs/api/class-page#page-evaluate
    custom_property = page.evaluate('() => window.customProperty')

    print(f'customProperty: {custom_property}')  # kameleo

    # --- page.expose_function ---
    # makes a host application function callable from the browser's JavaScript context.
    # see: https://playwright.dev/python/docs/api/class-page#page-expose-function
    page.expose_function('addNumbers', lambda a, b: a + b)

    page_result = page.evaluate('() => window.addNumbers(7, 3)')

    print(f'addNumbers(7, 3): {page_result}')  # 10

    # --- Take a screenshot ---
    # see: https://playwright.dev/python/docs/api/class-page#page-screenshot
    page.screenshot(path='screenshot.png', full_page=True)
    print('Screenshot saved to: screenshot.png')

    # --- Record a video ---
    # You can record video by creating a new browser context with the recordVideo option.
    # see: https://playwright.dev/python/docs/api/class-browser#browser-new-context-option-record-video-dir
    video_context = browser.new_context(record_video_dir='videos')
    video_page = video_context.new_page()
    video_page.goto('https://wikipedia.org')
    video_page.wait_for_timeout(3_000)
    video_context.close()
    video_path = video_page.video.path()
    print(f'Video saved to: {video_path}')

# Stop the browser by stopping the Kameleo profile
client.profile.stop_profile(profile.id)
