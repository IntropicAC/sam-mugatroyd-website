"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
export default function ReportRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button className="min-h-11 border border-border px-4 text-sm" disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? "Refreshing…" : "Refresh reports"}</button>;
}
