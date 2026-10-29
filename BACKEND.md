# BePhos backend: what's in this folder and how to switch it on

Nothing here has been applied to the live Supabase project. Review first.

## Files
- `supabase/migrations/20261018120000_bephos_v2.sql`: tables, row security and helper functions. It only adds things. The old tables from the first version (pulse_posts, chapters, journal_entries and so on) are left alone; all of them had 0 rows on 18 October 2026.
- `supabase/migrations/20261018130000_bephos_v3.sql`: apply after v2. Adds the Hub (opportunities), blocking, search visibility, private age range with ad consent, rest days, late check-ins, proof links, recognitions and per-view ad pricing. Also additive.
- `supabase/migrations/20261019090000_bephos_v4.sql`: apply after v3. Sharing in the Hub from day one (first-week listings wait for two checks), logs awarded on the server for listings 3 people find helpful, and leads imported from opportunity sites.
- `supabase/functions/opportunity-feeds/index.ts`: reads opportunity sites' public RSS or Atom feeds on a schedule and stores each item as a lead (title, link back, date only). Members check a lead, add the official page and deadline, and share it.
- `supabase/migrations/20261019120000_bephos_v5_feedback.sql`: apply after v4. The `feedback` table for alpha testers. Anyone can send; nobody can read it from the browser. Read it in the Supabase Table editor (`feedback_inbox` view), and set `status` as you triage.
- `supabase/migrations/20261020090000_bephos_v6_share_link.sql`: apply after v5. Sharing with just a link: the deadline is optional for every kind of listing, a listing with no deadline comes down after 30 days (`expires_at`, set by the database, not the author), and the preview picture is stored (`image`, https only).
- `supabase/functions/link-preview/index.ts`: reads a public page and returns its title, description, picture and site name for the Hub's share preview. It only fetches https pages on public names (no IP addresses, no local names, no names that point at private addresses), follows at most 3 redirects and checks each one, gives up after 5 seconds, and reads at most 400 KB. Until it's deployed, the app guesses the site and title from the link itself.
- `supabase/migrations/20261021090000_bephos_v7_starter_logs.sql`: apply after v6. 10 starter logs with a person's first check-in, written once by a database trigger (`log_awards`, reason `starter`). The 30-day rule (starter logs can't pay for recognitions) is enforced in the app only for now.
- `supabase/migrations/20261022090000_bephos_v8_sponsors.sql`: apply after v7. There are no ads any more. A business can ask to sponsor one building (Library, Gym, Bank and so on) in one of the four launch cities. Staff approve it and set the weekly price on the row; the business can't approve or price itself. Loan apps, betting, crypto trading, alcohol, tobacco and political campaigns are refused by the database. Members see live sponsors through `building_sponsors` (name, perk, link only). Sponsors see daily visit totals for their building (`building_visits`, written by `count_visit()`), never who.
- `supabase/functions/paystack/index.ts`: rewritten for sponsorships only. The business pays for an approved sponsorship; the price is read from the row staff set, never from the browser. Per-view ad pricing, ads and leases are gone from the function. The old `ads` and `leases` tables and `ads_for_me()` from v2/v3 are unused and can be dropped later.

## Not in the database yet
- The city game (quarters and the City Key, the daily card, the Lighthouse relights, city projects, seasons), hosting, shift counts, sigils and the firefly guide all live on the device for now. Before alpha with real people, these need tables: shifts (place, start, minutes), hosting (place, weekly slot, held count), relights (from, to, message), project gifts (project, amount) and season totals per city. Relights and project gifts spend logs, so they should be written by database functions, the same way `share_lead()` is.
- Business sponsorship of places (a real café paying to be the café in the city, with a member perk) is a planned way to earn money. Not built.

## Privacy rules built into the database
- Your daily lines are private. Pod mates see only whether you showed up, through `pod_days()`, and see the line itself only if you turn on "Show my daily lines to my pod".
- Age band and gender sit in `pod_requests`, which only you can read. They are used for matching on the server and never shown.
- Payments can only be written by the Paystack function, never from the browser. Paid ads still wait for review before anyone sees them.
- Organisations: anyone can list one, but only BePhos (service role) can mark it verified or hide it. Registration numbers sit in `org_private`, readable only by the owner. Volunteering logs can only be confirmed by the organisation they name, through `confirm_volunteering()`.
- "Who was in town today" (`town_seen`) is visible to signed-in people for 24 hours only.
- Town presence is off until the person turns it on (`presence_open` defaults to false).
- Date of birth is never asked for. Signup asks for an age range (Under 18 is refused), and only the range is kept in `profile_private`, which only its owner can read.
- (Retired Oct 2026, no ads any more:) Age-ranged ads reached only people who switched on "Use my age range to choose ads" (`ad_age_consent`, off by default). `ads_for_me()` does the matching on the server, so advertisers never learn who matched. This follows the September 2026 Lagos High Court ruling that platform terms of service are not valid consent for ad targeting under the NDPA.
- Blocking works both ways: `blocked_between()` hides two people from each other in search (`profile_search`), Hub listings, recognitions and ads.
- Hub listings need an https link and a "free to apply" confirmation, expire after their deadline, and are refused if they contain fee language (also checked in the app). Accounts can't post listings in their first 7 days. Only moderators can hide a listing. Reports about payment requests sort first.

