import type { KameleoLocalApiClient } from "./kameleoLocalApiClient";
import type { ProfilePreview, ProfileResponse } from "./models";

/** @throws Always — JunglefoxHelper is not available in browser environments. */
export class JunglefoxHelper {
    private constructor() {}

    public static getBridgePath(): string {
        throw new Error("JunglefoxHelper is not available in browser environments.");
    }

    public static getBridgeArgs(_client: KameleoLocalApiClient, _profile: ProfileResponse | ProfilePreview): string[] {
        throw new Error("JunglefoxHelper is not available in browser environments.");
    }
}
