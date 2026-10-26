"use client";
import { useEffect, useState } from "react";

type Member = { email: string; role: string; owner?: boolean };
export default function ReportAccess() {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    const response = await fetch("/api/lens-check/admin/access", { cache: "no-store" });
    if (!response.ok) throw new Error("Couldn't load report access.");
    setMembers((await response.json()).members || []);
  }
  useEffect(() => { void load().catch(() => setNotice("Couldn't load report access. Refresh to retry.")); }, []);
  async function change(email: string, role: string) {
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/lens-check/admin/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }) });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "Couldn't update access.");
      await load(); setEmail(""); setNotice(role === "remove" ? "Report access removed." : "Access saved. They can sign in with this email; no invitation email was sent.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Couldn't update access."); }
    finally { setBusy(false); }
  }
  return <details className="border border-border bg-cream-deep p-5">
    <summary className="cursor-pointer font-medium">Who can view reports?</summary>
    <p className="mt-3 text-sm text-charcoal-mid">Add Sam here when ready. Viewers can read analysis and export data without contact details; admins can also export legacy contacts and manage access. Access is checked using a verified email.</p>
    <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); void change(email, role); }}>
      <label className="grid gap-1 text-sm">Email<input type="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} className="min-h-11 max-w-full border border-border bg-cream px-3" /></label>
      <label className="grid gap-1 text-sm">Access<select value={role} onChange={e => setRole(e.target.value)} className="min-h-11 border border-border bg-cream px-3"><option value="viewer">View reports</option><option value="admin">Manage reports and access</option></select></label>
      <button disabled={busy} className="min-h-11 bg-green px-4 text-cream">{busy ? "Saving…" : "Save access"}</button>
    </form>
    <ul className="mt-4 space-y-2 text-sm">{members.map(member => <li key={member.email} className="flex flex-wrap items-center gap-3 break-all"><span>{member.email} · {member.owner ? "Owner" : member.role}</span>{!member.owner && <button disabled={busy} className="underline" onClick={() => { if (window.confirm(`Remove report access for ${member.email}?`)) void change(member.email, "remove"); }}>Remove access</button>}</li>)}</ul>
    {notice && <p role="status" className="mt-3 text-sm">{notice}</p>}
  </details>;
}
