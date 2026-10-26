// Sam's archetype descriptions are plain paragraphs with *italic* lines.
// The first paragraph is the one-liner shown before email; the rest is the
// gated reading.

export function descriptionParagraphs(markdown: string) {
  return markdown
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function stripEmphasis(text: string) {
  return text.replace(/\*([^*]+)\*/g, "$1");
}

export function splitDescription(markdown: string) {
  const [first = "", ...body] = descriptionParagraphs(markdown);
  return { oneLiner: stripEmphasis(first), body };
}

export type TextRun = { text: string; em: boolean };

// "*a* b" -> [{ text: "a", em: true }, { text: " b", em: false }]
export function emphasisRuns(paragraph: string): TextRun[] {
  return paragraph
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((part) =>
      part.length > 2 && part.startsWith("*") && part.endsWith("*")
        ? { text: part.slice(1, -1), em: true }
        : { text: part, em: false },
    );
}
