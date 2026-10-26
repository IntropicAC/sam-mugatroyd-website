import { permittedAuthUser, permittedTestEmail, reportRoleForEmail } from "@/lib/lens-check/report-access";
import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import AccountSignIn from "@/components/lens-check/AccountSignIn";
import { getLensCheckAuth } from "@/lib/lens-check/auth";
import { accountsEnabled, safeReturnTo } from "@/lib/lens-check/account-policy";
import { getAuthConfig, isAllowedAuthUser, isAuthTestEmail } from "@/lib/lens-check/auth-config";
import AccountFrame from "@/components/lens-check/AccountFrame";

export const metadata: Metadata = {
  title: "Mindset Test sign-in | Perception 47",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

async function Account({ searchParams }: Props) {
  await connection();
  const auth = getLensCheckAuth();
  const config = getAuthConfig();
  if (!auth || !config) return <AccountFrame><p className="eyebrow">Coming soon</p><h2>Your account, soon.</h2><p>Account sign-in is being prepared. Please check back later.</p></AccountFrame>;
  const result = await auth.getSession({ query: { disableCookieCache: "true" } }).catch(() => null);
  if (!result || result.error) return <AccountFrame><h2>A moment, please.</h2><p role="alert">Sign-in is temporarily unavailable. Please refresh or try again shortly.</p></AccountFrame>;
  const params = await searchParams;
  const returnTo = accountsEnabled() ? safeReturnTo(params.returnTo) : undefined;
  const user = result.data?.user;
  const allowed = await permittedAuthUser(user, config);
  const reports = allowed ? await reportRoleForEmail(user?.email).catch(() => null) : null;
  const pendingVerificationEmail = config.passwordEnabled && user && !user.emailVerified && await permittedTestEmail(user.email, config) ? user.email : undefined;
  const initialError = params.error === "social" ? "We couldn't complete that sign-in. Try again, or continue with an email code." : params.error === "account" ? "Use your approved test email to access your readings." : "";
  return <AccountFrame signedIn={allowed}>
    {reports && <a className="btn full" href="/lens-check/admin">Reports &amp; analysis <span aria-hidden="true">↗</span></a>}
    <AccountSignIn key={`${user?.id || "guest"}:${allowed}:${params.status === "signed-out" ? "signed-out" : ""}`} signedIn={Boolean(user) && !pendingVerificationEmail} accountAllowed={allowed} emailAddress={user?.email} pendingVerificationEmail={pendingVerificationEmail} passwordEnabled={config.passwordEnabled} returnTo={returnTo} socialProviders={config.socialProviders} initialError={initialError} signedOut={params.status === "signed-out"} />
  </AccountFrame>;
}

export default function AccountPage(props: Props) {
  return <div className="lc lc-account-page lc-sign-in-page" data-clarity-mask="true">
    <Suspense fallback={<AccountFrame><div className="lc-account-loading" role="status">Getting your space ready…</div></AccountFrame>}><Account {...props} /></Suspense>
  </div>;
}
