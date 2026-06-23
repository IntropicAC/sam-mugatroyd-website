import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | Perception 47 Coaching",
  description:
    "Cookie and local storage information for the Perception 47 Coaching website.",
  alternates: {
    canonical: "/cookies",
  },
};

const sections = [
  {
    title: "Analytics cookies",
    body: "With your consent, this site uses Google Analytics (GA4) and Microsoft Clarity to understand how visitors find and use it. Microsoft Clarity also records anonymised session replays and heatmaps that show how pages are used, with typed input and sensitive content masked by default. These cookies are set only after you choose Accept on the cookie banner, and never if you decline. No advertising cookies are used.",
  },
  {
    title: "Chat storage",
    body: "The chat guide may use your browser's local storage to remember saved chat tabs and recent chat state. Local storage is stored in your browser rather than as a traditional cookie.",
  },
  {
    title: "External services",
    body: "If you follow links to services such as Calendly, Amazon, Substack, or Facebook, those services may use their own cookies under their own policies.",
  },
  {
    title: "Clearing storage",
    body: "You can clear cookies and local storage for this site in your browser settings. Doing this may remove saved chat state.",
  },
];

export default function CookiesPage() {
  return (
    <section className="px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <p className="font-body text-xs uppercase tracking-[0.2em] text-charcoal-muted">
          Perception 47 Coaching
        </p>
        <h1 className="mt-5 font-heading text-[2.5rem] font-normal leading-tight text-charcoal md:text-5xl">
          Cookie Policy
        </h1>
        <p className="mt-6 font-body text-sm leading-relaxed text-charcoal-mid">
          This page explains cookies and local browser storage used by this
          website.
        </p>

        <div className="mt-12 space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="border-t border-border pt-6">
              <h2 className="font-heading text-2xl leading-tight text-charcoal">
                {section.title}
              </h2>
              <p className="mt-3 font-body text-sm leading-relaxed text-charcoal-mid">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <Link
            href="/privacy"
            className="inline-flex items-center justify-center border border-border px-7 py-3.5 font-body text-sm font-medium text-charcoal-mid transition-colors duration-300 hover:border-charcoal hover:text-charcoal"
          >
            Read the privacy policy
          </Link>
        </div>
      </div>
    </section>
  );
}
