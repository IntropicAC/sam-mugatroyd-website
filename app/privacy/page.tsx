import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";
import { accountsEnabled } from "@/lib/lens-check/account-policy";

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
    title: "The Mindset Test",
    body: "When you finish the Mindset Test, your answers and result are stored without your name or IP address, to show your result and to help improve the questions. If you add your email to see your full reading, we store your email, first name (if given) and whether you would like a follow-up note, and send your reading by email. Sam only writes to you again if you ticked that box, and you can say no at any time by replying. Answers and email are kept in a database hosted in London (Neon), and emails are sent through Resend. Email details are deleted 12 months after your last activity unless you go on to book or work with Sam, and anonymous answers after 24 months. The Mindset Test is a reflection, not a diagnosis.",
  },
  {
    title: "Analytics",
    body: "With your consent, this site uses Google Analytics and Microsoft Clarity to understand how the site is used. Clarity collects anonymised usage data, including session replays and heatmaps, with typed input and sensitive content masked by default. These tools only run after you choose Accept on the cookie banner. See the cookie policy for details.",
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
  const visibleSections = sections.map((section) => {
    if (section.title === "Analytics") return { ...section, body: "Third-party analytics and session replay are not loaded on Mindset Test questionnaire, account, results or report pages. If you separately opt in to progress sharing in the test, we record an attempt identifier, question numbers reached, approximate active time, device category, campaign labels and save-error counts in our database. We do not collect unfinished answers, IP addresses or browser fingerprints for these measurements. You can turn sharing off under Progress privacy; this erases that attempt?s progress measurements. These measurements are available only to authorised report accounts and expire after 90 days. Elsewhere, Google Analytics and Microsoft Clarity run only after you choose Accept on the cookie banner. See the cookie policy for details." };
    if (section.title !== "The Mindset Test" || !accountsEnabled()) return section;
    return { ...section, body: `The Mindset Test is for ages 13 and over. We use your declared age group to check eligibility, not to score your answers. Questionnaire progress stays on your device for up to 24 hours. When you finish, we save your answers, reading, questionnaire version and completion date in our London-hosted Neon database. Verify your email through Neon to link that reading to your account and find it again in My results. These saved answers are linked to you; they are not anonymous. Sam and authorised operators can access them for support and to review the questionnaire. Readings are not public, and sign-in does not subscribe you to marketing or personal follow-up. Login codes currently use Neon's development email sender; website result emails are disabled for this test. Test readings are temporary. Retention, access duration and account-deletion arrangements must be agreed and published before public release. You can ask about your information or request deletion by emailing ${CONTACT_EMAIL}. The Mindset Test is a reflection, not a diagnosis.` };
  });
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
          {visibleSections.map((section) => (
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
