import type { Metadata } from "next";
import LensCheckFlow from "@/components/lens-check/LensCheckFlow";
import { getPublicQuestionnaire } from "@/lib/lens-check/content";
import { accountsEnabled } from "@/lib/lens-check/account-policy";

export const metadata: Metadata = {
  title: "The Mindset Test | Perception 47",
  description:
    "A free reflection on how things are for you these days: how you start things, choose your direction, look after others, speak up and see yourself.",
  alternates: { canonical: "/lens-check" },
};

export default function LensCheckPage() {
  return (
    <div className="lc">
      <LensCheckFlow questionnaire={getPublicQuestionnaire()} accountFlow={accountsEnabled()} />
    </div>
  );
}
