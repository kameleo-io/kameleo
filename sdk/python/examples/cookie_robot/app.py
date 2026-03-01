from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest
from selenium import webdriver
import time
import os
import random


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
    name='cookie robot example',
)
profile = client.profile.create_profile(create_profile_request)

# Start the Kameleo profile and connect using WebDriver protocol
options = webdriver.FirefoxOptions()
options.set_capability('kameleo:profileId', profile.id)
driver = webdriver.Remote(
    command_executor=f'http://localhost:{kameleo_port}/webdriver',
    options=options,
)

all_sites = [
    'instagram.com',
    'linkedin.com',
    'ebay.com',
    'pinterest.com',
    'reddit.com',
    'cnn.com',
    'bbc.co.uk',
    'nytimes.com',
    'reuters.com',
    'theguardian.com',
    'foxnews.com',
]

# Select sites to collect cookies from
sites_to_visit = []
while len(sites_to_visit) < 5:
    site = all_sites[random.randint(0, len(all_sites) - 1)]
    if site not in set(sites_to_visit):
        sites_to_visit.append(site)

# Warm up profile by visiting the randomly selected sites
for site in sites_to_visit:
    driver.get(f'https://{site}')
    time.sleep(random.randint(5, 15))

# Stop the browser by stopping the Kameleo profile
client.profile.stop_profile(profile.id)
