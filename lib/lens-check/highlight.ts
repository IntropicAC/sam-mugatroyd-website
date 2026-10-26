export type HighlightRun = { text: string; key: boolean };

// Splits a statement into plain and key-phrase runs. Phrases are matched
// exactly and in order of appearance; a phrase that isn't found is ignored
// (validateQuestionnaire reports it).
export function highlightRuns(text: string, phrases: string[] = []): HighlightRun[] {
  const spans = phrases
    .map((phrase) => ({ start: text.indexOf(phrase), length: phrase.length }))
    .filter((span) => span.start >= 0 && span.length > 0)
    .sort((a, b) => a.start - b.start);

  const runs: HighlightRun[] = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.start < cursor) continue; // overlapping phrase
    if (span.start > cursor) runs.push({ text: text.slice(cursor, span.start), key: false });
    runs.push({ text: text.slice(span.start, span.start + span.length), key: true });
    cursor = span.start + span.length;
  }
  if (cursor < text.length) runs.push({ text: text.slice(cursor), key: false });
  return runs;
}
