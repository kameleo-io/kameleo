---
order: -103
title: Configure
description: Configure Kameleo via appsettings.json, environment variables, or flags.
permalink: /getting-started/configure
---

This page explains how to configure the Kameleo CLI using an appsettings.json file, environment variables, or command-line flags, and the precedence between them.

## Prerequisites

- Kameleo installed (see [Installation](./01-installation.md))
- Ability to run the CLI binary (headless or via Desktop)
- Text editor for creating `appsettings.json` (optional)

## 1. Choose a configuration method

You can supply values via (choose any combination):

1. File: `appsettings.json`
2. Environment variables
3. Command-line flags (`key=value`)

Use the method that matches your deployment style (local dev, CI, container, etc.).

!!!tip Mix & match
You can keep stable defaults in the file and override sensitive credentials via environment variables or flags. Precedence (highest wins): flags > environment variables > appsettings.json.
!!!

## 2. Create `appsettings.json` (optional)

Location:

| Platform | Path                                  |
| -------- | ------------------------------------- |
| Windows  | %APPDATA%\Kameleo                     |
| macOS    | ~/Library/Application Support/Kameleo |

Minimal example:

```json
{
    "ListeningHost": "+",
    "ListeningPort": 5050,
    "Verbose": 1
}
```

Complete key list and defaults are available at [Configuration options](../05-reference/04-configuration-options.md)

## 3. (Alternative) Use environment variables

Set variables before launching the CLI.

+++ Windows

```powershell
$Env:EMAIL="your-email@example.com"; $Env:PASSWORD="your-password"; ./Kameleo.CLI.exe
```

+++ macOS

```bash
EMAIL="your-email@example.com" PASSWORD="your-password" ./Kameleo.app/Contents/Resources/CLI/Kameleo.CLI
```

+++

## 4. (Alternative) Use command-line flags

Append `key=value` arguments to the executable.

+++ Windows

```powershell
./Kameleo.CLI.exe email=your-email@example.com password=your-password
```

+++ macOS

```bash
./Kameleo.app/Contents/Resources/CLI/Kameleo.CLI email=your-email@example.com password=your-password
```

+++

## 5. Start the CLI

Run the CLI (Desktop auto-starts it). Example with flags shown above; omit if using file+env only.

## 6. Verify

Open: <http://localhost:5050/swagger>

Expect the Swagger UI to load. Change `ListeningHost` / `ListeningPort` to relocate the endpoint (e.g., `0.0.0.0` for LAN access, custom port for collisions).
