'use client';

import FadeInView from "@/components/ui/FadeInView";

// TODO: Wire up "Ask a question" button to open the AI chat widget when ready.
// The widget is trained on Sam's books, course material, coaching approach, background, and FAQs.

export default function ContactChatPrompt() {
  return (
    <section
      className="py-16 md:py-24 px-5 md:px-8 lg:px-12"
      aria-label="Chat guide"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-xl border-l-2 border-green/40 pl-6 md:pl-8">

          <FadeInView>
            <h2 className="font-heading text-2xl md:text-3xl text-charcoal mb-4">
              Not ready to message yet?
            </h2>
            <p className="font-body text-sm md:text-base text-charcoal-mid leading-relaxed mb-8">
              You can ask a question first. Sam&apos;s chat guide is built around
              his writing, books, coaching approach, and course material — so
              you can understand the work before booking.
            </p>

            {/* TODO: Wire up to open AI chat widget when ready */}
            <button
              type="button"
              onClick={() => {
                // TODO: Open chat widget
              }}
              className="inline-flex items-center gap-3 border border-charcoal-mid text-charcoal-mid px-7 py-3.5 font-body text-sm font-medium tracking-wide hover:border-charcoal hover:text-charcoal hover:bg-cream-deep transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green group"
              aria-label="Ask a question using Sam's chat guide"
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
    </section>
  );
}
