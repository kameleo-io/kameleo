from kameleo.local_api_client import KameleoLocalApiClient
import os

# This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
kameleo_port = os.getenv('KAMELEO_PORT', '5050')

client = KameleoLocalApiClient(endpoint=f'http://localhost:{kameleo_port}')
client.verify_engine_ready()

profiles = client.profile.list_profiles()
for profile in profiles:
    client.profile.delete_profile(profile.id)

print(f'{len(profiles)} profiles deleted.')
