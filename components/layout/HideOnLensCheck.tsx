'use client';

import { usePathname } from "next/navigation";

// Keeps the chat launcher and sticky question button out of the way on
// Mindset Test pages, where they would sit over answers and the email sheet.
export default function HideOnLensCheck({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/lens-check")) return null;
  return <>{children}</>;
}
