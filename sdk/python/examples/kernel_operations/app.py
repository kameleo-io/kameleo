from kameleo.local_api_client import KameleoLocalApiClient
import time
import os


# This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
kameleo_port = os.getenv('KAMELEO_PORT', '5050')

client = KameleoLocalApiClient(endpoint=f'http://localhost:{kameleo_port}')
client.verify_engine_ready()

# Create a new profile with the default settings (note: the default can change in the future without notice, use it only for quick prototyping)
# You can find the default settings here: https://developer.kameleo.io/tutorials/filtering-fingerprints/
profile = client.profile.create_profile()
print(f'New default profile has been created: [{profile.id}] {profile.name}')

# Install the kernel that best suits the profile's fingerprint, downloading it if it's not already available locally
kernel = client.profile.install_profile_kernel(profile.id)
print(f'Kernel \'{kernel.browser}\' {kernel.version} for {kernel.platform} is installed')

# Start the profile: since the kernel is already installed, the browser launches immediately
client.profile.start_profile(profile.id)

# Wait for 5 seconds
time.sleep(5)

# Stop the profile
client.profile.stop_profile(profile.id)

# List all the kernels known to the Engine
kernels = client.kernel.list_kernels()
print(f'Kernels available on the server: {len(kernels)}')

# Remove the kernel that we have just installed for the profile from the local file system
client.kernel.remove_kernel(kernel.id)
print(f'Kernel \'{kernel.browser}\' {kernel.version} for {kernel.platform} is removed')

# Start the profile again
# Since the kernel has just been removed, the Engine has to download and install it implicitly before launching the browser,
# so this start procedure takes noticeably longer than the previous one
client.profile.start_profile(profile.id)

# Wait for 5 seconds
time.sleep(5)

# Stop the profile
client.profile.stop_profile(profile.id)
