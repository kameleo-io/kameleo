---
order: -503
title: Usage limits
meta:
    description: Learn Kameleo's concurrent browser and API rate limits, how each is counted, how to check current usage, and how to request higher limits.
permalink: /reference/usage-limits
---

Every Kameleo plan enforces the usage limits described on this page. Both limits are aggregated per team, not per device or user.

## Concurrent browser limits

Your plan limits how many profiles can run at the same time. This is tracked as two independent quotas: one for all profiles regardless of device type, and one specifically for mobile profiles.

| Quota                      | Counted as                                                                                         | Error code when exceeded                |
| -------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Concurrent Browsers (CB)   | Total profiles of any device type running at once.                                                 | `running_profiles_limit_reached`        |
| Mobile Concurrent Browsers | Currently running mobile profiles. Starting a mobile profile counts against both CB and mobile CB. | `running_mobile_profiles_limit_reached` |

### Plan limits

The exact CB and mobile CB limits depend on your active plan. See the [pricing page](https://kameleo.io/pricing) for a comparison of limits across plans.

### Checking current usage

Current CB usage is visible in the Kameleo app's bottom-left corner, hover over it to see mobile CB usage in a tooltip. Both sync in real time across all team members. It's also available via the `GetUserInfo` endpoint, see the [API reference](./04-api-reference.md) for the full response schema.

## API request rate limits

Your plan limits how many API requests the team can send per minute. Only the following high-impact endpoints count toward the limit:

- SearchFingerprints
- CreateProfile
- StartProfile

All other operations (e.g., stop profile, list profiles) are lightweight and do not count.

### Plan limits

The exact RPM limits depend on your active plan:

| Plan       | Requests / minute (RPM) |
| ---------- | ----------------------- |
| Free       | 60                      |
| Startup    | 120                     |
| Business   | 600                     |
| Enterprise | 1200                    |

### Checking current usage

There is currently no endpoint that reports current RPM usage. Exceeding the limit returns HTTP 429 with `rate_limit_exceeded` error code on further counted calls until usage falls back under the limit; see [API error handling](./05-api-error-handling.md) for the full reference.

## FAQ

| Question                                            | Answer                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------- |
| Are limits per device or per team?                  | Per team. All team members share the same CB, mobile CB, and RPM quotas.        |
| Does creating or storing a profile count toward CB? | No. Only profiles that are actively running count.                              |
| Does stopping a profile count toward RPM?           | No. Only `SearchFingerprints`, `CreateProfile`, and `StartProfile` are counted. |
| Can I get a higher limit?                           | Enterprise plans can contact support for a tailored allocation.                 |
