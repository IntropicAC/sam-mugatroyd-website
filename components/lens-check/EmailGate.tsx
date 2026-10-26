'use client';

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { trackLensCheck } from "@/lib/lens-check/analytics";
import { Icon } from "./visuals";

export default function EmailGate({ token, bookingUrl }: { token: string; bookingUrl: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter an email address like name@example.com so we can send your reading.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      const response = await fetch(`/api/lens-check/responses/${token}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), firstName: firstName.trim(), followUpConsent: followUp, website }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(data.error || "We couldn't unlock your reading. Please try again.");
      trackLensCheck("lens_check_email_submit", { follow_up: followUp ? 1 : 0 });
      setOpen(false);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We couldn't unlock your reading. Please try again.");
      setSending(false);
    }
  };

  return (
    <>
      <div className="lc-unlock">
        <button type="button" className="btn full" onClick={() => setOpen(true)}>
          See your full reading
          <Icon name="arrow" />
        </button>
        <a className="text-btn" href={bookingUrl} target="_blank" rel="noopener noreferrer" data-source="lens-check">
          Or book a free call with Sam
        </a>
      </div>

      <div className="lc-locked" aria-hidden="true">
        <div className="blurred">
          <p className="eyebrow">Your reading</p>
          <i style={{ width: "92%" }} />
          <i style={{ width: "80%" }} />
          <i style={{ width: "86%" }} />
          <i style={{ width: "70%" }} />
          <p className="eyebrow">What we noticed in your answers</p>
          <i style={{ width: "88%" }} />
          <i style={{ width: "76%" }} />
        </div>
        <div className="lc-lock-note">
          <Icon name="lock" />
          <p>Your reading is ready</p>
          <span>Add your email to bring it into focus.</span>
        </div>
      </div>

      {open && (
        <>
          <div className="lc-sheet-scrim" onClick={() => !sending && setOpen(false)} />
          <form className="lc-sheet" onSubmit={submit} noValidate aria-labelledby="lc-sheet-title">
            <div className="handle" aria-hidden="true" />
            <h2 id="lc-sheet-title">Get your full reading</h2>
            <p className="sub">We&apos;ll show it here straight away and email you a private link so you can come back to it.</p>
            <div className="lc-field">
              <label htmlFor="lc-email">Email</label>
              <input
                id="lc-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoFocus
              />
              {error && (
                <span className="err" role="alert">
                  {error}
                </span>
              )}
            </div>
            <div className="lc-field">
              <label htmlFor="lc-first-name">
                First name <span style={{ color: "var(--lc-muted)", fontWeight: 400 }}>(optional)</span>
              </label>
              <input id="lc-first-name" type="text" autoComplete="given-name" maxLength={60} value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </div>
            <label className="lc-consent" htmlFor="lc-follow-up">
              <input id="lc-follow-up" type="checkbox" checked={followUp} onChange={(event) => setFollowUp(event.target.checked)} />
              <span>Yes, I&apos;d like a short personal note from Sam in a week to see how things are going.</span>
            </label>
            <div className="lc-honeypot" aria-hidden="true">
              <label htmlFor="lc-website">Website</label>
              <input id="lc-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
            </div>
            <button type="submit" className="btn full" disabled={sending}>
              {sending ? "Bringing it into focus" : "Show my reading"}
              <Icon name="arrow" />
            </button>
            <p className="fine">
              We use your email to send your reading. Sam will only write to you again if you tick the box above.
            </p>
          </form>
        </>
      )}
    </>
  );
}
