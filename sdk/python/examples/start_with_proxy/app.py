from kameleo.local_api_client import ApiException, KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest, ProxyChoice, Server, TestProxyRequest
import time
import os


# This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
kameleo_port = os.getenv('KAMELEO_PORT', '5050')

PROXY_HOST = os.getenv('PROXY_HOST', '<your_proxy_host>')
PROXY_PORT = int(os.getenv('PROXY_PORT', '<your_proxy_port>'))
PROXY_USERNAME = os.getenv('PROXY_USERNAME', '<your_proxy_username>')
PROXY_PASSWORD = os.getenv('PROXY_PASSWORD', '<your_proxy_password>')

client = KameleoLocalApiClient(endpoint=f'http://localhost:{kameleo_port}')
client.verify_engine_ready()

# Search Chrome fingerprints
fingerprints = client.fingerprint.search_fingerprints(browser_product='chrome')

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
# Optional: test the proxy settings before creating a profile with them. Skip this step if you do not need it.
# An unusable proxy comes back as a 503 error response, so the call raises instead of returning a result.
try:
    proxy_test = client.general.test_proxy(TestProxyRequest(proxy=create_profile_request.proxy))
    print(f'Proxy test result: {proxy_test.result}')
    for step in proxy_test.steps:
        print(f'  {"OK  " if step.successful else "FAIL"} {step.name}' + ('' if step.successful else f' ({step.comment})'))
except ApiException:
    print('Proxy test failed, this proxy is not usable.')

profile = client.profile.create_profile(create_profile_request)

# Optional: test the proxy stored on the profile, without sending the credentials again. Skip this step if you do not need it.
try:
    profile_proxy_test = client.profile.test_profile_proxy(profile.id)
    print(f'Profile proxy test result: {profile_proxy_test.result}')
except ApiException:
    print('Profile proxy test failed, this proxy is not usable.')

# Start the browser profile
client.profile.start_profile(profile.id)

# Wait for 10 seconds
time.sleep(10)

# Stop the browser by stopping the Kameleo profile
client.profile.stop_profile(profile.id)
