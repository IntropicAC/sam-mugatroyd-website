'use client';

import { motion } from "framer-motion";
import FadeInView from "@/components/ui/FadeInView";

const statements = [
  "You are functioning, but something still feels off.",
  "You have become good at being who people need you to be.",
  "You overthink decisions because you no longer trust your own judgement.",
  "You feel tired from performing, not just from working.",
  "You do not need fixing. You need to see clearly.",
];

export default function ForYouIfSection() {
  return (
    <section className="py-20 md:py-28 px-5 md:px-8 lg:px-12" aria-label="Who this is for">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <FadeInView>
            <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-6">
              This is for you if…
            </p>
          </FadeInView>

          <div className="space-y-0 divide-y divide-border/60">
            {statements.map((statement, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.75,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true, margin: "-100px" }}
                className="py-5 group"
              >
                <p
                  className={`font-heading text-lg md:text-xl leading-snug transition-colors duration-300 ${
                    i === statements.length - 1
                      ? "text-green font-medium italic"
                      : "text-charcoal group-hover:text-charcoal-mid"
                  }`}
                >
                  {statement}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
