-- BePhos v3: Hub (opportunities), age-range ad pricing with opt-in consent, blocking, search visibility,
-- rest days and late check-ins, proof links, recognitions.
-- Additive. Apply after 20261018120000_bephos_v2.sql. Review before applying.

begin;

-- ---------- privacy defaults ----------
-- Town presence is off until the person turns it on.
alter table public.profiles alter column presence_open set default false;
alter table public.profiles add column if not exists searchable boolean not null default true;

-- Private profile fields: only the owner can read or change them. Never exposed on profile_cards.
-- The date of birth is checked in the app and is not stored. Only the range is kept.
create table if not exists public.profile_private (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  age_band text not null check (age_band in ('18–24','25–34','35–44','45–54','55+')),
  ad_age_consent boolean not null default false,          -- "Use my age range to choose ads", off by default
  ad_age_consent_at timestamptz,
  updated_at timestamptz not null default now());

-- ---------- blocking ----------
create table if not exists public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id), check (blocker_id <> blocked_id));
-- True if either person has blocked the other. Used to hide people from each other everywhere.
create or replace function public.blocked_between(other uuid) returns boolean language sql stable security definer set search_path = public as
  $$ select exists (select 1 from blocks where (blocker_id = auth.uid() and blocked_id = other) or (blocker_id = other and blocked_id = auth.uid())) $$;

-- ---------- sprints: rest days, late check-ins, proof, goal area ----------
alter table public.day_lines drop constraint if exists day_lines_kind_check;
alter table public.day_lines add constraint day_lines_kind_check check (kind in ('progress','going','stuck','rest','none','showed'));
alter table public.day_lines add column if not exists late boolean not null default false;
-- A late line can only be for yesterday. Two days of slack covers time zones.
alter table public.day_lines drop constraint if exists day_lines_late_check;
alter table public.day_lines add constraint day_lines_late_check check (not late or day between (created_at at time zone 'utc')::date - 2 and (created_at at time zone 'utc')::date);
alter table public.sprints add column if not exists proof_url text check (proof_url ~ '^https://[^\s]+\.[^\s]+$' and char_length(proof_url) <= 300);
alter table public.sprints add column if not exists area text check (area in ('study','work','make','body','build','money','home','mind','people'));

-- ---------- recognitions: a pod mate thanks you on your Passport (costs them 3 logs in the app) ----------
create table if not exists public.recognitions (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references public.profiles(id) on delete cascade,
  to_id uuid not null references public.profiles(id) on delete cascade,
  why text not null check (char_length(why) between 6 and 120),
  created_at timestamptz not null default now(), check (from_id <> to_id));

-- ---------- the Hub: opportunities and resources ----------
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('job','remote','scholarship','grant','fellowship','cofounder','mentor','resource')),
  title text not null check (char_length(title) between 6 and 90),
  org text check (char_length(org) <= 80),
  link text not null check (link ~ '^https://[^\s/]+\.[^\s]+' and char_length(link) <= 300),
  deadline date,
  place text check (char_length(place) <= 60),
  remote boolean not null default false,
  eligibility text check (char_length(eligibility) <= 140),
  about text check (char_length(about) <= 400),
  free_to_apply boolean not null check (free_to_apply),        -- the poster must confirm nobody is asked to pay
  hidden boolean not null default false,                       -- set by moderators (service role) only
  created_at timestamptz not null default now(),
  check (kind in ('cofounder','mentor','resource') or deadline is not null),
  -- obvious fee language is refused at the database too, not only in the app
  check (concat_ws(' ', title, about, eligibility) !~* '(application|processing|registration|admin|form|screening|clearance|training)\s*fee|send\s*(money|airtime)|western union|bitcoin|gift card'));
create table if not exists public.opportunity_saves (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (profile_id, opportunity_id));
create table if not exists public.opportunity_helpful (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (profile_id, opportunity_id));
alter table public.reports drop constraint if exists reports_kind_check;
alter table public.reports add constraint reports_kind_check check (kind in ('person','post','thread','ad','give_action','district','opportunity'));
alter table public.reports add column if not exists category text check (category in ('money','fake','link','other'));
-- Reports about payment requests are reviewed first.
create index if not exists reports_money_first on public.reports ((category = 'money') desc, created_at);

