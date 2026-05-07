'use client';

import { motion } from "framer-motion";
import TestimonialCard from "./TestimonialCard";
import FadeInView from "@/components/ui/FadeInView";

// Add more testimonials here as they come in
const testimonials = [
  {
    name: "Tania Griffiths",
    excerpt:
      "Working with Sam has really improved my teenager's self esteem and self belief, not only in his sporting abilities but in his outlook to life's challenges in general…",
    // TODO: Replace with full testimonial text when provided
    fullText:
      "Working with Sam has really improved my teenager's self esteem and self belief, not only in his sporting abilities but in his outlook to life's challenges in general. Sam has a natural ability to connect with young people and adults alike. The sessions have been invaluable and I would highly recommend Sam to anyone looking for support in finding their authentic self.",
  },
  {
    name: "Lisa Hatton",
    excerpt:
      "Being coached by Sam has been a light bulb moment for me. I have found my authentic self with Sam's strategies and weekly coaching…",
    // TODO: Replace with full testimonial text when provided
    fullText:
      "Being coached by Sam has been a light bulb moment for me. I have found my authentic self with Sam's strategies and weekly coaching. I now have the confidence to make decisions that feel true to who I am rather than who I thought I should be. Sam listens deeply, asks the right questions, and holds space in a way that is both challenging and deeply supportive. I cannot recommend him highly enough.",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      className="py-20 md:py-28 px-5 md:px-8 lg:px-12 bg-cream-deep"
      aria-label="Testimonials"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 md:mb-14">
          <FadeInView>
            <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-4">
              What people say
            </p>
          </FadeInView>
          <FadeInView delay={0.1}>
            <h2 className="font-heading text-3xl md:text-4xl text-charcoal max-w-md">
              The difference a shift in perspective can make
            </h2>
          </FadeInView>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: i * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <TestimonialCard {...testimonial} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
