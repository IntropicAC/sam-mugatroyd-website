'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import FadeInView from "@/components/ui/FadeInView";
import PackageCard from "@/components/home/PackageCard";

const CALENDLY_URL = "https://calendly.com/samuel-a-murg/free-discovery-call";

const packages = [
  {
    title: "Block Booking",
    price: "£120",
    subtitle: "Five sessions, with the fifth session free",
    features: [
      "£30 per session",
      "Three signed copies of Sam's books",
      "Email summary after every session",
      "Midweek email check-in",
      "Full written programme reflection",
    ],
    ctaHref: CALENDLY_URL,
    featured: true,
  },
  {
    title: "Pay As You Go",
    price: "£35",
    subtitle: "Per session, flexible and commitment-free",
    features: [
      "Free cancellation at any time",
      "Signed book gifted after the third session",
      "Email check-ins between sessions",
      "Free fifth session",
    ],
    ctaHref: CALENDLY_URL,
    featured: false,
  },
  {
    title: "Monthly Maintenance",
    price: "£30/month",
    subtitle: "Available after completing a programme",
    features: [
      "One monthly one-to-one session",
      "Review progress",
      "Work through anything that has come up",
      "No minimum commitment",
      "Cancel any time",
    ],
    ctaHref: CALENDLY_URL,
    featured: false,
  },
];

export default function CoachingPackagesSection() {
  return (
    <section
      className="relative py-20 md:py-32 px-5 md:px-8 lg:px-12 bg-cream-deep overflow-hidden"
      aria-label="What happens next — coaching packages"
    >
      {/* Subtle lens rings — top right */}
      <div
        className="pointer-events-none absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 300 300" className="w-64 h-64 md:w-80 md:h-80" fill="none">
          <circle cx="150" cy="150" r="140" stroke="#2A2722" strokeWidth="0.8" />
          <circle cx="150" cy="150" r="105" stroke="#2A2722" strokeWidth="0.5" />
          <circle cx="150" cy="150" r="70" stroke="#2A2722" strokeWidth="0.5" />
          <circle cx="150" cy="150" r="35" stroke="#2A2722" strokeWidth="0.8" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto">

        {/* Intro */}
        <div className="max-w-xl mb-12 md:mb-16">
          <FadeInView>
            <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-6">
              What Happens Next
            </p>
          </FadeInView>

          <FadeInView delay={0.1}>
            <h2 className="font-heading text-3xl md:text-4xl text-charcoal mb-6 leading-tight">
              What Happens Next?
            </h2>
          </FadeInView>

          <FadeInView delay={0.18}>
            <p className="font-heading italic text-lg md:text-xl text-charcoal leading-snug mb-5">
              It starts with a conversation.
            </p>
          </FadeInView>

          <FadeInView delay={0.25}>
            <p className="font-body text-base text-charcoal-mid leading-relaxed mb-5">
              Not a sales call. Not a discovery session with a hidden agenda.
            </p>
          </FadeInView>

          <FadeInView delay={0.32}>
            <p className="font-body text-base text-charcoal-mid leading-relaxed mb-8 md:mb-10">
              Just twenty minutes to talk honestly about where you are and
              whether a different way of seeing things could change anything for
              you. If it feels right, we go further. If it does not, you leave
              with something to think about either way.
            </p>
          </FadeInView>

          <FadeInView delay={0.4}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green text-cream px-7 py-3.5 font-body text-sm font-medium tracking-wide hover:bg-green-hover transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green group"
              >
                Book your free 20-minute call
                <span
                  className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
              <span className="font-body text-xs text-charcoal-muted">
                No pressure. No pitch. Just a conversation.
              </span>
            </div>
          </FadeInView>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true, margin: "-80px" }}
              className="flex"
            >
              <PackageCard {...pkg} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
