import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import ForYouIfSection from "@/components/home/ForYouIfSection";
import MeetSamSection from "@/components/home/MeetSamSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FinalCTA from "@/components/home/FinalCTA";
import { activeQuestionnaire, getPublicQuestionnaire } from "@/lib/lens-check/content";
import {
  AUTHOR_NAME,
  DEFAULT_SOCIAL_IMAGE,
  DEFAULT_SOCIAL_IMAGE_ALT,
  DEFAULT_SOCIAL_IMAGE_HEIGHT,
  DEFAULT_SOCIAL_IMAGE_WIDTH,
  INTRO_VIDEO,
  INTRO_VIDEO_TRANSCRIPT,
  LOGO_IMAGE,
  PERSON_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
// The hero runs the Mindset Test's logo reveal, which is styled there.
import "./lens-check/lens-check.css";

export const metadata: Metadata = {
  title: "Sam Murgatroyd | Mindset Coaching for Overthinking & Burnout",
  description:
    "Mindset coaching with Sam Murgatroyd for overthinking, people pleasing, confidence and burnout. Understand your patterns and book a free discovery call.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Perception 47 Coaching | Sam Murgatroyd",
    description:
      "Understand the patterns you have been living inside and start moving through life with more honesty, confidence and self-trust.",
    type: "website",
    url: "/",
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
    title: "Perception 47 Coaching | Sam Murgatroyd",
    description:
      "Understand the patterns you have been living inside and start moving through life with more honesty, confidence and self-trust.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#sam-murgatroyd`,
      name: AUTHOR_NAME,
      url: SITE_URL,
      image: PERSON_IMAGE,
      jobTitle: "Mindset Coach and Author",
      worksFor: {
        "@id": `${SITE_URL}/#organization`,
      },
      sameAs: [
        "https://substack.com/@sammurgatroyd",
        "https://www.facebook.com/Perception47Coaching",
      ],
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: LOGO_IMAGE,
      },
      founder: {
        "@id": `${SITE_URL}/#sam-murgatroyd`,
      },
      sameAs: [
        "https://substack.com/@sammurgatroyd",
        "https://www.facebook.com/Perception47Coaching",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
    {
      "@type": "VideoObject",
      "@id": `${SITE_URL}/#intro-video`,
      name: INTRO_VIDEO.title,
      description: INTRO_VIDEO.description,
      thumbnailUrl: INTRO_VIDEO.thumbnailUrl,
      uploadDate: INTRO_VIDEO.uploadDate,
      duration: INTRO_VIDEO.durationIso,
      contentUrl: INTRO_VIDEO.contentUrl,
      embedUrl: INTRO_VIDEO.embedUrl,
      transcript: INTRO_VIDEO_TRANSCRIPT,
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      creator: {
        "@id": `${SITE_URL}/#sam-murgatroyd`,
      },
    },
  ],
};

export default function HomePage() {
  const questionnaire = getPublicQuestionnaire();
  const statements = questionnaire.parts.reduce((n, part) => n + part.questions.length, 0);
  // Only the names: what each lens means stays with the result.
  const lenses = activeQuestionnaire.archetypes.map(({ id, title }) => ({ id, title }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Hero statements={statements} version={questionnaire.version} lenses={lenses} />
      <ForYouIfSection />
      <MeetSamSection />
      <TestimonialsSection />
      <FinalCTA />
    </>
  );
}
