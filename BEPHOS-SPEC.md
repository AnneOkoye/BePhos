# BePhos: product record (formerly BePhos, Entheos and Phos)

Everything decided, built, rejected and still open for BePhos (called BePhos until Round H, Entheos until Round J, Phos until Round L), as of 20 October 2026. It covers the work on branch `flow-round-2` (up to "Round F"), compiled from the full design conversation and the code itself.

**Status in one line:** a late prototype (pre-alpha). Every screen is built and clickable, but each person's data lives only in their own browser until the backend is connected. The Supabase project is paused, and none of the SQL below has been applied to it.

---

## Contents

1. [Working rules](#1-working-rules)
2. [What BePhos is](#2-what-phos-is)
3. [Decisions log](#3-decisions-log)
4. [Vocabulary](#4-vocabulary)
5. [Navigation](#5-navigation)
6. [Every screen](#6-every-screen)
7. [Features in detail](#7-features-in-detail)
8. [Money: sponsors, logs and what was rejected](#8-money-sponsors-logs-and-what-was-rejected)
9. [Backend](#9-backend)
10. [How it was tested](#10-how-it-was-tested)
11. [Reviews and stress tests](#11-reviews-and-stress-tests)
12. [Known issues](#12-known-issues)
13. [Open decisions](#13-open-decisions)
14. [Recommended next steps](#14-recommended-next-steps)
15. [Build history](#15-build-history)
16. [Sources](#16-sources)

---

## 1. Working rules

These are Anne's standing rules for this project.

- Work on a branch, never straight to main. The current branch is `flow-round-2`.
- Anne uploads to GitHub herself. After each round, hand over only the changed files and name exactly which ones changed.
- Backend changes are delivered as SQL for review. Nothing is applied to the live Supabase project.
- Test in a browser at 390px and 1280px, in light and dark, before delivering.
- Write directly and concisely, don't overclaim, and say what was verified and what wasn't.
- Discuss new design questions before building.
- Logs are earned, never bought, sold or transferred for money.
- Payments go through Paystack.
- Don't use Monopoly's names (trademark), and don't use "House X" fantasy naming.
- Commits end with the Claude co-author and session lines.

**Deployment:** the app is a single file, `index.html`, served from GitHub by Vercel at bephos.vercel.app. The live site still runs the old version on main; none of the flow rounds are live until Anne uploads them.

---

## 2. What BePhos is

**The core loop:** pick something to finish, pick a length, check in with one line a day, ideally with a pod of up to four people, and build a permanent record of what you actually finished.

**The promise:** be "the light at the end of the tunnel". Help people with what they need most (money, information and time) and get them to finish things, with other people noticing.

**The thesis Anne set:** there's no accountability without human connection. The city, games and street exist to make productivity feel like somewhere you go, and to carry ads as the revenue model.

**The light metaphor runs through everything:** a lamp is lit for each day you show up, a torch burns during focus blocks, rooms light up as sprints finish, fireflies come out at night, and the firefly is the guide.

**Around the core:**
- **City:** a walkable, shared 84-block city for each of 16 launch cities.
- **Hub:** a contributor-built board of opportunities such as jobs, scholarships, grants and co-founder posts.
- **Give back:** real volunteering and charity recruiting.
- **Passport:** an ID-style record of what you've done, earned and never bought.
- **House:** one room is added for every finished sprint.
- **Games:** a dark room with three one-minute games.
- **Firefly:** a guide character that nudges without guilt.

---

## 3. Decisions log

Each row is a choice that was made, roughly in order. Where an idea was replaced, the row says what replaced it.

| Topic | Decision | Replaced or rejected |
|---|---|---|
| Old app | Deleted the tree, Chapter, Root Network and Journal screens | Two apps had been living in one file |
| Landing | Open for signups only | Waitlist removed |
| Reactions | Witness, Celebrate, Support, plus a ♥ Like | "Acknowledge" dropped |
| Followers | Called **witnesses**, opt-in, off by default. Witnesses see starts and finishes only | No public follower counts by default |
| Sprint length | Hours (torch), days, or weeks up to 12 | 26 weeks removed. Hours were removed in round 1, then brought back with the torch |
| Pod flow | "With a pod" goes straight to matching preferences: age band required, gender optional | The old "we'll suggest a pod after week one" |
| Cities | **Four launch cities, one per continent: Lagos, London, Dubai, New York.** The other 12 stay in the code as "coming soon" with a waitlist. City required at signup | Free search for any city; then all 16 at once; then Lagos only |
| Realism | Stay 2D, with no photorealism and no 3D engine | 3D is too heavy for budget phones; isometric 2D is noted as a later upgrade |
| Art styles | All removed: ASCII, low-poly, halftone, woodcut, then pixel, glitch, line art, mosaic and collage | They made the city hard to read |
| Street | Folded into the City; the street code remains but is unreachable | Five tabs became four, then Hub was added |
| Logs | One kind, earned only | Plum, moss, blossom and ebony "marks" removed |
| Buying logs | Never allowed | Anne once suggested buying logs with money; reversed on 18 Oct |
| Places | **Hosted, never owned.** No leasing or buying venues or houses | Paid monthly leases (₦10,000–20,000) were built, then removed |
| House | Grows one room per finished sprint, each with a plaque; can't be bought | Mirror puzzles removed |
| Passport | An ID card at 5:3, with a mantra band and mantra fine print | A stats dashboard, then a copy of a real passport with machine-readable lines |
| Date of birth | Never asked or stored. Signup asks for an age range, and Under 18 is refused | An earlier date-of-birth check was replaced in Round E |
| Minors | 18+ only at launch; teens maybe later through schools, which handle consent | A 16–17 junior tier was rejected for now |
| Ads | **No ads at all.** Billboards, buses, taxis and banners show city notices. Money comes from labelled sponsors of buildings at a flat weekly price | Per-day ads, then per-view ads with age multipliers (rejected: "we are not YouTube"); age targeting dropped with ads |
| Partner apps on goals | No brand names anywhere on goals. Each goal has a neutral "Link your savings app" style slot for the person's own app | Naming partner apps for free, since that is free advertising |
| Onboarding | No tab bar until the first sprint begins; the pod charter is agreed by the pod once it forms, not during sign-up; time zone set from the city | Charter questions at step 4 |
| Empty screens | Getting-started list for week one, zero stats hidden, empty forum boards hidden with starter prompts, Give back shows action ideas, Hub shows an example listing | Screens full of zeros |
| Navigation | Top bar is the bell plus a ••• menu; Messages live inside Pod; the district's sub-pages are one page | Six top-bar icons; separate Messages, Roles, Activity, Clearing and Campfire screens |
| Ad targeting | Age range raises the price; targeted ads reach only people who opted in | Terms of service don't count as consent |
| Feed | A forum home in the Nairaland style (boards by category, front page, counts), with wins, lessons and asks as their own tab | Tabs, then a hide-filter version |
| Give back | Real volunteering: organisations recruit, people log hours with proof, donations link out | BePhos never handles donations |
| Hub | Share by pasting a link (preview card, type guessed), from day one | A long form; a 7-day posting block |
| Opportunity feeds | Read Opportunities Corners' RSS as leads, after asking permission | It has no webhook |
| Name | BePhos, then BePhos, then Oku, then Entheos, then Phos, then **BePhos** (chosen 21 Oct 2026, Round L). The app's visible text now says BePhos; storage keys, the `BePhos` JS object and the `bephos-mark.png` file keep the old name so saved data survives | Decided |
| City naming | City (the real place), District (a group inside it), Space (up to four; formerly Pod) | "Town" renamed to "City" |
| Group word | Small groups are called a **Space** by default (decided 20 Oct 2026). A group can choose its own word (Pod, Squad, Circle, Team, Study group, or typed), and an organisation will set it for all its groups. The code still uses `pod` internally | "Pod" everywhere, fixed |
| Care ladder | Day 1 reminder, day 2 one person asked to check in, day 3 anchor told, day 7 sprint paused with the place kept 14 days; struggle flags seen only by the anchor | A single "Nudge" button |
| Theme | White everywhere by default. Black is chosen by the user, including on the landing page | The city used to turn black after 7pm by itself |
| Games | Lamplighter, Imposters and Questions, playable any time; logs from games only once today's line is in | Rock paper scissors removed; trivia kept at Anne's request |
| Sigils | A personal mark: shape, colours, pattern and emblem, with a spin button, locks, and earned marks | "House X" heraldry rejected as fantasy |
| Starter logs | 10, given at the first check-in, and not usable for recognitions for 30 days | Giving them at signup |
| Mascot | A firefly guide that never guilts, appears at most once a visit, and can be switched off | Duolingo-style guilt |
| City game | Monopoly structure without its names or greed: quarters, City Key, daily card, Lighthouse, city projects, seasons | Dice, rent, jail and property ownership |
| Weather | Clear by default; harmattan haze instead of tumbleweed; soft lightning | Falling leaves removed |
| Places to drink | Both a lounge and a bar | — |
| Religious buildings | None | Recommended leaving out; not contested |
| Sound | Off by default, generated in the browser, with a switch for each sound | Recordings (freesound) couldn't be downloaded from the build environment |
| Localisation | Each of the 16 cities gets its own shop names, dish, greetings, local names and horn level | Earlier everything was Lagos |
| Governance | Recommended: self-run with elected district stewards and a fixed safety floor | Not built; awaiting Anne |

---

## 4. Vocabulary

| Word | Meaning |
|---|---|
| **Sprint** | A commitment to finish something, measured in hours, days or up to 12 weeks |
| **Line / check-in** | One line a day saying how it went. A day starts at 6am |
| **Lamp** | Lit for each day you show up. Finished sprints show as lamps by tier: Lantern (1–2 weeks), Post lamp (3–4), Tall streetlight (5–8), Double-headed (9–12). Hour sprints get a Torch |
| **Space** | Up to four people doing sprints together (was "Pod"). The word can be changed per group |
| **Anchor** | The pod member who leads the pod that week; the role rotates |
| **Charter** | The pod's rules, changed by vote |
| **Witness** | An opt-in follower who sees your starts and finishes only |
| **Logs** | The only currency; earned, never bought |
| **Starter logs** | 10 logs with your first check-in |
| **Focus block / torch** | A timed block of work with a burning torch |
| **Shift** | A focus block done at a place in the city, starting together with others on the hour or half hour |
| **Host** | A member who runs a weekly session at a place, earned by showing up |
| **Passport** | Your ID-style record |
| **Stamps** | Marks for finished sprints, focus days, volunteering, trips, first shifts, quarters and seasons |
| **Mantra** | Your own line, printed on the Passport |
| **House / rooms** | One furnished room per finished sprint |
| **City** | The real place you chose, such as Lagos, drawn as a walkable map |
| **District** | A group inside a city around a kind of work, such as Writers' Walk |
| **Quarter** | A themed set of places in the city game (for example, the Learning Quarter) |
| **City Key** | Earned by completing all six quarters |
| **Lighthouse** | Where a quiet member's lamp waits to be relit |
| **Hub** | The opportunities board |
| **Give back** | Real volunteering |
| **Firefly** | The guide character |
| **City folk** | Residents drawn in the city who aren't members |
| **BePhos** | The product name. (BePhos doubled as a word for members; BePhos doesn't, so members are called members) |

---

## 5. Navigation

**Bottom tabs:** Today · Pod · Hub · City · Me.

**Top bar on main screens:** the bell and a ••• menu holding Search, The dark room, Black or white background, Send feedback, and the BePhos home page.

**Before the first sprint:** no tab bar at all; onboarding screens show steps and Back only.

**Inside City:**
- **Sections:** Map, Feed, Give back and More. More holds Districts, Travel, the city map, the dark room and your house.
- **Buttons over the map:** who's here, City map, Text view, Go home (when visiting another city), your status, logs, season, and settings for sky, weather and sound.
- **Emotes** sit in one button at the bottom right.

**Ways back to the landing page:** the ••• menu → "BePhos home page" (stays logged in), Me → Settings, or Log out.

**Review mode:** add `?screens=1` to the address for a numbered list of every screen with sample data. A thin "All screens" tab on the right returns to the list. `?demo=1` loads the sample street. Both use their own storage, so they never touch a real account.

---

## 6. Every screen

This is the review list from the code (`LP_IX`), grouped as the app groups it. "Logged out" screens are seen before signing up.

**Getting started**
1. **Landing** (logged out): the hero street, with a sun by day or a moon, stars, lit windows and fireflies by night. Shows an "alpha" tag, a ☾/☀︎ theme button, "Log in", "Start", and footer links to Help and feedback.
2. **Log in** (logged out)
3. **Start 1: What you're finishing.** Nine areas with six sub-goals each (section 7.1), plus "done when…".
4. **Start 2: How long.** Hours, days or weeks.
5. **Start 3: Solo or pod**
6. **Start 4: Pod preferences**
7. **Start 5: Sign up.** Callsign, email, password, age range, city and terms.
8. **Confirm sprint**
9. **Looking for your pod.** You sit in the middle with three empty seats, a 4-step progress list, what you asked for, and things to do while you wait.

**Today**
10. **Today:** today's line, progress, focus, and your pod card.
11. **After check-in:** goal, "Day X of Y", Change, See your lamp, the week check-in, the pod card, a game card, and the City feed.
12. **Alpha check-in question:** a 1–5 score with an optional reason.
13. **Weekly check-in**
14. **Focus block (torch)**
15. **Sprint complete:** add the room to your house, plus an optional proof link.
16. **Notifications**
17. **Search**

**Pod**
18. **Pod**
19. **Pod match (no pod yet)**
20. **Pod chat**
21. **Messages:** since Round F, a "Talk" section inside Pod, not its own screen
22. **Pod charter:** proposals and votes.
23. **Anchor dashboard:** focus, who's showing up, nudge, checklist, recap and rotation.
24. **Invite to pod**
25. **Pod settings**

**House and Passport**
26. **Passport**
27. **Your house**
28. **Entrance hall:** open from day one.
29. **A room and its plaque**
30. **The dark room game**

**Hub**
31. **Hub**
32. **Opportunity**
33. **Co-founder post:** shows the poster's Passport.
34. **Share an opportunity:** paste a link to get a preview.

**City**
35. **City:** the walkable map.
36. **City as text:** for screen readers and slow phones.
37. **Districts**
38. **District**
39. **Start a district**
40. **Lead a district**
41. **District roles**: since Round F, a section of the District page
42. **District activity**: since Round F, a section of the District page
43. **Clearing**: since Round F, a section of the District page
44. **Campfire**: since Round F, a section of the District page
45. **Trail**
46. **Feed:** the forum home.
47. **Post**
48. **New post:** a win, lesson, ask, event or offer.

**Give back and more**
49. **Give back**
50. **Organise an action**
51. **Add your organisation**
52. **Log volunteering**
53. **More**
54. **Travel**
55. **Trip: visa and ticket**
56. **The ride:** a real-time focus block while travelling.
57. **Discussion topic** (a board)
58. **Discussion** (a thread)
59. **Start a discussion:** includes a board picker that says what each board is for.

**Me**
60. **Me:** header with your photo or sigil and mantra, four stat tiles, latest stamps, cards for house, games, focus and Passport, then Log out and Start over.
61. **Settings**
62. **Safety and reporting**

**Help and legal**
63. **Help:** the FAQ.
64. **Terms**
65. **Privacy**

**Sheets and overlays that aren't separate screens:**
- Feedback
- Mantra
- Sigil builder
- City map
- Sky, weather and sound
- Place card (shifts and hosting)
- Person card
- Guard card
- Lighthouse
- City project
- Season page
- Ad booking
- Rules
- Visa pop-up
- The firefly

**Still in the file but unreachable:** the old Street side-scroller and its lamp detail screen.

---

## 7. Features in detail

### 7.1 Starting a sprint

- **Sprint length (Round K):** a first sprint defaults to 2 weeks, so a new person gets a win quickly. Sprints of 8 weeks or more need a milestone for each week: the first two are required before you begin, the rest can be added later. Today shows this week's milestone, with a sheet to edit all of them.

**Areas and sub-goals.** These are Anne's list, used word for word.

| Area | Sub-goals |
|---|---|
| **Study** | An exam or final · A course or class · A thesis or paper · A certification · A textbook or reading list · A language level |
| **Work** | A work project · A report or presentation · Job applications · A promotion case · Catch up on emails · Expense reports & admin |
| **Make** | A writing draft · An artwork · A song or album · A video or film · A portfolio piece · A craft project |
| **Body** | A race or event · A workout program · A sleep reset · A nutrition challenge · A step goal · A physical milestone (like a first pull-up) |
| **Build** | A website or app · A product MVP · A business launch · A prototype · A side hustle setup · A home renovation |
| **Money** | A savings goal · A debt payoff · A monthly budget · A tax return · An investment milestone · A big purchase |
| **Home** | A declutter zone · A home repair · A room makeover · A meal prep week · A deep clean · A digital declutter |
| **Mind** | A meditation streak · A journaling challenge · A digital detox · A therapy goal · A reading challenge · A mindful habit |
| **People** | A family event · A gift or surprise · A volunteer commitment · A friend catch-up · A donation goal · A letter or card |

**Length:** hours (1–48), days (1–13) or weeks (1–12).

**Solo or pod.**

**Pod preferences:**
- Age band: 18–24, 25–34, 35–44, 45–54 or 55+.
- Gender (optional): Woman, Man, Non-binary or Prefer not to say.
- Ages close to yours, or any.
- Anyone, women only, or men only. "Women only" appears only if you said you're a woman, and "men only" only if you said you're a man.
- Same goal area.
- Similar time zone.

**Sign up:**
- Callsign (3–12 characters), email and password.
- Age range, chosen from a list (Under 18 is refused, and no date is kept).
- City (required), which sets the time zone.
- Terms.

**Logging back in on the same device:** a one-way fingerprint of email and password is kept on the device so you can log back in while the backend is offline. The password itself is never stored.

### 7.2 Today and check-ins

- **Getting started (first week):** a checklist on Today: write your first line, do a 10-minute focus block, make your sigil, walk around your city, save one opportunity. Each step opens the part of the app it fills, and the list disappears when done, after 7 days, or when hidden.
- **Your own app:** under the goal, a neutral link such as "+ Link your savings or budget app". The person adds any app's link; BePhos names no brands and reads nothing from it.
- **After checking in:** the lamp lights, then the getting-started list or today's card, then your pod. Everything else (focus, house, week check-in, games, feed) is folded under "More you can do today". The feedback question waits until the next visit.

- **Ways to check in:** Made progress, Kept going, Got stuck, Rest day (planned), Didn't get to it, or Showed up.
- **Change** lets you edit or undo today's check-in.
- **Rest day:** one planned rest day a week, which counts as planned rather than dark.
- **Late check-in:** you can log yesterday late, up to two days back.
- **Welcome back:** after 4 or more days away you get a "Welcome back" screen, with no backlog to explain.
- **Weekly check-in** for sprints longer than a week.
- **Pod card:** who's lit today, or "Looking for your pod".
- **Browser reminders** at a chosen time. They only work while the app is open or installed on the phone.

### 7.3 Focus blocks (the torch)

- **Torch or lamppost (Round K):** sprints under 8 weeks focus by a torch; sprints of 8 weeks or more focus under a lamppost.
  - Torch: 1st distraction a small creak, 2nd a sharp crack and white smoke, 3rd it snaps and the block ends.
  - Lamppost: 1st a buzz and a flicker, 2nd a harder flicker and the light dims, 3rd the filament pops (a spark, a wisp of smoke) and the light goes out. No breaking glass. The flicker never goes faster than 2.5 flashes a second; with reduced motion it simply fades.
  - On Android the phone gives a short buzz at each stage.

- **Lengths:** 10, 15, 25, 50 or 90 minutes. The 10- and 15-minute blocks count as focused time but don't earn logs.
- **Countdown:** a large countdown above a burning torch.
- **Leaving the app:** the flame dims. When you come back after more than 20 seconds, it asks "Were you working?"
- **Cracks (Round G):** "I got distracted" splits the stick: a seam opens down the wood, splinters fly, the flame gutters and sputters before settling lower, and white smoke rises (grey on a white background so it stays visible). The second crack opens the split wider and chars the head. At three, the stick snaps, the top half falls, the flame dies under thick smoke, and that block earns nothing.
- **Reward:** 1 log per 25 minutes, up to 4 a day (shared with shifts).
- **After a block:** a "Block done" screen stamps your focused minutes. You can note what got done, then start another block, take a 5-minute break, go to today's line or a game, or go back to Today.
- **Focus stamp:** any day with 25 or more focused minutes earns one.

### 7.4 Spaces (formerly pods)

- **The word:** the app says "Space" by default. In the Space's settings, under "What you call it", a group picks Pod, Squad, Circle, Team, Study group or types its own (up to 24 characters). Every screen, sheet, toast and the tab bar follow it, with the right "a/an" and plural. People's own messages and lines are never changed. In the preview it changes on one device; live, the anchor sets it for the group and an organisation for all its groups.
- **How it works in code:** the source still says "pod". One function (`lpWordify`) rewrites text as it appears, via a single observer, so new screens don't need changing. Invite emails, the share text and the Passport summary use the same function.
- **Care ladder** ("Who needs a hand", on the Space screen and the anchor's dashboard), by days quiet in a row:
  - 1 day: BePhos sends a gentle reminder. Nobody else has to act.
  - 2 days: one person (the next name after theirs, not the anchor) is asked to check in, with three ready notes or "I spoke to them".
  - 3 days: the anchor is told (in an organisation's group, its facilitator too). The lamp also waits at the Lighthouse.
  - 7 days: the sprint pauses so they don't return to a pile of missed days; their place is kept for 14 days.
  - Back: "X is back today" with one tap to say welcome back. No "you missed" wording anywhere.
- **Struggle flags:** "Got stuck" twice or more in seven days. Only the anchor sees it, with "Offer help" (three notes) or "Offer a lighter week".
- **For the person themselves:** after a check-in that follows two or more quiet days, a "Welcome back" card. After a second "Got stuck" in a week: ask the group for help (posts to the chat), make this week smaller, or do 10 minutes on the smallest piece.
- **Preview:** in sample mode, "Preview the steps" lets you set a sample member to 1, 2, 3 or 7 quiet days, or back today, and see the anchor's view.
- **Not real yet:** the reminders, the "asked to check in" message and the facilitator alert need the backend and push notifications. In the preview nothing leaves the device.

- **Charter:** not asked during sign-up any more. The pod agrees it together once it forms.
- **Talk:** pod chat and any district conversations are listed inside Pod.

- **Matching** on the preferences above. It needs the backend; until then, requests show as "Looking for your pod".
- **Anchor rotation and dashboard:** weekly checklist, recap, and a private "did the anchor help?" rating from pod mates.
- **Charter voting:**
  - Anyone in the pod can propose rewording, removing or adding a rule.
  - A vote passes when more than half the pod says yes, and closes after 48 hours. Results show each person's vote.
  - Rules about money are refused.
  - Fixed floor: "nobody asks anyone for money, lines stay inside the pod, and harassment gets reported. A pod can make its rules stricter than these, never looser."
- **Chat, nudges and recognitions:** recognising a pod mate costs 3 logs and puts a thank-you on their Passport.
- **Privacy:** pod mates see whether you showed up, never what you wrote, unless you turn on sharing your lines.

### 7.5 House, Passport, stamps and Me

**House**
- One room per finished sprint, with the room type set by the goal area: Study → Library, Work → Study, Make → Workshop, Body → Garden, Build → Attic, Money → Cellar, Home and People → Kitchen, Mind → Landing.
- Each room has a plaque with the title, dates, days shown up, goals done and an optional proof link.
- The Entrance Hall is open from day one.

**Passport card**
- An ID card at 5:3 with: photo or sigil, callsign, home city, member since, sprints finished, volunteer hours (with a ✓ count for hours an organisation confirmed), and age range (which the owner can hide).
- A mantra line in italics with the callsign as a signature; the card background is the mantra and callsign repeated as fine print.
- Actions: add a photo, edit the mantra, hide the age range, share a summary, print or save as PDF, and download CSV.

**Stamps**
- Circles for sprints, dashed for focus days, squares for volunteering and ovals for trips.
- Further stamps for a first shift at a place, completing a quarter, the City Key, the Lamplighter mark and seasons.
- Ticks mean a sprint has a proof link, or volunteering was confirmed by the organisation.

**Full record**
- A heatmap of the last six months, a 14-day focus chart, and a sprint table.
- Endorsements, weeks anchored, actions organised and Hub contributions.

**Me**
- Header with your photo or sigil and mantra, four stat tiles, a scrolling row of stamps, and cards for house, games, focus and Passport.
- Log out (your data stays on the device) and Start over (deletes everything, after a confirmation).

### 7.6 Hub (opportunities)

- **Types:** Job, Remote work, Scholarship, Grant or funding, Fellowship or training, Co-founder wanted, Mentorship, and Resource.
- **Sharing:** paste one link to get a preview card. The type is guessed from the link and can be changed; deadline and note are optional. Listings with no deadline come down after 30 days.
- **Rules:**
  - Listings need an https link and a "free to apply" confirmation.
  - Fee language is refused, both in the app and in the database.
  - First-week listings stay hidden until two established members tap "Looks real".
- **Actions on a listing:** Save, Helpful, Report a scam, Witness the person who shared it, and **Make it a sprint** (adds "Apply for…" or starts a sprint that ends at the deadline).
- **Logs for sharing:** 2 logs when 3 other people mark it helpful, 1 log per imported lead checked and shared, at most 10 a week from sharing.

### 7.7 Feed (forum)

- **Forum home:** how many people are here now, total topics and posts, "New topic", "Post a win or an ask", and a front page of the most active topics.
- **Boards by category:**
  - Life and society: General, Politics & civic life, Relationships.
  - Work and money: Career, Business & money, Tech.
  - Leisure: Sports & fitness, Entertainment.
- **Each board** shows what it's for, its topic and post counts, and its latest topic.
- **Wins, lessons & asks** have their own tab. Every post carries a takeaway; offers and events are labelled.
- **Forum ads** are allowed when they fit the board, are booked through Advertise, and are marked AD.
- **Forum rules:**
  - Argue the point, not the person.
  - No threats or hate.
  - No private information about other people.
  - No impersonation or fake evidence.
  - Unmarked selling is removed.

### 7.8 Give back

- **Log volunteering:** who it was with, what you did, where, date, hours (0.5–12) and a photo. It shows as "self-reported" until the organisation confirms it. Each hour earns 1 log, up to 4 a day.
- **Organise an action:** clean-up, tree planting, teach a skill, food drive, fix-it session, or visit and help. Each has where, when, what to bring and an "Add to calendar" button.
- **Add your organisation:**
  - Types: registered charity or NGO, community group, faith group, school or university club, or social enterprise.
  - Organisations post volunteer roles, and people tap "I can help".
  - An organisation shows "Not verified" until BePhos checks its registration number, which is never shown publicly.
- **Donations:** BePhos never takes them. "Donate" opens the organisation's own page.

### 7.9 The city

**Size and layout.** An 84-block grid (12 × 7), with one place per block. It has districts, homes, parks, a market, the City Square, open plots for new districts, and a fire station.

**Public buildings.** Each opens a real part of the app.

| Building | What it opens |
|---|---|
| University | Scholarships, fellowships and courses |
| Hospital | Rest and recovery |
| Fire Station | The relight crew |
| The Mall | Shops, offers and ad space |
| Library | Guides, templates and resources |
| Bus Station | Coaches to nearby cities |
| Train Station | Trains between cities |
| Airport | Flights to any city |
| Stadium | Races, events and body goals |
| The Studio | Making things: writing, art, music and film |
| Co-working Space | Deep work, side by side |
| Bank | Saving, debt and budget goals |
| Gym | Workouts and training plans |
| Community Centre | Volunteering and Give back |
| Post Office | Messages and letters |
| The Lighthouse | Quiet lamps wait here |
| Town Hall (one label still says Town Hall; see section 12) | Proposals and votes |

**Everyday places.** Each has opening hours that follow the city's clock.
- Bookshop, pharmacy, POS kiosk, salon, barbershop, cinema and supermarket.
- The Lounge and The Bar.
- A food spot, a street-food spot, a bakery, a tailor, phone repair, mechanic and car wash, and a petrol station.
- The bookshop, lounge and bakery take shifts. The others say they're part of the city when tapped.

**Localisation across 16 cities.** Each city has its own names for the food spot, street-food stall and money kiosk, plus a local dish, a market seller's call, a name for the haze, morning, afternoon and evening greetings, ten local first names for city people, and its own level of car-horn noise.
- Lagos has Mama Put Buka, Suya Spot and a POS Kiosk.
- Nairobi has a Kibanda, a Nyama Choma Grill and an M-Pesa Agent.
- Cairo, Dubai and Dhaka swap the bar for a juice bar or tea stall.

**Launch cities (Round F):** Lagos (Africa), London (Europe), Dubai (Asia) and New York (North America). Sign-up and Travel only offer these four.

**Coming soon, with a waitlist:** Accra, Nairobi, Johannesburg, Cairo, Mumbai, Delhi, Dhaka, Tokyo, Seoul, Bangkok, Berlin and São Paulo. São Paulo needs a Portuguese version first; Sydney isn't built yet. People tap a city to join its waitlist (saved on the device until the backend is connected).

Each region has its own buildings and street names. Street names come from general knowledge or OpenStreetMap when reachable, and haven't been checked against a map.

**Time of day.** Match your background (the default), follow the clock, or pick daybreak, morning, noon, afternoon, evening, dusk or night. The app theme and the city sky are separate settings.

**Weather.**
- Clear (the default; nothing falls).
- Rain, thunderstorm and light hail.
- Harmattan haze, or each city's local name for it.
- Snow.
- "Changes day to day".
- Lightning is a soft brightening, never a white flash, and switches off when the phone is set to reduce motion.
- Fireflies at night have their own on/off switch.

**Seasons.** Dry and rainy seasons for tropical cities; spring, summer, autumn and winter elsewhere.

**Sound (Round E).**
- Off by default, with a volume slider and a room echo, and sounds placed around you.
- Ten sounds, each with its own switch: birds, owls, crickets, cicadas, frogs and toads, car horns, traffic, market chatter, rain and thunder, and wind.
- What plays follows the time of day, weather and season. Birds are loudest at daybreak, cicadas sing in the heat, the market hums at noon, and crickets, frogs and owls come out at night.
- Sound stops when you leave the city or switch apps.
- All sounds are generated in the browser, not recorded.

**City people (Round E).**
- **Who they are:** residents with local first names and their own sigils, drawn like members but with a dashed ring and a small badge for what they're doing. Their card says "Lives in Nairobi. Not a BePhos member."
- **Roles:** street sweeper, jogger, delivery rider, dog walker, groundskeeper, market seller, security guard, commuter, student, shopper, friends out together, people walking home, and a shopkeeper at each open shop.
- **Movement:** they walk the pavements, turn at corners, go into open places and come back out later.
- **How busy it is:** busy mornings and evenings (about 40 people), quiet nights (about 8). Light mode halves the numbers.
- **Greetings:** they say hello when you pass, or when they pass you, in the local greeting. Each person greets you at most once every 2 minutes, and someone greets you at most once every 4 seconds.
- **The guard:** after about 75 seconds of walking without going in anywhere, a security guard walks over and asks "Can I help you find somewhere?" The options are **Walk me to somewhere open**, **Show me the city map**, and **Just walking, thanks**. He comes at most once every 10 minutes.

**Vehicles.**
- Cars, buses, trucks, bikes, motorbikes, taxis, an ambulance and a fire engine.
- Buses and trucks carry readable ads, with optional pictures or short videos (videos are saved on the device only for now).

**Getting around.**
- Walk with the stick or WASD.
- Tap a building to walk to its door and go in.
- Take the bus to any place from the city map.
- Light mode for older phones switches on automatically on slow devices.

**Text view.** The whole city as a list, for screen readers.

**Live presence.**
- Other members who chose the same city show as their sigil with a status of up to 60 characters.
- It's off until you turn it on, with a prompt on the first visit.
- It uses Supabase's live connection feature and was only tested on a local copy.
- "Who was here today" is planned to last 24 hours.

**Emotes:** 12 of them (wave, cheer, thanks, dance, clap, heart, laugh, high five, bow, think, sit and jump).

### 7.10 Shifts and hosting

- **A shift** is a focus block done at a place, joined on the hour or half hour (or started alone).
- **While on a shift:** a live countdown runs, you can see who's working there, and your status shows "On shift at …".
- **Titles at a place:** Visitor → Regular (5 shifts) → Host.
- **First shift stamp:** your first shift at each place earns a stamp.
- **Logs:** 1 per 25 minutes, up to 4 a day shared with focus blocks. Paying per 5 minutes was rejected because it would pay people to leave the app open.
- **Hosting:**
  - Earned after 10 shifts at a place or 3 finished sprints.
  - The host runs a weekly session with their name on the door, and it shows on their Passport.
  - Miss two sessions in a row and the role passes to the next regular.

### 7.11 The city game

This takes Monopoly's structure without its names or its winner-takes-all design.
- **Six quarters:**
  - Learning: University, Library, Bookshop, Studio.
  - Work: Co-working, Bank, Mall, Post Office.
  - Wellbeing: Hospital, Gym, Stadium, Community Centre.
  - Travel: Airport, Train Station, Bus Station, Hotel.
  - Leisure: Café, Gallery, Restaurant, Lounge, Bakery.
  - Civic: Fire Station, Town Hall, Greenhouse, Observatory.
  
  Work a shift at every place in a quarter to complete it. Completing all six earns the **City Key**, which appears as a stamp and as a key on your sigil.
- **Today's card:** one real task after your check-in, worth +1 log. Examples are a shift at a new place, a 25-minute focus block, saving an opportunity, answering a forum question, recognising a pod mate, logging Give back, or sharing an opportunity.
- **The Lighthouse:**
  - A member who's been quiet for 3 or more days has their lamp wait there.
  - Anyone can relight it with a short note and 1 log, and earns the Lamplighter stamp.
  - After 24 hours the firefly relights it itself, so nobody is left waiting.
  - The returning member sees who relit their lamp.
- **City projects:** members fund them with logs, and they're built into the city with a plaque listing contributors. The three are a bandstand in the City Square (200 logs), a reading garden by the Library (300) and string lights over the Market (150).
- **Seasons:**
  - 12 weeks each, counted from 5 January 2026, with a city goal of 10,000 lamps.
  - Milestones at 25%, 50%, 75% and 100%: the night market opens, a stage goes up, lanterns line the lagoon, and the Festival of Lamps.
  - Everyone who took part gets a season stamp.
- **Starter-log rule:** starter logs can't pay for recognitions for 30 days.

### 7.12 Travel

- **Where it lives:** City → More → Travel lists all 16 cities with their local time.
- **Visa for another country:**
  - You give a reason: meet my pod, an event, Give back, an opportunity, or explore.
  - It's granted only if you've shown up on 3 days or finished a sprint.
  - It lasts 30 days and appears as a Passport stamp.
  - Travel within your own country needs no visa.
- **Three ways to go (Round G):** coach 90 minutes (the long way, most time to work), train 70, plane 50. All three are offered between cities on the same side of an ocean; New York is plane only.
- **The ride is a real-time focus block, drawn as a light trail (Round K).** Seen from above, your plane, train or coach moves along a gold trail through the ground between the two cities. The trail behind you is always gold, so it always reads as yours.
  - **Time of day** follows the real clock in the city you left: day, dawn, dusk or night, moving on as the ride goes. Day is sunlit, with the plane's shadow on the ground and a white contrail. Dusk warms everything and towns start to light up. At night the vehicles glow, windows and headlights are lit, and town lights show below. A label gives where you are and the time ("Dusk · 18:36 in Lagos").
  - **The ground matches the route**, stretch by stretch: city, farmland, forest, savanna, desert, sea, coast, mountains, or the Channel tunnel. Lagos to London crosses forest, savanna, the Sahara, the Mediterranean and the Alps. Lagos to Accra runs along the coast. London to Berlin by train goes through the tunnel.
  - **Distraction on a plane:** turbulence shakes the plane sideways, and the wobble stays in the trail behind it. Seatbelt chime.
  - **Distraction on a train:** a red signal appears ahead; the train brakes to a stop, waits, then moves off on green.
  - **Distraction on a coach:** a pothole just behind (a jolt), then a queue of cars with red brake lights; the coach crawls until the road clears.
  - Arriving counts as focus time and earns logs at 25 minutes or more. The third distraction plays out, then you get off and head back.
  - **Not yet:** the city's weather (rain, cloud) isn't carried into the ride, and the terrain is generic for each stretch, not a real map.
- **Tickets:** every trip has a ticket before you board and during the ride: a BePhos Air boarding pass (airport codes, gate, seat), a BePhos Rail ticket (platform, coach, seat) or a BePhos Coaches ticket (bay, seat), each with the date, departure time, ride length and what you're working on. Tickets are kept under "Tickets" in the Passport.
- **Arriving:** you're a visitor; your street and house stay at home. "Go home" brings you back.
- **Cost:** extra trips cost 2 logs.

### 7.13 Sigils

- **Shapes (10):** circle, square, rounded square, shield, hexagon, octagon, arch, diamond, triangle and trapezium. The emblem resizes for each shape.
- **Colours:** start with one of 50 colours, ordered by hue. You can add a second and third, and the picker warns when two are hard to tell apart.
- **Patterns:** 20.
- **Emblems (167):**
  - 30 flowers and plants, 50 animals and 50 things from game-icons.net (CC BY 3.0, credited on the Help page and in `docs/CREDITS.md`; the "badges" folder was left out because its licence is unclear).
  - 30 trees.
  - 7 signature light emblems drawn by hand (lamp, torch, flame, star, sun, moon, firefly).
- **Spin:** shuffles every part you haven't locked. Each part has a lock, and Back steps through the last 5 spins. Spinning is plain: no rare rolls and no slot-machine animation.
- **Photo upload** instead of a sigil.
- **Earned marks:** a gold border after 3 finished sprints, a star after anchoring a pod, and a key for the City Key. These can be earned but never chosen.
- **Small sizes:** in chat and on the map the pattern is dropped so the sigil reads at 24px.
- **Default sigil:** people who never open the picker get a fixed sigil made from their callsign. Old tree sigils carry over unchanged.

### 7.14 The firefly guide

- **Look (Round E):**
  - A teal insect with glossy bug eyes, antennae and a glowing yellow-green tail.
  - No skin tone, mouth or cheeks; it shows feeling through its eyes, antennae and glow.
  - About 56px, shaded to look 3D. It flies in along a curve, bobs while you read, and flies off when dismissed.
- **Moods:** happy, proud, sleepy, curious, cheeky and gentle. It's never sad or disappointed.
- **Triggers:** first visit, after a check-in, 6 minutes into a game, a missed day, 8 minutes walking the city, finishing a sprint, late at night, and coming back after a week away.
- **Rules:**
  - At most one line per visit.
  - Silent from midnight to 6am and on rest days.
  - Quotes your goal at most once a day.
  - Never guilts, and jokes are never about the user.
  - Every line offers a real next step as a button (for example, "Start 10 min").
  - Has an off switch in Settings.
- **Lines:** the current ones are placeholders. Anne writes the real ones in `docs/firefly-lines.xlsx`, with up to 5 per trigger.
- **Where it doesn't appear:** demo and review modes.

### 7.15 Games (the dark room)

- **Three games:**
  - **Lamplighter:** 60 seconds to keep a street of lamps lit while distractions drift at your light.
  - **Imposters:** find five imposter shapes before they reach the core.
  - **Questions:** trivia; answers drift around the room.
- **Layout:** full screen, with a slim bar (back, the three games, settings and how to play) and the game area taking the rest. The room follows the app theme.
- **Where to find them:** the games icon in every top bar, a card on Today after you check in, the after-focus screen, and Me.
- **Rewards:** play any time; points turn into logs only once today's line is in (3 points = 1 log, 1 log a day). Showing up always earns more than playing.

### 7.16 Alpha feedback

- **Feedback sheet:** a speech-bubble button on every main screen, and in Settings, Help and the landing footer.
  - Choose Something's broken, Confusing, An idea, or I like this; write a note; optionally attach a screenshot and tick "You can email me".
  - Each note records the screen, version (alpha-0.1), screen size and theme, never daily lines.
- **Three one-tap questions:**
  - After the first check-in: "How easy was it?"
  - On day 7: "How likely are you to keep going?"
  - At the end of a sprint: "Would you start another?"
  
  Each is a 1–5 score with an optional reason, asked once and dismissible.
- **Where feedback goes:** it's saved on the device and uploaded to the `feedback` table when the backend is reachable. Anne reads it in the `feedback_inbox` view.
- **Email fallback:** an "email us" link appears once `LP_FEEDBACK_EMAIL` is set (currently empty).

### 7.17 Settings, safety and privacy

- **Theme:** white by default, black on request (here, with the moon button, or on the landing page).
- **City sky** follows the background or the clock.
- **Visibility switches:** show sample content, show me walking in my city, appear in search, witnesses on/off, use my age range to choose ads (off by default), and share my lines with my pod.
- **Block:** hides two people from each other everywhere (search, Hub, recognitions, ads and the city).
- **Report:** reports are saved, but there's no moderation queue yet.
- **Data:** Export everything, Log out, and Delete everything on this device.
- **Help, Terms and Privacy** are rewritten in plain language for what the app actually does. They're a draft and haven't had legal review.

---

### Round M: co-working ring, torch heat, busy city, district roles, home in the Passport

**Co-working is the ring of fire.** Starting or joining a session at any place opens its own screen, whatever the number of people. Everyone's torch stands in a ring around one fire. The fire gets bigger with each person, and its heat is the ring's average heat step, rounded down. You stand at the front of the ring. Tap any torch to see the person's line and heat step. "I got distracted" makes your torch lean and drops it one heat step; others see the lean, not the reason. "Step back" leaves. A session joined for the next half hour waits at an unlit ring until it starts. When it ends, the screen says "Session done." In the preview, the other people are labelled sample people. With live accounts, they are whoever joined.

**Focus partner.** From a place's Co-work section you can choose "Focus with one partner". It is one session for two torches. At the end, each person answers "Did you do what you said?" (Yes, Partly, No), and the pairing ends. Partners only appear in the preview until accounts are live.

**Torch colour and heat.** Any user can pick one of seven torch colours: Gold, Crimson, Ember orange, Sun yellow, Green, Teal, Violet. The picker appears on the focus start screen, in the ring and on Me. Colour is personal choice. Heat shows focus, in five steps timed as fractions of the session length T:

| Step | Starts at |
|---|---|
| Ember | start |
| Warming | 10% of T |
| Steady | 30% of T |
| Deep | 55% of T |
| Blue core | 85% of T, only when T is 25 minutes or more |

A distraction drops one step, and you climb again from there. The torch screen and the ring show the current step and the time to the next one. The colours are design choices; the blue core reads as the hottest part, as in a real flame.

**Busy city.** There are about three times as many residents by day: commuters, students, shoppers, riders, sellers, and people waiting at open doors. Dusk and night stay calmer. Walkers who drift far out of view come back just past the edge of the screen, so the streets you can see stay full. Each resident's card says "City resident". It shows a status that changes every hour of the city clock. Lighter phones get a third of the crowd. If frames run slow for a few seconds, half the walkers go indoors.

**Host and district roles.** The member Host role is now one clear thing: the Host runs the district's weekly co-working sessions and the campfire, and welcomes new members, and is picked by the Lead. City staff no longer use the word "Host"; the café's Host is now "Front of house", the co-working space's is "Front desk", and the lounge's is "Waiter". The old "work a shift as a role" code was unused and has been removed. The Lead can make up to 8 roles of their own. Each role has a name, what they do, and how it's filled: the Lead picks, or members volunteer, up to 3 per role. Lead and Host can't be duplicated. Spaces get the same mechanism, shown in the Spaces mockup board "9. Roles you make". The Spaces version isn't built yet.

**Home in the Passport.** The house with rooms is gone. The Passport has a Home section: a house with one lit window per finished sprint and at least one dark window to come. Under it is the list of finished sprints. Each sprint can have a proof link (https only), which you can add or change later. Old links to the house, a room or the street open the Passport. Finishing a sprint opens the Passport with the new window lit.

**Smaller changes.** The Hub notice "Real opportunities never ask you to pay" is removed. Listings that ask applicants to pay are still refused, with a shorter message: "Listings that charge applicants can't be posted." Every new person already gets 10 starter logs, at their first check-in. Visible "shift" wording now says co-working or session.

**Bugs fixed.** Round K added a second function called `lpLong` (sprint length). It replaced the date formatter of the same name, so dates across the app showed as "false" or "true", for example in Passport finish dates, deadlines and stamps. It is now `lpLongSprint`. Two older name clashes were also fixed:
- Chat message times used the countdown clock. They now use `lpClockTime`.
- The city sound key replaced the live-presence room name. It is now `lpCitySndKey`.

No duplicate function names remain.


## 8. Money: sponsors, logs and what was rejected

### What logs are for

**Earned by:**
- 1 for each day you show up.
- 1 per 25 minutes of focus or shifts, up to 4 a day.
- 3 per Give back action, and 1 per volunteer hour.
- 2 when something you shared in the Hub helps 3 people, and 1 per checked lead.
- 1 a day from the dark room.
- 10 starter logs with your first check-in.

**Spent on:**
- Extra trips (2).
- Reserving a shift seat for tomorrow (1, refunded when you turn up).
- Recognising a pod mate (3).
- Relighting a lamp at the Lighthouse (1).
- City projects.

**Never:** bought, sold, cashed out, or used to buy places, ads or status.

### Revenue ideas and where each stands

| Idea | Status |
|---|---|
| **Ads in the city and forums** | **Removed in Round F.** There are no ads. Billboards, buses, taxis and banners show city notices instead, and forum boards have no ad slot. Age-range targeting went with them |
| **Sponsored buildings** | **The revenue model now.** One business per building per city (Library, Gym, Bank, Co-working Space and others), flat weekly price set by staff, always labelled Sponsor, offers members a perk, sees visit totals only. Loan apps, betting, crypto trading, alcohol, tobacco and political campaigns can't sponsor. Built in the app and SQL v8; not open until after alpha |
| Earlier per-day ad prices (Lagos) | Lamp-post ₦1,500, forum ₦2,000, taxi ₦3,000, billboard ₦5,000, bus ₦7,500 per day; outside the Paystack countries, US$1.50–7.50. Superseded |
| Currencies | Sponsorships are priced in naira for Lagos and US dollars for London, Dubai and New York (Paystack doesn't take pounds or dirhams) |
| Leasing places (₦10,000–20,000 a month) | **Removed.** Places are hosted |
| Buying houses or logs | **Rejected** |
| Rest passes, streak protection, paid elite pods | **Rejected:** they break "nothing can be bought" and amount to paying for status |
| Real businesses sponsoring real places | Now the sponsored-buildings model above |
| Organisation cohorts ("Spaces"): bootcamps, universities and employers pay per seat | **Recommended** as the strongest early revenue line. Organisations would see totals only. Not built |
| Sponsored Give back actions | A possible later sponsorship format |
| Opening sponsorship before there's an audience | Not recommended. Open it in a city once it has enough weekly users |

---

## 9. Backend

Supabase project `nvgzejircugthcacidol`, currently paused. Nothing below has been applied to it. `BACKEND.md` has the full detail and the switch-on steps.

### Migrations, applied in order

| File | Adds |
|---|---|
| `20261018120000_bephos_v2.sql` | Core tables, row security and helper functions: sprints, lines, pods and pod requests, focus, Give back, organisations (`org_private`, `confirm_volunteering()`), town presence (`town_seen`), witnesses, reports, events, payments, ads and leases (leases now unused). It widens the callsign limit to 3–12 characters |
| `20261018130000_bephos_v3.sql` | Hub opportunities, blocking, search visibility, private age range with ad consent (`profile_private`, `ads_for_me()`), rest days, late check-ins, proof links, recognitions, and per-view ad pricing |
| `20261019090000_bephos_v4.sql` | Hub sharing from day one with two-person checks, server-awarded logs for helpful listings (`log_awards`), and leads from opportunity feeds (`opportunity_sources`, `share_lead()`) |
| `20261019120000_bephos_v5_feedback.sql` | The `feedback` table and `feedback_inbox` view. Anyone can send; nobody can read from the browser |
| `20261020090000_bephos_v6_share_link.sql` | Optional deadlines, `expires_at` set by the database (30 days with no deadline), and an https preview `image` |
| `20261021090000_bephos_v7_starter_logs.sql` | A trigger that awards 10 starter logs once, with the first line |
| `20261022090000_bephos_v8_sponsors.sql` | Sponsored buildings: requests from businesses, staff-only approval and pricing, a ban on loan, betting, crypto, alcohol, tobacco and political sponsors, a public `building_sponsors` view, and visit totals for sponsors |

### Edge functions

- **`paystack`:** checkout and webhook for approved building sponsorships only. The price comes from the row staff set, never the browser.
- **`opportunity-feeds`:** reads RSS or Atom feeds every hour and stores only titles and links back.
- **`link-preview`:** fetches a public page's title, description, picture and site name.
  - Safety limits: https only, public names only, a private-address check, at most 3 checked redirects, a 5-second timeout and a 400 KB limit.
  - Not confirmed: whether Supabase's runtime allows the DNS check.

### Privacy rules built into the database

- Daily lines are private. Pod mates see only whether you showed up, unless you share your lines.
- Age band and gender can only be read by their owner and are used only for matching.
- Payments can only be written by the Paystack function, and paid ads wait for review.
- Organisations can't verify themselves; registration numbers are readable only by the owner; only the named organisation can confirm volunteering.
- Age-ranged ads reach only people who opted in, and the matching happens on the server.
- Blocking works both ways.

### Not in the database yet

These live only on the device for now:
- Quarters and the City Key, daily cards, relights, city projects and seasons.
- Hosting and shift counts.
- Sigils and the firefly.
- Charter votes, recognitions, blocks, opportunities and Hub contributions.

### Switch-on order

1. Review the SQL, then apply v2 to v8 in order.
2. Set up the Paystack account and add its secret key.
3. Deploy `paystack` and set the webhook.
4. Make the city's live channels private (signed-in users only).
5. Deploy `opportunity-feeds` on a schedule, after getting Opportunities Corners' permission.
6. Deploy `link-preview`.
7. Connect `index.html` to the tables.

**Earlier backend facts from memory notes:** auth (magic link plus email and password), callsign uniqueness, pod creation with invite codes, and check-ins were wired in the old app's `bephos-client.js`. The lamp app reuses none of that yet.

---

## 10. How it was tested

- **Browser tests** run with Playwright in headless Chromium at 390px and 1280px, light and dark. There are 11 suites, including a sweep that opens every screen and checks for errors and sideways scrolling, a click-crawl for unreachable screens, and feature suites for each round. All passed at commit 279da5c.
- **Round E checks:**
  - Nairobi shows its own place names.
  - City people use local, unique names, stay on the pavements and go into places.
  - There are fewer people at night.
  - People say hello when you pass.
  - The guard comes over and his card fits a phone.
  - All ten sound switches work, and every sound plays without an error.
- **Database:** the SQL was applied to a local PostgreSQL 16 set up like Supabase, and the row rules were checked one by one.
- **Not tested:**
  - Anything against live Supabase or Paystack.
  - Real pod matching.
  - The link preview on real pages.
  - The opportunity feed against a live feed.
  - The service worker.
  - Outside services the app calls (street names, trivia).
  - Performance on cheap Android phones (the city ran at 60fps on a powerful test machine).
  - Audio quality: the sounds have never been heard.
  - Cultural accuracy of the city people and local details. People from each city should review them.
  - Street names and city coordinates, which come from general knowledge.

---

## 11. Reviews and stress tests

### Investor view

Anne asked for a Shark Tank view twice: once at the start and once after the city round. Both times the verdict was "out for now", for the same reasons:
- Nothing is proven with real users.
- The scope is very large.
- The money story isn't settled.
- Founder hours are split across several ventures.

**What would change that:** a paid cohort and real completion numbers. Each investor's angle:
- **O'Leary:** cohorts that pay per seat.
- **Cuban:** prove the core loop and measure the share of sprints finished.
- **Corcoran:** commitment, and the name's pronunciation cost.
- **Greiner:** a ten-second promise, and unlocking features gradually.
- **John:** the Passport as the brand, plus distribution through bootcamps, universities and opportunity sites.
- **Herjavec:** safety, moderation, and the fragility of a single file.

### Persona stress test

This was published as a separate document earlier. It concluded that BePhos works for a motivated adult in an English-speaking city who already has a pod.

**Launch blockers it found:**
- Minors: fixed by asking for an age range and refusing under-18s.
- People at risk from someone they know: fixed by making presence opt-in and adding block.
- Screen reader users: fixed by the city's text view.

**Problems that recur across personas:** slow pod formation, bad weeks that look like public failure (addressed with rest days, late check-ins and the welcome-back screen), heavy pages on cheap phones (addressed with light mode), English-only screens in non-English cities, and moderation that has no budget.

**Proposed pilot:** 40–60 people in Lagos, in pods from day one, for one six-week sprint. Targets to beat:
- 70% write a first line within 24 hours.
- 90% are in a full pod within 72 hours.
- 60% check in on 4 or more days in week 1.
- 40% return within 7 days of a 3-day gap.
- 50% finish.
- A median of 120 focused minutes a week.
- 25% have confirmed volunteering.
- Every report is acted on within 24 hours.

### Name analysis

- **BePhos** (the name in the app until Round H): people tend to read it as "MER-rohz"; it needs telling that it's said like "heroes".
- **Meroes:**
  - Easier to say from seeing it, but easy to misspell from hearing it.
  - It echoes Meroë (the ancient Kushite capital) and the Greek *meros* ("a part"), and works as a name for members.
  - meroes.com is registered by someone.
  - Suggested test: 10 people, aiming for 7 out of 10 spelling and saying it right.
- **Oku** (from Igbo ọkụ, fire):
  - The best fit for the app's light metaphor.
  - It's a common word in other languages (Turkish "read", Japanese "inner"), and there's a town called Oku in Cameroon.
  - There's probably an existing app with the name.
  - Anne has Oku reserved for her shoe platform, so she needs to choose which project gets it.
- **Okuzon:** not recommended; it sounds like a marketplace.
- **BePhos** (chosen by Anne on 21 October 2026): "be the light". Plain BePhos was dropped because several software companies already use it (Dealroom, VC Backed and The Org list companies called BePhos).
  - Options weighed: OnPhos (cleanest search, Claude's first pick), PhosWay (a small GitHub project and a Turkish fertiliser use the name), CoPhos (one letter from CPhos, a lab chemical), PhosCo (a listed phosphate-mining company, dropped).
  - BePhos search: no company or app found. Results are chemistry (beryllium phosphide, BiPhePhos). In lower case "Bephos" can look like a medicine, so it is always written BePhos.
  - "BePhos" is still the main part of the name, so a trademark agent's search (Nigeria, UK, US; classes 9, 41, 42) is still needed before spending on the brand. Domain and handles not yet checked.
- **Phos** (chosen on 20 October 2026, replacing Entheos; dropped the next day):
  - Greek φῶς, "light". It names the app's own picture directly: the lamp you light, the torch, the firefly. The home page says so in one line.
  - Short, easy to spell after hearing it once.
  - Risks: English speakers may say "foss" or "fohs" (Greek is closer to "fohs"); "phos" is a common prefix for phosphate products (Phos-Chek fire retardant, phosphate medicines); a CSE ticker is PHOS; a short word makes the domain and trademark harder; there's a light pun risk with "pho".
  - Still to do: the 10-person say-and-spell test, a trademark search, and a domain.
- **Entheos** (chosen earlier on 20 October 2026, then replaced by BePhos):
  - Greek *entheos*, "filled with a god", i.e. inspired; the root of "enthusiasm". The app tells it as the fire you bring to each sprint (one line on the home page, under "How Entheos works").
  - Risks Claude raised before the choice: it's the root of "entheogen" (a word for psychedelics), it has a religious meaning, people may not know how to say it (EN-thee-os) or spell it, and companies called Enthea and Entheotech exist.
  - Still to do: the 10-person say-and-spell test, a trademark search, and the domain.
- **No trademark searches have been done.**

### Colour

Three options were mocked up:
- **A:** green, as now.
- **B:** black and white, with lamp gold used only for light.
- **C:** gold buttons.

Recommended B: gold is the "light", and green is the default colour of Nigerian banks. Anne said she likes white and black but hasn't chosen.

---

## 12. Known issues

From the Round E city review and the code:

1. **Fixed in Round F:** per-view ads are gone from the app and Paystack, and "Town Hall" now reads City Hall. The old ad code is still in the file, unused.
2. **Districts and quarters:** both words remain. Districts are groups of people; quarters are sets of places in the city game. They no longer overlap in the text, but a new person may still mix them up.
3. **Same goal everywhere:** the season goal (10,000 lamps) is the same for every city.
4. **City game on device only:** all city-game progress lives on the device and is lost when switching phones.
5. **Street view:** the close-up street view hasn't had the latest changes, so it can feel like a different place.
6. **Clashing names:** some city people share first names with the sample members.
7. **File size:** `index.html` is about 1.06 MB, mostly emblem icon data. It's compressed when served, but heavy for slow connections.
8. **Unbuilt governance:** city governance exists only as a recommendation.
9. **Generated sounds:** they may sound artificial; recordings can be swapped in sound by sound.
10. **Fake town presence risk:** the live presence channel can be joined by anyone with the public key until it's restricted to signed-in users.
11. **The firefly's first line** can sit over the getting-started list on a small phone until it's dismissed.
12. **"Choose file" box:** stays white in black mode on the new-topic page.
13. **Leftover code:** the old city search and unused styles from the old app remain in the file.
14. **Unchecked text:** the Terms and Privacy text haven't had legal review, and street names aren't checked against a map.
15. **Group word, edge cases:** text people write is protected in chat, message previews and lines. Other user text (forum posts, Hub listings) that contains the word "pod" would be shown with the group's word instead.
16. **Care ladder is preview only:** quiet days for sample members come from a fixed pattern; real data needs the backend.
17. **Sound needs recordings:** all sound now comes from real recordings in `sounds/` (the list and a credits table are in `sounds/CREDITS.md`). None have been added yet, so the app is silent apart from the old generated city sound, which is off unless someone switches it on in the sound settings.
18. **Spaces roles are mockup only:** custom roles are built for districts; for Spaces they exist in the mockup.
19. **Ring people are samples:** the other torches in a ring are sample people until live presence is switched on.

---

## 13. Open decisions

Waiting on Anne:

1. **Name:** decided, BePhos. Still open: trademark search, domain, and whether to rename the storage keys at launch (a clean start) or keep them.
2. **Colour:** option A, B or C.
3. **Sponsorship price:** the flat weekly price per building in each launch city. Staff set it on each approved sponsorship, so it can be decided closer to launch.
4. **Feedback email:** an address for `LP_FEEDBACK_EMAIL`, and a support address for Help.
5. **Firefly lines:** fill in `docs/firefly-lines.xlsx`.
6. **Firefly name.**
7. **City governance:** build the recommended model? The proposal:
   - Each district elects 3 stewards for 3-month terms, at most 2 terms in a row.
   - Only people who showed up on at least 3 days in the last 2 weeks can vote.
   - Votes need a majority with a minimum turnout.
   - BePhos safety rules are a floor that cities can only make stricter.
   
   Also: are votes one person one vote, or only for people who've shown up recently?
8. **Pod chat:** keep it as it is, or clear it each day?
9. **City and game limits:** the proposed games cap of 10 minutes a day, the dimming city when wandering, a Gentle/Firm setting, moving the dark room into the city as an arcade, and a Night Market for cosmetic sigil patterns. Proposed, not built.
10. **Birthdays:** an optional day-and-month-only birthday celebration (not built).

---

## 14. Recommended next steps

1. **Settle the name and colour**, then apply them everywhere. Then the 3D room and co-working test page.
2. **Alpha 1 now**, with 10–20 people Anne knows, for about 2 weeks. Test the solo loop and whether the city and Passport motivate or distract. Tell testers that pods and other people are samples. Unpause Supabase and apply the feedback SQL first.
3. **Backend round:** apply v2 to v8, connect accounts, pods, matching, lines, chat and the city game tables, and restrict the live channels to signed-in users.
4. **Alpha 2:** 30–50 people with real pods.
5. **Beta:** one paid cohort with a bootcamp, university club or programme, with someone handling reports within 24 hours.
6. **Public launch:** Lagos first.
7. **Measure** the share of sprints finished, weekly check-ins, and returns for a second sprint. Also measure how many people open the city and do shifts; if few do, shrink the city to a feature on Today.

---

## 15. Build history

Commits on the flow branches, oldest first:

| Commit | What it did |
|---|---|
| 7052ecc | Baseline from main |
| 8248fa9 | **Flow round 1:** one app, new onboarding and login, five tabs, consistent wording, rewritten Help and legal pages, sample content off |
| 41b7687 | **Round 2:** regional cities, art styles, torch, goals, pod matching preferences, town plan, witnesses, forum ads |
| c1abfd2 | Removed the fade behind the street and city top bar |
| bed074d | `?screens=1` review index, separate storage for sample modes, log out with local log-back-in |
| c2eef63 | After check-in: Change, next steps, pod card; home page link |
| 98e49fe | Live city presence with status, required city, bigger vehicle ads with pictures and video, likes and bio, Lamplighter |
| db56c1d | Passers-by in regional dress (later removed), real street names, house furnishing, Give back, timed shifts, lower prices, rock paper scissors (later removed) |
| 1ae674b | Focus torch, ledger, four tabs, Paystack (not live), logs earned only, travel, anchor checklist, reminders, event counts, SQL v2 |
| 0dd6d4a | Real volunteering and organisations, feed hide-filter |
| 2b37797 | **Round 3:** cuts, Hub, ads by age range, safety, bad-week fixes, Passport, SQL v3 |
| ed7b15d → e85dd89 | Passport redesigns, ending with the 5:3 ID card with a mantra |
| 598450e | Bigger town with civic buildings, Hub sharing from day one, logs for sharing, opportunity feed leads, SQL v4 |
| ac8772f | 48-block town with labels and staff, shifts, visas and rides, new goal areas, focus follows the theme |
| c24c0ae | White everywhere by default; black option on the landing page |
| d7179a1 | "Town" renamed to "City", tidy city controls, day and night landing hero, fireflies |
| 93d31a7 | Alpha feedback: sheet, check-in questions, alpha label, SQL v5 |
| 007c76f | Share by link with preview, after-focus screen, stamps on Me, Imposters back, pod-finding redesign, charter votes, SQL v6 |
| e9d33a5 | Full-screen game, games one tap away, forum-style feed, art styles removed |
| b7a2b9e | Sigil builder with spin and locks, 10 starter logs, firefly guide, SQL v7 |
| 2792067 | **Round A:** log out on Me, firefly moods, hosting replaces leasing, shared shift sessions |
| 070ece5 | **Round B:** the 84-block city, everyday places, time of day, weather, sound, city folk, bus, light mode |
| d278600 | **Round C:** quarters, City Key, daily card, Lighthouse, city projects, seasons |
| 9c5c1a5 | **Round D:** 50 colours, 20 patterns, emblem library |
| 279da5c | **Round E:** insect firefly, age range at signup, 16 localised cities, sound switches, busy city people with greetings and a helpful guard |
| 05ece49 | This product record |
| Round G | Torch that visibly splits and snaps with smoke; live ride windows with turbulence, signal stops and traffic; coach, train and plane on every land route; tickets for every trip, kept in the Passport |
| Round F | No ads (city notices and sponsored buildings, Paystack and SQL v8 for sponsorships), four launch cities with waitlists, no brand names on goals, onboarding without tabs or charter questions, getting-started list, calmer after-check-in, empty screens fixed, ••• menu, Messages into Pod, one District page, honest search |
| Round I | Pods renamed to Spaces, with a per-group word setting; care ladder (reminder, check-in, anchor, pause, welcome back), anchor-only struggle flags, welcome-back and stuck-help cards after check-in |
| Round K | Light-trail rides (time of day from the departure city, terrain by route, distractions per vehicle); torch for under 8 weeks, lamppost for 8+; 2-week first sprint; weekly milestones for 8+ weeks; recorded-sound slots with generated city sound off by default |
| Round L | Renamed from Phos to BePhos everywhere visible; home-page line: "Phos is Greek for light. BePhos means be the light" |
| Round J | Renamed from Entheos to Phos everywhere visible; the home-page line now says Phos is Greek for light |
| Round M | Ring-of-fire co-working screen and focus partner; seven torch colours and five heat steps timed to session length; city about three times busier with hourly resident statuses; clear Host role and custom district roles; house folded into the Passport as a home with lit windows and proof links; Hub notice removed; date bug from Round K fixed |
| Round H | Renamed to Entheos in every visible place (title, home page, menus, tickets, Passport, terms, invites, downloads); one line on the home page tells the meaning; Terms "Payments" rewritten for sponsorships |

---

## 16. Sources

External facts used in the decisions above:

- [ALN: digital age of consent for children (Nigeria Data Protection Act)](https://aln.africa/insight/privacy-please-digital-age-of-consent-for-children-series-6/)
- [UUBO: personal data of a minor](https://uubo.org/document/personal-data-of-a-minor-what-you-must-know)
- [Kennedys: Australia's social media ban for under-16s](https://www.kennedyslaw.com/en/thought-leadership/article/2026/australia-s-social-media-ban-for-under-16s)
- [CTV News: Instagram teen accounts](https://ctvnews.ca/sci-tech/instagram-makes-teen-accounts-private-as-pressure-mounts-on-the-app-to-protect-children-1.7041094)
- [IOL: Meta blocks 544,000 accounts under the Australian ban](https://iol.co.za/news/world/2026-01-12-meta-blocks-544000-accounts-as-australia-enforces-under-16-social-media-ban/)
- [Relevant Audience: Lagos court ruling on Meta ad-targeting consent](https://www.relevantaudience.com/meta/meta-nigeria-court-ad-targeting-consent-ruling/)
- [AdQuick: Lagos digital out-of-home advertising rates](https://www.adquick.com/dooh-advertising/lagos-ng)
- [Gazette: NDDC warns against fake scholarships](https://gazettengr.com/nddc-warns-nigerians-against-scammers-offering-fake-scholarships/)
- [game-icons.net](https://game-icons.net) (emblems, CC BY 3.0)
- [Meros (Wikipedia)](https://en.wikipedia.org/wiki/Meros), [Oku (Wikipedia)](https://en.wikipedia.org/wiki/Oku), [Oku, Cameroon (Wikipedia)](https://en.wikipedia.org/wiki/Oku,_Cameroon)
- [Mero app (App Store)](https://apps.apple.com/mx/app/mero-program%C4%83ri-online/id1411473472), [Meross vs Moes](https://smarthomecompared.com/brands/vs/meross-vs-moes)
