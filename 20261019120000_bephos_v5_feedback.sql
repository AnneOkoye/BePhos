-- BePhos v5: alpha feedback. Apply after v4. Additive. Review before applying.
-- Anyone using the app can send feedback (signed in or not). Nobody can read it from the browser:
-- you read it in the Supabase dashboard (Table editor) or with the service role.

begin;

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  profile_id uuid references public.profiles(id) on delete set null default auth.uid(),
  callsign text check (char_length(callsign) <= 12),
  kind text not null check (kind in ('bug','confusing','idea','love','pulse')),
  pulse text check (pulse in ('first','day7','done')),
  score int check (score between 1 and 5),
  body text check (char_length(body) <= 1000),
  screen text check (char_length(screen) <= 40),
  version text check (char_length(version) <= 20),
  context jsonb not null default '{}'::jsonb check (pg_column_size(context) < 4000),
  has_image boolean not null default false,       -- screenshots stay on the device in alpha; ask for them if needed
  contact_ok boolean not null default false,
  email text check (email is null or (contact_ok and char_length(email) <= 200)),
  status text not null default 'new' check (status in ('new','seen','planned','fixed','wont_fix')),
  check (kind <> 'pulse' or (pulse is not null and score is not null)),
  check (kind = 'pulse' or char_length(coalesce(body,'')) >= 3)
);
alter table public.feedback enable row level security;
create policy "send feedback" on public.feedback for insert to anon, authenticated
  with check (status = 'new' and (profile_id is null or profile_id = auth.uid()));
-- no select, update or delete policy: only the service role (the dashboard) can read and triage

-- A simple view for reading it in the dashboard
create or replace view public.feedback_inbox as
  select created_at, kind, pulse, score, screen, version, callsign, body, contact_ok, email, status, id
  from public.feedback order by created_at desc;
revoke all on public.feedback_inbox from anon, authenticated;

commit;
