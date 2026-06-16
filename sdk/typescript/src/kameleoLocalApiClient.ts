import * as apis from "./apis";
import { ErrorCode } from "./models";
import { Configuration, type ConfigurationParameters, DefaultConfig, ResponseError } from "./runtime";

export class KameleoLocalApiClient {
    /** Common configuration for all APIs, set at class construction. */
    public readonly configuration: Configuration;

    // APIs
    public readonly fingerprint: apis.FingerprintApi;
    public readonly cookie: apis.CookieApi;
    public readonly folder: apis.FolderApi;
    public readonly general: apis.GeneralApi;
    public readonly profile: apis.ProfileApi;
    public readonly kernel: apis.KernelApi;

    /**
     * Initializes a new instance of the KameleoLocalApiClient class.
     * @param configuration Configuration for connecting to the Kameleo Engine, including the base url.
     */
    public constructor(configuration?: ConfigurationParameters) {
        this.configuration = configuration ? new Configuration(configuration) : new Configuration();

        this.fingerprint = new apis.FingerprintApi(this.configuration);
        this.cookie = new apis.CookieApi(this.configuration);
        this.folder = new apis.FolderApi(this.configuration);
        this.general = new apis.GeneralApi(this.configuration);
        this.profile = new apis.ProfileApi(this.configuration);
        this.kernel = new apis.KernelApi(this.configuration);
    }

    /**
     * Verifies that the Kameleo Engine is ready to accept connections.
     * Throws if the engine is not available, or the engine was started, but does not become ready within the timeout.
     */
    public async verifyEngineReady(timeoutMs = 30_000): Promise<void> {
        const deadline = Date.now() + timeoutMs;
        while (true) {
            try {
                await this.general.healthcheck();
                return;
            } catch (e) {
                if (e instanceof ResponseError && e.errorCode === ErrorCode.ServiceNotReady && Date.now() < deadline) {
                    await new Promise((resolve) => setTimeout(resolve, 1_000));
                    continue;
                }

                const error = new Error(
                    "ERROR: Could not connect to Kameleo. Make sure it is running, or download it at https://kameleo.io/downloads",
                );

                // we target ES6, but Error.cause is only available in ~ES2022
                (error as any).cause = e;
                throw error;
            }
        }
    }
}
