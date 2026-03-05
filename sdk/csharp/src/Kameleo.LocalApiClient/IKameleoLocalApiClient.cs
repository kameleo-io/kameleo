using Kameleo.LocalApiClient.Api;
using Kameleo.LocalApiClient.Client;

namespace Kameleo.LocalApiClient
{
    /// <summary>
    /// Encapsualte access to all the provided APIs by Kameleo.CLI.
    /// </summary>
    public interface IKameleoLocalApiClient
    {
        /// <summary>
        /// Configuration of the API client.
        /// </summary>
        IReadableConfiguration Configuration { get; }

        /// <summary>
        /// Represents a collection of functions to interact with the Fingerprint API endpoints.
        /// </summary>
        IFingerprintApiAsync Fingerprint { get; }

        /// <summary>
        /// Represents a collection of functions to interact with the Cookie API endpoints.
        /// </summary>
        ICookieApiAsync Cookie { get; }

        /// <summary>
        /// Represents a collection of functions to interact with the Folder API endpoints.
        /// </summary>
        IFolderApiAsync Folder { get; }

        /// <summary>
        /// Represents a collection of functions to interact with the General API endpoints.
        /// </summary>
        IGeneralApiAsync General { get; }

        /// <summary>
        /// Represents a collection of functions to interact with the Profile API endpoints.
        /// </summary>
        IProfileApi Profile { get; }

        /// <summary>
        /// Represents a collection of functions to interact with the Kernel API endpoints.
        /// </summary>
        IKernelApi Kernel { get; }
    }
}
