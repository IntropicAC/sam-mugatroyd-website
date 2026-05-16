import type { Metadata } from "next";
import CoachingHero from "@/components/coaching/CoachingHero";
import CoachingPullQuote from "@/components/coaching/CoachingPullQuote";
import CoachingLensMovement from "@/components/coaching/CoachingLensMovement";
import CoachingPracticeFlow from "@/components/coaching/CoachingPracticeFlow";
import CoachingWhySam from "@/components/coaching/CoachingWhySam";
import CoachingJourneyTimeline from "@/components/coaching/CoachingJourneyTimeline";
import CoachingPackagesSection from "@/components/coaching/CoachingPackagesSection";
import CoachingFinalCTA from "@/components/coaching/CoachingFinalCTA";

export const metadata: Metadata = {
  title: "Coaching | Perception 47 — Sam Murgatroyd",
  description:
    "Authenticity coaching that changes the way you see the world and in turn changes the world you see. Book a free 20-minute discovery call.",
  openGraph: {
    title: "Coaching | Perception 47 — Sam Murgatroyd",
    description:
      "Authenticity coaching that begins with a conversation. Book your free 20-minute discovery call.",
    type: "website",
  },
};

export default function CoachingPage() {
  return (
    <>
      <CoachingHero />
      <CoachingPullQuote />
      <CoachingLensMovement />
      <CoachingPracticeFlow />
      <CoachingWhySam />
      <CoachingJourneyTimeline />
      <CoachingPackagesSection />
      <CoachingFinalCTA />
    </>
  );
}
