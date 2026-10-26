"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/lens-check/auth-client";
import { MASCOTS, mascotSrc } from "@/lib/lens-check/mascots";
import styles from "./AccountNavigation.module.css";

function UserIcon() {
  return <svg className={styles.userIcon} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg>;
}

export default function AccountNavigation({ light = false, mobileMenu = false, onNavigate }: {
  light?: boolean;
  mobileMenu?: boolean;
  onNavigate?: () => void;
}) {
  const { data: session, isPending } = authClient.useSession();
  const signedIn = Boolean(session?.user?.emailVerified);
  const userId = signedIn ? session?.user?.id : undefined;
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [savedResults, setSavedResults] = useState<{ userId: string; hasResults: boolean; archetypeId: string | null } | null>(null);
  const hasResults = signedIn && savedResults?.userId === userId && savedResults?.hasResults;
  const mascot = hasResults && savedResults?.archetypeId ? MASCOTS[savedResults.archetypeId] : null;

  useEffect(() => {
    if (!userId || isPending) return;
    const controller = new AbortController();
    async function refreshResults() {
      try {
        const response = await fetch("/api/lens-check/my-results", { cache: "no-store", signal: controller.signal });
        const data = response.ok ? await response.json() : null;
        const results = Array.isArray(data?.results) ? data.results : [];
        const latest = results[0];
        const archetypeId = latest?.resultKind === "matched" && typeof latest.archetypeId === "string" && Object.hasOwn(MASCOTS, latest.archetypeId)
          ? latest.archetypeId : null;
        if (!controller.signal.aborted) {
          setSavedResults({ userId: userId!, hasResults: results.length > 0, archetypeId });
        }
      } catch {
        if (!controller.signal.aborted) setSavedResults({ userId: userId!, hasResults: false, archetypeId: null });
      }
    }
    void refreshResults();
    window.addEventListener("lens-check:results-updated", refreshResults);
    return () => {
      controller.abort();
      window.removeEventListener("lens-check:results-updated", refreshResults);
    };
  }, [userId, isPending, pathname]);

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign-out failed");
      setSavedResults(null);
      onNavigate?.();
      router.replace("/lens-check/account?status=signed-out");
      router.refresh();
    } catch {
      setError("Couldn't sign out. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return <div className={`${styles.accountNav} ${light ? styles.light : ""} ${mobileMenu ? styles.mobileMenu : ""}`}>
    {hasResults && <Link href="/lens-check/my-results" onClick={onNavigate}
      className={`${styles.link} ${styles.resultsLink}`}>
      My results
    </Link>}
    {isPending ? <span aria-live="polite" className={styles.link}>Account…</span> : signedIn ? <>
      <Link className={`${styles.link} ${styles.accountLink} ${mascot ? styles.archetypeLink : ""}`} href="/lens-check/account" aria-label="My account" title={mascot ? "My account · Your latest archetype" : "My account"} onClick={onNavigate}>
        {mascot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.archetypeIcon} src={mascotSrc(mascot)} width={36} height={36} alt="" />
        ) : <UserIcon />}
        {mobileMenu && "My account"}
      </Link>
      <button type="button" className={styles.action} disabled={busy} onClick={signOut}>{busy ? "Signing out…" : "Sign out"}</button>
    </> : <Link className={styles.link} href="/lens-check/account?returnTo=%2Flens-check%2Fmy-results" onClick={onNavigate}><UserIcon />Sign in</Link>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
  </div>;
}
