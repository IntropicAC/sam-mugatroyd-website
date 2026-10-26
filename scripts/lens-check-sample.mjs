// Sample data for trying out the Mindset Test dashboard locally.
//
//   npm run lens:sample          sends 30 made-up visitors through the real
//                                save/unlock/feedback API (dev server must be running)
//   npm run lens:sample:remove   deletes every sample response and sample person
//
// Samples are marked with utm_source "sample" and emails ending
// @sample.lenscheck.test, so removal never touches real data.

import fs from "node:fs";

const BASE = process.env.LENS_CHECK_SAMPLE_BASE || "http://localhost:3000";
const SAMPLE_EMAIL_DOMAIN = "@sample.lenscheck.test";
const COUNT = 30;
const NAMES = ["Alex", "Jo", "Priya", "Tom", "Ellie", "Sam", "Nadia", "Chris", "Leah", "Ollie", "Maya", "Dan"];
const ARTICLES = ["how-to-stop-overthinking", "how-do-i-stop-people-pleasing", "how-to-recover-from-burnout", "why-do-i-feel-lost-in-life", null, null];

function loadContent() {
  const ts = fs.readFileSync("lib/lens-check/content/index.ts", "utf8");
  const contentFile = ts.match(/import \{ \w+ \} from "\.\/([\w-]+)"/)?.[1];
  const source = fs.readFileSync(`lib/lens-check/content/${contentFile}.ts`, "utf8");
  const json = source.match(/import handoff from "\.\/([\w.-]+\.json)"/)?.[1];
  if (!json) throw new Error(`Couldn't find the questionnaire JSON behind lib/lens-check/content/${contentFile}.ts`);
  return JSON.parse(fs.readFileSync(`lib/lens-check/content/${json}`, "utf8"));
}

let seed = 47;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (list) => list[Math.floor(rand() * list.length)];
const clamp = (value) => Math.max(0, Math.min(4, Math.round(value)));

function makeVisitor(content) {
  // Each sample visitor strongly fits zero to two archetypes and answers the
  // rest around their own general level, skipping about 6% of statements.
  const count = rand() < 0.15 ? 0 : rand() < 0.35 ? 2 : 1;
  const fits = Array.from({ length: count }, () => pick(content.archetypes));
  const keyed = new Map();
  for (const archetype of fits) for (const marker of archetype.markers) keyed.set(marker.questionId, marker.reverse);
  const base = 1 + rand() * 1.6;
  const answers = {};
  const missing = {};
  for (const q of content.questions) {
    if (rand() < 0.06) {
      answers[q.id] = null;
      missing[q.id] = rand() < 0.7 ? "not_applicable" : "skipped";
      continue;
    }
    const reverse = keyed.get(q.id);
    const noise = (rand() - 0.5) * 1.6;
    answers[q.id] = clamp(reverse === undefined ? base + noise : reverse ? 0.7 + noise : 3.3 + noise);
  }
  const fitIds = new Set(fits.map((archetype) => archetype.id));
  const followupAnswer = (id) => {
    const supports = content.clarificationQuestions.find((q) => q.id === id)?.supportsArchetypeId;
    return clamp((fitIds.has(supports) ? 3.3 : base) + (rand() - 0.5) * 1.6);
  };
  return { answers, missing, followupAnswer };
}

async function post(path, body, i) {
  const res = await fetch(BASE + path, {
    method: "POST",
    // A different address per sample visitor so local rate limits don't kick in.
    headers: { "Content-Type": "application/json", "x-forwarded-for": `10.47.0.${i + 1}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} ${res.status}: ${data.error ?? "unknown error"}`);
  return data;
}

async function add() {
  const content = loadContent();
  let unlocked = 0;
  for (let i = 0; i < COUNT; i++) {
    const from = pick(ARTICLES);
    const visitor = makeVisitor(content);
    const body = {
      version: content.questionnaireVersion,
      answers: visitor.answers,
      missing: visitor.missing,
      source: { ...(from ? { from } : {}), utm: { utm_source: "sample" } },
    };
    let data = await post("/api/lens-check/responses", body, i);
    if (data.followups) {
      for (const followup of data.followups) body.answers[followup.id] = visitor.followupAnswer(followup.id);
      data = await post("/api/lens-check/responses", body, i);
    }
    const { token, preview } = data;
    if (rand() < 0.55) {
      const name = pick(NAMES);
      await post(`/api/lens-check/responses/${token}/claim`, {
        email: `${name.toLowerCase()}.${i + 1}${SAMPLE_EMAIL_DOMAIN}`,
        firstName: rand() < 0.8 ? name : "",
        followUpConsent: rand() < 0.45,
      }, i);
      unlocked += 1;
      if (rand() < 0.7) await post(`/api/lens-check/responses/${token}/feedback`, { rating: pick(["yes", "yes", "somewhat", "no"]) }, i);
    }
    process.stdout.write(`  ${String(i + 1).padStart(2)}. ${preview.archetypes.map((a) => a.title).join(" / ") || preview.status}\n`);
  }
  console.log(`\nAdded ${COUNT} sample responses (${unlocked} unlocked). Open ${BASE}/lens-check/admin to see them.`);
}

async function remove() {
  try { process.loadEnvFile(".env.local"); } catch { /* use shell environment */ }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL);
  const responses = await sql`delete from lens_check_responses where source->'utm'->>'utm_source' = 'sample' returning id`;
  const leads = await sql`delete from lens_check_leads where email like ${"%" + SAMPLE_EMAIL_DOMAIN} returning id`;
  console.log(`Removed ${responses.length} sample responses and ${leads.length} sample people. Real data was not touched.`);
}

const command = process.argv[2];
(command === "remove" ? remove() : add()).catch((error) => {
  console.error(`\n${error.message}`);
  if (command !== "remove") console.error(`Is the dev server running at ${BASE}? Start it with: npm run dev`);
  process.exit(1);
});
