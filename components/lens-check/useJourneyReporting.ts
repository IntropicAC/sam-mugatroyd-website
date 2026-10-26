"use client";
import { useEffect, useRef } from "react";
import { JOURNEY_NOTICE_VERSION } from "@/lib/lens-check/journey-policy";

type Snapshot = {
  version: string; stage: string; questionId: string | null; questionNumber: number; totalQuestions: number;
  processedCount: number; answeredCount: number; skippedCount: number; notApplicableCount: number;
};
export function useJourneyReporting(consent: boolean, eligible: boolean, secret: string, snapshot: Snapshot) {
  const latest = useRef(snapshot);
  const send = useRef<() => Promise<void>>(async () => {});
  const errorCounter = useRef(0);
  useEffect(() => { latest.current = snapshot; });
  useEffect(() => {
    if (!secret) return;
    const key = `lens-check-measurement-${secret}`;
    if (!consent) {
      let previouslyShared = false;
      try { previouslyShared = Boolean(localStorage.getItem(key)); localStorage.removeItem(key); } catch {}
      if (previouslyShared) void fetch("/api/lens-check/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ withdraw: true, secret }), keepalive: true }).catch(() => {});
      return;
    }
    if (!eligible) return;
    let active = 0, furthest = 0, previous = Date.now(), interacted = Date.now(), counter = 0;
    errorCounter.current = 0;
    let source: unknown = null;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (saved?.expiresAt > Date.now()) { active = saved.active || 0; furthest = saved.furthest || 0; source = saved.source; errorCounter.current = saved.errors || 0; }
    } catch {}
    if (!source) {
      const params = new URLSearchParams(location.search);
      source = { from: params.get("from"), utm: Object.fromEntries([...params].filter(([k]) => k.startsWith("utm_"))) };
    }
    const interact = () => { interacted = Date.now(); };
    const packet = () => {
      const now = Date.now();
      if (!document.hidden && now - interacted < 60000) active += Math.min(30, Math.max(0, (now - previous) / 1000));
      previous = now;
      furthest = Math.max(furthest, latest.current.questionNumber);
      try { localStorage.setItem(key, JSON.stringify({ active, furthest, source, errors: errorCounter.current, expiresAt: now + 86400000 })); } catch {}
      return { ...latest.current, consent: true, noticeVersion: JOURNEY_NOTICE_VERSION, secret, source,
        device: innerWidth < 768 ? "phone" : innerWidth < 1024 ? "tablet" : "desktop",
        furthestQuestion: furthest, activeSeconds: Math.min(86400, Math.round(active)), errorCount: errorCounter.current,
        sequence: now * 1000 + (counter++ % 1000) };
    };
    const flush = async () => {
      await fetch("/api/lens-check/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(packet()), keepalive: true, signal: AbortSignal.timeout(2500) }).catch(() => {});
    };
    send.current = flush;
    const hidden = () => {
      // A checkpoint on hiding is best effort, not proof someone abandoned.
      if (document.hidden) navigator.sendBeacon("/api/lens-check/progress", new Blob([JSON.stringify(packet())], { type: "application/json" }));
      previous = Date.now();
    };
    const leave = () => navigator.sendBeacon("/api/lens-check/progress", new Blob([JSON.stringify(packet())], { type: "application/json" }));
    document.addEventListener("pointerdown", interact, { passive: true });
    document.addEventListener("keydown", interact);
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", leave);
    const timer = window.setInterval(() => { if (!document.hidden) void flush(); }, 15000);
    void flush();
    return () => {
      send.current = async () => {};
      clearInterval(timer);
      document.removeEventListener("pointerdown", interact);
      document.removeEventListener("keydown", interact);
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", leave);
    };
  }, [consent, eligible, secret]);
  useEffect(() => { void send.current(); }, [snapshot.stage, snapshot.questionId, snapshot.processedCount]);
  return { flush: () => send.current(), error: () => { errorCounter.current = Math.min(1000, errorCounter.current + 1); void send.current(); } };
}
