'use client';

import Link from "next/link";
import FadeInView from "@/components/ui/FadeInView";
import { OnceMotion } from "@/components/ui/OnceMotion";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

const waysToWork = [
  {
    audience: "For individuals",
    title: "Individual Coaching",
    description:
      "One-to-one online sessions built around you. Programme length and structure are discussed at your free discovery call.",
    detail:
      "A focused, private space to understand what is holding you back and make changes that feel true to you.",
    reassurance: "Free 20-minute discovery call. No pressure, no commitment.",
    cta: "Book your free discovery call",
    href: CALENDLY_URL,
    external: true,
    featured: false,
  },
  {
    audience: "For teams and organisations",
    title: "Corporate & Team Coaching",
    description:
      "Tailored programmes for teams, organisations and businesses. Workshops, ongoing coaching and bespoke delivery available.",
    detail:
      "We will start by understanding your people, your goals and the kind of change you want to create together.",
    reassurance: "Pricing on enquiry.",
    cta: "Enquire about team coaching",
    href: "/contact#contact-form",
    external: false,
    featured: true,
  },
];

export default function CoachingPackagesSection() {
  return (
    <section
      id="ways-to-work"
      className="relative overflow-hidden bg-cream-deep px-5 py-20 md:px-8 md:py-32 lg:px-12"
      aria-label="Ways to work together"
    >
      <div
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-green/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[28rem] w-[28rem] translate-x-1/3 translate-y-1/3 rounded-full border border-green/15"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(61,89,72,0.045) 0 1px, transparent 1px 100%), linear-gradient(180deg, rgba(61,89,72,0.035) 0 1px, transparent 1px 100%)",
          backgroundSize: "92px 92px",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl md:mb-16">
          <FadeInView>
            <p className="mb-5 font-body text-xs uppercase tracking-[0.18em] text-charcoal-muted">
              Ways to work together
            </p>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h2 className="mb-5 font-heading text-3xl leading-tight text-charcoal md:text-5xl">
              The right support starts with the right conversation.
            </h2>
          </FadeInView>
          <FadeInView delay={0.16}>
            <p className="font-body text-sm leading-relaxed text-charcoal-mid md:text-base">
              Whether you are looking for personal change or support for your
              team, we will begin by understanding what you need before
              deciding what working together looks like.
            </p>
          </FadeInView>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          {waysToWork.map((option, index) => {
            const linkProps = option.external
              ? { target: "_blank" as const, rel: "noopener noreferrer" }
              : {};

            return (
              <OnceMotion.article
                key={option.title}
                seenId={`coaching-way-to-work-${index}`}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true, margin: "-60px" }}
                className={`relative flex min-h-[28rem] flex-col overflow-hidden border p-6 md:min-h-[30rem] md:p-9 ${
                  option.featured
                    ? "border-green/45 bg-charcoal text-cream shadow-[0_24px_70px_rgba(42,39,34,0.18)]"
                    : "border-border bg-cream/80 text-charcoal"
                }`}
              >
                {option.featured && (
                  <>
                    <div
                      className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-green/30"
                      aria-hidden="true"
                    />
                    <div
                      className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 translate-x-1/3 translate-y-1/3 rounded-full border border-cream/10"
                      aria-hidden="true"
                    />
                  </>
                )}

                <div className="relative border-b border-current/10 pb-7">
                  <p
                    className={`mb-4 font-body text-[10px] uppercase tracking-[0.2em] ${
                      option.featured ? "text-green-hover" : "text-charcoal-muted"
                    }`}
                  >
                    {option.audience}
                  </p>
                  <h3 className="font-heading text-3xl leading-tight md:text-4xl">
                    {option.title}
                  </h3>
                </div>

                <div className="relative flex flex-1 flex-col pt-7">
                  <p
                    className={`mb-5 font-body text-base leading-relaxed md:text-lg ${
                      option.featured ? "text-cream/78" : "text-charcoal-mid"
                    }`}
                  >
                    {option.description}
                  </p>
                  <p
                    className={`font-body text-sm leading-relaxed ${
                      option.featured ? "text-cream/52" : "text-charcoal-muted"
                    }`}
                  >
                    {option.detail}
                  </p>

                  <div className="mt-auto pt-10">
                    <p
                      className={`mb-5 font-body text-xs leading-relaxed ${
                        option.featured ? "text-green-hover" : "text-charcoal-muted"
                      }`}
                    >
                      {option.reassurance}
                    </p>
                    <Link
                      href={option.href}
                      className={`group inline-flex w-full items-center justify-center gap-2 px-5 py-4 font-body text-sm font-medium tracking-wide transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green ${
                        option.featured
                          ? "bg-green text-cream hover:bg-green-hover"
                          : "bg-charcoal text-cream hover:bg-ink"
                      }`}
                      {...linkProps}
                    >
                      {option.cta}
                      <span
                        className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      >
                        &rarr;
                      </span>
                    </Link>
                  </div>
                </div>
              </OnceMotion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
