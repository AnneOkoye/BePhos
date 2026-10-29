# Voice service test: LiveKit vs Daily

A small page for comparing the two voice services with real people in different countries before we build voice into Together. It is separate from the app.

## Files

| File | What it is |
|---|---|
| `voice-test.html` | The test page, at `/voice-test.html`. Voice only. Mic starts off, hold to talk. Measures delay, jitter, lost audio, route and (LiveKit only) server region. Results are kept in the tester's browser until they copy or download them. |
| `api/voice-token.js` | A Vercel function that gives out 2-hour join tokens. It checks a test passcode so strangers can't use your free minutes. |

Safety is enforced by each service's servers, not the page: the LiveKit token only allows publishing the microphone, and the Daily token only allows sending audio, in a private room capped at 20 people. Nothing is recorded.

## Set up (about 20 minutes)

1. **LiveKit Cloud.** Create a free account and a project. From the project's settings, copy the server URL (starts with `wss://`), the API key and the API secret. The free plan includes 5,000 participant-minutes a month and stops new joins when they run out.
2. **Daily.** Create a free account. From the dashboard's developer section, copy the API key. The free allowance is 10,000 participant-minutes a month. The test room is created automatically the first time someone joins.
3. **Vercel.** In the `bephos` project, open Settings › Environment Variables and add:
   - `VOICE_TEST_CODE`: a passcode you'll give testers, for example a short word and number
   - `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
   - `DAILY_API_KEY`
4. Upload `voice-test.html` to the root of the repo and `api/voice-token.js` into an `api` folder, then let Vercel redeploy.
5. Open `https://<your-domain>/voice-test.html` and try it yourself on two devices first.

Never put the keys in the page or in GitHub. They only go in Vercel's environment variables.

## The test

Aim for at least two people per run, in different places, joining at the same time. Each run: about 10 minutes on Service A, then 10 on Service B, taking turns to talk.

Suggested spread, so the result reflects people outside Nigeria too:

| Where | Connections to try |
|---|---|
| Lagos and one other Nigerian city | Wi-Fi, MTN, Airtel |
| Ghana or Kenya | Mobile data |
| South Africa | Any |
| UK or Europe | Wi-Fi and mobile |
| US or Canada | Any |
| India or South-East Asia | Mobile data |

Mixed pairs matter most, for example Lagos with London, or Nairobi with New York, because that is what a global cohort will feel like.

## Reading the results

- **Delay** under 150 ms feels natural; over 300 ms people talk over each other.
- **Jitter** under 30 ms is good.
- **Lost audio** under 1% is good; over 3% sounds choppy.
- **Route: relayed** means the call had to go through a relay server, usually because of a strict network. It works, but adds delay.
- The 1 to 5 rating is the tie-breaker. If the numbers are close, pick the one that sounded better.

Each tester's "Copy results" gives one line per run. Paste them all into one sheet and compare the medians per service and region.

## Not tested

The page was tested with stand-ins for both services in a browser here, including real WebRTC measurements on a local connection. It has not connected to the real LiveKit or Daily services, because that needs your accounts and keys.
