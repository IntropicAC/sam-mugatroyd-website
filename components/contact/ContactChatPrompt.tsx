'use client';

import FadeInView from "@/components/ui/FadeInView";
import { openSamChat } from "@/lib/sam-chat-events";

export default function ContactChatPrompt() {
  return (
    <section
      className="py-16 md:py-24 px-5 md:px-8 lg:px-12"
      aria-label="Chat guide"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* Left — abstract visual */}
          <FadeInView className="md:col-span-5">
            <div className="relative aspect-square max-w-[320px] mx-auto md:mx-0 bg-cream-deep border border-border flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #8A8680 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-gradient-to-tr from-cream-deep/80 to-transparent"
                aria-hidden="true"
              />
              <svg
                viewBox="0 0 200 200"
                className="relative z-10 w-32 h-32 text-charcoal/10"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="0.8" />
                <circle cx="100" cy="100" r="68" stroke="currentColor" strokeWidth="0.6" />
                <circle cx="100" cy="100" r="46" stroke="currentColor" strokeWidth="0.6" />
                <circle cx="100" cy="100" r="24" stroke="#3D5948" strokeWidth="1.4" opacity="0.6" />
                <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
                <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.4" opacity="0.4" />
              </svg>
            </div>
          </FadeInView>

          {/* Right — copy */}
          <div className="md:col-span-6 md:col-start-7">
            <FadeInView>
              <p className="font-body text-xs text-charcoal-muted tracking-[0.2em] uppercase mb-4">
                Not ready to message yet?
              </p>
              <h2 className="font-heading text-2xl md:text-3xl text-charcoal mb-5">
                Explore the approach first.
              </h2>
              <p className="font-body text-sm md:text-base text-charcoal-mid leading-relaxed mb-8">
                You can ask a question first. Sam&apos;s chat guide is built around
                his writing, books, coaching approach, and course material — so
                you can understand the work before booking.
              </p>
              <button
                type="button"
                onClick={openSamChat}
                className="inline-flex items-center gap-3 border border-charcoal-mid text-charcoal-mid px-7 py-3.5 font-body text-sm font-medium tracking-wide hover:border-charcoal hover:text-charcoal hover:bg-cream-deep transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green group"
                aria-label="Ask a question using Sam AI"
              >
                Ask a question
                <span
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            </FadeInView>
          </div>

        </div>
      </div>
    </section>
  );
}
