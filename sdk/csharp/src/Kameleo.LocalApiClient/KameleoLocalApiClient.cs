using Kameleo.LocalApiClient.Api;
using Kameleo.LocalApiClient.Client;
using System;

namespace Kameleo.LocalApiClient
{
    /// <summary>
    /// Encapsualte access to all the provided APIs by Kameleo.CLI.
    /// </summary>
    public class KameleoLocalApiClient : IKameleoLocalApiClient
    {
        private readonly Configuration _configuration;

        /// <inheritdoc/>
        public IReadableConfiguration Configuration => _configuration;

        /// <summary>
        /// Initializes a new instance of the <see cref="KameleoLocalApiClient"/> class using the default parameters.
        /// </summary>
        public KameleoLocalApiClient() : this(new Uri("http://localhost:5050"))
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="KameleoLocalApiClient"/> class providing the base url of tha Kameleo.CLI.
        /// </summary>
        /// <param name="baseUri">Base url of tha Kameleo.CLI</param>
        public KameleoLocalApiClient(Uri baseUri) : this(new Configuration { BasePath = baseUri.ToString() })
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="KameleoLocalApiClient"/> class using <see cref="Kameleo.LocalApiClient.Client.Configuration"/> object.
        /// </summary>
        /// <param name="configuration"><see cref="Kameleo.LocalApiClient.Client.Configuration"/></param>
        public KameleoLocalApiClient(Configuration configuration)
        {
            _configuration = configuration;

            Fingerprint = new FingerprintApi(_configuration);
            Cookie = new CookieApi(_configuration);
            Folder = new FolderApi(_configuration);
            General = new GeneralApi(_configuration);
            Profile = new ProfileApi(_configuration);
            Kernel = new KernelApi(_configuration);
        }

        /// <inheritdoc/>
        public IFingerprintApiAsync Fingerprint { get; }

        /// <inheritdoc/>
        public ICookieApiAsync Cookie { get; }

        /// <inheritdoc/>
        public IFolderApiAsync Folder { get; }

        /// <inheritdoc/>
        public IGeneralApiAsync General { get; }

        /// <inheritdoc/>
        public IProfileApi Profile { get; }

        /// <inheritdoc/>
        public IKernelApi Kernel { get; }
    }
}
