/**
 * BEPHOS — Supabase data-access layer.
 *
 * Load order in your HTML:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="bephos-client.js"></script>
 *   <script> ...your app code, calling window.BePhos.* ... </script>
 *
 * Fill in SUPABASE_URL and SUPABASE_ANON_KEY below (Project Settings > API in your Supabase dashboard).
 * The anon key is safe to expose in client code — Row Level Security in schema.sql does the real access control.
 */
const SUPABASE_URL = 'https://nvgzejircugthcacidol.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Z3plamlyY3VndGhjYWNpZG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxODI5OTYsImV4cCI6MjEwMTc1ODk5Nn0.Gagp53MhRoh9m1aW5UdMXAKvFePgJBS__LNV6CbNnuI';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------------------------------------------------------------- AUTH */
async function signInWithEmail(email) {
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
  if (error) throw error;
  return true; // magic link sent
}
async function signUpWithPassword(email, password) {
  const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: window.location.href } });
  if (error) throw error;
  return data; // data.session is null if email confirmation is required
}
async function signInWithPassword(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
async function resetPassword(email) {
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
  if (error) throw error;
  return true;
}
async function signOut() { await sb.auth.signOut(); }
async function getUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user;
}
async function getAccessToken() {
  const { data: { session } } = await sb.auth.getSession();
  return session?.access_token || null;
}
function onAuthChange(cb) {
  sb.auth.onAuthStateChange((_event, session) => cb(session?.user ?? null));
}

/* ---------------------------------------------------------------- PROFILE */
async function getMyProfile() {
  const user = await getUser();
  if (!user) return null;
  const { data, error } = await sb.from('profiles').select('*').eq('id', user.id).single();
  if (error) throw error;
  return data;
}
async function updateMyProfile({ callsign, life_stage, match_pref, city, timezone }) {
  const user = await getUser();
  const { data, error } = await sb.from('profiles')
    .update({ callsign, life_stage, match_pref, city, timezone })
    .eq('id', user.id).select().single();
  if (error) throw error;
  return data;
}
async function isCallsignAvailable(callsign) {
  const { data, error } = await sb.from('public_profiles').select('id').eq('callsign', callsign).maybeSingle();
  if (error) throw error;
  return !data;
}
async function getSettings() {
  const user = await getUser();
  const { data, error } = await sb.from('settings').select('*').eq('profile_id', user.id).single();
  if (error) throw error;
  return data;
}
async function updateSetting(key, value) {
  const user = await getUser();
  const { error } = await sb.from('settings').update({ [key]: value }).eq('profile_id', user.id);
  if (error) throw error;
}

/* ---------------------------------------------------------------- PODS */
async function createPod({ track, track_key, tone, plan, name }) {
  const user = await getUser();
  const { data: pod, error } = await sb.from('pods')
    .insert({ track, track_key, tone, plan, name: name || 'New Pod', created_by: user.id }).select().single();
  if (error) throw error;
  const { data: member, error: mErr } = await sb.from('pod_members')
    .insert({ pod_id: pod.id, profile_id: user.id, role: 'anchor', anchor_week_start: 1, anchor_week_end: 3 })
    .select().single();
  if (mErr) throw mErr;
  return { pod, member };
}
async function joinPodByCode(invite_code) {
  const user = await getUser();
  const { data: pod, error } = await sb.from('pods').select('*').eq('invite_code', invite_code.toUpperCase()).single();
  if (error) throw error;
  const { data: member, error: mErr } = await sb.from('pod_members')
    .insert({ pod_id: pod.id, profile_id: user.id }).select().single();
  if (mErr) throw mErr;
  return { pod, member };
}
async function findOpenPod(matchLifeStage) {
  // Pods with fewer than 4 filled members
  const { data: pods, error: pErr } = await sb
    .from('pods')
    .select('*, pod_members(count)')
    .limit(20);
  if (pErr) throw pErr;
  return (pods || []).filter(p => (p.pod_members?.[0]?.count ?? 0) < 4);
}
async function joinPod(podId) {
  const user = await getUser();
  const { data, error } = await sb.from('pod_members').insert({ pod_id: podId, profile_id: user.id }).select().single();
  if (error) throw error;
  return data;
}
async function getMyPod() {
  const user = await getUser();
  const { data: membership, error } = await sb.from('pod_members').select('*, pods(*)').eq('profile_id', user.id).maybeSingle();
  if (error) throw error;
  return membership;
}
async function getPodSeats(podId) {
  const { data, error } = await sb.from('pod_members').select('*, public_profiles(*)').eq('pod_id', podId);
  if (error) throw error;
  return data;
}

