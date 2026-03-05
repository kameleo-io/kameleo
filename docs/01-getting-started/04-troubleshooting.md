---
order: -104
title: Troubleshooting
description: Locate logs & data, interpret exit codes, and gather diagnostics.
permalink: /getting-started/troubleshooting
---

Use this guide to quickly locate user data and logs, interpret CLI exit codes, and gather the right diagnostics for troubleshooting Kameleo. Following these steps accelerates root-cause analysis and enables efficient support escalation.

## Locate user data files

Kameleo stores user-generated data (profiles, kernels, logs, settings) in a workspace directory.

Default locations:

- Windows: `C:\Users\YOUR_USERNAME\AppData\Roaming\Kameleo`
- macOS: `~/Library/Application Support/Kameleo`

Deleting this folder resets Kameleo (factory default) but permanently removes all profiles & settings.

## Review log files

Daily log files live under the `Logs` subfolder. File pattern: `COMPONENT-YYYYMMDD.txt`. Increase verbosity by setting `Verbose` to `2` (see Configuration in Installation guide) only while debugging; revert to reduce noise.

The default location for the log files:

- Windows: `C:\Users\YOUR_USERNAME\AppData\Roaming\Kameleo\Logs`
- macOS: `~/Library/Application Support/Kameleo/Logs`

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
