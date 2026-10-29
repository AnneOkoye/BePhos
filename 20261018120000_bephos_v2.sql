-- BePhos v2 backend: accounts, sprints, pods, matching, focus, give back, money.
-- Additive only: nothing existing is dropped or renamed. All existing tables are empty (0 rows, checked 18 Oct 2026).
-- Review before applying. Apply with: supabase db push   (or paste into the SQL editor)

begin;

-- ---------- profiles: extend the existing table ----------
alter table public.profiles drop constraint if exists profiles_callsign_check;
alter table public.profiles add constraint profiles_callsign_check check (callsign ~ '^[A-Z0-9_]{3,12}$');
alter table public.profiles
  add column if not exists city_name text,
  add column if not exists city_cc text,
  add column if not exists pack text check (pack in ('africa','mideast','southasia','eastasia','europe','americas')),
  add column if not exists status text check (char_length(status) <= 60),
  add column if not exists bio text check (char_length(bio) <= 160),
  add column if not exists sigil jsonb not null default '{}'::jsonb,
  add column if not exists witnesses_open boolean not null default false,
  add column if not exists presence_open boolean not null default true,
  add column if not exists lines_to_pod boolean not null default false;

-- Age band and gender are NOT on profiles (other people can read profiles). They live in pod_requests, readable only by you.
create or replace view public.profile_cards with (security_invoker = true) as
  select id, callsign, city_name, pack, status, bio, sigil, witnesses_open from public.profiles;

-- ---------- helpers ----------
create or replace function public.my_pods() returns setof uuid language sql stable security definer set search_path = public as
  $$ select pod_id from pod_members where profile_id = auth.uid() $$;
create or replace function public.is_pod_mate(other uuid) returns boolean language sql stable security definer set search_path = public as
  $$ select exists (select 1 from pod_members a join pod_members b on a.pod_id = b.pod_id
                   where a.profile_id = auth.uid() and b.profile_id = other) $$;

-- ---------- sprints and daily lines ----------
create table if not exists public.sprints (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  unit text not null check (unit in ('hours','days','weeks')),
  len int not null check (len between 1 and 48),
  starts_on date not null,
  ends_at timestamptz not null,
  goals jsonb not null,                    -- [{t, done_when, area}]
  mode text not null check (mode in ('solo','alongside')),
  finished_at timestamptz,
  goals_done int,
  created_at timestamptz not null default now());
create table if not exists public.day_lines (
  sprint_id uuid not null references public.sprints(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  kind text not null check (kind in ('progress','going','stuck','none','showed')),
  line text check (char_length(line) <= 280),
  created_at timestamptz not null default now(),
  primary key (sprint_id, day));
-- Pod mates see whether you showed up. They see the line itself only if you allow it.
-- Row security can't hide one column, so pod mates read through this function, not the table.
create or replace function public.pod_days(since date) returns table (profile_id uuid, day date, lit boolean, line text)
  language sql stable security definer set search_path = public as $$
  select d.profile_id, d.day, d.kind <> 'none', case when p.lines_to_pod then d.line end
  from day_lines d join profiles p on p.id = d.profile_id
  where d.day >= since and is_pod_mate(d.profile_id) $$;

create table if not exists public.focus_blocks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null, minutes int not null check (minutes between 0 and 180),
  planned int not null check (planned in (25,50,90)), cracks int not null default 0 check (cracks between 0 and 3),
  venue text, outcome text not null check (outcome in ('done','early','out')),
  created_at timestamptz not null default now());

-- ---------- pods: extend existing tables, add matching ----------
alter table public.pods add column if not exists city_cc text, add column if not exists charter jsonb not null default '{}'::jsonb, add column if not exists starts_on date;
create table if not exists public.pod_requests (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  age_band text not null check (age_band in ('18–24','25–34','35–44','45–54','55+')),
  gender text check (gender in ('Woman','Man','Non-binary','Prefer not to say')),
  want_age text not null default 'near' check (want_age in ('near','any')),
  want_gender text not null default 'any' check (want_gender in ('any','women','men')),
  same_area boolean not null default false, same_tz boolean not null default true,
  area text, tz text, tone text, checkin_day text,
  created_at timestamptz not null default now(), matched_pod uuid references public.pods(id));
-- Matching runs on the server (service role). Women-only or men-only requests only match people who chose that gender themselves.
create table if not exists public.nudges (
  id uuid primary key default gen_random_uuid(),
  pod_id uuid not null references public.pods(id) on delete cascade,
  from_id uuid not null references public.profiles(id) on delete cascade,
  to_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now());
create table if not exists public.anchor_ratings (
  pod_id uuid not null references public.pods(id) on delete cascade, week int not null,
  rater_id uuid not null references public.profiles(id) on delete cascade,
  anchor_id uuid not null references public.profiles(id) on delete cascade,
  helped boolean not null, primary key (pod_id, week, rater_id));

-- ---------- witnesses ----------
create table if not exists public.witnesses (
  witness_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (witness_id, subject_id));

