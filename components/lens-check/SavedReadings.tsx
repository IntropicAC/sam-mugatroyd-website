import Image from "next/image";
import Link from "next/link";
import { getQuestionnaire } from "@/lib/lens-check/content";
import { getArchetype } from "@/lib/lens-check/scoring";
import { splitDescription } from "@/lib/lens-check/description";
import { MASCOTS, mascotSrc } from "@/lib/lens-check/mascots";
import { AccountArtwork } from "./AccountFrame";

// Presentation receives only owned-history metadata, never answers or leads.
export type SavedReading = {
  token: string; createdAt: Date; questionnaireVersion: string; resultKind: string; archetypeId: string | null;
};

export default function SavedReadings({ results }: { results: SavedReading[] }) {
  return <>
    <div className="lc-library-heading">
      <div><p className="eyebrow">Your own perspective</p><h1>My results</h1><p>A place to pause, look back and notice what resonates. Each reading is a reflection of that moment in your life.</p></div>
      <Link href="/lens-check" className="btn ghost">Take a new Mindset Test <span aria-hidden="true">↗</span></Link>
    </div>
    {results.length ? <>
      <div className="lc-library-count"><span>{results.length} saved {results.length === 1 ? "reading" : "readings"}</span><span>Most recent first</span></div>
      <ul className="lc-reading-grid">{results.map((result) => {
        const content = getQuestionnaire(result.questionnaireVersion);
        const archetype = content ? getArchetype(content, result.archetypeId) : null;
        const title = result.resultKind === "matched" ? archetype?.title || "Your reading" : result.resultKind === "mixed" ? "A mix of patterns" : result.resultKind === "unclear" ? "No single pattern stood out" : "A moment to reflect";
        const summary = !content ? "The original content for this edition is currently unavailable. Your reading record is still saved." : result.resultKind === "matched" && archetype ? splitDescription(archetype.descriptionMarkdown).oneLiner : result.resultKind === "mixed" ? "More than one pattern showed up in your answers. Revisit the different parts of your picture." : result.resultKind === "unclear" ? "Your answers didn't point to one clear pattern. There is still room for reflection." : "There weren't enough answers for a clear pattern this time. You can return whenever you're ready.";
        const mascot = result.resultKind === "matched" && result.archetypeId ? MASCOTS[result.archetypeId] : null;
        return <li key={result.token} className="lc-reading-card">
          <div className="lc-reading-card-art" aria-hidden="true">{mascot ? <Image src={mascotSrc(mascot)} alt="" width={140} height={164} sizes="140px" /> : <AccountArtwork />}</div>
          <div className="lc-reading-card-body">
            <div className="lc-reading-card-meta"><time dateTime={result.createdAt.toISOString()}>{result.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" })}</time><span>Free reading saved</span></div>
            <h2>{title}</h2><p>{summary}</p>
            <div className="lc-reading-card-bottom"><span>Edition {result.questionnaireVersion}</span>{content ? <Link prefetch={false} href={`/lens-check/result?t=${result.token}`}>Open reading <span aria-hidden="true">↗</span></Link> : <p>This reading&apos;s original content is currently unavailable.</p>}</div>
          </div>
        </li>;
      })}</ul>
      {results.length === 50 && <p className="lc-library-note">Showing your latest 50 readings.</p>}
    </> : <div className="lc-library-empty"><AccountArtwork /><p className="eyebrow">Your next moment of clarity</p><h2>Your first reading starts here.</h2><p>Take the Mindset Test at your own pace. Your free reading will be saved here after you finish and sign in.</p><Link className="btn" href="/lens-check">Take the Mindset Test <span aria-hidden="true">→</span></Link></div>}
    <p className="lc-library-note">Your readings are personal to your account. A new Mindset Test adds a reading here and keeps your earlier ones in place.</p>
  </>;
}
