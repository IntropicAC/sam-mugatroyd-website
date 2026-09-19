import type { Metadata } from "next";
import CoachingHero from "@/components/coaching/CoachingHero";
import CoachingLensMovement from "@/components/coaching/CoachingLensMovement";
import CoachingTerritoriesSection from "@/components/coaching/CoachingTerritoriesSection";
import CoachingWhySam from "@/components/coaching/CoachingWhySam";
import CoachingPackagesSection from "@/components/coaching/CoachingPackagesSection";
import CoachingFinalCTA from "@/components/coaching/CoachingFinalCTA";
import {
  AUTHOR_NAME,
  DEFAULT_SOCIAL_IMAGE,
  DEFAULT_SOCIAL_IMAGE_ALT,
  DEFAULT_SOCIAL_IMAGE_HEIGHT,
  DEFAULT_SOCIAL_IMAGE_WIDTH,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Individual & Team Mindset Coaching | Sam Murgatroyd",
  description:
    "Individual mindset coaching and tailored programmes for teams and organisations. Start with a free discovery call or make a corporate enquiry.",
  alternates: {
    canonical: "/coaching",
  },
  openGraph: {
    title: "Coaching | Perception 47 — Sam Murgatroyd",
    description:
      "Individual coaching and tailored team programmes to build self-trust, clarity and more honest ways of working.",
    type: "website",
    url: "/coaching",
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: DEFAULT_SOCIAL_IMAGE_WIDTH,
        height: DEFAULT_SOCIAL_IMAGE_HEIGHT,
        alt: DEFAULT_SOCIAL_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coaching | Perception 47 — Sam Murgatroyd",
    description:
      "Individual coaching and tailored team programmes to build self-trust, clarity and more honest ways of working.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

const coachingJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/coaching#service`,
  name: "Individual and team mindset coaching with Sam Murgatroyd",
  serviceType: "Individual and team mindset coaching",
  url: `${SITE_URL}/coaching`,
  description:
    "One-to-one coaching for overthinking, people pleasing, confidence, burnout, identity and living more honestly, plus tailored workshops and coaching for teams and organisations.",
  areaServed: "GB",
  provider: {
    "@type": "Person",
    name: AUTHOR_NAME,
    url: SITE_URL,
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  },
};

export default function CoachingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(coachingJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <CoachingHero />
      <CoachingPackagesSection />
      <CoachingLensMovement />
      <CoachingTerritoriesSection />
      <CoachingWhySam />
      <CoachingFinalCTA />
    </>
  );
}
