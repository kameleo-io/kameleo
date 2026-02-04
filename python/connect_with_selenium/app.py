from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest
from selenium import webdriver
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
    name='connect to Selenium example',
)
profile = client.profile.create_profile(create_profile_request)

# Start the Kameleo profile and connect using WebDriver protocol
options = webdriver.ChromeOptions()
options.set_capability('kameleo:profileId', profile.id)
driver = webdriver.Remote(
    command_executor=f'http://localhost:{kameleo_port}/webdriver',
    options=options,
)

# Use any WebDriver command to drive the browser
# and enjoy full protection from bot detection products
driver.get('https://wikipedia.org')
driver.find_element('name', 'search').send_keys('Chameleon\n')
print(driver.title)

# Wait for 5 seconds
time.sleep(5)

# Stop the browser by stopping the Kameleo profile
client.profile.stop_profile(profile.id)
