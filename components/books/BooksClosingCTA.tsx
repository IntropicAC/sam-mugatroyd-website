'use client';

import Link from "next/link";
import { OnceMotion } from "@/components/ui/OnceMotion";
import FadeInView from "@/components/ui/FadeInView";
import { openSamChat } from "@/lib/sam-chat-events";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

export default function BooksClosingCTA() {
  return (
    <section
      className="relative overflow-hidden bg-cream-deep px-5 py-16 md:px-8 md:py-24 lg:px-12"
      aria-label="What's next — chat or book a call"
    >
      {/* Subtle lens rings, right side */}
      <div
        className="pointer-events-none absolute right-0 top-1/2 translate-x-1/3 -translate-y-1/2 opacity-[0.04]"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 600 600"
          className="w-[420px] h-[420px] md:w-[560px] md:h-[560px]"
          fill="none"
        >
          <circle cx="300" cy="300" r="290" stroke="#2A2722" strokeWidth="0.6" />
          <circle cx="300" cy="300" r="220" stroke="#2A2722" strokeWidth="0.6" />
          <circle cx="300" cy="300" r="150" stroke="#2A2722" strokeWidth="0.6" />
          <circle cx="300" cy="300" r="80" stroke="#2A2722" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Eyebrow */}
        <FadeInView>
          <div className="flex items-center gap-3 mb-5 md:mb-6">
            <span className="block h-px w-10 bg-green/60" aria-hidden="true" />
            <p className="font-body text-[10px] uppercase tracking-[0.3em] text-charcoal-muted">
              When you&apos;re ready
            </p>
          </div>
        </FadeInView>

        {/* Heading */}
        <OnceMotion.h2
          seenId="books-closing-heading"
          initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-heading text-charcoal leading-[1.08] tracking-[-0.015em] text-[clamp(1.65rem,4.5vw,2.75rem)] max-w-2xl mb-4"
        >
          If something here landed,{" "}
          <em className="not-italic text-green">there are two quiet ways in.</em>
        </OnceMotion.h2>

        <FadeInView delay={0.1}>
          <p className="font-body text-sm md:text-base text-charcoal-mid leading-[1.7] max-w-xl mb-8 md:mb-12">
            You do not have to decide anything yet. You can ask a question
            first, or have a conversation when it feels right.
          </p>
        </FadeInView>

        {/* The two paths */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {/* — Chat guide path — */}
          <OnceMotion.div
            seenId="books-closing-chat-card"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            className="group relative bg-cream border border-border p-6 md:p-8 flex flex-col"
          >
            <div className="flex items-baseline justify-between mb-4">
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-charcoal-muted">
                Path One
              </p>
              <p className="font-body text-[10px] tracking-[0.22em] uppercase text-green">
                No commitment
              </p>
            </div>

            <h3 className="font-heading text-xl md:text-2xl text-charcoal leading-snug mb-3">
              Ask the chat guide
            </h3>

            <p className="font-body text-sm text-charcoal-mid leading-relaxed mb-6 flex-1">
              Trained on the books, the coaching, and the thinking that runs
              through both. Useful for the questions you would normally have to
              email someone to ask.
            </p>

            <button
              type="button"
              onClick={openSamChat}
              className="inline-flex items-center gap-3 border border-charcoal-mid text-charcoal-mid px-6 py-3 font-body text-sm font-medium tracking-wide hover:border-charcoal hover:text-charcoal hover:bg-cream-deep transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green self-start"
              aria-label="Ask a question using Sam's chat guide"
            >
              Ask a question
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </button>
          </OnceMotion.div>

          {/* — Book a call path — */}
          <OnceMotion.div
            seenId="books-closing-call-card"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            className="group relative bg-charcoal text-cream p-6 md:p-8 flex flex-col"
          >
            {/* Faint scan lines */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent, transparent 47px, #F5F0EA 47px, #F5F0EA 48px)",
              }}
              aria-hidden="true"
            />

            <div className="relative flex items-baseline justify-between mb-4">
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-cream/45">
                Path Two
              </p>
              <p className="font-body text-[10px] tracking-[0.22em] uppercase text-green-hover">
                Free · 20 minutes
              </p>
            </div>

            <h3 className="relative font-heading text-xl md:text-2xl text-cream leading-snug mb-3">
              Book a conversation
            </h3>

            <p className="relative font-body text-sm text-cream/60 leading-relaxed mb-6 flex-1">
              Twenty minutes on a call. No pitch, no agenda — just an honest
              conversation about where you are and whether this might fit.
            </p>

            <Link
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-3 bg-green text-cream px-6 py-3 font-body text-sm font-medium tracking-wide hover:bg-green-hover transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream self-start"
            >
              Book your free call
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </OnceMotion.div>
        </div>

        {/* Footer note */}
        <FadeInView delay={0.2}>
          <p className="mt-8 md:mt-10 font-body text-xs text-charcoal-muted italic max-w-md">
            Signed copies of all three books are included in selected coaching
            packages.
          </p>
        </FadeInView>
      </div>
    </section>
  );
}
