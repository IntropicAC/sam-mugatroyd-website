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
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Coaching | Perception 47 — Sam Murgatroyd",
  description:
    "Life coaching that changes the way you see the world and in turn changes the world you see. Book a free 20-minute discovery call.",
  alternates: {
    canonical: "/coaching",
  },
  openGraph: {
    title: "Coaching | Perception 47 — Sam Murgatroyd",
    description:
      "Life coaching that begins with a conversation. Book your free 20-minute discovery call.",
    type: "website",
    url: "/coaching",
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: 1200,
        height: 1200,
        alt: AUTHOR_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coaching | Perception 47 — Sam Murgatroyd",
    description:
      "Life coaching that begins with a conversation. Book your free 20-minute discovery call.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

const coachingJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/coaching#service`,
  name: "One-to-one life coaching with Sam Murgatroyd",
  serviceType: "Life coaching",
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
