---
order: -506
title: Blacklisted browser switches
description: Disallowed Chromium and Firefox command-line switches blocked by Kameleo and the rationale for each.
permalink: /reference/blacklisted-browser-switches
---

Kameleo blocks specific native browser command-line switches to preserve coordinated fingerprint integrity, maintain isolation of managed profile data, and avoid conflicts with internal orchestration. Passing any listed switch results in an error and the profile will not start.

## Chroma (Chromium-based)

| Switch                    | Rationale                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| `--incognito`             | Incognito mode discards persistent data Kameleo relies on                                   |
| `--remote-debugging-port` | Port is managed internally                                                                  |
| `--user-data-dir`         | Profile directory is managed & isolated by Kameleo                                          |
| `--proxy-server`          | Proxy is configured via profile settings and validated                                      |
| `--disable-3d-apis`       | Used conditionally when WebGL blocking is enabled; manual override may desync masking state |

## Junglefox (Firefox-based)

| Switch                                       | Rationale                                                 |
| -------------------------------------------- | --------------------------------------------------------- |
| `-private` / `--private` / `-private-window` | Incognito mode discards persistent data Kameleo relies on |
| `--profile`                                  | Profile directory is managed & isolated by Kameleo        |
| `--marionette`                               | Port is managed internally                                |
| `-juggler` / `--juggler`                     | Connection is managed internally                          |

## Notes

- This list may expand over time; newly blocked switches will raise the same validation error.
- Use profile properties (e.g., proxy configuration, start page) instead of forcing low‑level flags.
- For additional, general browser command-line options, see the external references below.

## External references

- Chromium switches: <https://peter.sh/experiments/chromium-command-line-switches/>
- Firefox switches: <https://wiki.mozilla.org/Firefox/CommandLineOptions>
