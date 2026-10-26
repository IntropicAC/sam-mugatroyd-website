'use client';

import { useState } from "react";
import { trackLensCheck } from "@/lib/lens-check/analytics";
import type { HelpfulRating as Rating } from "@/lib/lens-check/types";

const OPTIONS: { value: Rating; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "somewhat", label: "Somewhat" },
  { value: "no", label: "Not really" },
];

export default function HelpfulRating({ token, initial }: { token: string; initial: Rating | null }) {
  const [rated, setRated] = useState<Rating | null>(initial);
  const [sending, setSending] = useState(false);

  const rate = async (value: Rating) => {
    setSending(true);
    try {
      const response = await fetch(`/api/lens-check/responses/${token}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: value }),
      });
      if (response.ok) {
        setRated(value);
        trackLensCheck("lens_check_helpful", { rating: value });
      }
    } finally {
      setSending(false);
    }
  };

  if (rated) {
    return (
      <section className="lc-helpful">
        <p className="eyebrow">Thank you</p>
        <p style={{ fontSize: 14, color: "var(--lc-charcoal-mid)" }}>That helps Sam improve the Mindset Test.</p>
      </section>
    );
  }

  return (
    <section className="lc-helpful">
      <p className="eyebrow">Was this reading useful?</p>
      <div className="row">
        {OPTIONS.map((option) => (
          <button key={option.value} type="button" className="btn ghost" disabled={sending} onClick={() => void rate(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}
