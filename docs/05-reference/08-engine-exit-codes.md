---
order: -508
title: Engine exit codes
description: Complete list of Kameleo Engine process exit codes and their meanings for scripting and automation.
permalink: /reference/engine-exit-codes
---

Kameleo Engine returns specific numeric exit codes to signal termination reasons for automation scripts, CI pipelines, and monitoring agents. Codes are stable; new codes may be added over time. A value of `0` always indicates success (standard convention) and is omitted below.

## Exit codes

| Code | Name (mnemonic)            | Meaning                                             | Typical remediation                                                                                   |
| ---- | -------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 100  | AUTH_LOGIN_ERROR           | Login error (temporary service or credential issue) | Retry after short delay; verify credentials and service status.                                       |
| 101  | SUBSCRIPTION_INACTIVE      | Subscription inactive or expired                    | Renew or reactivate subscription; verify billing status.                                              |
| 102  | AUTH_INVALID_CREDENTIALS   | Invalid or expired credentials                      | Reauthenticate the app.                                                                               |
| 103  | THROTTLE_LIMIT             | Request throttle limit reached                      | Back off (exponential); reduce parallel requests.                                                     |
| 104  | TEAM_SUBSCRIPTION_INACTIVE | Team subscription inactive                          | Team owner must reactivate; check team billing.                                                       |
| 105  | CONCURRENT_SESSION_LIMIT   | Concurrent session limit reached                    | Close/stop other sessions or upgrade plan.                                                            |
| 106  | TEAM_USER_LIMIT            | Team user limit exceeded                            | Remove unused members or upgrade plan.                                                                |
| 107  | FREE_TIER_ABUSE            | Free tier abuse detected                            | Contact support if false positive; otherwise comply with terms.                                       |
| 108  | VERSION_NOT_SUPPORTED      | Version can't be used anymore                       | Upgrade to latest version to continue using the application.                                          |
| 109  | DOCKER_NOT_ALLOWED         | Subscription is missing Docker capability           | Upgrade to a plan that includes Docker support.                                                       |
| 110  | REFRESH_TOKEN_EXPIRED      | Refresh token has expired                           | Log in again to obtain a new refresh token.                                                           |
| 111  | PAT_INVALID                | Personal access token is invalid                    | Generate a new personal access token at [https://login.kameleo.io/PAT](https://login.kameleo.io/PAT). |
| 112  | DEVICE_ACCOUNTLESS_LIMIT   | Device has been used with a registered account      | Use the registered account or contact support.                                                        |
| 113  | UNSUPPORTED_AUTH_METHOD    | The email+password authentication is not supported  | Use PAT instead, see: [Configure](../01-getting-started/03-configure.md)                              |
| 200  | INTERNAL_UNKNOWN           | Unknown internal error                              | Re-run with `Verbose=2`; file ticket with logs.                                                       |
| 201  | NETWORK_FAILURE            | Network connection failed                           | Check connectivity, proxy/firewall rules; retry.                                                      |
| 202  | INSTANCE_ALREADY_RUNNING   | Another instance already running                    | Stop existing instance or use different port/user directory.                                          |