-- Only moderators (service role) can hide or unhide a listing.
create or replace function public.opp_guard() returns trigger language plpgsql as $$
begin
  if auth.role() <> 'service_role' and new.hidden is distinct from coalesce(old.hidden, false) then
    raise exception 'only moderators can hide listings';
  end if;
  return new;
end $$;
drop trigger if exists opp_guard on public.opportunities;
create trigger opp_guard before insert or update on public.opportunities for each row execute function public.opp_guard();

-- Accounts can post links after their first week.
create or replace function public.account_days() returns int language sql stable security definer set search_path = public as
  $$ select coalesce(current_date - (select created_at::date from profiles where id = auth.uid()), 0) $$;

-- ---------- ads: priced per 1,000 views, optional age ranges ----------
alter table public.ads add column if not exists budget_minor bigint check (budget_minor > 0);
alter table public.ads add column if not exists cpm_minor bigint check (cpm_minor > 0);
alter table public.ads add column if not exists age_bands text[] not null default '{}'
  check (age_bands <@ array['18–24','25–34','35–44','45–54','55+']::text[]);
alter table public.ads add column if not exists views_bought int check (views_bought >= 0);
alter table public.ads add column if not exists views_served int not null default 0;
alter table public.ads drop constraint if exists ads_days_check;
alter table public.ads add constraint ads_days_check check (days in (1,3,7,14,30));
-- Per-ad reach report for the advertiser: counts only, never who.
create table if not exists public.ad_stats (
  ad_id uuid not null references public.ads(id) on delete cascade,
  day date not null default current_date,
  views int not null default 0, taps int not null default 0,
  primary key (ad_id, day));
-- Which ads may be shown to the current viewer: untargeted ads to everyone, age-ranged ads only
-- to people who opted in and whose range matches. Advertisers never learn who matched.
create or replace function public.ads_for_me(p_city_cc text) returns setof public.ads
  language sql stable security definer set search_path = public as $$
  select a.* from ads a
  where a.review = 'approved' and now() between a.starts_at and a.ends_at and a.city_cc = p_city_cc
    and a.views_served < coalesce(a.views_bought, 2147483647)
    and (cardinality(a.age_bands) = 0 or exists (
      select 1 from profile_private pp where pp.profile_id = auth.uid() and pp.ad_age_consent and pp.age_band = any(a.age_bands)))
    and not blocked_between(a.profile_id) $$;

-- ---------- row level security ----------
alter table public.profile_private enable row level security;
alter table public.blocks enable row level security;
alter table public.recognitions enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_saves enable row level security;
alter table public.opportunity_helpful enable row level security;
alter table public.ad_stats enable row level security;

create policy "own private profile" on public.profile_private for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "own blocks" on public.blocks for all using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());
create policy "recognise a pod mate" on public.recognitions for insert with check (from_id = auth.uid() and public.is_pod_mate(to_id));
create policy "see recognitions" on public.recognitions for select using (to_id = auth.uid() or from_id = auth.uid() or (auth.role() = 'authenticated' and not public.blocked_between(to_id)));
create policy "share after first week" on public.opportunities for insert with check (author_id = auth.uid() and public.account_days() >= 7 and not hidden);
create policy "edit own listing" on public.opportunities for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "remove own listing" on public.opportunities for delete using (author_id = auth.uid());
create policy "see open listings" on public.opportunities for select using (
  author_id = auth.uid() or (auth.role() = 'authenticated' and not hidden and (deadline is null or deadline >= current_date) and not public.blocked_between(author_id)));
create policy "own saves" on public.opportunity_saves for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "own helpful" on public.opportunity_helpful for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "count helpful" on public.opportunity_helpful for select using (auth.role() = 'authenticated');
create policy "advertiser sees own stats" on public.ad_stats for select using (exists (select 1 from public.ads a where a.id = ad_id and a.profile_id = auth.uid()));

-- Search and the town respect "searchable" and blocks through this view.
create or replace view public.profile_search with (security_invoker = true) as
  select id, callsign, city_name, status from public.profiles
  where searchable and id <> auth.uid() and not public.blocked_between(id);

commit;