/* ---------------------------------------------------------------- ROADMAP */
async function saveRoadmap(podMemberId, weeks /* [{week,label}] */) {
  const rows = weeks.map(w => ({ pod_member_id: podMemberId, week: w.week, label: w.label }));
  const { error } = await sb.from('roadmap_items').upsert(rows, { onConflict: 'pod_member_id,week' });
  if (error) throw error;
}
async function toggleRoadmapItem(itemId, done) {
  const { error } = await sb.from('roadmap_items').update({ done }).eq('id', itemId);
  if (error) throw error;
}
async function getMyRoadmap(podMemberId) {
  const { data, error } = await sb.from('roadmap_items').select('*').eq('pod_member_id', podMemberId).order('week');
  if (error) throw error;
  return data;
}

/* ---------------------------------------------------------------- CHECK-INS / MICROLINES */
async function postCheckin(podId, week, text, status, kind = 'microline') {
  const user = await getUser();
  const { data, error } = await sb.from('checkins')
    .insert({ pod_id: podId, profile_id: user.id, week, text, status, kind }).select().single();
  if (error) throw error;
  return data;
}
async function getPodFeed(podId, limit = 20) {
  const { data, error } = await sb.from('checkins')
    .select('*, public_profiles(callsign)').eq('pod_id', podId)
    .order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}

/* ---------------------------------------------------------------- CHARTER */
async function proposeRule(podId, text) {
  const user = await getUser();
  const { data: rule, error } = await sb.from('charter_rules')
    .insert({ pod_id: podId, text, proposed_by: user.id }).select().single();
  if (error) throw error;
  await sb.from('charter_votes').insert({ rule_id: rule.id, profile_id: user.id }); // proposer auto-votes yes
  return rule;
}
async function voteRule(ruleId) {
  const user = await getUser();
  const { error } = await sb.from('charter_votes').insert({ rule_id: ruleId, profile_id: user.id });
  if (error) throw error;
  // Check vote count vs. pod size; flip to inforce at 4-of-4 (adjust threshold to your pod size)
  const { count } = await sb.from('charter_votes').select('id', { count: 'exact', head: true }).eq('rule_id', ruleId);
  if (count >= 4) {
    await sb.from('charter_rules').update({ status: 'inforce' }).eq('id', ruleId);
  }
}
async function withdrawRule(ruleId) {
  const { error } = await sb.from('charter_rules').update({ status: 'withdrawn' }).eq('id', ruleId);
  if (error) throw error;
}
async function getCharter(podId) {
  const { data, error } = await sb.from('charter_rules')
    .select('*, charter_votes(count)').eq('pod_id', podId).neq('status', 'withdrawn')
    .order('created_at');
  if (error) throw error;
  return data;
}

