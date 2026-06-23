'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import GoogleAnalytics from "./GoogleAnalytics";
import MicrosoftClarity from "./MicrosoftClarity";

const STORAGE_KEY = "p47-cookie-consent";

type Consent = "accepted" | "declined";

export default function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "accepted" || stored === "declined") {
          setConsent(stored);
        }
      } catch {
        // localStorage may be unavailable in restricted browsing modes.
      }
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const choose = (value: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ignore write failures; the user's current choice still applies.
    }
    setConsent(value);
  };

  if (!ready) {
    return null;
  }

  return (
    <>
      {consent === "accepted" && (
        <>
          <GoogleAnalytics />
          <MicrosoftClarity />
        </>
      )}

      {consent === null && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-cream/95 px-5 py-4 shadow-[0_-18px_50px_-30px_rgba(26,24,20,0.55)] backdrop-blur md:px-8"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl font-body text-sm leading-relaxed text-charcoal-mid">
              Help improve the site by allowing anonymous analytics cookies. They
              show which pages people use and which content is helpful.{" "}
              <Link
                href="/cookies"
                className="underline underline-offset-2 hover:text-charcoal"
              >
                Cookie Policy
              </Link>
              .
            </p>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => choose("declined")}
                className="inline-flex min-h-11 items-center justify-center border border-border px-5 py-3 font-body text-sm font-medium tracking-wide text-charcoal-mid transition-colors duration-300 hover:border-charcoal hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green sm:min-w-40"
              >
                Continue without
              </button>
              <button
                type="button"
                onClick={() => choose("accepted")}
                className="inline-flex min-h-12 items-center justify-center bg-green px-8 py-3.5 font-body text-base font-medium tracking-wide text-cream transition-colors duration-300 hover:bg-green-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green sm:min-w-44"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
