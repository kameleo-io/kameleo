from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest, ProxyChoice, Server
import time
import os


# This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
kameleo_port = os.getenv('KAMELEO_PORT', '5050')

PROXY_HOST = os.getenv('PROXY_HOST', '<your_proxy_host>')
PROXY_PORT = int(os.getenv('PROXY_PORT', '<your_proxy_port>'))
PROXY_USERNAME = os.getenv('PROXY_USERNAME', '<your_proxy_username>')
PROXY_PASSWORD = os.getenv('PROXY_PASSWORD', '<your_proxy_password>')

client = KameleoLocalApiClient(endpoint=f'http://localhost:{kameleo_port}')

# Search Chrome fingerprints
fingerprints = client.fingerprint.search_fingerprints(
    device_type='desktop',
    browser_product='chrome',
)

# Create a new profile with recommended settings for browser fingerprinting protection
# Choose one of the Chrome fingerprints
create_profile_request = CreateProfileRequest(
    fingerprint_id=fingerprints[0].id,
    name='start with proxy example',
    proxy=ProxyChoice(
        value='socks5',
        extra=Server(host=PROXY_HOST, port=PROXY_PORT, id=PROXY_USERNAME, secret=PROXY_PASSWORD),
    ),
)
profile = client.profile.create_profile(create_profile_request)

# Start the browser profile
client.profile.start_profile(profile.id)

# Wait for 10 seconds
time.sleep(10)

# Stop the browser by stopping the Kameleo profile
client.profile.stop_profile(profile.id)
