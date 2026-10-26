import { CALENDLY_URL } from "@/lib/site";

// Prefilled discovery-call link. `a1` fills the first custom question on the
// Calendly event; the UTM values let Calendly attribute bookings to the quiz
// even when analytics cookies are declined.
export function buildLensCheckCalendlyUrl(details: {
  name?: string | null;
  email?: string | null;
  archetypeTitle?: string | null;
  archetypeId?: string | null;
}) {
  const url = new URL(CALENDLY_URL);

  if (details.name) url.searchParams.set("name", details.name);
  if (details.email) url.searchParams.set("email", details.email);
  if (details.archetypeTitle) url.searchParams.set("a1", `Mindset Test result: ${details.archetypeTitle}`);

  url.searchParams.set("utm_source", "lens-check");
  url.searchParams.set("utm_medium", "quiz");
  if (details.archetypeId) url.searchParams.set("utm_content", details.archetypeId);

  return url.toString();
}
