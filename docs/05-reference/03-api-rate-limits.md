---
order: -503
title: API rate limits
description: Requests-per-minute limits per plan, counted operations, and strategies to stay within quotas.
permalink: /reference/api-rate-limits
---

Each Kameleo team has a requests‑per‑minute limit to keep the service stable and fair. It applies to authenticated Local API calls that reach our backend.

## Counted operations

High-impact endpoints that fetch or bind fresh fingerprint / profile state increment your RPM:

- SearchFingerprints
- CreateProfile
- StartProfile

Other lightweight operations (e.g., stop profile) have negligible cost and are not subject to the same strict counting.

## Plan limits

| Plan       | Requests / minute (RPM) |
| ---------- | ----------------------- |
| Free       | 60                      |
| Startup    | 120                     |
| Business   | 600                     |
| Enterprise | 1200                    |

Enterprise customers needing more can contact support for a tailored allocation.

## What happens when you exceed

If you cross the plan ceiling within the rolling window:

1. Further counted calls return a HTTP 429 error.
2. Retry after a short exponential backoff (e.g., 1s, 2s, 4s, 8s) until within quota again.
3. Persistent saturation indicates you should optimize or upgrade.

## Optimization strategies

| Goal                             | Technique                                                                   | Example                                                       |
| -------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Reduce fingerprint searches      | Cache fingerprint IDs per (deviceType, platform, product, versionRange) key | Store the result of `searchFingerprints` and reuse later      |
| Avoid redundant profile creation | Reuse terminated profiles instead of recreating                             | Start/stop same profile instead of recreate+start cycle       |
| Batch automation start           | Stagger launches to smooth peaks                                            | Launch 10 profiles over 30s, not all in one second            |
| Minimize cold starts             | Keep a warm pool of pre-created profiles                                    | Maintain 20 ready profiles; only create when pool < threshold |

## Quick FAQ

| Question                             | Answer                                                                |
| ------------------------------------ | --------------------------------------------------------------------- |
| Are limits per device?               | No, they are aggregated per team.                                     |
| Do retries count again?              | Yes, each distinct request counts if it reaches the API. Use backoff. |
| Does stopping a profile count?       | Not counted toward RPM.                                               |
| Can I burst above the limit briefly? | Short micro-bursts may still be throttled; design for smoothing.      |
