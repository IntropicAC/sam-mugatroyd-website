import Link from "next/link";
import type { ReactNode } from "react";

export function AccountArtwork() {
  return <svg className="lc-account-art" viewBox="0 0 420 280" fill="none" aria-hidden="true">
    <circle cx="205" cy="138" r="102" stroke="currentColor" opacity=".18" />
    <circle cx="205" cy="138" r="75" stroke="currentColor" opacity=".28" />
    <circle cx="205" cy="138" r="48" stroke="currentColor" opacity=".45" />
    <path d="M28 238c74-65 111 11 174-63s110-86 189-99" stroke="currentColor" strokeWidth="1.5" opacity=".7" />
    <path d="M65 262c59-43 100 11 149-49s95-83 166-86" stroke="currentColor" opacity=".25" />
    <circle cx="267" cy="58" r="13" fill="#D9B98A" />
    <circle cx="202" cy="175" r="4" fill="currentColor" />
    <path d="M205 22v18m0 196v18M89 138h18m196 0h18" stroke="currentColor" opacity=".35" />
  </svg>;
}

export default function AccountFrame({ signedIn = false, children }: { signedIn?: boolean; children: ReactNode }) {
  return <div className="lc-account-shell lc-account-centred">
    <section className="lc-account-panel" aria-label={signedIn ? "Your account" : "Sign in"}>{children}</section>
    <p className="lc-account-footer"><Link href="/lens-check">Back to the Mindset Test</Link><span aria-hidden="true"> · </span><Link href="/privacy">Privacy policy</Link></p>
  </div>;
}
