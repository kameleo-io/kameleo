# import apis into sdk package
from kameleo.local_api_client.api_client import ApiClient
from kameleo.local_api_client.configuration import Configuration
from kameleo.local_api_client.api.fingerprint_api import FingerprintApi
from kameleo.local_api_client.api.cookie_api import CookieApi
from kameleo.local_api_client.api.folder_api import FolderApi
from kameleo.local_api_client.api.general_api import GeneralApi
from kameleo.local_api_client.api.profile_api import ProfileApi
from kameleo.local_api_client.api.kernel_api import KernelApi

class KameleoLocalApiClient:
    """You can use the following API endpoints to communicate with the local running Kameleo
    programmatically.

    :keyword endpoint: Service URL. Default value is "http://localhost:5050".
    :paramtype endpoint: str
    """

    def __init__(  # pylint: disable=missing-client-constructor-parameter-credential
        self, *, endpoint: str = "http://localhost:5050", configuration: Configuration = None
    ) -> None:
        
        if configuration is None:
            configuration = Configuration.get_default()

        configuration.host = endpoint
        api_client = ApiClient(configuration)

        self._fingerprint = FingerprintApi(api_client)
        self._cookie = CookieApi(api_client)
        self._folder = FolderApi(api_client)
        self._general = GeneralApi(api_client)
        self._profile = ProfileApi(api_client)
        self._kernel = KernelApi(api_client)

    @property
    def fingerprint(self):
        """Get the Fingerprint API."""
        return self._fingerprint

    @property
    def cookie(self):
        """Get the CookieApi API."""
        return self._cookie

    @property
    def folder(self):
        """Get the FolderApi API."""
        return self._folder

    @property
    def general(self):
        """Get the GeneralApi API."""
        return self._general

    @property
    def profile(self):
        """Get the ProfileApi API."""
        return self._profile

    @property
    def kernel(self):
        """Get the KernelApi API."""
        return self._kernel
