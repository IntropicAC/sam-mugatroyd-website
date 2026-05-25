'use client';

import type { ComponentType } from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useElementIntroAnimation } from "@/components/layout/PageAnimationProvider";

type OnceMotionProps = {
  seenId?: string;
  seenAnimate?: unknown;
  seenTransition?: unknown;
  initial?: unknown;
  animate?: unknown;
  whileInView?: unknown;
  onViewportEnter?: (entry: IntersectionObserverEntry | null) => void;
  onAnimationStart?: () => void;
  [key: string]: unknown;
};

function createOnceMotion(Component: ComponentType<OnceMotionProps>) {
  return function OnceMotionComponent({
    seenId,
    seenAnimate,
    seenTransition,
    initial,
    animate,
    whileInView,
    onViewportEnter,
    onAnimationStart,
    ...props
  }: OnceMotionProps) {
    const { shouldAnimate, markSeen } = useElementIntroAnimation(seenId);

    useEffect(() => {
      if (shouldAnimate && animate && !whileInView) {
        markSeen();
      }
    }, [animate, markSeen, shouldAnimate, whileInView]);

    if (!shouldAnimate) {
      return (
        <Component
          {...props}
          initial={false}
          animate={seenAnimate ?? whileInView ?? animate}
          transition={seenTransition ?? props.transition}
        />
      );
    }

    return (
      <Component
        {...props}
        initial={initial}
        animate={animate}
        whileInView={whileInView}
        onAnimationStart={onAnimationStart}
        onViewportEnter={(entry: IntersectionObserverEntry | null) => {
          if (whileInView) {
            markSeen();
          }

          onViewportEnter?.(entry);
        }}
      />
    );
  };
}

function asOnceMotionComponent(Component: unknown) {
  return Component as ComponentType<OnceMotionProps>;
}

export const OnceMotion = {
  article: createOnceMotion(asOnceMotionComponent(motion.article)),
  div: createOnceMotion(asOnceMotionComponent(motion.div)),
  figure: createOnceMotion(asOnceMotionComponent(motion.figure)),
  h1: createOnceMotion(asOnceMotionComponent(motion.h1)),
  h2: createOnceMotion(asOnceMotionComponent(motion.h2)),
  p: createOnceMotion(asOnceMotionComponent(motion.p)),
  path: createOnceMotion(asOnceMotionComponent(motion.path)),
  span: createOnceMotion(asOnceMotionComponent(motion.span)),
};
