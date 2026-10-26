import { createRateLimiter, getClientIp } from "@/lib/api/request-guards";
import { activeQuestionnaire } from "@/lib/lens-check/content";
import { parseJourney } from "@/lib/lens-check/journey-policy";
import { recordJourney, withdrawJourney } from "@/lib/lens-check/journeys";
import { parseResponseSource } from "@/lib/lens-check/api";

const limit = createRateLimiter({ windowMs: 60000, max: 100 });
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex", "Referrer-Policy": "no-referrer" };
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return new Response(null, { status: 403, headers });
  if (!limit(getClientIp(request)).allowed) return new Response(null, { status: 429, headers });
  // Bound the actual body, including requests that omit Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400, headers });
  const decoder = new TextDecoder();
  let text = "", size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 4096) { await reader.cancel(); return new Response(null, { status: 413, headers }); }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
  } catch { return new Response(null, { status: 400, headers }); }
  finally { reader.releaseLock(); }
  let raw;
  try { raw = JSON.parse(text); } catch { return new Response(null, { status: 400, headers }); }
  try {
    if (raw?.withdraw === true && typeof raw.secret === "string" && /^[0-9a-f-]{36}$/i.test(raw.secret)) {
      await withdrawJourney(raw.secret);
      return new Response(null, { status: 204, headers });
    }
    const packet = parseJourney(raw, activeQuestionnaire);
    if (!packet) return new Response(null, { status: 400, headers });
    const source = parseResponseSource(raw.source);
    // Campaign labels only, never arbitrary URLs, email addresses, or free text.
    if (source?.utm) for (const [key, value] of Object.entries(source.utm)) {
      if (!/^[a-z0-9_-]{1,64}$/i.test(value)) delete source.utm[key as keyof typeof source.utm];
    }
    await recordJourney(packet, source);
    return new Response(null, { status: 204, headers });
  } catch {
    // Reporting must never prevent questionnaire completion.
    return Response.json({ error: "Progress reporting is unavailable." }, { status: 503, headers });
  }
}
