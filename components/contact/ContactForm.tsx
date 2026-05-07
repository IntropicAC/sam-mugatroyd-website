'use client';

import FadeInView from "@/components/ui/FadeInView";

// TODO: Connect form submission to samuel.a.murg@gmail.com using chosen form provider.
// Options: Next.js server action, API route with Resend, Formspree, or Netlify Forms.

export default function ContactForm() {
  return (
    <section
      id="contact-form"
      className="py-16 md:py-24 px-5 md:px-8 lg:px-12 bg-cream-deep border-t border-border"
      aria-label="Contact form"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-lg">

          <FadeInView>
            <h2 className="font-heading text-2xl md:text-3xl text-charcoal mb-4">
              Ask a question first
            </h2>
            <p className="font-body text-sm md:text-base text-charcoal-mid leading-relaxed mb-10">
              If you are not ready to book a call, send a message instead. No
              application, no pressure, no complicated form.
            </p>
          </FadeInView>

          <FadeInView delay={0.1}>
            <form
              noValidate
              aria-label="Send Sam a message"
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: Connect form submission to samuel.a.murg@gmail.com using chosen form provider.
              }}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="contact-name"
                  className="block font-body text-xs text-charcoal-muted tracking-[0.15em] uppercase mb-2"
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="w-full bg-cream border border-border px-4 py-3 font-body text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:border-green transition-colors duration-300"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block font-body text-xs text-charcoal-muted tracking-[0.15em] uppercase mb-2"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full bg-cream border border-border px-4 py-3 font-body text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:border-green transition-colors duration-300"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block font-body text-xs text-charcoal-muted tracking-[0.15em] uppercase mb-2"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  className="w-full bg-cream border border-border px-4 py-3 font-body text-sm text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:border-green transition-colors duration-300 resize-none"
                  placeholder="Ask anything."
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-3 bg-charcoal text-cream px-7 py-3.5 font-body text-sm font-medium tracking-wide hover:bg-ink transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green group"
              >
                Send message
                <span
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            </form>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
