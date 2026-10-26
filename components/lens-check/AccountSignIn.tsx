"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/lens-check/auth-client";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, validNewPassword } from "@/lib/lens-check/password-policy";
import type { SocialProvider } from "@/lib/lens-check/auth-config";

type Screen = "password" | "create" | "verify" | "code" | "recover" | "reset" | "setup";
type Purpose = "sign-in" | "email-verification" | "forget-password";

function ProviderMark({ provider }: { provider: SocialProvider }) {
  return provider === "microsoft" ? <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#f25022" d="M2 2h9v9H2z" /><path fill="#7fba00" d="M13 2h9v9h-9z" /><path fill="#00a4ef" d="M2 13h9v9H2z" /><path fill="#ffb900" d="M13 13h9v9h-9z" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.6Z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.8-2.5l-3.3-2.6c-.9.6-2 1-3.5 1-2.6 0-4.9-1.8-5.7-4.1H2.9v2.7A10.3 10.3 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.3 13.8a6.2 6.2 0 0 1 0-3.6V7.5H2.9a10 10 0 0 0 0 9l3.4-2.7Z" /><path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10.3 10.3 0 0 0-9.1 5.5l3.4 2.7c.8-2.3 3.1-4.1 5.7-4.1Z" /></svg>;
}

export default function AccountSignIn({ signedIn, returnTo, emailAddress, accountAllowed = true, socialProviders = [], passwordEnabled = false, pendingVerificationEmail, initialError = "", signedOut = false }: {
  signedIn: boolean; returnTo?: string; emailAddress?: string; accountAllowed?: boolean;
  socialProviders?: SocialProvider[]; passwordEnabled?: boolean; pendingVerificationEmail?: string; initialError?: string; signedOut?: boolean;
}) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>(pendingVerificationEmail ? "verify" : passwordEnabled ? "password" : "code");
  const [email, setEmail] = useState(pendingVerificationEmail || emailAddress || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState("");
  const cooldowns = useRef(new Map<string, number>());
  const emailValue = email.trim().toLowerCase();
  const accountView = signedIn && !["setup", "reset"].includes(screen);
  const newPassword = screen === "create" || screen === "reset";
  const hasPassword = screen === "password" || newPassword;
  const hasCode = screen === "reset" || ((screen === "code" || screen === "verify") && codeSent);
  const purpose: Purpose = screen === "verify" ? "email-verification" : ["recover", "setup", "reset"].includes(screen) ? "forget-password" : "sign-in";

  function changeScreen(next: Screen) {
    setScreen(next); setPassword(""); setOtp(""); setCodeSent(false); setError(""); setNotice(""); setShowPassword(false);
  }
  async function finishSignIn() {
    // Fresh server verification, rather than trusting the signup client state.
    const response = await fetch("/api/auth/get-session?disableCookieCache=true", { cache: "no-store" });
    if (!response.ok) throw new Error("We couldn't confirm your session. Please try signing in again.");
    const session = await response.json();
    if (!session?.user?.emailVerified) return false;
    setPassword(""); setOtp("");
    router.replace(returnTo || "/lens-check/my-results"); router.refresh();
    return true;
  }
  async function sendCode(type: Purpose) {
    const key = `${type}:${emailValue}`;
    if (Date.now() < (cooldowns.current.get(key) || 0)) throw new Error("Please wait a minute before requesting another code.");
    const result = await authClient.emailOtp.sendVerificationOtp({ email: emailValue, type });
    if (result.error) throw new Error("We couldn't send a code. Check your test email address or try again shortly.");
    cooldowns.current.set(key, Date.now() + 60_000); setCodeSent(true); setOtp("");
  }
  async function socialSignIn(provider: SocialProvider) {
    setBusy(true); setError(""); setPassword(""); setOtp("");
    try {
      const callbackURL = new URL("/lens-check/auth/callback", window.location.origin);
      callbackURL.searchParams.set("returnTo", returnTo || "/lens-check/my-results");
      const result = await authClient.signIn.social({ provider, callbackURL: callbackURL.href });
      if (result.error) throw new Error("Provider unavailable");
    } catch { setError("We couldn't connect. Use email instead, or try again shortly."); }
    finally { setBusy(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      if (newPassword && !validNewPassword(password)) throw new Error("Choose a password with at least 15 characters, up to 128 characters.");
      if (screen === "password") {
        const result = await authClient.signIn.email({ email: emailValue, password });
        if (result.error) throw new Error("Email or password not recognised. Check them, or use an email code.");
        if (!result.data?.user?.emailVerified) { setScreen("verify"); setCodeSent(false); }
        else if (!(await finishSignIn())) throw new Error("This account isn't enabled for the test. Use your approved test email.");
      } else if (screen === "create") {
        const result = await authClient.signUp.email({ email: emailValue, password, name: "Mindset Test reader" });
        if (result.error) throw new Error("We couldn't create that account. If you've signed in before, use Sign in or set a password with an email code.");
        setScreen("verify"); setCodeSent(false);
        // Use verification, not a sign-in OTP that could remove an unverified password.
        await sendCode("email-verification");
      } else if (screen === "recover" || screen === "setup") {
        await sendCode("forget-password"); setScreen("reset");
      } else if (screen === "reset") {
        const result = await authClient.emailOtp.resetPassword({ email: emailValue, otp: otp.trim(), password });
        if (result.error) throw new Error("We couldn't save your password. Check your code or request a new one.");
        // A follow-up failure must not send the user back to a consumed reset
        // code or imply the successfully saved password failed to change.
        let stage: "sign-in" | "revoke" | "session" = "sign-in";
        try {
          const login = await authClient.signIn.email({ email: emailValue, password });
          if (login.error) throw new Error("Sign-in unavailable");
          stage = "revoke";
          const revocation = await authClient.revokeOtherSessions();
          if (revocation.error) throw new Error("Revocation unavailable");
          stage = "session";
          if (!(await finishSignIn())) throw new Error("Session unavailable");
        } catch {
          changeScreen("password");
          setNotice(stage === "revoke" ? "Your password was saved, but we couldn't sign out your other devices. Sign in again and retry from your account." : "Your password was saved. Sign in with your new password to continue.");
        }
      } else if (!codeSent) { await sendCode(purpose);
      } else if (screen === "verify") {
        const result = await authClient.emailOtp.verifyEmail({ email: emailValue, otp: otp.trim() });
        if (result.error) throw new Error("That code couldn't be verified. Check it or request another code.");
        if (!(await finishSignIn())) { changeScreen(passwordEnabled ? "password" : "code"); setNotice("Email verified. Sign in to continue."); }
      } else {
        const result = await authClient.signIn.emailOtp({ email: emailValue, otp: otp.trim() });
        if (result.error) throw new Error("That code couldn't be verified. Check it or request another code.");
        if (!(await finishSignIn())) throw new Error("Please use your approved test email to sign in.");
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "We couldn't complete that request. Please try again."); }
    finally { setPassword(""); setBusy(false); }
  }
  async function resendCode() {
    setBusy(true); setError("");
    try { await sendCode(purpose); } catch (reason) { setError(reason instanceof Error ? reason.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true); setError(""); setPassword(""); setOtp("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign-out failed");
      router.replace("/lens-check/account?status=signed-out"); router.refresh();
    } catch { setError("We couldn't sign you out. Please try again."); }
    finally { setBusy(false); }
  }
  const title = screen === "create" ? "Create your account" : screen === "verify" ? "Verify your email" : screen === "recover" ? "Reset your password" : screen === "setup" ? "Set your password" : screen === "reset" ? "Choose your password" : screen === "code" && codeSent ? "Check your inbox" : "Welcome back";
  const description = screen === "create" ? "Save your readings and return whenever you like." : screen === "verify" ? "Confirm your email to finish setting up your account." : screen === "reset" ? "Enter your email code and choose a new password." : ["recover", "setup"].includes(screen) ? "We'll email you a code to set or change your password." : screen === "code" && codeSent ? "Enter the one-time code sent to your email." : "Sign in to your Mindset Test account.";

  return <div className="lc-account-form">
    {notice && <p className="lc-account-notice" role="status">{notice}</p>}
    {accountView ? <>
      <span className="lc-account-status"><span aria-hidden="true" />{accountAllowed ? "Signed in" : "Account needs attention"}</span>
      <h1>{accountAllowed ? "Your account" : "Choose your test account"}</h1>
      <p className="lc-account-copy">{accountAllowed ? "Your readings, whenever you need them." : "This email isn't enabled for the test. Sign out and use your approved email."}</p>
      <div className="lc-account-identity"><span className="lc-account-identity-icon" aria-hidden="true">✧</span><div><span className="eyebrow">Your email</span><p>{emailAddress || "Email verified"}</p></div></div>
      {accountAllowed && <Link className="btn full" href={returnTo || "/lens-check/my-results"}>{returnTo?.startsWith("/lens-check/result?") ? "Continue to your reading" : "My results"}<span aria-hidden="true">↗</span></Link>}
      {accountAllowed && passwordEnabled && emailAddress && <button type="button" className="text-btn" disabled={busy} onClick={() => { setEmail(emailAddress); changeScreen("setup"); }}>Set or change password</button>}
      <button type="button" className="btn ghost full" disabled={busy} onClick={signOut}>{busy ? "Signing out…" : "Sign out"}</button>
    </> : <>
      {signedOut && !notice && <p role="status" className="lc-account-notice">You&apos;re signed out.</p>}
      <div className="lc-login-heading"><p className="eyebrow">The Mindset Test</p><h1>{title}</h1><p className="lc-account-copy">{description}</p></div>
      {["password", "create", "code"].includes(screen) && !codeSent && socialProviders.length > 0 && <>
        <div className="lc-social-buttons">{socialProviders.map((provider) => <button key={provider} type="button" className="lc-social-button" disabled={busy} title={provider === "microsoft" ? "Use your Outlook, Hotmail or Microsoft account" : undefined} onClick={() => socialSignIn(provider)}><ProviderMark provider={provider} />Continue with {provider === "google" ? "Google" : "Microsoft"}</button>)}</div>
        <div className="lc-account-divider"><span>or continue with email</span></div>
      </>}
      <form onSubmit={submit} className="lc-account-fields">
        <div className="lc-field"><label htmlFor="account-email">Email address</label><input id="account-email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" value={email} disabled={busy || codeSent || screen === "verify" || screen === "setup"} onChange={(event) => setEmail(event.target.value)} /></div>
        {hasCode && <div className="lc-field"><label htmlFor="account-code">Email code</label><input id="account-code" autoComplete="one-time-code" inputMode="numeric" required maxLength={12} className="lc-account-code" placeholder="Enter your code" value={otp} disabled={busy} onChange={(event) => setOtp(event.target.value)} /></div>}
        {hasPassword && <div className="lc-field">
          <div className="lc-password-label"><label htmlFor="account-password">{newPassword ? "New password" : "Password"}</label>{screen === "password" && <button type="button" className="lc-inline-button" disabled={busy} onClick={() => changeScreen("recover")}>Forgot or set a password?</button>}</div>
          <div className="lc-password-input"><input id="account-password" type={showPassword ? "text" : "password"} autoComplete={newPassword ? "new-password" : "current-password"} minLength={newPassword ? MIN_PASSWORD_LENGTH : undefined} maxLength={MAX_PASSWORD_LENGTH} required value={password} disabled={busy} onChange={(event) => setPassword(event.target.value)} aria-describedby={newPassword ? "account-password-hint" : undefined} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} disabled={busy} onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button></div>
          {newPassword && <p id="account-password-hint" className="lc-account-fine">Use at least 15 characters. You can paste from a password manager.</p>}
        </div>}
        <button className="btn full" type="submit" disabled={busy}>{busy ? "Please wait…" : screen === "password" ? "Sign in" : screen === "create" ? "Create account" : screen === "reset" ? "Save password" : hasCode ? screen === "verify" ? "Verify email" : "Verify and sign in" : screen === "verify" ? "Email a verification code" : ["recover", "setup"].includes(screen) ? "Email a password code" : "Email me a code"}<span aria-hidden="true">→</span></button>
        {codeSent && <div className="lc-account-resend"><button type="button" className="text-btn" disabled={busy} onClick={resendCode}>Send another code</button>{screen === "code" && <button type="button" className="text-btn" disabled={busy} onClick={() => changeScreen("code")}>Change email</button>}</div>}
      </form>
      {screen === "password" && <div className="lc-login-alternatives"><button type="button" className="text-btn" disabled={busy} onClick={() => changeScreen("code")}>Use an email code instead</button><p className="lc-account-fine">New here? <button type="button" className="lc-inline-button" disabled={busy} onClick={() => changeScreen("create")}>Create an account</button></p></div>}
      {screen !== "password" && <button type="button" className="text-btn" disabled={busy} onClick={() => changeScreen(passwordEnabled ? "password" : "code")}>{signedIn ? "Back to account" : "Back to sign in"}</button>}
    </>}
    {error && <p className="lc-account-error" role="alert">{error}</p>}
  </div>;
}
