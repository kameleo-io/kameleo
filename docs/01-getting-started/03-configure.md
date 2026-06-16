---
order: -103
title: Configure
description: Configure Kameleo via appsettings.json, environment variables, or flags.
permalink: /getting-started/configure
---

This page explains how to configure the Kameleo Engine using an appsettings.json file, environment variables, or command-line flags, and the precedence between them.

## Prerequisites

- Kameleo installed (see [Installation](./01-installation.md))
- Ability to run the Engine binary (headless or via Desktop)
- Text editor for creating `appsettings.json` (optional)

## 1. Choose a configuration method

You can supply values via (choose any combination):

1. File: `appsettings.json`
2. Environment variables
3. Command-line flags (`key=value`)

Use the method that matches your deployment style (local dev, CI, container, etc.).

!!!tip Mix & match
You can keep stable defaults in the file and override the PAT via environment variables or flags. Precedence (highest wins): flags > environment variables > appsettings.json.
!!!

## 2. Create `appsettings.json` (optional)

Location:

| Platform         | Path                                  |
| ---------------- | ------------------------------------- |
| Windows          | %APPDATA%\Kameleo                     |
| macOS            | ~/Library/Application Support/Kameleo |
| Docker (Linux)   | `/data`                               |
| Docker (Windows) | `C:\data`                             |

Minimal example:

```json
{
    "ListeningHost": "+",
    "ListeningPort": 5050,
    "Verbose": 1
}
```

Complete key list and defaults are available at [Configuration options](../05-reference/06-configuration-options.md)

## 3. Generate a personal access token (PAT)

A personal access token (PAT) authenticates the Engine with your Kameleo account. You must either provide a valid PAT every time the Engine starts (suited for automation scenarios) or login using the GUI once to access your account.

1. Open [https://login.kameleo.io/PAT](https://login.kameleo.io/PAT) in your browser and sign in.
2. Click **Generate new token**.
3. Copy the token immediately — it is shown only once.
4. Store the token securely (e.g., in a secrets manager or environment variable). Do not commit it to source control.

!!!warning Token visibility
The token value is displayed only at creation time. If you lose it, generate a new one and revoke the old token.
!!!

## 4. (Alternative) Use environment variables

Set variables before launching the Engine.

+++ Windows

```powershell
$Env:PAT="your-pat"; ./Kameleo.Engine.exe
```

+++ macOS

```bash
PAT="your-pat" ./Kameleo.app/Contents/Resources/Engine/Kameleo.Engine
```

+++

## 5. (Alternative) Use command-line flags

Append `key=value` arguments to the executable.

+++ Windows

```powershell
./Kameleo.Engine.exe pat=your-pat
```

+++ macOS

```bash
./Kameleo.app/Contents/Resources/Engine/Kameleo.Engine pat=your-pat
```

+++

## 6. Start the Engine

Run the Engine (Desktop auto-starts it). Example with flags shown above; omit if using file+env only.

## 7. Verify

Open: <http://localhost:5050/swagger>

Expect the Swagger UI to load. Change `ListeningHost` / `ListeningPort` to relocate the endpoint (e.g., `0.0.0.0` for LAN access, custom port for collisions).
