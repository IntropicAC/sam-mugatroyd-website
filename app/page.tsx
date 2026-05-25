import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import ForYouIfSection from "@/components/home/ForYouIfSection";
import LensSection from "@/components/home/LensSection";
import AboutPreview from "@/components/home/AboutPreview";
import BooksSection from "@/components/home/BooksSection";
import CoachingPackages from "@/components/home/CoachingPackages";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FinalCTA from "@/components/home/FinalCTA";
import {
  AUTHOR_NAME,
  DEFAULT_SOCIAL_IMAGE,
  LOGO_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Perception 47 Coaching | Sam Murgatroyd",
  description:
    "Life coaching with Sam Murgatroyd for overthinking, people pleasing, confidence, burnout, and living more honestly. Book a free 20-minute call.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Perception 47 Coaching | Sam Murgatroyd",
    description:
      "Life coaching that helps you understand the patterns you have been living inside.",
    type: "website",
    url: "/",
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
    title: "Perception 47 Coaching | Sam Murgatroyd",
    description:
      "Life coaching that helps you understand the patterns you have been living inside.",
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
      image: DEFAULT_SOCIAL_IMAGE,
      jobTitle: "Life Coach and Author",
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
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <ForYouIfSection />
      <LensSection />
      <AboutPreview />
      <BooksSection />
      <CoachingPackages />
      <TestimonialsSection />
      <FinalCTA />
    </>
  );
}
