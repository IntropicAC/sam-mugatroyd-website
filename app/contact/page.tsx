import type { Metadata } from "next";
import ContactHero from "@/components/contact/ContactHero";
import ContactWaysToReach from "@/components/contact/ContactWaysToReach";
import ContactChatPrompt from "@/components/contact/ContactChatPrompt";
import ContactFindSam from "@/components/contact/ContactFindSam";
import ContactFinalCTA from "@/components/contact/ContactFinalCTA";

export const metadata: Metadata = {
  title: "Contact | Perception 47 — Sam Murgatroyd",
  description:
    "Book a free 20-minute discovery call with Sam Murgatroyd, Authenticity Coach and Author. No pressure, no pitch — just a conversation.",
  openGraph: {
    title: "Contact | Perception 47 — Sam Murgatroyd",
    description:
      "Book a free 20-minute discovery call or send Sam a message. No application required.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactWaysToReach />
      <ContactChatPrompt />
      <ContactFindSam />
      <ContactFinalCTA />
    </>
  );
}
