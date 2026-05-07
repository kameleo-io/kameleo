---
order: -101
title: Installation
description: Install Kameleo CLI & Desktop, then verify it's running.
permalink: /getting-started/installation
---

This page walks you through installing Kameleo, starting the Local API, adding an SDK, and confirming the service is reachable. After finishing, you can authenticate, run headless or with GUI, and move on to the Quickstart.

## 1. System requirements

| Component | Minimum                                                                                               | Recommended                                   |
| --------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| OS        | Windows 10+, Windows Server 2016+<br>macOS 11+ (Apple Silicon)<br>Docker (Linux or Windows container) | Latest stable OS version                      |
| RAM       | 4 GB                                                                                                  | 8+ GB for multi-profile automation            |
| Disk      | 5 GB free                                                                                             | 20+ GB (to cache multiple kernels & profiles) |
| Network   | Stable broadband                                                                                      | Low‑latency connection for high concurrency   |

## 2. Download & install

+++ Windows (Installer)

1. Visit [kameleo.io/downloads](https://kameleo.io/downloads)
2. Download the Windows installer and run it.
3. Launch Kameleo Desktop once to verify installation.

+++ Windows (Winget)

```powershell
winget install Kameleo.App
```

+++ macOS (Installer)

1. Download the macOS .dmg from [kameleo.io/downloads](https://kameleo.io/downloads)
2. Drag Kameleo to Applications
3. (First run) Approve gatekeeper prompt if shown.

+++ macOS (Homebrew Cask)

```bash
brew install --cask kameleo
```

+++ Docker

Pull the official image. Docker selects the image variant that matches the active container platform/runtime. If you need a specific variant, pass `--platform` explicitly:

```bash
docker pull kameleo/kameleo-app:latest
```

See the [Docker guide](../03-integrations/04-docker.md) for full setup instructions including data persistence, GPU support, and Playwright integration.

+++

## 3. Start the CLI (headless or with GUI)

Launching the Desktop app also starts the CLI in the background. For headless automation-only usage run the CLI binary directly:

+++ Windows

```powershell
& "$Env:LOCALAPPDATA\Programs\Kameleo\Kameleo.CLI.exe" email=<EMAIL> password=<PASSWORD>
```

+++ macOS

```bash
/Applications/Kameleo.app/Contents/Resources/CLI/Kameleo.CLI email=<EMAIL> password=<PASSWORD>
```

+++ Docker

```bash
docker run -p 5050:5050 --shm-size=2g -e EMAIL="<EMAIL>" -e PASSWORD="<PASSWORD>" -v kameleo-data:/data kameleo/kameleo-app:latest
```

+++

The CLI listens on `http://localhost:5050` by default.

## 4. Change configuration (optional)

Adjust listening host/port, credentials, workspace paths, and logging level if the defaults don’t meet your needs. See [Configure](./03-configure.md) for a guided setup and [Configuration options](../05-reference/04-configuration-options.md) for the complete key list and defaults.

## 5. Verify

Visit <http://localhost:5050/swagger> while CLI runs. If it loads, the Local API is ready. Follow the [Quickstart](./02-quickstart.md) to launch and automate your first profile.
