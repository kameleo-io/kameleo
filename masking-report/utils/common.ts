import { spawnSync, type SpawnSyncOptionsWithStringEncoding } from "child_process";
import { createWriteStream } from "fs";
import { mkdir, rm } from "fs/promises";
import path from "path";
import { Writable } from "stream";

export function envOptional(key: string): string | undefined {
    const trimmed = process.env[key]?.trim();
    return trimmed === "" ? undefined : trimmed;
}

export function env(key: string): string {
    const value = envOptional(key);
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

export function envNumberOptional(key: string): number | undefined {
    const value = envOptional(key);
    if (value) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return undefined;
}

export function isWindows(): boolean {
    return process.platform == "win32";
}

export async function downloadFile(url: string | URL, outputPath: string, username?: string, password?: string): Promise<void> {
    console.log(`Downloading file to ${outputPath} from ${url}`);
    const authString = Buffer.from(`${username}:${password}`).toString("base64");
    const options = { headers: { Authorization: "Basic " + authString } };

    await mkdir(path.dirname(outputPath), { recursive: true });
    try {
        const response = await fetch(url, options);
        const body = response.body;
        if (!response.ok || !body) {
            throw new Error(`Fetch Failed. ${response.status}: ${await response.text()}`);
        }

        const fileStreamWeb = Writable.toWeb(createWriteStream(outputPath));
        await body.pipeTo(fileStreamWeb);

        console.log(`Downloaded file to ${outputPath} from ${url}`);
    } catch (err) {
        console.error(`An error occurred: ${String(err instanceof Error ? err.message : err)}`);
        await rm(outputPath, { force: true });
        throw err;
    }
}

export function extractSevenZip(filePath: string, destination: string, extraArgs: string[] = []): string {
    const sevenZipExecutable = isWindows() ? "7z.exe" : "7z";
    const sevenZipPath = path.resolve(path.join(import.meta.dirname, "..", "tools", "7zip", sevenZipExecutable));
    return runCommand(sevenZipPath, ["x", filePath, "-o" + destination, "-y", ...extraArgs]);
}

export function runCommand(command: string, args: string[] = [], cwd?: string, env?: Record<string, string>): string {
    const commandString = `"${command}" ${args.join(" ")}`.trim();
    console.log(`$ ${cwd ? cwd + ">" : ""}${commandString}`);

    try {
        const options: SpawnSyncOptionsWithStringEncoding = {
            shell: true,
            env: Object.assign({}, process.env, env),
            encoding: "utf-8",
        };
        if (cwd) {
            options.cwd = cwd;
        }

        const output = spawnSync(command, args, options);

        const stdout = output.stdout ? output.stdout.replace(/^(?!\s*$)/gm, "  ") : "";
        const stderr = output.stderr ? output.stderr.replace(/^(?!\s*$)/gm, "  ") : "";
        console.log(stdout);
        console.error(stderr);

        if (output.status != 0) {
            throw new Error(`Exit code: ${output.status}\n${output.stderr}`);
        }

        return output.stdout;
    } catch (error) {
        throw new Error(`Command "${commandString}" failed:\n${String(error instanceof Error ? error.message : error)}`);
    }
}

export function generateVideoName(testTitle: string, browserProject: string, status?: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replaceAll(/\W/g, "_");
    const safeTitle = testTitle.replaceAll(/\W/g, "_").toLowerCase();
    const platform = process.platform === "win32" ? "windows" : process.platform == "darwin" ? "macos" : process.platform;

    return `${safeTitle}-${platform}-${browserProject.toLowerCase()}-${status}-${timestamp}.webm`;
}
