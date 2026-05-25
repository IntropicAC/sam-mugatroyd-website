'use client';

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from "react";
import { MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";

const serverViewedAnimationIds = new Set<string>();

type AnimationWindow = Window &
  typeof globalThis & {
    __p47ViewedAnimationIds__?: Set<string>;
  };

function getViewedAnimationIds() {
  if (typeof window === "undefined") {
    return serverViewedAnimationIds;
  }

  const animationWindow = window as AnimationWindow;
  animationWindow.__p47ViewedAnimationIds__ ??= new Set<string>();
  return animationWindow.__p47ViewedAnimationIds__;
}

interface PageAnimationContextValue {
  pathname: string;
  hasSeenAnimation: (id: string) => boolean;
  markAnimationSeen: (id: string) => void;
}

const PageAnimationContext = createContext<PageAnimationContextValue | null>(
  null,
);

export function usePageIntroAnimations() {
  return true;
}

export function hasSeenAnimationForPath(pathname: string, explicitId: string) {
  return getViewedAnimationIds().has(`${pathname}:${explicitId}`);
}

export function useElementIntroAnimation(explicitId?: string) {
  const context = useContext(PageAnimationContext);
  const reactId = useId();
  const fallbackPathname =
    typeof window === "undefined" ? "" : window.location.pathname;
  const pathname = context?.pathname ?? fallbackPathname;
  const animationId = `${pathname}:${explicitId ?? reactId}`;
  const [shouldAnimate] = useState(
    () =>
      !(
        context?.hasSeenAnimation(animationId) ??
        getViewedAnimationIds().has(animationId)
      ),
  );

  const markSeen = useCallback(() => {
    getViewedAnimationIds().add(animationId);
    context?.markAnimationSeen(animationId);
  }, [animationId, context]);

  return {
    shouldAnimate,
    markSeen,
  };
}

export default function PageAnimationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const value = useMemo<PageAnimationContextValue>(() => {
    return {
      pathname,
      hasSeenAnimation: (id) => getViewedAnimationIds().has(id),
      markAnimationSeen: (id) => {
        getViewedAnimationIds().add(id);
      },
    };
  }, [pathname]);

  return (
    <PageAnimationContext.Provider value={value}>
      <MotionConfig>{children}</MotionConfig>
    </PageAnimationContext.Provider>
  );
}
