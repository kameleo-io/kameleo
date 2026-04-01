from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest, BrowserSettings, Preference
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import time
import os


# This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
kameleo_port = os.getenv('KAMELEO_PORT', '5050')

client = KameleoLocalApiClient(endpoint=f'http://localhost:{kameleo_port}')

# Search for a mobile fingerprints
fingerprints = client.fingerprint.search_fingerprints(
    device_type='mobile',
    os_family='ios',
    browser_product='safari',
)

# Create a new profile with automatic recommended settings
# Choose one of the fingerprints
# Kameleo launches mobile profiles with our Chroma browser
create_profile_request = CreateProfileRequest(
    fingerprint_id=fingerprints[0].id,
    name='automate mobile profiles on desktop example',
)
profile = client.profile.create_profile(create_profile_request)

# Start the profile
client.profile.start_profile(
    profile.id,
    BrowserSettings(
        # This allows you to click on elements using the cursor when emulating a touch screen in the browser.
        # If you leave this out, your script may time out after clicks and fail.
        additional_options=[Preference(key='disableTouchEmulation', value=True)],
    ),
)

# In this example we show how you can automate the mobile profile with Selenium
# You can also do this with Puppeteer or Playwright
options = webdriver.ChromeOptions()
options.set_capability('kameleo:profileId', profile.id)
driver = webdriver.Remote(
    command_executor=f'http://localhost:{kameleo_port}/webdriver',
    options=options,
)

# Use any WebDriver command to drive the browser
# and enjoy full protection from bot detection products
driver.get('https://wikipedia.org')
driver.find_element(By.NAME, 'search').send_keys('Chameleon', Keys.ENTER)
WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, 'content')))
print(f'The title is {driver.title}')

# Wait for 5 seconds
time.sleep(5)

# Stop the browser by stopping the Kameleo profile
client.profile.stop_profile(profile.id)
