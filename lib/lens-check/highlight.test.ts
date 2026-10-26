import { describe, expect, it } from "vitest";
import { highlightRuns } from "./highlight";

describe("highlightRuns", () => {
  it("marks phrases in order without changing the text", () => {
    const text = "I kept preparing because I did not feel ready to begin.";
    const runs = highlightRuns(text, ["did not feel ready", "kept preparing"]);
    expect(runs.map((run) => run.text).join("")).toBe(text);
    expect(runs.filter((run) => run.key).map((run) => run.text)).toEqual(["kept preparing", "did not feel ready"]);
  });

  it("ignores missing and overlapping phrases", () => {
    expect(highlightRuns("abc def", ["xyz", "abc", "bc"])).toEqual([
      { text: "abc", key: true },
      { text: " def", key: false },
    ]);
  });
});
