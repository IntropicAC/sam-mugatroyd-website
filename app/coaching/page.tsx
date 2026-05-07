import type { Metadata } from "next";
import CoachingHero from "@/components/coaching/CoachingHero";
import CoachingPullQuote from "@/components/coaching/CoachingPullQuote";
import CoachingLensMovement from "@/components/coaching/CoachingLensMovement";
import CoachingShiftMovement from "@/components/coaching/CoachingShiftMovement";
import CoachingWhyDifferent from "@/components/coaching/CoachingWhyDifferent";
import CoachingPackagesSection from "@/components/coaching/CoachingPackagesSection";

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
      <CoachingShiftMovement />
      <CoachingWhyDifferent />
      <CoachingPackagesSection />
    </>
  );
}
