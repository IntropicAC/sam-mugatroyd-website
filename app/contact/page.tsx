import type { Metadata } from "next";
import ContactHero from "@/components/contact/ContactHero";
import ContactWaysToReach from "@/components/contact/ContactWaysToReach";
import ContactChatPrompt from "@/components/contact/ContactChatPrompt";
import ContactFindSam from "@/components/contact/ContactFindSam";
import ContactFinalCTA from "@/components/contact/ContactFinalCTA";
import {
  AUTHOR_NAME,
  CONTACT_EMAIL,
  CONTACT_PHONE_E164,
  DEFAULT_SOCIAL_IMAGE,
  DEFAULT_SOCIAL_IMAGE_ALT,
  DEFAULT_SOCIAL_IMAGE_HEIGHT,
  DEFAULT_SOCIAL_IMAGE_WIDTH,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact | Perception 47 — Sam Murgatroyd",
  description:
    "Book a free 20-minute discovery call with Sam Murgatroyd or send a message about one-to-one life coaching. No pressure, just a conversation.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | Perception 47 — Sam Murgatroyd",
    description:
      "Book a free 20-minute discovery call or send Sam a message about one-to-one life coaching.",
    type: "website",
    url: "/contact",
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
    title: "Contact | Perception 47 — Sam Murgatroyd",
    description:
      "Book a free 20-minute discovery call or send Sam a message about one-to-one life coaching.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": `${SITE_URL}/contact#webpage`,
  name: `Contact ${AUTHOR_NAME}`,
  url: `${SITE_URL}/contact`,
  description:
    "Book a free discovery call, email, or phone Sam Murgatroyd about one-to-one coaching.",
  about: {
    "@type": "Person",
    name: AUTHOR_NAME,
    email: CONTACT_EMAIL,
    telephone: CONTACT_PHONE_E164,
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ContactHero />
      <ContactWaysToReach />
      <ContactChatPrompt />
      <ContactFindSam />
      <ContactFinalCTA />
    </>
  );
}
