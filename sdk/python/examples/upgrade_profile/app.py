from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest
import time
import os


# This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
kameleo_port = os.getenv('KAMELEO_PORT', '5050')

client = KameleoLocalApiClient(endpoint=f'http://localhost:{kameleo_port}')

# Search for a Desktop fingerprint with Windows OS and Chrome browser
fingerprints = client.fingerprint.search_fingerprints(
    device_type='desktop',
    os_family='windows',
    browser_product='chrome',
)

# Find a fingerprint with the oldest available version of chrome
fingerprint = sorted(fingerprints, key=lambda x: x.browser.major)[0]

# Create a new profile with recommended settings
# Choose one of the fingerprints
create_profile_request = CreateProfileRequest(
    fingerprint_id=fingerprint.id,
    name='upgrade profiles example',
)
profile = client.profile.create_profile(create_profile_request)

print(f"Profile's browser before update is {profile.fingerprint.browser.product} {profile.fingerprint.browser.version}")

# The fingerprint’s browser version will be updated if there is any available on our servers
profile = client.profile.upgrade_profile_kernel(profile.id)
print(f"Profile's browser after update is {profile.fingerprint.browser.product} {profile.fingerprint.browser.version}")

# Start the browser profile
client.profile.start_profile(profile.id)

# Wait for 5 seconds
time.sleep(5)

# Stop the browser by stopping the Kameleo profile
client.profile.stop_profile(profile.id)
