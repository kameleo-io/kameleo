import { existsSync } from "fs";
import { arch, platform } from "os";
import * as path from "path";

import type { KameleoLocalApiClient } from "./kameleoLocalApiClient";
import type { ProfilePreview, ProfileResponse } from "./models";

/**
 * Node.js-only static helper class for using the Junglefox kernel (for Firefox profiles) with Playwright.
 *
 * The Playwright framework can't connect to an already running Firefox instance directly.
 * The Kameleo SDK provides an executable (pw-bridge) that bridges this gap,
 * allowing Playwright to control the browser launched by Kameleo.
 *
 * @example
 * ```js
 * const context = await playwright.firefox.launchPersistentContext("", {
 *     executablePath: JunglefoxHelper.getBridgePath(),
 *     args: JunglefoxHelper.getBridgeArgs(client, profile),
 *     viewport: null,
 *     timeout: 90_000,
 * });
 * ```
 */
export class JunglefoxHelper {
    private constructor() {}

    /**
     * Provides the path to the pw-bridge executable for connecting to Junglefox with Playwright.
     * Use in combination with {@link getBridgeArgs}.
     *
     * See also Playwright's {@link https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context | BrowserType.launchPersistentContext}
     */
    public static getBridgePath(): string {
        let folder: string;
        if (platform() === "win32" && arch() === "x64") {
            folder = "win-x64";
        } else if (platform() === "linux" && arch() === "x64") {
            folder = "linux-x64";
        } else if (platform() === "darwin" && arch() === "arm64") {
            folder = "osx-arm64";
        } else throw new Error(`Unsupported platform: ${platform()}-${arch()}`);

        const exe = platform() === "win32" ? "pw-bridge.exe" : "pw-bridge";
        return path.join(JunglefoxHelper.resolvePackageRoot(), "bin", folder, exe);
    }

    private static resolvePackageRoot(): string {
        // Handles both dist/ (CJS main) and dist/esm/ (bundler ESM entry)
        const oneLevelUp = path.join(__dirname, "..");
        if (existsSync(path.join(oneLevelUp, "package.json"))) {
            return oneLevelUp;
        }
        return path.join(__dirname, "../..");
    }

    /**
     * Provides args for connecting to Junglefox with Playwright.
     * Use in combination with {@link getBridgePath}.
     *
     * @example ["-target", `ws://localhost:5050/playwright/${profile.id}`]
     *
     * @see {@link https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context | Playwright's BrowserType.launchPersistentContext}
     */
    public static getBridgeArgs(client: KameleoLocalApiClient, profile: ProfileResponse | ProfilePreview): string[] {
        const { port, hostname } = new URL(client.configuration.basePath);
        const browserWSEndpoint = `ws://${hostname}:${port}/playwright/${profile.id}`;

        return ["-target", browserWSEndpoint];
    }
}
