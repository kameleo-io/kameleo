---
order: -204
title: Teamwork
description: See how cloud storage, profile groups, and roles enable safe multi-user collaboration on identities without data clashes or lock conflicts.
permalink: /concepts/teamwork
---

Team collaboration in Kameleo rests on three pillars that pair with reusable profiles:

1. Cloud Storage – shared, synced access to profile data
2. Profile Groups – organized containers + granular sharing
3. Team Management – controlling who is on the team and their privileges

Together they let multiple operators work on many identities without clashes, data loss, or chaotic hand‑offs.

## Cloud storage

Cloud‑stored profiles live in the Kameleo backend instead of only your disk. Benefits:

| Capability           | Local profile            | Cloud profile                                 |
| -------------------- | ------------------------ | --------------------------------------------- |
| Visibility           | Private (per machine)    | Shareable (via groups)                        |
| Cross‑device use     | Export / import manually | Automatic sync (create on laptop, open on VM) |
| Collaboration safety | Manual coordination      | Built‑in locking (no dual runs)               |
| Backup / durability  | Your responsibility      | Managed redundancy                            |
| Privacy isolation    | Strong (never leaves PC) | Controlled via group membership               |

Key concepts:

- Syncing – profile data is uploading or downloading the latest state.
- Locked – another user/device is currently running it; start is blocked to protect cookie/history integrity.
- Single runner rule – only one active instance of a profile at a time (prevents divergent fingerprints & ban risk).
- Capacity – unlimited local profiles on all plans; cloud profile quota depends on plan tier. Enterprise can request higher limits via support.

Choose cloud when: multiple people touch the same identities, you switch workstations, or you need centralized oversight. Stay local for rapid throw‑away experiments, maximum privacy, or high‑performance workloads where eliminating sync overhead matters (e.g., intensive scraping bursts, CPU/GPU heavy automation labs).

## Profile Groups

Groups bundle related cloud profiles (client A, campaign Q4, anti‑fraud research, etc.) and apply a single sharing policy to all contained profiles. Ungrouped cloud profiles are private to their creator (except Team Owner visibility mode), while local profiles remain machine‑local.

Group advantages:

- Organization – filter by group instead of scrolling hundreds of entries.
- Bulk actions – move / tag / archive sets faster.
- Access boundary – invite only the colleagues who need those identities.
- Separation of concerns – keep unrelated client data isolated.

## Team management

Team membership decides who is on your account. Groups then control which profiles each person can use. You can add many team members but give each only the groups they need.

Core actors:

| Scope          | Role / Mode | Summary                                                                |
| -------------- | ----------- | ---------------------------------------------------------------------- |
| Team (account) | Team Owner  | Billing & seat control, can view/edit all cloud content (owner mode).  |
| Group          | Admin       | Full rights on the group + can share / change roles / delete profiles. |
| Group          | Analyst     | Create, run, modify, delete profiles; cannot change sharing.           |
| Group          | Member      | Run (start/stop) only; read fingerprint metadata; no edits or sharing. |

Inviting / removing teammates does not automatically expose every group - only those shared or owned. Ungrouped cloud profiles stay private except to the Team Owner for quota oversight. Need stricter isolation? Keep profiles local.

## How they work together (example flow)

1. Team lead creates 10 baseline cloud profiles; sync completes.
2. Moves them into a new group “Onboarding”.
3. Shares the group: adds two analysts and one member.
4. Analyst starts Profile A, it becomes locked. Member sees lock, waits.
5. Analyst stops Profile A, lock clears. Member starts it to continue session seamlessly.
6. Team Owner audits group usage and storage without altering running sessions.

## Quick FAQ

| Question                               | Short answer                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| Can two devices run one cloud profile? | No, Lock enforces single active runner.                                          |
| Are local profiles still unlimited?    | Yes, all plans.                                                                  |
| Do I need a group to share a profile?  | Yes, sharing is applied at group level. Move the profile into a group first.     |
| Can a Member export a profile?         | No, only Analyst or Admin.                                                       |
| How to keep a profile totally private? | Keep it local or leave it ungrouped in cloud (Team Owner may still audit usage). |
| What if sync seems stuck?              | Wait, then retry; persistent issues → check network or contact support.          |
