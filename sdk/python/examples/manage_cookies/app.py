from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest, CookieRequest
from selenium import webdriver
import time
import os


# This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
kameleo_port = os.getenv('KAMELEO_PORT', '5050')

client = KameleoLocalApiClient(endpoint=f'http://localhost:{kameleo_port}')

# Search Firefox fingerprints
fingerprints = client.fingerprint.search_fingerprints(
    device_type='desktop',
    browser_product='firefox',
)

# Create a new profile with recommended settings for browser fingerprinting protection
# Choose one of the Firefox fingerprints
create_profile_request = CreateProfileRequest(
    fingerprint_id=fingerprints[0].id,
    name='manage cookies example',
)
profile = client.profile.create_profile(create_profile_request)

# Start the Kameleo profile and connect using WebDriver protocol
options = webdriver.FirefoxOptions()
options.set_capability('kameleo:profileId', profile.id)
driver = webdriver.Remote(
    command_executor=f'http://localhost:{kameleo_port}/webdriver',
    options=options,
)

# Navigate to a site which give you cookies
driver.get('https://whoer.net')
time.sleep(5)

driver.get('https://youtube.com')
time.sleep(5)

driver.get('https://www.nytimes.com')
time.sleep(5)

# Stop the browser by stopping the Kameleo profile
client.profile.stop_profile(profile.id)

# You can list all of your cookies
cookie_list = client.cookie.list_cookies(profile.id)
print(f'There are {len(cookie_list)} cookies in the profile')

# You can modify cookie or you can add new
cookie = cookie_list[0]
new_cookie = CookieRequest(
    domain=cookie.domain,
    name=cookie.name,
    path=cookie.path,
    value=cookie.value,
    host_only=cookie.host_only,
    http_only=cookie.http_only,
    secure=cookie.secure,
    same_site=cookie.same_site,
    expiration_date=cookie.expiration_date,
)
cookie_array = [new_cookie]
client.cookie.add_cookies(profile.id, cookie_array)

# You can delete all cookies of the profile
client.cookie.delete_cookies(profile.id)
