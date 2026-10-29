-- BePhos v8: sponsored buildings replace ads. Apply after v7. Review before applying.
-- There are no ads in the app any more (Oct 2026). A business can sponsor one building in one city
-- for a flat price per week, set by BePhos staff on each approved sponsorship. Sponsors see totals only.
-- The v2/v3 ad tables (ads, ad pricing columns, ads_for_me) are left in place but unused; drop them later.

begin;

alter table public.payments drop constraint if exists payments_purpose_check;
alter table public.payments add constraint payments_purpose_check check (purpose in ('ad','lease','sponsorship'));

create table if not exists public.sponsorships (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  profile_id uuid not null references public.profiles(id) on delete cascade,   -- the business contact's account
  city_name text not null check (city_name in ('Lagos','London','Dubai','New York')),
  building text not null check (building in ('university','library','bank','gym','cowork','studio','community','stadium','mall','bookshop')),
  business_name text not null check (char_length(business_name) between 2 and 40),
  category text not null check (char_length(category) <= 40),
  perk text not null check (char_length(perk) between 4 and 80),          -- what members get in the building
  link text check (link is null or link ~ '^https://'),
  weeks int not null check (weeks in (1,2,4,8,12)),
  -- set by BePhos staff only (service role), never by the sponsor:
  status text not null default 'requested' check (status in ('requested','approved','refused','paid','live','ended')),
  price_minor_per_week bigint check (price_minor_per_week > 0),
  currency text check (currency in ('NGN','USD')),
  payment_ref text references public.payments(reference),
  starts_at timestamptz, ends_at timestamptz,
  check (category !~* '(loan|lend|credit|bet|casino|gambl|crypto|forex|alcohol|beer|spirits|tobacco|vape|politic|campaign)')
);
-- one live sponsor per building per city
create unique index if not exists one_sponsor_per_building on public.sponsorships (city_name, building) where status = 'live';

alter table public.sponsorships enable row level security;
-- a business can ask, and see its own requests
create policy "ask to sponsor" on public.sponsorships for insert to authenticated
  with check (profile_id = auth.uid() and status = 'requested' and price_minor_per_week is null and payment_ref is null and starts_at is null);
create policy "see my sponsorships" on public.sponsorships for select to authenticated using (profile_id = auth.uid());
-- no update or delete policy: only staff (service role) approve, price, start and end a sponsorship

-- what members see: live sponsors only, no contact or money columns
create or replace view public.building_sponsors with (security_invoker = false) as
  select city_name, building, business_name, perk, link from public.sponsorships
  where status = 'live' and now() between starts_at and ends_at;
grant select on public.building_sponsors to anon, authenticated;

-- totals a sponsor may see: visits per day to their building, never who
create table if not exists public.building_visits (
  city_name text not null, building text not null, day date not null default current_date, visits int not null default 0,
  primary key (city_name, building, day));
alter table public.building_visits enable row level security;
create policy "sponsor sees own building totals" on public.building_visits for select to authenticated
  using (exists (select 1 from public.sponsorships s where s.profile_id = auth.uid() and s.city_name = building_visits.city_name and s.building = building_visits.building and s.status in ('live','ended')));
create or replace function public.count_visit(p_city text, p_building text) returns void language sql security definer set search_path = public as $$
  insert into building_visits(city_name, building) values (p_city, p_building)
  on conflict (city_name, building, day) do update set visits = building_visits.visits + 1 $$;
revoke all on function public.count_visit(text,text) from public;
grant execute on function public.count_visit(text,text) to authenticated;

commit;
