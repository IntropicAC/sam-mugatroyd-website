'use client';

import Link from "next/link";
import FadeInView from "@/components/ui/FadeInView";
import { OnceMotion } from "@/components/ui/OnceMotion";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

const packages = [
  {
    title: "Block Booking",
    price: "\u00a3120",
    priceNote: "Five sessions \u00b7 fifth session free",
    description: "The full programme \u2014 the most transformative way to work with Sam.",
    features: [
      "\u00a330 per session",
      "Three signed copies of Sam's books",
      "Email summary after every session",
      "Midweek email check-in",
      "Full written programme reflection",
    ],
    featured: true,
  },
  {
    title: "Pay As You Go",
    price: "\u00a335",
    priceNote: "Per session \u00b7 no commitment",
    description: "Flexible and honest \u2014 come when you need it, stop when you don't.",
    features: [
      "Free cancellation at any time",
      "Signed book gifted after the third session",
      "Email check-ins between sessions",
      "Free fifth session",
    ],
    featured: false,
  },
  {
    title: "Monthly Maintenance",
    price: "\u00a330",
    priceNote: "Per month \u00b7 after completing a programme",
    description: "Keep the lens clear. One monthly session to review and stay honest.",
    features: [
      "One monthly one-to-one session",
      "Review progress and what has come up",
      "No minimum commitment",
      "Cancel any time",
    ],
    featured: false,
  },
];

export default function CoachingPackagesSection() {
  return (
    <section
      className="relative py-20 md:py-32 px-5 md:px-8 lg:px-12 bg-cream-deep overflow-hidden"
      aria-label="Coaching packages"
    >
      <div
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-green/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 bottom-0 h-[28rem] w-[28rem] translate-x-1/3 translate-y-1/3 rounded-full border border-green/15"
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

      <div className="relative max-w-7xl mx-auto">
        <FadeInView>
          <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-10 md:mb-14">
            Packages
          </p>
        </FadeInView>

        <div className="grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {packages.map((pkg, i) => (
            <OnceMotion.div
              key={pkg.title}
              seenId={`coaching-package-${pkg.title}`}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true, margin: "-60px" }}
              className={`relative flex h-full min-h-full flex-col overflow-hidden border px-5 py-6 md:px-7 md:py-8 ${
                pkg.featured
                  ? "border-green/45 bg-charcoal text-cream shadow-[0_24px_70px_rgba(42,39,34,0.18)]"
                  : "border-border bg-cream/80 text-charcoal"
              }`}
            >
              {pkg.featured && (
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-green/30"
                  aria-hidden="true"
                />
              )}

              <div className="relative flex items-start justify-between gap-5 border-b border-current/10 pb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3
                      className={`font-heading text-2xl leading-tight ${
                        pkg.featured ? "text-cream" : "text-charcoal"
                      }`}
                    >
                      {pkg.title}
                    </h3>
                    {pkg.featured && (
                      <span className="font-body text-[10px] text-green-hover border border-green-hover/70 px-2 py-1 tracking-wide">
                        Popular
                      </span>
                    )}
                  </div>
                  <p
                    className={`font-body text-xs leading-snug ${
                      pkg.featured ? "text-cream/42" : "text-charcoal-muted"
                    }`}
                  >
                    {pkg.priceNote}
                  </p>
                </div>
                <span
                  className={`font-heading text-4xl leading-none ${
                    pkg.featured ? "text-cream" : "text-charcoal"
                  }`}
                >
                  {pkg.price}
                </span>
              </div>

              <div className="relative flex flex-1 flex-col pt-6">
                <p
                  className={`font-body text-sm leading-relaxed mb-6 ${
                    pkg.featured ? "text-cream/62" : "text-charcoal-mid"
                  }`}
                >
                  {pkg.description}
                </p>

                <ul className="space-y-3 mb-8" aria-label={`${pkg.title} features`}>
                  {pkg.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-start gap-3 ${
                        pkg.featured ? "text-cream/56" : "text-charcoal-muted"
                      }`}
                    >
                      <span
                        className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                          pkg.featured ? "bg-green-hover" : "bg-green/70"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="font-body text-xs leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-auto inline-flex w-full items-center justify-center gap-2 px-5 py-3.5 font-body text-xs font-medium tracking-wide transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green group ${
                    pkg.featured
                      ? "bg-green text-cream hover:bg-green-hover"
                      : "border border-border text-charcoal hover:border-charcoal hover:bg-cream"
                  }`}
                >
                  Book a free call first
                  <span
                    className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  >
                    {"\u2192"}
                  </span>
                </Link>
              </div>

              {!pkg.featured && (
                <div
                  className="pointer-events-none absolute right-5 top-5 opacity-[0.06]"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none">
                    <circle cx="32" cy="32" r="29" stroke="currentColor" strokeWidth="0.8" />
                    <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="0.6" />
                    <circle cx="32" cy="32" r="5" fill="currentColor" />
                  </svg>
                </div>
              )}
            </OnceMotion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
