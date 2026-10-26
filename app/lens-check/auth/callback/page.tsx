import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { safeReturnTo } from "@/lib/lens-check/account-policy";
import { verifiedPrincipal } from "@/lib/lens-check/accounts";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Finishing sign-in | Perception 47", robots: { index: false, follow: false }, referrer: "no-referrer" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
async function Callback({ searchParams }: Props) {
  await connection();
  const principal = await verifiedPrincipal().catch(() => null);
  if (!principal) redirect("/lens-check/account?error=account");
  return redirect(safeReturnTo((await searchParams).returnTo));
}

export default function SocialCallback(props: Props) {
  return <div className="lc lc-account-page"><div className="lc-account-loading" role="status">Finishing sign-in…</div><Suspense fallback={null}><Callback {...props} /></Suspense></div>;
}