- Logs from sharing: 2 logs when 3 other people mark a listing helpful, 1 log per imported lead checked and shared, at most 10 logs a week from sharing. Awards are written by database triggers and functions only (`log_awards`), never from the browser. You can't mark your own listing helpful.
- Feeds: only titles and links are stored, and every lead credits and links to its source. Opportunities Corners publishes an RSS feed (opportunitiescorners.com/feed/), which is easy to read, but it has no licence statement. Ask them for permission before turning it on, and record it in `opportunity_sources.permission_note`.

## To switch it on (in order)
1. Read the SQL files. Then run `supabase db push` (or paste v2 to v8, in order, into the Supabase SQL editor).
2. In Paystack: create the account for BePhos, copy the secret key.
3. `supabase secrets set PAYSTACK_SECRET_KEY=sk_live_... SITE_URL=https://bephos.vercel.app`
4. `supabase functions deploy paystack --no-verify-jwt` (the webhook comes from Paystack without a Supabase login; the function checks Paystack's signature itself and checks the user's login for checkouts).
5. In the Paystack dashboard, set the webhook URL to `https://nvgzejircugthcacidol.supabase.co/functions/v1/paystack`.
6. In Supabase, Realtime settings: make the town channels private (signed-in users only).
7. For feeds: `supabase secrets set CRON_SECRET=...`, deploy `opportunity-feeds` with `--no-verify-jwt`, add rows to `opportunity_sources`, and schedule an hourly call with the header `x-cron-secret` (Supabase Cron).
8. `supabase functions deploy link-preview` (keep JWT verification on; the app sends the anon key).
9. Next app round: wire index.html to these tables (sprints, lines, pods, focus, give back, town_seen, witnesses, reports, events, opportunities, blocks, recognitions, profile_private) and to the Paystack function.

## What was tested
- The SQL was applied to a local PostgreSQL 16 database set up like Supabase (auth.uid, roles), and row security was checked:
  pod mates can't read lines directly, they see "showed up" but not the line until you share it, outsiders see nothing,
  nobody can write a payment or approve their own ad from the browser, you can't witness someone who hasn't opened witnesses, an owner can't verify their own organisation, others can't read registration numbers, and you can't confirm your own volunteering.
- v3 was applied on top of v2 in a fresh local database and checked: fee language, a job without a deadline, an http link and an author hiding their own listing are all refused; a first-week account can't post; expired listings disappear for others but not for the author; blocking hides listings and search results both ways; nobody can read someone else's age range; age-ranged ads reach an opted-in person in that range and not someone who didn't opt in; a pod mate can be recognised but a stranger can't; a late line more than two days back is refused.
- v4 was applied on top of v3 locally and checked: a day-one account can share but its listing is marked as needing checks and it can't clear that itself; a first-week account can't check others; marking your own listing helpful is refused; 2 logs are awarded only at the third helpful mark from someone else; nobody can write log awards directly; a lead claimed by one member can't be taken by another; sharing a claimed lead awards 1 log.
- v5 was applied locally and checked: a signed-out visitor can send feedback; a check-in score without a number, or an email without consent, is refused; nobody can read feedback from the browser.
- The feed reader was type-checked, and its parser was run on sample RSS and Atom (CDATA titles, entities, bad dates, non-https links dropped). It has not fetched a live feed from here.
- v8 was applied on top of v7 locally and checked: a business can ask to sponsor; a loan app is refused; a business can't approve or price its own request; a city that isn't open is refused; a business can't update a request, and can't see anyone else's; once staff set it live, signed-out visitors see only the name and perk.
- v6 was applied on top of v5 locally and checked: a job with no deadline is accepted and expires in 30 days; a listing with a deadline expires the day after it; the author can't extend the expiry; an http picture link is refused; an expired listing disappears for others.
- v7 was applied on top of v6 locally and checked: a member's first line awards 10 starter logs; a second line awards nothing more; a member who already had lines before v7 gets nothing; nobody can write a starter award from the browser.
- The link-preview function was type-checked, and its parts were run here: the link filter (http, IP addresses, localhost, logins in the link, odd ports and single-word names are refused), the private-address check (10.x, 172.16–31.x, 192.168.x, 169.254.x, 100.64–127.x, ::1, fc/fd, mapped IPv4), and the page reader on sample HTML. It has not fetched a live page from here, and I haven't confirmed that Supabase's edge runtime allows `Deno.resolveDns`; if it doesn't, that check is skipped and the name filter still applies. A name can also change what it points at between the check and the fetch, so treat this as a strong filter, not a guarantee.
- The Paystack function (sponsorships version) was type-checked only (TypeScript strict, with stubs for Deno and supabase-js). It has not been run against Paystack.
