'use client';

import Link from "next/link";
import { motion } from "framer-motion";

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  external?: boolean;
}

export default function CTAButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  external = false,
}: CTAButtonProps) {
  const base =
    "inline-flex items-center justify-center font-body font-medium tracking-wide transition-all duration-300 rounded-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green";

  const variants = {
    primary:
      "bg-green text-cream hover:bg-green-hover border border-green hover:border-green-hover",
    ghost:
      "bg-transparent text-charcoal border border-border hover:border-charcoal hover:bg-cream-deep",
    outline:
      "bg-transparent text-green border border-green hover:bg-green hover:text-cream",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-7 py-3.5 text-sm",
    lg: "px-9 py-4 text-base",
  };

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <motion.div whileTap={{ scale: 0.97 }} className="inline-block">
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    </motion.div>
  );
}