-- ---------- the town: who was here today (24 hours) ----------
create table if not exists public.town_seen (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  city_cc text not null, city_name text not null, x int, y int, status text, seen_at timestamptz not null default now());
create index if not exists town_seen_city on public.town_seen (city_cc, city_name, seen_at desc);

-- ---------- give back ----------
create table if not exists public.give_actions (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  city_cc text not null, city_name text not null,
  kind text not null check (kind in ('cleanup','trees','teach','food','fixit','visit')),
  title text not null check (char_length(title) <= 60), place text not null check (char_length(place) <= 80),
  starts_at timestamptz not null, bring text, max_people int check (max_people between 2 and 500),
  sponsor text, created_at timestamptz not null default now(), hidden boolean not null default false);
create table if not exists public.give_participants (
  action_id uuid not null references public.give_actions(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  done_at timestamptz, photo_path text, note text check (char_length(note) <= 200),
  primary key (action_id, profile_id));

-- organisations that recruit volunteers. BePhos never takes donations; donate_url points to their own page.
create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) <= 60),
  kind text not null check (kind in ('Registered charity or NGO','Community group','Faith group','School or university club','Social enterprise')),
  about text not null check (char_length(about) <= 200), city_cc text not null, city_name text not null, area text,
  site_url text check (site_url ~ '^https?://'), donate_url text check (donate_url ~ '^https?://'),
  verified_at timestamptz, hidden boolean not null default false, created_at timestamptz not null default now());
-- Registration numbers live apart, readable only by the owner (and BePhos staff via the service role).
create table if not exists public.org_private (org_id uuid primary key references public.organisations(id) on delete cascade, registration text check (char_length(registration) <= 40));
-- Only BePhos staff (service role) can verify or hide an organisation.
create or replace function public.org_guard() returns trigger language plpgsql as $$ begin
  if auth.role() <> 'service_role' and (new.verified_at is distinct from old.verified_at or new.hidden is distinct from old.hidden) then raise exception 'Only BePhos can verify or hide an organisation'; end if;
  return new; end $$;
create trigger org_guard before update on public.organisations for each row execute function public.org_guard();
create or replace view public.organisation_cards with (security_invoker = true) as
  select id, owner_id, name, kind, about, city_cc, city_name, area, site_url, donate_url, verified_at is not null as verified from public.organisations where not hidden;
create table if not exists public.org_roles (
  id uuid primary key default gen_random_uuid(), org_id uuid not null references public.organisations(id) on delete cascade,
  title text not null check (char_length(title) <= 40), time_needed text check (char_length(time_needed) <= 40), what text check (char_length(what) <= 100), open boolean not null default true);
create table if not exists public.org_interest (
  role_id uuid not null references public.org_roles(id) on delete cascade, profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (role_id, profile_id));
create table if not exists public.volunteer_logs (
  id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade,
  org_id uuid references public.organisations(id) on delete set null, org_name text,
  what text not null check (char_length(what) <= 80), place text not null check (char_length(place) <= 80),
  day date not null check (day <= current_date), hours numeric(4,1) not null check (hours between 0.5 and 12),
  photo_path text, confirm_email text, confirmed_at timestamptz, created_at timestamptz not null default now());

-- ---------- money: Paystack payments, ads, leases ----------
create table if not exists public.payments (
  reference text primary key,                      -- Paystack reference we create
  profile_id uuid not null references public.profiles(id) on delete cascade,
  purpose text not null check (purpose in ('ad','lease')),
  amount_minor bigint not null check (amount_minor > 0), currency text not null check (currency in ('NGN','GHS','KES','ZAR','USD')),
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  paystack_id bigint, paid_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  payment_ref text references public.payments(reference),
  slot text not null check (slot in ('pole','shelter','forum','taxi','billboard','truck','bus','digital')),
  city_cc text not null, city_name text not null, board text,
  headline text not null check (char_length(headline) <= 28), line text check (char_length(line) <= 40),
  colour text not null, media_path text, days int not null default 1 check (days in (1,3,7,14)),
  review text not null default 'waiting' check (review in ('waiting','approved','rejected')),
  starts_at timestamptz, ends_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.leases (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  venue text not null, city_cc text not null, city_name text not null,
  payment_ref text references public.payments(reference), sign text check (char_length(sign) <= 30),
  starts_at timestamptz, ends_at timestamptz, created_at timestamptz not null default now());
-- One live lease per place per city is enforced by the paystack function before it activates a lease.

-- ---------- safety and measurement ----------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('person','post','thread','ad','give_action','district')),
  target text not null, reason text not null check (char_length(reason) <= 500),
  status text not null default 'open' check (status in ('open','actioned','dismissed')),
  created_at timestamptz not null default now());
create table if not exists public.events (
  id bigint generated always as identity primary key,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null check (char_length(name) <= 40), props jsonb not null default '{}'::jsonb,
  day date not null default current_date, created_at timestamptz not null default now());

