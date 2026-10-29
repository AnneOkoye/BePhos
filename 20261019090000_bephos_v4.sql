-- BePhos v4: share in the Hub from day one, logs for useful listings, and leads imported from opportunity sites.
-- Apply after v3. Additive. Review before applying.

begin;

-- ---------- logs earned on the server ----------
-- Logs are still earned only. This table records awards the server makes (the app adds them to the balance).
create table if not exists public.log_awards (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  amount int not null check (amount between 1 and 10),
  reason text not null check (reason in ('listing_helpful','lead_checked')),
  ref uuid,
  created_at timestamptz not null default now(),
  unique (profile_id, reason, ref));
alter table public.log_awards enable row level security;
create policy "see own awards" on public.log_awards for select using (profile_id = auth.uid());
-- no insert policy: only triggers and the service role write here

-- ---------- sharing from day one ----------
-- New accounts can share straight away. In their first week a listing waits until two other members
-- tap "Looks real" (or a moderator approves). After that it shows to everyone.
alter table public.opportunities add column if not exists needs_checks boolean not null default false;
create table if not exists public.opportunity_checks (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (profile_id, opportunity_id));
alter table public.opportunity_checks enable row level security;
create policy "check others' listings" on public.opportunity_checks for insert with check (
  profile_id = auth.uid() and public.account_days() >= 7
  and not exists (select 1 from public.opportunities o where o.id = opportunity_id and o.author_id = auth.uid()));
create policy "see checks" on public.opportunity_checks for select using (auth.role() = 'authenticated');

create or replace function public.opp_checked(opp uuid) returns boolean language sql stable security definer set search_path = public as
  $$ select (select count(*) from opportunity_checks where opportunity_id = opp) >= 2 $$;

-- set needs_checks from the author's account age; the author can't set it themselves
create or replace function public.opp_new_account() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.needs_checks := coalesce((select current_date - created_at::date < 7 from profiles where id = new.author_id), true);
  elsif auth.role() <> 'service_role' then
    new.needs_checks := old.needs_checks;
  end if;
  return new;
end $$;
drop trigger if exists opp_new_account on public.opportunities;
create trigger opp_new_account before insert or update on public.opportunities for each row execute function public.opp_new_account();

drop policy if exists "share after first week" on public.opportunities;
create policy "share from day one" on public.opportunities for insert with check (author_id = auth.uid() and not hidden);
drop policy if exists "see open listings" on public.opportunities;
create policy "see open listings" on public.opportunities for select using (
  author_id = auth.uid()
  or (auth.role() = 'authenticated' and not hidden and (deadline is null or deadline >= current_date)
      and not public.blocked_between(author_id)
      and (not needs_checks or public.opp_checked(id) or public.account_days() >= 7)));
-- Members past their first week can see listings that are waiting, so they can check them.

-- ---------- logs for listings people find useful ----------
-- When a listing is marked helpful by 3 other people, its author earns 2 logs, once per listing,
-- and at most 10 logs a week from sharing, so posting lots of junk earns nothing.
create or replace function public.award_helpful() returns trigger language plpgsql security definer set search_path = public as $$
declare a uuid; n int; wk int;
begin
  select author_id into a from opportunities where id = new.opportunity_id;
  if a is null or a = new.profile_id then return new; end if;
  select count(*) into n from opportunity_helpful h where h.opportunity_id = new.opportunity_id and h.profile_id <> a;
  if n >= 3 then
    select coalesce(sum(amount),0) into wk from log_awards where profile_id = a and reason in ('listing_helpful','lead_checked') and created_at > now() - interval '7 days';
    if wk + 2 <= 10 then
      insert into log_awards(profile_id, amount, reason, ref) values (a, 2, 'listing_helpful', new.opportunity_id) on conflict do nothing;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists award_helpful on public.opportunity_helpful;
create trigger award_helpful after insert on public.opportunity_helpful for each row execute function public.award_helpful();
-- you can't mark your own listing helpful
drop policy if exists "own helpful" on public.opportunity_helpful;
create policy "own helpful" on public.opportunity_helpful for all using (profile_id = auth.uid()) with check (
  profile_id = auth.uid() and not exists (select 1 from public.opportunities o where o.id = opportunity_id and o.author_id = auth.uid()));

-- ---------- leads imported from opportunity sites (RSS) ----------
-- A scheduled function reads public feeds and stores each item as a lead: a title and a link back to the source.
-- A lead is not a listing. A member checks it, finds the official page and the deadline, and shares it.
-- The source is always credited and linked.
create table if not exists public.opportunity_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null, feed_url text not null unique check (feed_url ~ '^https://'),
  site_url text not null, active boolean not null default true,
  permission_note text,                       -- record of the source's permission to use its feed
  last_fetched_at timestamptz);
create table if not exists public.opportunity_leads (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.opportunity_sources(id) on delete cascade,
  guid text not null, title text not null check (char_length(title) <= 200),
  source_link text not null check (source_link ~ '^https://'),
  published_at timestamptz,
  status text not null default 'new' check (status in ('new','claimed','shared','not_real','expired')),
  claimed_by uuid references public.profiles(id), claimed_at timestamptz,
  opportunity_id uuid references public.opportunities(id),
  created_at timestamptz not null default now(),
  unique (source_id, guid));
alter table public.opportunities add column if not exists lead_id uuid references public.opportunity_leads(id);
alter table public.opportunity_sources enable row level security;
alter table public.opportunity_leads enable row level security;
create policy "see sources" on public.opportunity_sources for select using (auth.role() = 'authenticated');
create policy "see leads" on public.opportunity_leads for select using (auth.role() = 'authenticated');
-- Claiming and finishing a lead goes through these functions so nobody can take over someone else's claim.
create or replace function public.claim_lead(lead uuid) returns boolean language plpgsql security definer set search_path = public as $$
begin
  update opportunity_leads set status = 'claimed', claimed_by = auth.uid(), claimed_at = now()
   where id = lead and (status = 'new' or (status = 'claimed' and claimed_at < now() - interval '2 hours'));
  return found;
end $$;
create or replace function public.share_lead(lead uuid, opp uuid) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from opportunities where id = opp and author_id = auth.uid()) then return false; end if;
  update opportunity_leads set status = 'shared', opportunity_id = opp where id = lead and claimed_by = auth.uid() and status = 'claimed';
  if not found then return false; end if;
  update opportunities set lead_id = lead where id = opp;
  if (select coalesce(sum(amount),0) from log_awards where profile_id = auth.uid() and reason in ('listing_helpful','lead_checked') and created_at > now() - interval '7 days') < 10 then
    insert into log_awards(profile_id, amount, reason, ref) values (auth.uid(), 1, 'lead_checked', lead) on conflict do nothing;
  end if;
  return true;
end $$;

commit;
