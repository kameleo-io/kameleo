from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest, BrowserSettings, Preference
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

# Create a new profile with recommended settings for browser fingerprinting protection
# Choose one of the Chrome fingerprints
create_profile_request = CreateProfileRequest(
    fingerprint_id=fingerprints[0].id,
    name='start browser with additional options example',
)
profile = client.profile.create_profile(create_profile_request)

# Provide additional settings for the web driver when starting the browser
# Use this command to customize the browser process by adding command-line arguments
#  like '--mute-audio' or '--start-maximized'
#  or modify the native profile settings when starting the browser

# start the browser with the --mute-audio command line argument
client.profile.start_profile(
    profile.id,
    BrowserSettings(
        arguments=['mute-audio'],
    ),
)
# Wait for 10 seconds
time.sleep(10)
# Stop the profile
client.profile.stop_profile(profile.id)

# start the browser with an additional Selenum option
client.profile.start_profile(
    profile.id,
    BrowserSettings(
        additional_options=[
            Preference(key='pageLoadStrategy', value='eager'),
        ]
    ),
)
time.sleep(10)
client.profile.stop_profile(profile.id)

# start the browser and also set a Chrome preference
client.profile.start_profile(
    profile.id,
    BrowserSettings(
        preferences=[
            Preference(key='profile.managed_default_content_settings.images', value=2),
        ]
    ),
)
time.sleep(10)
client.profile.stop_profile(profile.id)
