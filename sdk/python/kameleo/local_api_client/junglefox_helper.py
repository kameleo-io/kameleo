import os
import platform
import stat
from typing import List, Union
from urllib.parse import urlparse

from kameleo.local_api_client.kameleo_local_api_client import KameleoLocalApiClient
from kameleo.local_api_client.models import ProfilePreview, ProfileResponse


class JunglefoxHelper:
    """Static helper class for using the Junglefox kernel (for Firefox profiles) with Playwright.

    The Playwright framework can't connect to an already running Firefox instance directly.
    The Kameleo SDK provides an executable (pw-bridge) that bridges this gap,
    allowing Playwright to control the browser launched by Kameleo.

    Example::

        context = playwright.firefox.launch_persistent_context(
            '',
            executable_path=JunglefoxHelper.get_bridge_path(),
            args=JunglefoxHelper.get_bridge_args(client, profile),
            no_viewport=True,
            timeout=90_000,
        )
    """

    def __new__(cls):
        raise TypeError("JunglefoxHelper is a static class and cannot be instantiated.")

    @staticmethod
    def get_bridge_path() -> str:
        """Provides the path to the pw-bridge executable for connecting to Junglefox with Playwright.
        Use in combination with :meth:`get_bridge_args`.

        See also `BrowserType.launch_persistent_context
        <https://playwright.dev/python/docs/api/class-browsertype#browser-type-launch-persistent-context>`_.

        :returns: Absolute path to the pw-bridge executable.
        """
        system = platform.system()
        machine = platform.machine()

        if system == "Windows":
            folder = "win-x64"
            exe = "pw-bridge.exe"
        elif system == "Linux":
            folder = "linux-x64"
            exe = "pw-bridge"
        elif system == "Darwin":
            folder = "osx-arm64"
            exe = "pw-bridge"
        else:
            raise OSError(f"Unsupported platform: {system}-{machine}")

        path = os.path.join(JunglefoxHelper._resolve_package_root(), "bin", folder, exe)
        # make pw-bridge executable on Linux / macOS even when it was packaged on Windows
        if system != "Windows":
            current = os.stat(path).st_mode
            os.chmod(path, current | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
        return path

    @staticmethod
    def get_bridge_args(
        client: KameleoLocalApiClient,
        profile: Union[ProfileResponse, ProfilePreview],
    ) -> List[str]:
        """Provides the args for connecting to Junglefox with Playwright.
        Use in combination with :meth:`get_bridge_path`.

        See also `BrowserType.launch_persistent_context
        <https://playwright.dev/python/docs/api/class-browsertype#browser-type-launch-persistent-context>`_.

        :param client: The :class:`KameleoLocalApiClient` instance.
        :param profile: The profile to connect to (ProfileResponse or ProfilePreview).
        :returns: Args list, e.g. ``["-target", "ws://localhost:5050/playwright/<profileId>"]``.
        """
        parsed = urlparse(client.configuration.host)
        browser_ws_endpoint = (
            f"ws://{parsed.hostname}:{parsed.port}/playwright/{profile.id}"
        )
        return ["-target", browser_ws_endpoint]

    @staticmethod
    def _resolve_package_root() -> str:
        # __file__ is kameleo/local_api_client/junglefox_helper.py
        # bin/ is placed alongside this file in the same directory
        return os.path.dirname(os.path.abspath(__file__))
