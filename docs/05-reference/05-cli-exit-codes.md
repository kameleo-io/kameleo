---
order: -505
title: CLI exit codes
description: Complete list of Kameleo CLI process exit codes and their meanings for scripting and automation.
permalink: /reference/cli-exit-codes
---

Kameleo CLI returns specific numeric exit codes to signal termination reasons for automation scripts, CI pipelines, and monitoring agents. Codes are stable; new codes may be added over time. A value of `0` always indicates success (standard convention) and is omitted below.

## Exit codes

| Code | Name (mnemonic)            | Meaning                                             | Typical remediation                                             |
| ---- | -------------------------- | --------------------------------------------------- | --------------------------------------------------------------- |
| 100  | AUTH_LOGIN_ERROR           | Login error (temporary service or credential issue) | Retry after short delay; verify credentials and service status. |
| 101  | SUBSCRIPTION_INACTIVE      | Subscription inactive or expired                    | Renew or reactivate subscription; verify billing status.        |
| 102  | AUTH_INVALID_CREDENTIALS   | Invalid email or password                           | Correct credentials; rotate secrets in CI if changed.           |
| 103  | THROTTLE_LIMIT             | Request throttle limit reached                      | Back off (exponential); reduce parallel requests.               |
| 104  | TEAM_SUBSCRIPTION_INACTIVE | Team subscription inactive                          | Team owner must reactivate; check team billing.                 |
| 105  | CONCURRENT_SESSION_LIMIT   | Concurrent session limit reached                    | Close/stop other sessions or upgrade plan.                      |
| 106  | TEAM_USER_LIMIT            | Team user limit exceeded                            | Remove unused members or upgrade plan tier.                     |
| 107  | FREE_TIER_ABUSE            | Free tier abuse detected                            | Contact support if false positive; otherwise comply with terms. |
| 200  | INTERNAL_UNKNOWN           | Unknown internal error                              | Re-run with `Verbose=2`; file ticket with logs.                 |
| 201  | NETWORK_FAILURE            | Network connection failed                           | Check connectivity, proxy/firewall rules; retry.                |
| 202  | INSTANCE_ALREADY_RUNNING   | Another instance already running                    | Stop existing instance or use different port/user directory.    |
