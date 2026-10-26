# Safety operations for the pilot

The app has block, report and leave-any-time. This page is the service behind them: who reads reports, how fast, and what happens next. Fill in the blanks before the first cohort. Until there is a named person here, keep sessions to invited cohort members only.

This is an operating plan, not legal advice. Have it reviewed alongside the Terms and Privacy notice.

## Who

| Role | Name | Contact | Covers |
|---|---|---|---|
| Safety lead | Anne | Company email to come | Reads every report, decides actions |
| Backup | | | When the lead is away |
| Session hosts | | | In the room: start on time, remind people of the rules, report what they see |

## How fast

Proposed targets for the pilot. Change them if you can't keep them, but write down what you will keep.

| Report type | Look at it within | Decide within |
|---|---|---|
| Safety concern, or someone may be under 18 | Same day | 24 hours |
| Harassment, hate, sexual content | 24 hours | 48 hours |
| Spam, other | 48 hours | 1 week |

Check for new reports every day of the pilot, including session days. Query 8 in `PILOT-METRICS.sql` lists anything not yet closed and how long it has waited.

## What to do with a report

1. Open it in Supabase (Table editor › `safety_reports`). Set `status` to `reviewing`.
2. Read what the reporter wrote. There are no recordings, so their words, the session and the time are the evidence. If needed, ask the reporter one or two short questions by email.
3. Decide, using the ladder below, and write a line in the log at the bottom of this page.
4. Set `status` to `closed`.
5. Tell the reporter it was handled. Don't share what action was taken against the other person.

## The ladder

| Step | When | How |
|---|---|---|
| Note only | Misunderstanding, first minor issue | Log it |
| Warning | Rude, disruptive, first offence | Email them the rule they broke |
| Remove from the cohort | Harassment, hate, sexual content, repeat disruption | `delete from public.cohort_members where cohort_id = '…' and user_id = '…';` |
| Close the account | Serious or repeated harm, or clearly under 18 | Authentication › Users in Supabase: delete the user (their goals and check-ins are deleted with them) |

Two reports about the same person from different people in a short time skips straight to removal while you look into it.

## Special cases

- **Someone may be under 18.** Remove them from the cohort straight away and ask them to confirm their age. If they are under 18, close the account and delete their data.
- **Someone may be in danger.** BePhos can't send help. Reply quickly, encourage them to contact local emergency services or someone they trust, and record that you did.
- **A report about a host.** The backup handles it, not the host's usual contact.

## Before inviting strangers (launch gate)

- [ ] A named safety lead and backup, with the time to check reports daily
- [ ] Hosts briefed on the rules and the report button
- [ ] The two migrations applied and the access checks run with real test accounts
- [ ] Terms and Privacy reviewed against the Nigeria Data Protection Act 2023 and the other countries you'll accept users from
- [ ] A plan for repeat offenders who make new accounts (for the pilot: invite-only cohorts)

## Log

| Date | Report id | What happened | Action | By |
|---|---|---|---|---|
| | | | | |
