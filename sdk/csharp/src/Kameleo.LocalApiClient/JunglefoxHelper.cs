using Kameleo.LocalApiClient.Model;
using System;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;

namespace Kameleo.LocalApiClient
{
    /// <summary>
    /// Static helper class for using the Junglefox kernel (for Firefox profiles) with Playwright.
    /// </summary>
    /// <remarks>
    /// The Playwright framework can't connect to an already running Firefox instance directly.
    /// The Kameleo SDK provides an executable (pw-bridge) that bridges this gap,
    /// allowing Playwright to control the browser launched by Kameleo.
    /// <para>Example usage:</para>
    /// <code>
    /// var context = await playwright.Firefox.LaunchPersistentContextAsync("", new BrowserTypeLaunchPersistentContextOptions
    /// {
    ///     ExecutablePath = JunglefoxHelper.GetBridgePath(),
    ///     Args = JunglefoxHelper.GetBridgeArgs(client, profile),
    ///     ViewportSize = ViewportSize.NoViewport,
    ///     Timeout = 90_000,
    /// });
    /// </code>
    /// </remarks>
    public static class JunglefoxHelper
    {
        /// <summary>
        /// Provides the path to the pw-bridge executable for connecting to Junglefox with Playwright.
        /// Use in combination with <see cref="GetBridgeArgs"/>.
        /// </summary>
        /// <remarks>See also Playwright's <see href="https://playwright.dev/dotnet/docs/api/class-browsertype#browser-type-launch-persistent-context">BrowserType.LaunchPersistentContextAsync</see>.</remarks>
        /// <returns>Absolute path to the pw-bridge executable.</returns>
        public static string GetBridgePath()
        {
            string folder;
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows) && RuntimeInformation.ProcessArchitecture == Architecture.X64)
                folder = "win-x64";
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux) && RuntimeInformation.ProcessArchitecture == Architecture.X64)
                folder = "linux-x64";
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX) && RuntimeInformation.ProcessArchitecture == Architecture.Arm64)
                folder = "osx-arm64";
            else
                throw new PlatformNotSupportedException($"Unsupported platform: {RuntimeInformation.OSDescription} ({RuntimeInformation.ProcessArchitecture})");

            string exe = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "pw-bridge.exe" : "pw-bridge";

            // Strategy 1: next to the assembly in the app output directory
            // (copied there by the build, e.g. via CopyToOutputDirectory or dotnet publish)
            var assemblyDir = ResolveAssemblyDirectory();
            var candidate = Path.Combine(assemblyDir, "bin", folder, exe);
            if (File.Exists(candidate))
                return candidate;

            // Strategy 2: NuGet package cache — the assembly is under lib/<tfm>/,
            // so going up two levels reaches the package root where runtimes/ lives.
            candidate = Path.GetFullPath(Path.Combine(assemblyDir, "..", "..", "runtimes", folder, "native", exe));
            if (File.Exists(candidate))
                return candidate;

            throw new FileNotFoundException(
                $"pw-bridge executable not found for {folder}. " +
                $"Searched in '{Path.Combine(assemblyDir, "bin", folder)}' and NuGet package runtimes/.");
        }

        /// <summary>
        /// Provides the args for connecting to Junglefox with Playwright.
        /// Use in combination with <see cref="GetBridgePath"/>.
        /// </summary>
        /// <remarks>See also Playwright's <see href="https://playwright.dev/dotnet/docs/api/class-browsertype#browser-type-launch-persistent-context">BrowserType.LaunchPersistentContextAsync</see>.</remarks>
        /// <param name="client">The <see cref="KameleoLocalApiClient"/> instance.</param>
        /// <param name="profile">The profile to connect to.</param>
        /// <returns>Args to pass to <c>LaunchPersistentContextAsync</c>, e.g. <c>["-target", "ws://localhost:5050/playwright/&lt;profileId&gt;"]</c>.</returns>
        public static string[] GetBridgeArgs(KameleoLocalApiClient client, ProfileResponse profile)
            => GetBridgeArgs(client, profile.Id);

        /// <inheritdoc cref="GetBridgeArgs(KameleoLocalApiClient, ProfileResponse)"/>
        public static string[] GetBridgeArgs(KameleoLocalApiClient client, ProfilePreview profile)
            => GetBridgeArgs(client, profile.Id);

        private static string[] GetBridgeArgs(KameleoLocalApiClient client, Guid profileId)
        {
            var uri = new Uri(client.Configuration.BasePath);
            var browserWSEndpoint = $"ws://{uri.Host}:{uri.Port}/playwright/{profileId}";
            return new string[] { "-target", browserWSEndpoint };
        }

        private static string ResolveAssemblyDirectory()
        {
            // Prefer AppContext.BaseDirectory when the SDK assembly is present there
            // (i.e. the app was built/published and the DLL was copied to the output dir).
            if (!string.IsNullOrEmpty(AppContext.BaseDirectory))
            {
                var baseDir = new DirectoryInfo(AppContext.BaseDirectory);
                if (baseDir.Exists && File.Exists(Path.Combine(baseDir.FullName, "Kameleo.LocalApiClient.dll")))
                    return baseDir.FullName;
            }

            // Fall back to the actual location of this assembly.
            // assembly.CodeBase gives the original file:// URI even when shadow-copied.
            var assembly = typeof(JunglefoxHelper).Assembly;
            try
            {
                if (Uri.TryCreate(assembly.CodeBase, UriKind.Absolute, out var codeBase) && codeBase?.IsFile == true)
                {
                    return new FileInfo(codeBase.LocalPath).DirectoryName;
                }
            }
            catch (NotSupportedException) { } // thrown for single-file bundles

            if (!string.IsNullOrEmpty(assembly.Location))
            {
                return new FileInfo(assembly.Location).DirectoryName;
            }

            return AppContext.BaseDirectory;
        }
    }
}
