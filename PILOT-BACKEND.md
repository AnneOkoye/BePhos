# Pilot backend: what changed and how to apply it

Written 26 October 2026, after the technical audit. Nothing here has been applied to the live Supabase project.

## What the audit found (short)

- The app saves goals, check-ins, groups and messages in the browser only. The backend handles sign-up, log-in and loading a profile, nothing else.
- The live database has 22 tables, all empty, and no recorded migrations. The seven local migrations (v2 to v8) were never applied.
- Pilot measurement never worked: the app looked for `BePhos.client`, which didn't exist, and wrote to an `events` table that doesn't exist.
- Supabase's security advisor reports one error and three warnings (see the security migration).
- The offline cache never installed because it listed two files that don't exist.
- GitHub has an older `index.html` than the one we built, plus two stray copies, `index (3).html` and `index (4).html`.

## Files in this round

| File | What it is |
|---|---|
| `supabase/migrations/20261026080000_security_fixes.sql` | Fixes the advisor findings. Run first. |
| `supabase/migrations/20261026090000_pilot_r1.sql` | The pilot backend: goals, plans, check-ins, recoveries, cohorts, time-bound sessions, blocks, reports, pilot events. |
| `supabase/migrations/20261027090000_session_rsvps.sql` | "I'll be there" for sessions: members see how many said they're coming (counts only, never names). Run third. |
| `supabase/tests/` | The local test harness: a stand-in for Supabase's auth plus 51 checks (`pilot_r1_test.sh`) and 18 for RSVPs (`rsvp_test.sh`), run as different users. |
| `supabase/archive/` | v2 to v8, moved here so nobody applies them by mistake. |
| `bephos-client.js` | Adds `BePhos.pilot.*` for the new tables, and `BePhos.client` so pilot events are sent. |
| `index.html` | Sign-up no longer makes a device-only account when the account service fails. Events go to `pilot_events`. Fixed icon and theme colour links. |
| `service-worker.js` | Cache list now matches real files (v2). |
| `manifest.json` | New. The page already linked to it. |

## How the rules are enforced

All of these are enforced by the database, so a modified app or a direct API call can't get around them:

- Goals, plans, check-ins and recovery choices can only be read or changed by their owner.
- Only members of a cohort can see its sessions. Only cohort hosts can create sessions.
- Joining a session happens only through `join_session()`. It checks membership, timing (opens 10 minutes before the start), capacity and blocks, with the session locked so two people can't take the last place at once. Direct inserts are refused.
- Leaving through `leave_session()` is always allowed.
- Sessions last 15 to 120 minutes. Hosts can extend by 15 minutes at a time, only while the session is running, and never past 120 in total.
- `session_roster()` shows callsigns only, and only to people currently in the room. Blocked people don't appear.
- A block removes the blocked person from any live session the blocker is in or hosts, and stops them rejoining while the blocker is there.
- Reports (10 a day), blocks (30 a day) and events (500 a day) are rate limited per person.
- People can write pilot events but can't read any, including their own. Only you can, from the dashboard.

## What I tested, and what I didn't

Tested on a local Postgres 16 with a stand-in for Supabase's `auth` schema and default privileges: both migrations apply cleanly in order, the sign-up trigger still creates profiles after the security fixes, and all 51 checks in `supabase/tests/pilot_r1_test.sh` pass. That includes the attack cases: reading or writing someone else's goal, joining as an outsider, taking a full session's place, reading the roster from outside, editing timing directly, blocking on someone else's behalf, pre-closing a report, and signed-out access to everything.

Not tested: the real Supabase project. Three assumptions need checking before you apply:

1. `public.profiles` has a `callsign` column (the client code uses it; I couldn't read the live columns).
2. The functions `is_pod_member(uuid)` and `is_chapter_member(uuid)` take one uuid argument, as the advisor reports.
3. Switching `public_profiles` to respect access rules doesn't break anything you rely on. The current app only uses it for the "callsign taken?" check.

## How to apply (when you decide to)

1. In the Supabase dashboard, open SQL Editor, paste `20261026080000_security_fixes.sql`, run it.
2. Paste `20261026090000_pilot_r1.sql`, run it. Then `20261027090000_session_rsvps.sql`.
3. Run the security advisor again. It should show no errors.
4. Turn on leaked-password protection under Authentication. Supabase lists it as a Pro Plan feature.
5. Create the pilot cohort and add people (they must have signed up first):

```sql
insert into public.cohorts (name) values ('Application sprint, cohort 1') returning id;
-- then, for each person, using their id from Authentication > Users:
insert into public.cohort_members (cohort_id, user_id, role) values ('<cohort id>', '<user id>', 'member');
-- you, as host:
insert into public.cohort_members (cohort_id, user_id, role) values ('<cohort id>', '<your user id>', 'host');
```

Each script runs inside a transaction, so if anything fails nothing is left half-applied.

## How the app uses it

The Release 1 screens (in `index.html`) save everything on the device first, then copy goals, plans, check-ins and recovery choices to these tables when two things are true: the person is signed in, and the tables exist. Until you apply the migration, the app quietly stays device-only. Sessions use `join_session`, `leave_session`, `session_roster` and `extend_session`; block and report in a room write to `user_blocks` and `safety_reports`. Pilot events go to `pilot_events`.

Before the first cohort, decide whether sign-up needs email confirmation. If it does, people can't save anything to the server until they've clicked the email link.

## GitHub clean-up

Upload: `index.html`, `bephos-client.js`, `service-worker.js`, `manifest.json`, and the `supabase/` and `docs/` folders.
Delete: `index (3).html` and `index (4).html` (both are publicly reachable copies of an old version).
`generate-roadmap.js` won't run where it is: Vercel only runs functions inside an `/api/` folder, and the page never calls it. Delete it, or move it to `api/generate-roadmap.js` if you want the feature back later.
