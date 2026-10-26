import { afterAll, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdir, writeFile } from "node:fs/promises";
import SavedReadings, { type SavedReading } from "@/components/lens-check/SavedReadings";
import AccountFrame from "@/components/lens-check/AccountFrame";
import AccountSignIn from "@/components/lens-check/AccountSignIn";
import { activeQuestionnaire } from "./content";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace() {}, refresh() {} }) }));
const results: SavedReading[] = [
  { token: "a".repeat(43), resultKind: "matched", archetypeId: activeQuestionnaire.archetypes[0].id, questionnaireVersion: activeQuestionnaire.version, createdAt: new Date("2026-10-25T12:00:00Z") },
  { token: "b".repeat(43), resultKind: "mixed", archetypeId: null, questionnaireVersion: activeQuestionnaire.version, createdAt: new Date("2026-10-24T12:00:00Z") },
  { token: "c".repeat(43), resultKind: "unclear", archetypeId: null, questionnaireVersion: activeQuestionnaire.version, createdAt: new Date("2026-10-23T12:00:00Z") },
  { token: "d".repeat(43), resultKind: "matched", archetypeId: "earlier-pattern", questionnaireVersion: "unavailable-edition", createdAt: new Date("2026-10-22T12:00:00Z") },
];

function Library({ children }: { children: React.ReactNode }) {
  return <div className="lc lc-account-page"><section className="lc-library"><nav className="lc-library-nav" aria-label="Your Mindset Test"><a href="/lens-check/my-results" aria-current="page">My results</a><a href="/lens-check/account">My account</a></nav>{children}</section></div>;
}

describe("saved-reading presentation", () => {
  it("keeps each dated edition distinct, including mixed outcomes, without changing the supplied history order", () => {
    const html = renderToStaticMarkup(<SavedReadings results={results} />);
    expect(html).toContain("4 saved readings");
    expect(html).toContain(activeQuestionnaire.archetypes[0].title);
    expect(html).toContain("A mix of patterns");
    expect(html).toContain("No single pattern stood out");
    expect(html.indexOf("25 October 2026")).toBeLessThan(html.indexOf("24 October 2026"));
    expect((html.match(/Open reading/g) || [])).toHaveLength(3);
    expect(html).not.toContain(`/lens-check/result?t=${results[3].token}`);
    expect(html).toContain("original content is currently unavailable");
  });
  it("provides a first-reading path without fake saved cards", () => {
    const html = renderToStaticMarkup(<SavedReadings results={[]} />);
    expect(html).toContain("Your first reading starts here");
    expect(html).not.toContain("Open reading");
    expect(html).toContain('href="/lens-check"');
  });
});

// Optional synthetic HTML for visual checks; never an application route or an
// authentication bypass, and never populated from a real user's database rows.
afterAll(async () => {
  if (process.env.LENS_CHECK_UI_SNAPSHOTS !== "true") return;
  const directory = "output/lens-check-account-qa";
  await mkdir(directory, { recursive: true });
  const fixtures = {
    history: <Library><SavedReadings results={results} /></Library>,
    "empty-history": <Library><SavedReadings results={[]} /></Library>,
    account: <div className="lc lc-account-page lc-sign-in-page"><AccountFrame signedIn><AccountSignIn signedIn passwordEnabled emailAddress="reader@example.invalid" /></AccountFrame></div>,
    "signed-out": <div className="lc lc-account-page lc-sign-in-page"><AccountFrame><AccountSignIn signedIn={false} passwordEnabled signedOut socialProviders={["google"]} /></AccountFrame></div>,
  };
  await Promise.all(Object.entries(fixtures).map(([name, component]) => writeFile(`${directory}/${name}.html`, renderToStaticMarkup(component))));
});
