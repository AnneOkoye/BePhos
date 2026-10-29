-- BePhos v6: share an opportunity with just a link. Deadline becomes optional for every kind;
-- a listing with no deadline comes down after 30 days. Stores the preview picture.
-- Apply after v5. Additive. Review before applying.

begin;

alter table public.opportunities add column if not exists image text check (image ~ '^https://' and char_length(image) <= 500);
alter table public.opportunities add column if not exists expires_at timestamptz;

-- Old rule: jobs, grants, scholarships and fellowships needed a deadline. Drop it (Postgres named it opportunities_check).
do $$ declare c text; begin
  for c in select conname from pg_constraint where conrelid = 'public.opportunities'::regclass and contype = 'c'
            and pg_get_constraintdef(oid) ilike '%deadline IS NOT NULL%' loop
    execute format('alter table public.opportunities drop constraint %I', c);
  end loop;
end $$;

-- No deadline: up for 30 days. With a deadline: up until the day after it. The author can't set this themselves.
create or replace function public.opp_expiry() returns trigger language plpgsql as $$
begin
  if auth.role() <> 'service_role' then
    new.expires_at := case when new.deadline is not null then (new.deadline + 1)::timestamptz
                           else coalesce(old.created_at, now()) + interval '30 days' end;
  end if;
  return new;
end $$;
drop trigger if exists opp_expiry on public.opportunities;
create trigger opp_expiry before insert or update on public.opportunities for each row execute function public.opp_expiry();
update public.opportunities set expires_at = coalesce((deadline + 1)::timestamptz, created_at + interval '30 days') where expires_at is null;

drop policy if exists "see open listings" on public.opportunities;
create policy "see open listings" on public.opportunities for select using (
  author_id = auth.uid()
  or (auth.role() = 'authenticated' and not hidden and (expires_at is null or expires_at > now())
      and not public.blocked_between(author_id)
      and (not needs_checks or public.opp_checked(id) or public.account_days() >= 7)));

commit;
