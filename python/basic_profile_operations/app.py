from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest, UpdateProfileRequest, WebglMetaChoice, WebglMetaSpoofingOptions
import time
import os


# This is the port Kameleo.CLI is listening on. Default value is 5050, but can be overridden in appsettings.json file
kameleo_port = os.getenv('KAMELEO_PORT', '5050')

client = KameleoLocalApiClient(
    endpoint=f'http://localhost:{kameleo_port}'
)

# Search Chrome fingerprints
# Possible deviceType value: desktop, mobile
# Possible browserProduct value: chrome, firefox, edge, ...
# Possible osFamily values: windows, macos, linux, android, ios
# Examples of browserVersion values that limit the major version of the fingeprint: 135, >134, ...
# You can use empty parameters as well, Kameleo provides recent and varied fingerprints by default
fingerprints = client.fingerprint.search_fingerprints(
    device_type='desktop',
    browser_product='chrome',
    browser_version='>134',
)

# Create a new profile with recommended settings for browser fingerprinting protection
# Choose one of the Chrome fingerprints
# You can setup here all of the profile options like WebGL
create_profile_request = CreateProfileRequest(
    fingerprint_id=fingerprints[0].id,
    language="es-ES",
    name='create profile example',
    webgl='noise',
    webgl_meta=WebglMetaChoice(
        value='manual',
        extra=WebglMetaSpoofingOptions(
            vendor='Google Inc.',
            renderer='ANGLE (Intel(R) HD Graphics 630 Direct3D11 vs_5_0 ps_5_0)')),
    start_page='https://kameleo.io',
    password_manager='enabled')
profile = client.profile.create_profile(create_profile_request)

# Start the browser profile
client.profile.start_profile(profile.id)

# Wait for 10 seconds
time.sleep(10)

# Stop the browser by stopping the Kameleo profile
client.profile.stop_profile(profile.id)

# Duplicate the previously created profile
duplicated_profile = client.profile.duplicate_profile(profile.id)
print(f'Profile {duplicated_profile.name} is created')

# Change every property that you want to update on the duplicated profile
# Send the update request and the response will be your updated profile
update_profile_request = UpdateProfileRequest(
    name = 'duplicate profile example',
    webgl_meta = WebglMetaChoice(value='automatic')
)

# Send the update request and the response will be your updated profile
duplicated_profile = client.profile.update_profile(duplicated_profile.id, update_profile_request)

# Start the duplicated browser profile
client.profile.start_profile(duplicated_profile.id)

# Wait for 10 seconds
time.sleep(10)

# Stop the browser by stopping the Kameleo profile
client.profile.stop_profile(duplicated_profile.id)

# Delete original profile
# Profiles need to be deleted explicitly becase they are persisted so they are available after restarting Kameleo
client.profile.delete_profile(profile.id)
