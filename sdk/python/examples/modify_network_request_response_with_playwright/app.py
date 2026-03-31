from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest
from playwright.sync_api import sync_playwright
import time
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
# Choose one of the fingerprints
create_profile_request = CreateProfileRequest(
    fingerprint_id=fingerprints[0].id,
    name='modify request response example',
)
profile = client.profile.create_profile(create_profile_request)

# Start the Kameleo profile and connect with Playwright through CDP
browser_ws_endpoint = f'ws://localhost:{kameleo_port}/playwright/{profile.id}'
with sync_playwright() as playwright:
    browser = playwright.chromium.connect_over_cdp(endpoint_url=browser_ws_endpoint)
    context = browser.contexts[0]
    page = context.new_page()
    with open(os.path.join(os.path.dirname(__file__), 'kameleo.svg'), 'rb') as f:
        svg_bytes = f.read()

    # Set up network interceptor, see: https://playwright.dev/python/docs/network
    def route_handler(route):
        request = route.request
        print(f'[{request.method}] {request.url}')

        # Redirect from main to French Wikipedia home page
        if request.url.rstrip('/') == 'https://www.wikipedia.org':
            print('Changing url')
            route.fulfill(
                status=302,
                headers={'Location': 'https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal'},
            )
            return

        # Replace Wikipedia's logo with Kameleo's logo
        if 'wikipedia-wordmark-fr.svg' in request.url:
            route.fulfill(
                status=200,
                body=svg_bytes,
                headers={'Content-Type': 'image/svg+xml'},
            )
            return

        route.continue_()

    page.route('**/*', route_handler)

    # Navigate to the main Wikipedia home page and observe that the French one is loaded
    page.goto('https://www.wikipedia.org/')

time.sleep(10)

# Stop the browser by stopping the Kameleo profile
client.profile.stop_profile(profile.id)
