import * as apis from "./apis";
import { Configuration, ConfigurationParameters } from "./runtime";

export class KameleoLocalApiClient {
    public fingerprint: apis.FingerprintApi;
    public cookie: apis.CookieApi;
    public folder: apis.FolderApi;
    public general: apis.GeneralApi;
    public profile: apis.ProfileApi;
    public kernel: apis.KernelApi;

    /**
     * Initializes a new instance of the KameleoLocalApiClient class.
     * @param configuration The base url of the Kameleo.CLI.
     */
    public constructor(configuration?: ConfigurationParameters) {
        const config = configuration ? new Configuration(configuration) : new Configuration();

        this.fingerprint = new apis.FingerprintApi(config);
        this.cookie = new apis.CookieApi(config);
        this.folder = new apis.FolderApi(config);
        this.general = new apis.GeneralApi(config);
        this.profile = new apis.ProfileApi(config);
        this.kernel = new apis.KernelApi(config);
    }
}
