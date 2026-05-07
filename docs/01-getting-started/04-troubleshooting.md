---
order: -104
title: Troubleshooting
description: Locate logs & data, interpret exit codes, and gather diagnostics.
permalink: /getting-started/troubleshooting
---

Use this guide to quickly locate user data and logs, interpret CLI exit codes, and gather the right diagnostics for troubleshooting Kameleo. Following these steps accelerates root-cause analysis and enables efficient support escalation.

## Locate user data files

Kameleo stores user-generated data (profiles, kernels, logs, settings) in a workspace directory.

+++ Windows

Default location: `C:\Users\YOUR_USERNAME\AppData\Roaming\Kameleo`

Deleting this folder resets Kameleo (factory default) but permanently removes all profiles & settings.

+++ macOS

Default location: `~/Library/Application Support/Kameleo`

Deleting this folder resets Kameleo (factory default) but permanently removes all profiles & settings.

+++ Linux-based container

Default location: `/data` (the mounted named volume)

Removing the named volume has the same effect as deleting the data folder — all profiles & settings are lost.

+++ Windows-based container

Default location: `C:\data` (the mounted named volume)

Removing the named volume has the same effect as deleting the data folder — all profiles & settings are lost.

+++

## Review log files

Daily log files live under the `Logs` subfolder. File pattern: `COMPONENT-YYYYMMDD.txt`. Increase verbosity by setting `Verbose` to `2` (see Configuration in Installation guide) only while debugging; revert to reduce noise.

+++ Windows

Log files location: `C:\Users\YOUR_USERNAME\AppData\Roaming\Kameleo\Logs`

+++ macOS

Log files location: `~/Library/Application Support/Kameleo/Logs`

+++ Linux-based container

Log files location: `/data/Logs`

If the named volume is mounted, logs are accessible on the host at the volume's mount path. To read the latest log file directly from a running container:

```bash
docker exec kameleo-app sh -c 'cat /data/Logs/$(ls /data/Logs | tail -1)'
```

+++ Windows-based container

Log files location: `C:\data\Logs`

If the named volume is mounted, logs are accessible on the host at the volume's mount path. To read the latest log file directly from a running container:

```powershell
docker exec kameleo-app powershell -NoProfile -Command "Get-Content (Get-ChildItem C:\data\Logs | Sort-Object Name | Select-Object -Last 1).FullName"
```

+++

## CLI exit codes

Refer to the consolidated list in [CLI exit codes](../05-reference/05-cli-exit-codes.md) for meanings and remediation guidance. Use these codes in scripts to branch on transient vs. persistent failures.

## Gathering diagnostic info

1. Reproduce the issue with Verbose=2
2. Note timestamp & profileId (if relevant)
3. Collect the most recent log files
4. Export affected profile (if reproducible state matters)

## Opening a ticket

Use the in-app **Report a Bug** button in the sidebar whenever you can. It automatically collects vital environment details and relevant log files so we can help you faster and with fewer back-and-forth questions.

1. Reproduce the issue (if possible).
2. In Kameleo, open the sidebar.
3. Click **Report a Bug**.
4. Describe what you expected vs. what happened.
5. Attach any helpful files (for example screenshots, scripts, or test data) that make it easier to reproduce the issue.
6. Submit the report.

If the app does not start, you cannot log in, or you cannot access the bug report feature, contact support through the [Help Center](https://help.kameleo.io/).
