---
order: -504
title: Configuration options
description: List of all configuration keys, sources, precedence, and defaults.
permalink: /reference/configuration-options
---

This page lists every supported configuration key for the Kameleo CLI service. For procedural guidance (where to place `appsettings.json`, how to set environment variables or flags, and precedence rules) see [Configure](../01-getting-started/03-configure.md).

All keys are optional unless stated. Defaults apply when omitted. Precedence (highest to lowest): flags > environment variables > file.

## Configuration keys

| JSON key                | Environment variable    | Command line flag       | Default            | Description                                                                                        |
| ----------------------- | ----------------------- | ----------------------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| `ListeningHost`         | `LISTENINGHOST`         | `listeningHost`         | `+`                | Host interface to bind. `+` accepts connections from any network interface.                        |
| `ListeningPort`         | `LISTENINGPORT`         | `listeningPort`         | `5050`             | TCP port exposed for the local API.                                                                |
| `Email`                 | `EMAIL`                 | `email`                 | (none)             | Account email used for authentication. Required for authenticated operations.                      |
| `Password`              | `PASSWORD`              | `password`              | (none)             | Account password used for authentication. Keep secure.                                             |
| `Verbose`               | `VERBOSE`               | `verbose`               | `1`                | Log verbosity: `0` = minimal, `1` = normal, `2` = detailed diagnostics.                            |
| `UserDirectoryOverride` | `USERDIRECTORYOVERRIDE` | `userDirectoryOverride` | (platform default) | Overrides default user directory (`%APPDATA%\Kameleo` or `~/Library/Application Support/Kameleo`). |
| `WorkspaceFolder`       | `WORKSPACEFOLDER`       | `workspaceFolder`       | `Workspace`        | Workspace root folder. Relative paths resolve under the user directory.                            |
| `DisableMetrics`        | `DISABLEMETRICS`        | `disableMetrics`        | `false`            | When `true`, disables anonymous metrics collection.                                                |

## Notes

- Omitted authentication keys (`Email`, `Password`) start the service unauthenticated; some features may be unavailable.
- Use higher verbosity (`Verbose=2`) only for troubleshooting; it increases log volume.
- Paths can be absolute or relative. Relative paths resolve against the effective user directory (override if set).
