'use client';

import { motion } from "framer-motion";
import PackageCard from "./PackageCard";
import FadeInView from "@/components/ui/FadeInView";
import Link from "next/link";

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
    price: "£30",
    subtitle: "Per month — available after completing a programme",
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

export default function CoachingPackages() {
  return (
    <section
      className="py-20 md:py-28 px-5 md:px-8 lg:px-12"
      aria-label="Coaching packages"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 md:mb-14">
          <FadeInView>
            <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-4">
              Coaching packages
            </p>
          </FadeInView>
          <FadeInView delay={0.1}>
            <h2 className="font-heading text-3xl md:text-4xl text-charcoal mb-4 max-w-lg">
              Coaching that begins with a conversation
            </h2>
          </FadeInView>
          <FadeInView delay={0.2}>
            <p className="font-body text-sm text-charcoal-mid max-w-xl leading-relaxed">
              Every package starts with a free 20-minute discovery call. No pressure,
              no pitch, and no application form.
            </p>
          </FadeInView>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-12">
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
              viewport={{ once: true, margin: "-100px" }}
              className="flex"
            >
              <PackageCard {...pkg} />
            </motion.div>
          ))}
        </div>

        <FadeInView className="text-center">
          <p className="font-body text-xs text-charcoal-muted mb-5">
            Not sure which is right for you? Start with the call.
          </p>
          <Link
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green text-cream px-8 py-4 font-body text-sm font-medium tracking-wide hover:bg-green-hover transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green group"
          >
            Book your free 20-minute call
            <span
              className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </FadeInView>
      </div>
    </section>
  );
}
