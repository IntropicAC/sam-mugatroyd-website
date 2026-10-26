// Scores ChatGPT blind-sort runs against key.json, using the decision rule
// fixed in the key before any results came back.
// Usage: node docs/lens-check-blind-sort/score.mjs results/*.csv
// Each file is one run's CSV (ids S.. = prompt 1, T.. = prompt 2).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const key = JSON.parse(fs.readFileSync(path.join(here, "key.json"), "utf8"));
const byId = new Map(key.statements.map((s) => [s.id, s]));
const title = (letter) => key.letters[letter]?.title ?? (letter === "X" ? "none" : `?${letter}`);

function parseCsv(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const cells = [];
    let cell = "", quoted = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (quoted) {
        if (c === '"' && line[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') quoted = false;
        else cell += c;
      } else if (c === '"') quoted = true;
      else if (c === ",") { cells.push(cell); cell = ""; }
      else cell += c;
    }
    cells.push(cell);
    if (/^[ST]\d\d$/.test(cells[0]?.trim())) rows.push(cells.map((x) => x.trim()));
  }
  return rows.map(([id, best, direction, also, confidence, reason]) => ({
    id, best: best.toUpperCase(), direction: direction.toLowerCase(), also, confidence, reason,
  }));
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node score.mjs <run1.csv> [run2.csv ...]");
  process.exit(1);
}

// tally[prompt file][q] = list of { correct, best, directionOk }
const tally = {};
const control = {};
for (const file of files) {
  const rows = parseCsv(fs.readFileSync(file, "utf8"));
  const prompts = new Set(rows.map((r) => byId.get(r.id)?.prompt).filter(Boolean));
  if (prompts.size !== 1) throw new Error(`${file}: expected rows from one prompt, found ${[...prompts].join(", ") || "none"}`);
  const prompt = [...prompts][0];
  const expected = key.statements.filter((s) => s.prompt === prompt).length;
  if (rows.length !== expected) console.warn(`${file}: ${rows.length} rows, expected ${expected}`);
  for (const row of rows) {
    const s = byId.get(row.id);
    const hit = s.intended.find((m) => m.letter === row.best);
    const result = { correct: Boolean(hit), best: row.best, directionOk: hit ? hit.direction === row.direction : null, reason: row.reason };
    if (s.questioned) ((tally[prompt] ??= {})[s.q] ??= []).push(result);
    else ((control[file] ??= { right: 0, n: 0 }), control[file].n++, (control[file].right += result.correct ? 1 : 0));
  }
}

console.log("Control: unchanged statements placed under an intended archetype");
let controlRight = 0, controlN = 0;
for (const [file, c] of Object.entries(control)) {
  console.log(`  ${path.basename(file)}: ${c.right}/${c.n} (${Math.round((100 * c.right) / c.n)}%)`);
  controlRight += c.right;
  controlN += c.n;
}
const controlOk = controlRight / controlN >= 0.7;
console.log(`  Overall ${Math.round((100 * controlRight) / controlN)}%: ${controlOk ? "reliable enough to use (70%+)" : "BELOW 70%, so this check can't settle anything"}\n`);

const qs = [...new Set(key.statements.filter((s) => s.questioned).map((s) => s.q))].sort();
const summary = (list = []) => {
  const right = list.filter((r) => r.correct).length;
  const placed = list.map((r) => title(r.best)).join(", ");
  return { right, runs: list.length, text: `${right}/${list.length} right (placed: ${placed || "no runs"})` };
};
console.log("Questioned statements");
for (const q of qs) {
  const s = key.statements.find((x) => x.q === q && x.source === "sam");
  const intended = s.intended.map((m) => `${key.letters[m.letter].title}${m.direction === "opposite" ? " (opposite)" : ""}`).join(" / ");
  const sam = summary(tally["prompt-1-sam.md"]?.[q]);
  const rewrite = summary(tally["prompt-2-rewrites.md"]?.[q]);
  const verdict = !controlOk
    ? "no verdict (control too low)"
    : sam.runs && sam.right / sam.runs >= 2 / 3
      ? "critique WITHDRAWN: Sam's version sorts correctly"
      : rewrite.runs && rewrite.right / rewrite.runs > sam.right / Math.max(sam.runs, 1)
        ? "critique SUPPORTED: rewrite sorts correctly more often"
        : "unresolved: neither version sorts clearly better";
  console.log(`\n${q}, written for ${intended}`);
  console.log(`  Sam's:   ${sam.text}`);
  console.log(`  Rewrite: ${rewrite.text}`);
  console.log(`  -> ${verdict}`);
}
