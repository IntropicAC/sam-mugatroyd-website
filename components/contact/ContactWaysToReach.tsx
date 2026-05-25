'use client';

import Link from "next/link";
import FadeInView from "@/components/ui/FadeInView";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
    </svg>
  );
}

const contactMethods = [
  {
    id: "call",
    icon: <IconCalendar />,
    label: "Discovery call",
    description: "Free 20-minute discovery call",
    linkText: "Book a call",
    href: CALENDLY_URL,
    external: true,
    accent: true,
  },
  {
    id: "email",
    icon: <IconMail />,
    label: "Email",
    description: "samuel.a.murg@gmail.com",
    linkText: "Email Sam",
    href: "mailto:samuel.a.murg@gmail.com",
    external: false,
    accent: false,
  },
  {
    id: "phone",
    icon: <IconPhone />,
    label: "Phone",
    description: "07804 743 725",
    linkText: "Call Sam",
    href: "tel:07804743725",
    external: false,
    accent: false,
  },
];

export default function ContactWaysToReach() {
  return (
    <section
      id="contact-form"
      className="py-16 md:py-24 px-5 md:px-8 lg:px-12 bg-cream-deep border-y border-border"
      aria-label="Contact"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16">

          {/* Left — ways to reach */}
          <div className="lg:col-span-4 lg:border-r lg:border-border lg:pr-12 border-b border-border pb-12 lg:border-b-0 lg:pb-0">
            <FadeInView>
              <h2 className="font-heading text-2xl md:text-3xl text-charcoal mb-3">
                Ways to reach Sam.
              </h2>
              <p className="font-body text-sm text-charcoal-mid leading-relaxed mb-8">
                Choose the path that feels most comfortable for you.
              </p>
            </FadeInView>

            <div className="flex flex-col gap-3">
              {contactMethods.map((method, i) => {
                const linkProps = method.external
                  ? { target: "_blank" as const, rel: "noopener noreferrer" }
                  : {};

                return (
                  <FadeInView key={method.id} delay={i * 0.07}>
                    <div
                      className={`group flex items-start gap-4 p-5 border transition-colors duration-300 ${
                        method.accent
                          ? "bg-green/[0.06] border-green/30 hover:bg-green/[0.1]"
                          : "bg-cream border-border hover:border-charcoal-muted/40 hover:bg-surface"
                      }`}
                    >
                      {/* Icon container */}
                      <div
                        className={`shrink-0 flex items-center justify-center w-9 h-9 mt-0.5 ${
                          method.accent
                            ? "bg-green/15 text-green"
                            : "bg-cream-deep text-charcoal-mid"
                        }`}
                      >
                        {method.icon}
                      </div>

                      <div className="flex flex-col gap-1 min-w-0">
                        <p
                          className={`font-body text-[10px] tracking-[0.18em] uppercase ${
                            method.accent ? "text-green" : "text-charcoal-muted"
                          }`}
                        >
                          {method.label}
                        </p>
                        <p className="font-body text-sm text-charcoal truncate">
                          {method.description}
                        </p>
                        <Link
                          href={method.href}
                          className={`inline-flex items-center gap-1.5 font-body text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green w-fit ${
                            method.accent
                              ? "text-green hover:text-green-hover"
                              : "text-charcoal-mid hover:text-charcoal"
                          }`}
                          {...linkProps}
                        >
                          {method.linkText}
                          <span
                            className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </FadeInView>
                );
              })}
            </div>
          </div>

          {/* Right — contact form */}
          <div className="lg:col-span-7 lg:col-start-6">
            <FadeInView>
              <h2 className="font-heading text-2xl md:text-3xl text-charcoal mb-3">
                Ask a question first
              </h2>
              <p className="font-body text-sm md:text-base text-charcoal-mid leading-relaxed mb-8 pb-8 border-b border-border">
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
                }}
                className="space-y-7"
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
                    className="w-full bg-transparent border-0 border-b border-border focus:border-charcoal focus:outline-none px-0 py-3 font-body text-sm text-charcoal placeholder:text-charcoal-muted/50 transition-colors duration-300"
                    placeholder="Your full name"
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
                    className="w-full bg-transparent border-0 border-b border-border focus:border-charcoal focus:outline-none px-0 py-3 font-body text-sm text-charcoal placeholder:text-charcoal-muted/50 transition-colors duration-300"
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
                    rows={4}
                    required
                    className="w-full bg-transparent border-0 border-b border-border focus:border-charcoal focus:outline-none px-0 py-3 font-body text-sm text-charcoal placeholder:text-charcoal-muted/50 transition-colors duration-300 resize-none"
                    placeholder="How can I help you?"
                  />
                </div>

                <div className="pt-2">
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
                </div>
              </form>
            </FadeInView>
          </div>

        </div>
      </div>
    </section>
  );
}
