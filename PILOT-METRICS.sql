-- ============================================================================
-- BePhos pilot measures. Read-only queries for the Supabase SQL Editor (which runs as the
-- project owner, so it can read the tables participants can't).
--
-- Before running: set the cohort and the pilot's first day in the "params" line of each query.
-- Every query returns counts as well as percentages: with 10 to 20 people, one person moves a
-- percentage a lot, so read the counts first.
--
-- Needs migrations 20261026090000_pilot_r1.sql and 20261027090000_session_rsvps.sql applied.
-- ============================================================================


-- 1. Do people arrive? Members who came to at least one session, and to their first one.
with params as (select '00000000-0000-0000-0000-000000000000'::uuid as cohort, date '2026-11-03' as start_day),
members as (select m.user_id from public.cohort_members m, params p where m.cohort_id = p.cohort and m.role = 'member'),
attended as (
  select distinct sm.user_id from public.session_members sm
  join public.sessions s on s.id = sm.session_id, params p
  where s.cohort_id = p.cohort)
select (select count(*) from members) as members,
       (select count(*) from members where user_id in (select user_id from attended)) as came_at_least_once,
       round(100.0 * (select count(*) from members where user_id in (select user_id from attended))
             / nullif((select count(*) from members), 0), 1) as pct;


-- 2. Each session: how many said they'd come, how many came, and how many of those who said yes came.
with params as (select '00000000-0000-0000-0000-000000000000'::uuid as cohort)
select s.starts_at::date as day, s.title,
       (select count(*) from public.session_rsvps r where r.session_id = s.id) as said_yes,
       (select count(*) from public.session_members sm where sm.session_id = s.id) as came,
       (select count(*) from public.session_rsvps r join public.session_members sm
          on sm.session_id = r.session_id and sm.user_id = r.user_id where r.session_id = s.id) as said_yes_and_came,
       (select round(avg(extract(epoch from (coalesce(sm.left_at, s.ends_at) - sm.joined_at)) / 60))
          from public.session_members sm where sm.session_id = s.id) as avg_minutes_stayed
from public.sessions s, params p
where s.cohort_id = p.cohort and s.starts_at < now()
order by s.starts_at;


-- 3. Do they return? Of the people who came in week 1, how many came again in week 2 and week 4.
with params as (select '00000000-0000-0000-0000-000000000000'::uuid as cohort, date '2026-11-03' as start_day),
visits as (
  select sm.user_id, floor((s.starts_at::date - p.start_day) / 7)::int + 1 as week
  from public.session_members sm join public.sessions s on s.id = sm.session_id, params p
  where s.cohort_id = p.cohort),
w1 as (select distinct user_id from visits where week = 1)
select (select count(*) from w1) as came_week_1,
       (select count(distinct v.user_id) from visits v join w1 using (user_id) where v.week = 2) as of_them_week_2,
       (select count(distinct v.user_id) from visits v join w1 using (user_id) where v.week = 4) as of_them_week_4,
       round(100.0 * (select count(distinct v.user_id) from visits v join w1 using (user_id) where v.week = 2) / nullif((select count(*) from w1), 0), 1) as pct_week_2,
       round(100.0 * (select count(distinct v.user_id) from visits v join w1 using (user_id) where v.week = 4) / nullif((select count(*) from w1), 0), 1) as pct_week_4;


-- 4. What happens after a miss? Recovery choices, and how many were followed by real progress
--    (a completed or partly done check-in on the same goal) within 7 days.
with params as (select '00000000-0000-0000-0000-000000000000'::uuid as cohort),
members as (select m.user_id from public.cohort_members m, params p where m.cohort_id = p.cohort),
rec as (select r.* from public.goal_recoveries r where r.owner_id in (select user_id from members))
select rec.choice,
       count(*) as times_chosen,
       count(*) filter (where exists (
         select 1 from public.goal_checkins c
         where c.goal_id = rec.goal_id and c.status in ('completed','partial')
           and c.created_at > rec.created_at and c.created_at <= rec.created_at + interval '7 days')) as progress_within_7_days
from rec group by rec.choice order by times_chosen desc;


-- 5. Check-ins per person per week, and how they went.
with params as (select '00000000-0000-0000-0000-000000000000'::uuid as cohort, date '2026-11-03' as start_day),
members as (select m.user_id from public.cohort_members m, params p where m.cohort_id = p.cohort)
select floor((c.day - p.start_day) / 7)::int + 1 as week,
       count(distinct c.owner_id) as people_checking_in,
       count(*) as check_ins,
       count(*) filter (where c.status = 'completed') as completed,
       count(*) filter (where c.status = 'partial') as partly,
       count(*) filter (where c.status = 'blocked') as blocked,
       count(*) filter (where c.status = 'rescheduled') as moved
from public.goal_checkins c, params p
where c.owner_id in (select user_id from members) and c.day >= p.start_day
group by 1 order by 1;


-- 6. The new prompts: how often each was shown and what people chose.
--    (pilot_events: low_attendance_shown/choice, welcome_back_shown/choice, deadline_passed_choice,
--     after_finish, rsvp, calendar_added.)
with params as (select '00000000-0000-0000-0000-000000000000'::uuid as cohort, date '2026-11-03' as start_day),
members as (select m.user_id from public.cohort_members m, params p where m.cohort_id = p.cohort)
select e.name, coalesce(e.props ->> 'choice', e.props ->> 'via', e.props ->> 'on', '') as detail,
       count(*) as times, count(distinct e.user_id) as people
from public.pilot_events e, params p
where e.user_id in (select user_id from members) and e.created_at >= p.start_day
  and e.name in ('low_attendance_shown','low_attendance_choice','welcome_back_shown','welcome_back_choice',
                 'deadline_passed_choice','after_finish','rsvp','calendar_added')
group by 1, 2 order by 1, 3 desc;


-- 7. After seeing "only a few people are coming", did people come to a later session?
with params as (select '00000000-0000-0000-0000-000000000000'::uuid as cohort),
shown as (select user_id, min(created_at) as first_shown from public.pilot_events where name = 'low_attendance_shown' group by user_id)
select count(*) as people_shown,
       count(*) filter (where exists (
         select 1 from public.session_members sm join public.sessions s on s.id = sm.session_id, params p
         where sm.user_id = shown.user_id and s.cohort_id = p.cohort and sm.joined_at > shown.first_shown + interval '1 day')) as came_back_later
from shown;


-- 8. Safety: reports by week and anything still waiting for a reply.
select date_trunc('week', created_at)::date as week, reason, status, count(*) as reports
from public.safety_reports group by 1, 2, 3 order by 1 desc, 4 desc;

select id, reason, created_at, now() - created_at as waiting
from public.safety_reports where status <> 'closed' order by created_at;
