import { spawnSync } from "child_process";
import { createWriteStream } from "fs";
import { mkdir, rm } from "fs/promises";
import path from "path";
import { Writable } from "stream";

export function isWindows(): boolean {
    return process.platform == "win32";
}

export async function httpRequest(url: string, method = "GET"): Promise<void> {
    const response = await fetch(url, { method });
    if (!response.ok) {
        throw new Error(`Request Failed. HTTP ${response.status}: ${await response.text()}`);
    }
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

    const args = ["x", filePath, "-o" + destination, "-y", ...extraArgs];
    const result = spawnSync(sevenZipPath, args, {
        shell: true,
        encoding: "utf-8",
    });

    if (result.status !== 0) {
        const commandString = `"${sevenZipPath}" ${args.join(" ")}`;
        console.error(`Command failed: ${commandString}`);
        if (result.stderr) {
            console.error(result.stderr);
        }
        throw new Error(`7-Zip extraction failed with exit code ${result.status}:\n${result.stderr}`);
    }

    return result.stdout;
}

export function generateVideoName(testTitle: string, browserProduct: string): string {
    const timestamp = new Date().toISOString().replace(/\D/g, "").slice(2, 14);
    const safeTitle = testTitle.replace(/\s+/g, "-").toLowerCase();
    const platform = process.platform === "win32" ? "windows" : process.platform == "darwin" ? "macos" : process.platform;

    return `${safeTitle}-${platform}-${browserProduct.toLowerCase()}-${timestamp}.webm`;
}