/* ---------------------------------------------------------------- NOTICE BOARD */
async function postNotice(podId, kind, text) {
  const user = await getUser();
  const { data, error } = await sb.from('notices').insert({ pod_id: podId, author_id: user.id, kind, text }).select().single();
  if (error) throw error;
  return data;
}
async function getNotices(podId) {
  const { data, error } = await sb.from('notices').select('*, public_profiles(callsign)').eq('pod_id', podId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/* ---------------------------------------------------------------- WAITLIST (public, no login required) */
async function joinWaitlist(email, plan = 'Fellow') {
  const { error } = await sb.from('waitlist_signups').insert({ email, plan_interested: plan });
  if (error) throw error;
  return true;
}

/* ---------------------------------------------------------------- COLLECTION RINGS */
async function saveCollectionRing({ species, weeksCompleted, consistencyPct, sentimentArc, seedHash }) {
  const user = await getUser();
  const { data, error } = await sb.from('collection_rings').insert({
    profile_id: user.id, species, weeks_completed: weeksCompleted,
    consistency_pct: consistencyPct, sentiment_arc: sentimentArc, seed_hash: seedHash,
  }).select().single();
  if (error) throw error;
  return data;
}
async function getMyCollectionRings() {
  const user = await getUser();
  const { data, error } = await sb.from('collection_rings').select('*').eq('profile_id', user.id).order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}
async function saveChapterRing({ chapterId, goalTitle, contributorCount, seedHash }) {
  const { data, error } = await sb.from('chapter_rings').insert({
    chapter_id: chapterId, goal_title: goalTitle, contributor_count: contributorCount, seed_hash: seedHash,
  }).select().single();
  if (error) throw error;
  return data;
}
async function getChapterRings(chapterId) {
  const { data, error } = await sb.from('chapter_rings').select('*').eq('chapter_id', chapterId).order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

/* ---------------------------------------------------------------- ROADMAP PINS */
async function addRoadmapPin(pinDate, label, notify=false) {
  const user = await getUser();
  const { data, error } = await sb.from('roadmap_pins').insert({
    profile_id: user.id, pin_date: pinDate, label, notify,
  }).select().single();
  if (error) throw error;
  return data;
}
async function getMyRoadmapPins() {
  const user = await getUser();
  const { data, error } = await sb.from('roadmap_pins').select('*').eq('profile_id', user.id).order('pin_date', { ascending: true });
  if (error) throw error;
  return data;
}
async function deleteRoadmapPin(pinId) {
  const { error } = await sb.from('roadmap_pins').delete().eq('id', pinId);
  if (error) throw error;
  return true;
}
async function toggleRoadmapPinNotify(pinId, notify) {
  const { error } = await sb.from('roadmap_pins').update({ notify }).eq('id', pinId);
  if (error) throw error;
  return true;
}

/* ---------------------------------------------------------------- ROOTPRINT */
async function saveRootPrint({ species, weeksCompleted, consistencyPct, sentimentArc, witnessedMoments, seedHash }) {
  const user = await getUser();
  const { data, error } = await sb.from('root_prints').insert({
    profile_id: user.id, species, weeks_completed: weeksCompleted, consistency_pct: consistencyPct,
    sentiment_arc: sentimentArc, witnessed_moments: witnessedMoments, seed_hash: seedHash,
  }).select().single();
  if (error) throw error;
  return data;
}
async function getMyRootPrints() {
  const user = await getUser();
  const { data, error } = await sb.from('root_prints').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
async function getRootPrintById(id) {
  const { data, error } = await sb.from('root_prints').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

/* ---------------------------------------------------------------- POD CHANNEL (realtime) */
async function postChannelMessage(podId, text) {
  const user = await getUser();
  const { error } = await sb.from('channel_messages').insert({ pod_id: podId, author_id: user.id, text });
  if (error) throw error;
}
async function getChannelMessages(podId) {
  const { data, error } = await sb.from('channel_messages')
    .select('*, public_profiles(callsign)').eq('pod_id', podId).order('created_at');
  if (error) throw error;
  return data;
}
function subscribeToChannel(podId, onInsert) {
  return sb.channel('channel:' + podId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'channel_messages', filter: `pod_id=eq.${podId}` },
      payload => onInsert(payload.new))
    .subscribe();
}

/* ---------------------------------------------------------------- CHAPTERS */
async function createChapter({ name, description, joining_policy }) {
  const user = await getUser();
  const { data: chapter, error } = await sb.from('chapters')
    .insert({ name, description, joining_policy, created_by: user.id }).select().single();
  if (error) throw error;
  await sb.from('chapter_members').insert({ chapter_id: chapter.id, profile_id: user.id, role: 'lead' });
  return chapter;
}
async function listChapters() {
  const { data, error } = await sb.from('chapters').select('*, chapter_members(count)').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
async function joinChapter(chapterId) {
  const user = await getUser();
  const { error } = await sb.from('chapter_members').insert({ chapter_id: chapterId, profile_id: user.id });
  if (error) throw error;
}
async function getChapterMembers(chapterId) {
  const { data, error } = await sb.from('chapter_members').select('*, public_profiles(*)').eq('chapter_id', chapterId);
  if (error) throw error;
  return data;
}
async function postChapterNotice(chapterId, text) {
  const user = await getUser();
  const { error } = await sb.from('chapter_notices').insert({ chapter_id: chapterId, author_id: user.id, text });
  if (error) throw error;
}
async function getChapterNotices(chapterId) {
  const { data, error } = await sb.from('chapter_notices').select('*, public_profiles(callsign)').eq('chapter_id', chapterId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/* ---------------------------------------------------------------- JOURNAL (private) */
async function saveJournalEntry(text) {
  const user = await getUser();
  const { data, error } = await sb.from('journal_entries').insert({ profile_id: user.id, text }).select().single();
  if (error) throw error;
  return data;
}
async function getJournalEntries() {
  const user = await getUser();
  const { data, error } = await sb.from('journal_entries').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

/* ---------------------------------------------------------------- PULSE (realtime) */
async function postPulse({ icon, text, pod_id, chapter_id }) {
  const user = await getUser();
  const { error } = await sb.from('pulse_posts').insert({ author_id: user.id, icon, text, pod_id, chapter_id });
  if (error) throw error;
}
async function getPulseFeed(limit = 30) {
  const { data, error } = await sb.from('pulse_posts')
    .select('*, pulse_reactions(emoji, profile_id)')
    .order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}
async function reactToPulse(postId, emoji) {
  const user = await getUser();
  const { error } = await sb.from('pulse_reactions').insert({ post_id: postId, profile_id: user.id, emoji });
  if (error && error.code !== '23505') throw error; // ignore duplicate-reaction conflicts
}
function subscribeToPulse(onInsert) {
  return sb.channel('pulse')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pulse_posts' }, payload => onInsert(payload.new))
    .subscribe();
}

/* ---------------------------------------------------------------- PILOT (Release 1)
 * Talks to the tables and functions in supabase/migrations/20261026090000_pilot_r1.sql.
 * Every rule (privacy, membership, capacity, blocks, rate limits) is enforced by the database;
 * these functions only send requests. Errors come back as plain sentences you can show people.
 */
function pilotErr(error) { if (error) { const e = new Error(error.message || 'Something went wrong.'); e.code = error.code; throw e; } }

async function createGoal({ area = null, outcome, done_when = null, deadline = null }) {
  const { data, error } = await sb.from('goals').insert({ area, outcome, done_when, deadline }).select().single();
  pilotErr(error); return data;
}
async function listMyGoals() {
  const { data, error } = await sb.from('goals').select('*').order('created_at', { ascending: false });
  pilotErr(error); return data;
}
async function updateGoal(id, fields /* {outcome, done_when, deadline, status, area} */) {
  const { data, error } = await sb.from('goals').update(fields).eq('id', id).select().single();
  pilotErr(error); return data;
}
/* Saving a new plan keeps the old ones in history and marks only the newest as current. */
async function savePlan(goalId, { next_action, cue_time = null, cue_place = null, minutes = null,
                                  obstacle_if = null, obstacle_then = null, days = [] }) {
  const { error: e1 } = await sb.from('goal_plans').update({ is_current: false }).eq('goal_id', goalId).eq('is_current', true);
  pilotErr(e1);
  const { data, error } = await sb.from('goal_plans')
    .insert({ goal_id: goalId, next_action, cue_time, cue_place, minutes, obstacle_if, obstacle_then, days })
    .select().single();
  pilotErr(error); return data;
}
async function getCurrentPlan(goalId) {
  const { data, error } = await sb.from('goal_plans').select('*').eq('goal_id', goalId).eq('is_current', true).maybeSingle();
  pilotErr(error); return data;
}
/* One check-in per goal per day; checking in again the same day replaces it. status: completed | partial | blocked | rescheduled */
async function checkIn(goalId, { status, note = null, evidence_url = null, plan_id = null, session_id = null, day = null }) {
  const row = { goal_id: goalId, status, note, evidence_url, plan_id, session_id };
  if (day) row.day = day;
  const { data, error } = await sb.from('goal_checkins').upsert(row, { onConflict: 'goal_id,day' }).select().single();
  pilotErr(error); return data;
}
async function listCheckins(goalId, sinceDay = null) {
  let q = sb.from('goal_checkins').select('*').eq('goal_id', goalId).order('day', { ascending: false });
  if (sinceDay) q = q.gte('day', sinceDay);
  const { data, error } = await q; pilotErr(error); return data;
}
/* reason: no_time | too_big | unclear_start | unwell | other_priority | rather_not_say
   choice: resume | reduce | reschedule | ask_help | pause | rethink */
async function recordRecovery(goalId, { missed_day = null, reason = null, choice }) {
  const { data, error } = await sb.from('goal_recoveries').insert({ goal_id: goalId, missed_day, reason, choice }).select().single();
  pilotErr(error); return data;
}
async function listUpcomingSessions(limit = 20) {
  const { data, error } = await sb.from('sessions').select('*')
    .gt('ends_at', new Date().toISOString()).eq('status', 'scheduled').order('starts_at').limit(limit);
  pilotErr(error); return data;
}
async function createSession({ cohort_id, title, starts_at, duration_min = 50, capacity = 8, format = 'quiet', purpose = 'application_sprint' }) {
  const { data, error } = await sb.from('sessions')
    .insert({ cohort_id, title, starts_at, duration_min, capacity, format, purpose }).select().single();
  pilotErr(error); return data;
}
async function joinSession(id)   { const { error } = await sb.rpc('join_session',  { p_session: id }); pilotErr(error); return true; }
async function leaveSession(id)  { const { error } = await sb.rpc('leave_session', { p_session: id }); pilotErr(error); return true; }
async function sessionRoster(id) { const { data, error } = await sb.rpc('session_roster', { p_session: id }); pilotErr(error); return data; }
async function extendSession(id) { const { data, error } = await sb.rpc('extend_session', { p_session: id }); pilotErr(error); return data; }
async function blockUser(userId) {
  const { error } = await sb.from('user_blocks').insert({ blocked_id: userId });
  if (error && error.code !== '23505') pilotErr(error); return true; // already blocked is fine
}
async function unblockUser(userId) {
  const user = await getUser();
  const { error } = await sb.from('user_blocks').delete().eq('blocker_id', user.id).eq('blocked_id', userId);
  pilotErr(error); return true;
}
/* reason: harassment | spam | inappropriate | safety_concern | other */
async function reportUser({ reported_user_id = null, session_id = null, reason, details = null }) {
  const { error } = await sb.from('safety_reports').insert({ reported_user_id, session_id, reason, details });
  pilotErr(error); return true;
}
/* Never put goal text, notes or anything personal in props: names and small numbers only. */
async function logEvent(name, props = {}) {
  const { error } = await sb.from('pilot_events').insert({ name, props });
  return !error;
}

/* ---------------------------------------------------------------- EXPORT */
window.BePhos = {
  sb,
  client: sb,
  pilot: {
    createGoal, listMyGoals, updateGoal, savePlan, getCurrentPlan, checkIn, listCheckins, recordRecovery,
    listUpcomingSessions, createSession, joinSession, leaveSession, sessionRoster, extendSession,
    blockUser, unblockUser, reportUser, logEvent,
  },
  auth: { signInWithEmail, signUpWithPassword, signInWithPassword, resetPassword, signOut, getUser, getAccessToken, onAuthChange },
  profile: { getMyProfile, updateMyProfile, isCallsignAvailable, getSettings, updateSetting },
  pods: { createPod, joinPodByCode, findOpenPod, joinPod, getMyPod, getPodSeats },
  roadmap: { saveRoadmap, toggleRoadmapItem, getMyRoadmap },
  checkins: { postCheckin, getPodFeed },
  charter: { proposeRule, voteRule, withdrawRule, getCharter },
  notices: { postNotice, getNotices },
  waitlist: { joinWaitlist },
  rootprints: { saveRootPrint, getMyRootPrints, getRootPrintById },
  collectionRings: { saveCollectionRing, getMyCollectionRings, saveChapterRing, getChapterRings },
  roadmapPins: { addRoadmapPin, getMyRoadmapPins, deleteRoadmapPin, toggleRoadmapPinNotify },
  channel: { postChannelMessage, getChannelMessages, subscribeToChannel },
  chapters: { createChapter, listChapters, joinChapter, getChapterMembers, postChapterNotice, getChapterNotices },
  journal: { saveJournalEntry, getJournalEntries },
  pulse: { postPulse, getPulseFeed, reactToPulse, subscribeToPulse },
};