-- ---------- row level security ----------
alter table public.sprints enable row level security;
alter table public.day_lines enable row level security;
alter table public.focus_blocks enable row level security;
alter table public.pod_requests enable row level security;
alter table public.nudges enable row level security;
alter table public.anchor_ratings enable row level security;
alter table public.witnesses enable row level security;
alter table public.town_seen enable row level security;
alter table public.give_actions enable row level security;
alter table public.give_participants enable row level security;
alter table public.organisations enable row level security;
alter table public.org_private enable row level security;
alter table public.org_roles enable row level security;
alter table public.org_interest enable row level security;
alter table public.volunteer_logs enable row level security;
alter table public.payments enable row level security;
alter table public.ads enable row level security;
alter table public.leases enable row level security;
alter table public.reports enable row level security;
alter table public.events enable row level security;

create policy "own sprints" on public.sprints for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "pod mates see sprints" on public.sprints for select using (public.is_pod_mate(profile_id));
create policy "own lines" on public.day_lines for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "own focus" on public.focus_blocks for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "pod mates see focus" on public.focus_blocks for select using (public.is_pod_mate(profile_id));
create policy "own request" on public.pod_requests for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "send nudges in my pod" on public.nudges for insert with check (from_id = auth.uid() and pod_id in (select public.my_pods()) and public.is_pod_mate(to_id));
create policy "see my nudges" on public.nudges for select using (to_id = auth.uid() or from_id = auth.uid());
create policy "rate in my pod" on public.anchor_ratings for insert with check (rater_id = auth.uid() and pod_id in (select public.my_pods()));
create policy "see own ratings" on public.anchor_ratings for select using (rater_id = auth.uid());
create policy "witness open people" on public.witnesses for insert with check (witness_id = auth.uid() and exists (select 1 from public.profiles p where p.id = subject_id and p.witnesses_open));
create policy "stop witnessing" on public.witnesses for delete using (witness_id = auth.uid());
create policy "see witnesses" on public.witnesses for select using (auth.role() = 'authenticated');
create policy "own town spot" on public.town_seen for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "see town today" on public.town_seen for select using (auth.role() = 'authenticated' and seen_at > now() - interval '24 hours');
create policy "host actions" on public.give_actions for insert with check (host_id = auth.uid());
create policy "edit own actions" on public.give_actions for update using (host_id = auth.uid());
create policy "see actions" on public.give_actions for select using (auth.role() = 'authenticated' and not hidden);
create policy "join actions" on public.give_participants for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "see who is going" on public.give_participants for select using (auth.role() = 'authenticated');
create policy "list my org" on public.organisations for insert with check (owner_id = auth.uid() and verified_at is null and not hidden);
create policy "edit my org" on public.organisations for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "my org registration" on public.org_private for all using (exists (select 1 from public.organisations o where o.id = org_id and o.owner_id = auth.uid())) with check (exists (select 1 from public.organisations o where o.id = org_id and o.owner_id = auth.uid()));
create policy "see orgs" on public.organisations for select using (owner_id = auth.uid() or (auth.role() = 'authenticated' and not hidden));
create policy "manage my roles" on public.org_roles for all using (exists (select 1 from public.organisations o where o.id = org_id and o.owner_id = auth.uid())) with check (exists (select 1 from public.organisations o where o.id = org_id and o.owner_id = auth.uid()));
create policy "see roles" on public.org_roles for select using (auth.role() = 'authenticated');
create policy "offer help" on public.org_interest for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "orgs see who offered" on public.org_interest for select using (exists (select 1 from public.org_roles r join public.organisations o on o.id = r.org_id where r.id = role_id and o.owner_id = auth.uid()));
create policy "own volunteering" on public.volunteer_logs for all using (profile_id = auth.uid()) with check (profile_id = auth.uid() and confirmed_at is null);
create policy "orgs see logs for them" on public.volunteer_logs for select using (exists (select 1 from public.organisations o where o.id = org_id and o.owner_id = auth.uid()));
create or replace function public.confirm_volunteering(log_id uuid) returns void language sql security definer set search_path = public as $$
  update volunteer_logs v set confirmed_at = now() from organisations o where v.id = log_id and o.id = v.org_id and o.owner_id = auth.uid() and v.confirmed_at is null $$;
create policy "see own payments" on public.payments for select using (profile_id = auth.uid());
-- payments are only written by the paystack edge function (service role), never by the browser
create policy "own ads" on public.ads for select using (profile_id = auth.uid());
create policy "approved live ads" on public.ads for select using (review = 'approved' and now() between starts_at and ends_at);
create policy "draft ads" on public.ads for insert with check (profile_id = auth.uid() and review = 'waiting' and payment_ref is null);
create policy "own leases" on public.leases for select using (profile_id = auth.uid() or ends_at > now());
create policy "set own sign" on public.leases for update using (profile_id = auth.uid());
create policy "file reports" on public.reports for insert with check (reporter_id = auth.uid());
create policy "see own reports" on public.reports for select using (reporter_id = auth.uid());
create policy "count events" on public.events for insert with check (profile_id = auth.uid() or profile_id is null);

commit;
