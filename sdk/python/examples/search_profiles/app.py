from kameleo.local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import (
    ColumnFilterState,
    CreateProfileRequest,
    PaginationState,
    SortingState,
    TableRequest,
)
import os


# This is the port the Kameleo Engine is listening on. Default value is 5050, but can be overridden in appsettings.json file
kameleo_port = os.getenv('KAMELEO_PORT', '5050')

client = KameleoLocalApiClient(endpoint=f'http://localhost:{kameleo_port}')
client.verify_engine_ready()

# Create a few profiles to search in
fingerprints = client.fingerprint.search_fingerprints(device_type='desktop', browser_product='chrome')
created_profiles = []
for i in range(1, 6):
    created_profiles.append(client.profile.create_profile(CreateProfileRequest(
        fingerprint_id=fingerprints[0].id,
        name=f'search example {i}',
        tags=['search-example', 'even'] if i % 2 == 0 else ['search-example'],
    )))

# search_profiles returns one page of profiles, filtered and sorted by the Engine, instead of loading all of them like list_profiles
# Note: the endpoint is experimental, its request may change in a future version
# The column ids are the property paths of the returned profiles, e.g. name, tags, browser.product, status.lifetimeState

# The global filter searches every column, e.g. the name, tags, OS, browser and device of the profiles
by_text = client.profile.search_profiles(TableRequest(global_filter='search example'))
print(f'Profiles matching \'search example\': {by_text.total_count}')

# A column filter with a single text matches by substring, with a list it matches any of the values exactly
# Several column filters must all match
even_chrome_profiles = client.profile.search_profiles(TableRequest(column_filters=[
    ColumnFilterState(id='tags', value='even'),
    ColumnFilterState(id='browser.product', value=['chrome']),
]))
print(f'Chrome profiles tagged \'even\': {", ".join(p.name for p in even_chrome_profiles.items)}')

# The running profiles, without listing the others
running_profiles = client.profile.search_profiles(TableRequest(
    column_filters=[ColumnFilterState(id='status.lifetimeState', value=['starting', 'running'])],
    pagination=PaginationState(page_index=0, page_size=1),
))
print(f'Running profiles: {running_profiles.total_count}')

# Walk the matching profiles page by page, newest first
page_index = 0
while True:
    page = client.profile.search_profiles(TableRequest(
        column_filters=[ColumnFilterState(id='tags', value='search-example')],
        sorting=[SortingState(id='createdAt', desc=True)],
        pagination=PaginationState(page_index=page_index, page_size=2),
    ))
    print(f'Page {page.page_index + 1} of {page.page_count}: {", ".join(p.name for p in page.items)}')
    page_index += 1
    if page_index >= page.page_count:
        break

# Delete the profiles of the example
for profile in created_profiles:
    client.profile.delete_profile(profile.id)
