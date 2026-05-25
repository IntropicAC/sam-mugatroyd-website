import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | Perception 47 Coaching",
  description:
    "How Perception 47 Coaching handles contact details, discovery call bookings, and chat messages.",
  alternates: {
    canonical: "/privacy",
  },
};

const sections = [
  {
    title: "Information you choose to share",
    body: "If you email, phone, book a discovery call, or send a message through the site, Sam may use the details you provide to reply, arrange a call, and keep a record of the conversation.",
  },
  {
    title: "Discovery call bookings",
    body: "Discovery call bookings are handled through Calendly. If you use that link, Calendly may process your booking details under its own privacy terms.",
  },
  {
    title: "Chat guide",
    body: "The chat guide sends your messages to the site's chat service and AI provider so it can generate a reply. Do not enter sensitive personal, medical, financial, or emergency information into the chat.",
  },
  {
    title: "External links",
    body: "Links to Amazon, Substack, Facebook, and other external services take you away from this site. Those services have their own privacy policies and data practices.",
  },
  {
    title: "Your choices",
    body: `You can ask about personal information you have shared by emailing ${CONTACT_EMAIL}.`,
  },
];

export default function PrivacyPage() {
  return (
    <section className="px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <p className="font-body text-xs uppercase tracking-[0.2em] text-charcoal-muted">
          Perception 47 Coaching
        </p>
        <h1 className="mt-5 font-heading text-[2.5rem] font-normal leading-tight text-charcoal md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-6 font-body text-sm leading-relaxed text-charcoal-mid">
          This page explains the main ways information is handled on
          Perception 47 Coaching. The canonical URL for this policy is{" "}
          <Link href="/privacy" className="text-green hover:text-green-hover">
            {SITE_URL}/privacy
          </Link>
          .
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
            href="/contact"
            className="inline-flex items-center justify-center bg-green px-7 py-3.5 font-body text-sm font-medium text-cream transition-colors duration-300 hover:bg-green-hover"
          >
            Contact Sam
          </Link>
        </div>
      </div>
    </section>
  );
}
