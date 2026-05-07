import Hero from "@/components/home/Hero";
import ForYouIfSection from "@/components/home/ForYouIfSection";
import LensSection from "@/components/home/LensSection";
import AboutPreview from "@/components/home/AboutPreview";
import BooksSection from "@/components/home/BooksSection";
import CoachingPackages from "@/components/home/CoachingPackages";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FinalCTA from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <>
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
