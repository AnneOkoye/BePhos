// Voice provider test: issues short-lived join tokens for LiveKit Cloud or Daily.
// For the comparison test only (voice-test.html). Not used by the app.
//
// Environment variables (Vercel > Project > Settings > Environment Variables):
//   VOICE_TEST_CODE     a passcode you give to testers, so strangers can't use your minutes
//   LIVEKIT_URL         wss://<your-project>.livekit.cloud
//   LIVEKIT_API_KEY     from LiveKit Cloud > Settings > Keys
//   LIVEKIT_API_SECRET
//   DAILY_API_KEY       from the Daily dashboard > Developers
//
// Safety, enforced by the providers' servers rather than the page:
//   - LiveKit: the token only allows publishing the microphone (no camera, no screen share).
//   - Daily: the token only allows sending audio; the room is private and capped at 20 people.
// Nothing is recorded.

const crypto = require('crypto');

const ROOM = 'bephos-voice-test';
const TTL_SECONDS = 2 * 60 * 60; // tokens last 2 hours

function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function liveKitToken(identity, name) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    iss: process.env.LIVEKIT_API_KEY,
    sub: identity,
    name,
    nbf: now - 10,
    exp: now + TTL_SECONDS,
    video: {
      room: ROOM,
      roomJoin: true,
      canSubscribe: true,
      canPublish: true,
      canPublishData: false,
      canPublishSources: ['microphone'],
    },
  };
  const body = b64url(JSON.stringify(header)) + '.' + b64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', process.env.LIVEKIT_API_SECRET).update(body).digest('base64')
    .replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return body + '.' + sig;
}

async function daily(path, init) {
  const r = await fetch('https://api.daily.co/v1' + path, {
    ...init,
    headers: { Authorization: 'Bearer ' + process.env.DAILY_API_KEY, 'Content-Type': 'application/json' },
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

async function dailyToken(name) {
  let room = await daily('/rooms/' + ROOM, { method: 'GET' });
  if (room.status === 404) {
    room = await daily('/rooms', {
      method: 'POST',
      body: JSON.stringify({
        name: ROOM,
        privacy: 'private',
        properties: { max_participants: 20, start_video_off: true, enable_screenshare: false, enable_chat: false },
      }),
    });
  }
  if (!room.ok) throw new Error('Daily room: ' + (room.data.info || room.data.error || room.status));
  const now = Math.floor(Date.now() / 1000);
  const tok = await daily('/meeting-tokens', {
    method: 'POST',
    body: JSON.stringify({
      properties: { room_name: ROOM, user_name: name, exp: now + TTL_SECONDS, start_video_off: true, permissions: { canSend: ['audio'] } },
    }),
  });
  if (!tok.ok) throw new Error('Daily token: ' + (tok.data.info || tok.data.error || tok.status));
  return { url: room.data.url, token: tok.data.token };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  const code = String(body.code || '');
  const expected = process.env.VOICE_TEST_CODE || '';
  if (!expected || code.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(code), Buffer.from(expected))) {
    return res.status(401).json({ error: 'That passcode isn’t right.' });
  }
  const name = String(body.name || '').toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 12) || 'TESTER';
  const identity = name + '-' + crypto.randomBytes(3).toString('hex');
  try {
    if (body.provider === 'livekit') {
      if (!process.env.LIVEKIT_URL || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) throw new Error('LiveKit keys are not set on the server.');
      return res.status(200).json({ provider: 'livekit', url: process.env.LIVEKIT_URL, token: liveKitToken(identity, name), room: ROOM, name });
    }
    if (body.provider === 'daily') {
      if (!process.env.DAILY_API_KEY) throw new Error('The Daily key is not set on the server.');
      const t = await dailyToken(name);
      return res.status(200).json({ provider: 'daily', url: t.url, token: t.token, room: ROOM, name });
    }
    return res.status(400).json({ error: 'Choose livekit or daily.' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Something went wrong.' });
  }
};

module.exports._liveKitToken = liveKitToken; // for local tests
