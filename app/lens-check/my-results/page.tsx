import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { accountsEnabled } from "@/lib/lens-check/account-policy";
import { listAccountResults, verifiedPrincipal } from "@/lib/lens-check/accounts";
import SavedReadings from "@/components/lens-check/SavedReadings";
import { AccountArtwork } from "@/components/lens-check/AccountFrame";

export const metadata: Metadata = { title: "My Mindset Test results", robots: { index: false, follow: false }, referrer: "no-referrer" };

async function Results() {
  await connection();
  if (!accountsEnabled()) return <p>Saved results are being prepared.</p>;
  const principal = await verifiedPrincipal().catch(() => undefined);
  if (principal === undefined) return <p>Your readings are temporarily unavailable. Please try again shortly.</p>;
  if (!principal) return <div className="lc-library-empty"><AccountArtwork /><p className="eyebrow">Your Mindset Test library</p><h1>Your readings, all in one place.</h1><p>Sign in to revisit your saved readings, or take your first Mindset Test and start with where you are now.</p><Link className="btn" href="/lens-check/account?returnTo=%2Flens-check%2Fmy-results">Sign in to see your readings <span aria-hidden="true">→</span></Link></div>;
  const results = await listAccountResults(principal).catch(() => null);
  if (!results) return <p>Your readings are temporarily unavailable. Please try again shortly.</p>;
  return <SavedReadings results={results} />;
}

export default function MyResultsPage() {
  return <div className="lc lc-account-page"><section className="lc-library" data-clarity-mask="true">
    <nav className="lc-library-nav" aria-label="Your Mindset Test"><Link href="/lens-check/my-results" aria-current="page">My results</Link><Link href="/lens-check/account">My account</Link></nav>
    <Suspense fallback={<div className="lc-account-loading" role="status">Gathering your readings…</div>}><Results /></Suspense>
  </section></div>;
}
