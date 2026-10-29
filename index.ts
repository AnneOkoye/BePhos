// Reads a public web page and returns its title, description, picture and site name, for the Hub's link previews.
// Safety: https only, no IP addresses or local names, 3 redirects at most, 5 seconds, first 400 KB only.
const SITE = Deno.env.get("SITE_URL") ?? "https://bephos.vercel.app";
const cors = { "Access-Control-Allow-Origin": SITE, "Access-Control-Allow-Headers": "authorization, content-type, apikey", "Access-Control-Allow-Methods": "GET, OPTIONS" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" } });

export function safeUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.username || u.password || (u.port && u.port !== "443")) return null;
    const h = u.hostname.toLowerCase();
    if (!h.includes(".") || h.endsWith(".local") || h.endsWith(".internal") || h === "localhost") return null;
    if (/^\d+(\.\d+){3}$/.test(h) || h.includes(":") || h.startsWith("[")) return null; // IP literals
    return u;
  } catch { return null; }
}

// Also refuse names that point at private addresses (best effort: a name can change between this check and the fetch).
export function privateIp(ip: string) {
  return /^(10\.|127\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/.test(ip)
    || /^(::1?$|f[cd]|fe80|::ffff:)/i.test(ip);
}
async function pointsPrivate(host: string) {
  for (const t of ["A", "AAAA"] as const) {
    try { if ((await Deno.resolveDns(host, t)).some(privateIp)) return true; } catch { /* no record of that type */ }
  }
  return false;
}

const ent = (s: string) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/\s+/g, " ").trim();
export function readMeta(html: string, base: URL) {
  const meta = (k: string) => {
    const re1 = new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]*content=["']([^"']*)["']`, "i");
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${k}["']`, "i");
    const m = html.match(re1) || html.match(re2); return m ? ent(m[1]) : "";
  };
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  let image = meta("og:image") || meta("twitter:image");
  try { if (image) image = new URL(image, base).href; } catch { image = ""; }
  return {
    title: (meta("og:title") || meta("twitter:title") || (t ? ent(t[1]) : "")).slice(0, 200),
    description: (meta("og:description") || meta("description")).slice(0, 300),
    image: image.startsWith("https://") ? image : "",
    site: (meta("og:site_name") || base.hostname.replace(/^www\./, "")).slice(0, 80),
  };
}

if (import.meta.main) Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  let u = safeUrl(new URL(req.url).searchParams.get("url") ?? "");
  if (!u) return json({ error: "Only public https links" }, 400);
  try {
    let r: Response | null = null;
    for (let hop = 0; hop < 4; hop++) {
      if (await pointsPrivate(u.hostname)) return json({ error: "Only public https links" }, 400);
      r = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(5000), headers: { "User-Agent": "BePhosLinkPreview/1.0", Accept: "text/html" } });
      if (r.status >= 300 && r.status < 400 && r.headers.get("location")) { const next = safeUrl(new URL(r.headers.get("location")!, u).href); if (!next) return json({ error: "Redirect not allowed" }, 400); u = next; continue; }
      break;
    }
    if (!r || !r.ok || !(r.headers.get("content-type") ?? "").includes("text/html")) return json({ error: "Not a web page" }, 422);
    const reader = r.body!.getReader(); let html = "", got = 0; const dec = new TextDecoder();
    while (got < 400_000) { const { done, value } = await reader.read(); if (done) break; got += value.length; html += dec.decode(value, { stream: true }); if (/<\/head>/i.test(html)) break; }
    try { reader.cancel(); } catch { /* ignore */ }
    return json({ url: u.href, ...readMeta(html, u) });
  } catch { return json({ error: "Could not read that page" }, 502); }
});
