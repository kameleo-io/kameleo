from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest
from playwright.sync_api import sync_playwright
import time
import os
import json

# This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
kameleo_port = os.getenv('KAMELEO_PORT', '5050')

client = KameleoLocalApiClient(
    endpoint=f'http://localhost:{kameleo_port}'
)

# Search Chrome fingerprints
fingerprints = client.fingerprint.search_fingerprints(
    device_type='desktop',
    browser_product='chrome'
)

# Create a new profile with recommended settings
# Choose one of the fingerprints
create_profile_request = CreateProfileRequest(
    fingerprint_id=fingerprints[0].id,
    name='Kameleo bypass Cloudflare Turnstile')
profile = client.profile.create_profile(create_profile_request)

# Start the Kameleo profile and connect with Playwright through CDP
client.profile.start_profile(profile.id)
browser_ws_endpoint = f'ws://localhost:{kameleo_port}/playwright/{profile.id}'
with sync_playwright() as playwright:
    browser = playwright.chromium.connect_over_cdp(endpoint_url=browser_ws_endpoint)
    context = browser.contexts[0]
    page = context.new_page()

    user_agent = page.evaluate("navigator.userAgent")
    print(f"Current User-Agent: {user_agent}")
    with open("user_agent.txt", "w") as file:
        file.write(user_agent)

    # Use any Playwright command to drive the browser and enjoy full protection from bot detection products
    page.goto('https://www.indeed.com/cmp/Burger-King/reviews')

# Wait for 15 seconds
time.sleep(15)

# Stop the browser by stopping the Kameleo profile
client.profile.stop_profile(profile.id)

# Export cookies using the Kameleo API
try:
    exported_cookies = client.cookie.list_cookies(profile.id)

    # Filter the cf_clearance cookie
    cf_clearance_cookie = next(
        (cookie for cookie in exported_cookies if cookie.name == 'cf_clearance'),
        None
    )

    # Save the cookie to a JSON file if found
    if cf_clearance_cookie:
        output_data = [{
            'domain': cf_clearance_cookie.domain,
            'name': cf_clearance_cookie.name,
            'value': cf_clearance_cookie.value
        }]
        with open('cf_clearance_cookie.json', 'w') as f:
            json.dump(output_data, f, indent=4)
        print("Cookies exported successfully!")
    else:
        print("cf_clearance cookie not found")
except Exception as e:
    print(f"Error accessing cookies: {e}")
