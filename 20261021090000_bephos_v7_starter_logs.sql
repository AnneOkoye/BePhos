-- BePhos v7: 10 starter logs with your first check-in. Apply after v6. Additive. Review before applying.
-- Logs are still never sold or sent. Starter logs are written by this trigger only, once per person.
-- The app also stops starter logs being spent on recognitions in the first 30 days; that balance lives in the app for now.

begin;

alter table public.log_awards drop constraint if exists log_awards_reason_check;
alter table public.log_awards add constraint log_awards_reason_check check (reason in ('listing_helpful','lead_checked','starter'));

create or replace function public.award_starter() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from day_lines d where d.profile_id = new.profile_id and (d.sprint_id, d.day) <> (new.sprint_id, new.day)) then
    -- ref = the person's own id, so the unique (profile_id, reason, ref) rule allows exactly one starter award
    insert into log_awards(profile_id, amount, reason, ref) values (new.profile_id, 10, 'starter', new.profile_id) on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists award_starter on public.day_lines;
create trigger award_starter after insert on public.day_lines for each row execute function public.award_starter();

commit;
