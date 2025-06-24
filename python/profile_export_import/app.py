from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import CreateProfileRequest, ExportProfileRequest, ImportProfileRequest
import time
import os


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

# Create a new profile with recommended settings for browser fingerprinting protection
# Choose one of the Chrome fingerprints
create_profile_request = CreateProfileRequest(
    fingerprint_id=fingerprints[0].id,
    name='profile export import example')
profile = client.profile.create_profile(create_profile_request)

# Export the profile to a given path
folder = os.path.dirname(os.path.realpath(__file__))
path = os.path.join(folder, 'test.kameleo')
client.profile.export_profile(profile.id, ExportProfileRequest(path=path))
print(f'Profile has been exported to {folder}')

# You have to delete this profile if you want to import back
client.profile.delete_profile(profile.id)

# Import the profile from the given url
profile = client.profile.import_profile(ImportProfileRequest(path=path))

# Start the profile
client.profile.start_profile(profile.id)

# Wait for 5 seconds
time.sleep(5)

# Stop the browser by stopping the Kameleo profile
client.profile.stop_profile(profile.id)
