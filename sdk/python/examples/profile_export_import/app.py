from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import ExportProfileRequest, ImportProfileRequest
import time
import os


# This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
kameleo_port = os.getenv('KAMELEO_PORT', '5050')

client = KameleoLocalApiClient(endpoint=f'http://localhost:{kameleo_port}')
client.verify_engine_ready()

# Create a new profile with the default settings (note: the default can change in the future without notice, use it only for quick prototyping)
# You can find the default settings here: https://developer.kameleo.io/tutorials/filtering-fingerprints/
profile = client.profile.create_profile()

# Export the profile to a given path
export_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'test.kameleo')
client.profile.export_profile(profile.id, ExportProfileRequest(path=export_path))
print(f'Profile has been exported to {export_path}')

# You have to delete this profile if you want to import back
client.profile.delete_profile(profile.id)

# Import the profile from the given url
profile = client.profile.import_profile(ImportProfileRequest(path=export_path))

# Start the profile
client.profile.start_profile(profile.id)

# Wait for 10 seconds
time.sleep(10)

# Stop the browser by stopping the Kameleo profile
client.profile.stop_profile(profile.id)
