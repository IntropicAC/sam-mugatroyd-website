'use client';

import { motion } from "framer-motion";

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  blur?: boolean;
  y?: number;
}

export default function FadeInView({
  children,
  delay = 0,
  duration = 0.85,
  className = "",
  blur = false,
  y = 22,
}: FadeInViewProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: blur ? 0 : y,
        filter: blur ? "blur(10px)" : "blur(0px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      viewport={{ once: true, margin: "-120px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
