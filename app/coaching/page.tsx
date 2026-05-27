import type { Metadata } from "next";
import CoachingHero from "@/components/coaching/CoachingHero";
import CoachingPullQuote from "@/components/coaching/CoachingPullQuote";
import CoachingLensMovement from "@/components/coaching/CoachingLensMovement";
import CoachingPracticeFlow from "@/components/coaching/CoachingPracticeFlow";
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
  title: "Coaching | Perception 47 — Sam Murgatroyd",
  description:
    "One-to-one mindset coaching with Sam Murgatroyd for overthinking, people pleasing, confidence, burnout and living with more honesty.",
  alternates: {
    canonical: "/coaching",
  },
  openGraph: {
    title: "Coaching | Perception 47 — Sam Murgatroyd",
    description:
      "A calm one-to-one coaching space to understand your patterns, build self-trust and make braver decisions.",
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
      "A calm one-to-one coaching space to understand your patterns, build self-trust and make braver decisions.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

const coachingJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/coaching#service`,
  name: "One-to-one mindset coaching with Sam Murgatroyd",
  serviceType: "Mindset coaching",
  url: `${SITE_URL}/coaching`,
  description:
    "One-to-one coaching for overthinking, people pleasing, confidence, burnout, identity, and living more honestly.",
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
      <CoachingPullQuote />
      <CoachingLensMovement />
      <CoachingTerritoriesSection />
      <CoachingPracticeFlow />
      <CoachingWhySam />
      <CoachingPackagesSection />
      <CoachingFinalCTA />
    </>
  );
}
