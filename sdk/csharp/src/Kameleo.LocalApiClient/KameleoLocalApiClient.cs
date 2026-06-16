using Kameleo.LocalApiClient.Api;
using Kameleo.LocalApiClient.Client;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Kameleo.LocalApiClient
{
    /// <summary>
    /// Encapsualte access to all the provided APIs by the Kameleo Engine.
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
        /// Initializes a new instance of the <see cref="KameleoLocalApiClient"/> class providing the base url of the Kameleo Engine.
        /// </summary>
        /// <param name="baseUri">Base url of the Kameleo Engine</param>
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

        /// <summary>
        /// Verifies that the Kameleo Engine is ready to accept connections.
        /// Throws if the engine is not available, or the engine was started, but does not become ready within the timeout.
        /// </summary>
        /// <param name="timeout">How long to wait for the engine to become ready. Defaults to 30 seconds.</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        public async Task VerifyEngineReadyAsync(TimeSpan? timeout = null, CancellationToken cancellationToken = default)
        {
            var deadline = DateTime.UtcNow + (timeout ?? TimeSpan.FromSeconds(30));
            while (true)
            {
                try
                {
                    await General.HealthcheckAsync(cancellationToken: cancellationToken).ConfigureAwait(false);
                    return;
                }
                catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                {
                    throw;
                }
                catch (ApiException ex) when (ex.ErrorCode == Model.ErrorCode.ServiceNotReady && DateTime.UtcNow < deadline)
                {
                    await Task.Delay(1_000, cancellationToken).ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException(
                        "ERROR: Could not connect to Kameleo. Make sure it is running, or download it at https://kameleo.io/downloads",
                        ex);
                }
            }
        }
    }
}
