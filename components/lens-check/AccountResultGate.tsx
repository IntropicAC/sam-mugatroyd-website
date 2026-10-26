"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountResultGate({ token, signedIn }: { token: string; signedIn: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!signedIn) return;
    let active = true;
    void fetch(`/api/lens-check/responses/${token}/account`, { method: "POST" })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 401 ? "Please sign in again to save your reading." : "We couldn't save this reading. Try again in the browser where you completed it, within 24 hours.");
        if (active) {
          window.dispatchEvent(new Event("lens-check:results-updated"));
          router.refresh();
        }
      }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "We couldn't save your reading."); });
    return () => { active = false; };
  }, [signedIn, token, router, attempt]);
  const href = `/lens-check/account?returnTo=${encodeURIComponent(`/lens-check/result?t=${token}`)}`;
  return <section className="lc-unlock lc-account-gate space-y-4">
    {signedIn ? <>
      <p role="status">{error || "Saving your reading to your account…"}</p>
      {error && <button className="btn" onClick={() => { setError(""); setAttempt((value) => value + 1); }}>Try again</button>}
    </> : <>
      <p className="eyebrow">A little more clarity</p>
      <h2>Keep your perspective.</h2>
      <p>Sign in to read your full free reading and give it a home in My results. Come back to it whenever you need a moment to reflect.</p>
      <Link className="btn full" href={href}>Sign in and save my reading</Link>
      <p className="text-sm">Complete sign-in in this browser within 24 hours. Account emails are separate from marketing.</p>
    </>}
  </section>;
}
