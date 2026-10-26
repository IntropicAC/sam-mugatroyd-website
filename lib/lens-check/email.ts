import "server-only";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";
import { listTitles } from "./titles";
import type { ResponseSource, ResultStatus } from "./types";
import { getEmailConfig } from "./email-config";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const COLORS = {
  cream: "#F5F0EA",
  creamDeep: "#EDE8DF",
  charcoal: "#2A2722",
  charcoalMid: "#514D49",
  charcoalMuted: "#8A8680",
  green: "#3D5948",
  border: "#D8D0C6",
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";

type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEmail(message: EmailMessage) {
  const config = getEmailConfig(message.to);
  if (!config) {
    console.warn("Mindset Test email skipped: delivery disabled or configuration/recipient not approved");
    return false;
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      body: JSON.stringify({
        from: config.from,
        html: message.html,
        reply_to: config.replyTo,
        subject: message.subject,
        text: message.text,
        to: [message.to],
      }),
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error("Mindset Test email provider rejected request", { status: response.status });
      return false;
    }

    return true;
  } catch {
    console.error("Mindset Test email network request failed");
    return false;
  }
}

function button(href: string, label: string, primary: boolean) {
  const style = primary
    ? `background:${COLORS.green};color:${COLORS.cream};border:1px solid ${COLORS.green};`
    : `background:transparent;color:${COLORS.green};border:1px solid ${COLORS.green};`;

  return `<a href="${escapeHtml(href)}" style="${style}display:inline-block;padding:14px 26px;font-family:${SANS};font-size:15px;font-weight:500;letter-spacing:0.02em;text-decoration:none;">${escapeHtml(label)} &rarr;</a>`;
}

function layout(bodyHtml: string, footerHtml: string) {
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:${COLORS.cream};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.cream};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="padding-bottom:24px;border-bottom:1px solid ${COLORS.border};font-family:${SANS};font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:${COLORS.charcoalMuted};">
              Perception 47 &middot; The Mindset Test
            </td>
          </tr>
          <tr><td style="padding:32px 0;">${bodyHtml}</td></tr>
          <tr>
            <td style="padding-top:24px;border-top:1px solid ${COLORS.border};font-family:${SANS};font-size:12px;line-height:1.6;color:${COLORS.charcoalMuted};">
              ${footerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function paragraph(html: string) {
  return `<p style="margin:0 0 18px;font-family:${SANS};font-size:16px;line-height:1.65;color:${COLORS.charcoalMid};">${html}</p>`;
}

function resultHeadline(status: ResultStatus, titles: string[]) {
  if (status === "mixed" && titles.length > 1) {
    return `Your answers sat between ${listTitles(titles)}.`;
  }

  if (status === "matched" && titles[0]) {
    return `Your answers leaned towards ${titles[0]}.`;
  }

  return "Your reading is ready.";
}

export async function sendResultEmail(details: {
  to: string;
  firstName: string | null;
  status: ResultStatus;
  archetypeTitles: string[];
  oneLiner: string | null;
  resultUrl: string;
  bookingUrl: string;
  followUpConsent: boolean;
}) {
  const greeting = details.firstName ? `Hi ${details.firstName},` : "Hi,";
  const headline = resultHeadline(details.status, details.archetypeTitles);
  const followUpLine = details.followUpConsent
    ? "You asked for a short personal note from Sam in a week to see how things are going, so expect one soon. Reply at any time if you'd rather not."
    : "This is the only email you'll receive about your result.";

  const html = layout(
    [
      paragraph(escapeHtml(greeting)),
      paragraph("Thank you for taking the Mindset Test."),
      `<h1 style="margin:8px 0 12px;font-family:${SERIF};font-size:28px;line-height:1.2;font-weight:400;color:${COLORS.charcoal};">${escapeHtml(headline)}</h1>`,
      details.oneLiner
        ? `<p style="margin:0 0 28px;font-family:${SERIF};font-style:italic;font-size:18px;line-height:1.5;color:${COLORS.green};">${escapeHtml(details.oneLiner)}</p>`
        : "",
      `<p style="margin:0 0 32px;">${button(details.resultUrl, "Read your full reading", true)}</p>`,
      `<div style="background:${COLORS.charcoal};padding:28px 24px;">
        <p style="margin:0 0 10px;font-family:${SANS};font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(245,240,234,0.5);">Talk it through</p>
        <p style="margin:0 0 20px;font-family:${SERIF};font-size:22px;line-height:1.3;color:${COLORS.cream};">Bring this to a free 20-minute call. Sam will help you see what sits behind it.</p>
        <a href="${escapeHtml(details.bookingUrl)}" style="display:inline-block;background:${COLORS.green};color:${COLORS.cream};padding:14px 26px;font-family:${SANS};font-size:15px;font-weight:500;text-decoration:none;">Book your free call &rarr;</a>
      </div>`,
    ].join(""),
    [
      "The Mindset Test is a reflection, not a clinical assessment. If you're struggling, you can call Samaritans free on 116 123 or contact NHS 111.",
      `<br><br>${escapeHtml(followUpLine)}`,
      `<br><br>Sent because you asked for your Mindset Test reading at <a href="${SITE_URL}" style="color:${COLORS.charcoalMuted};">sam-murgatroyd.co.uk</a>. <a href="${SITE_URL}/privacy" style="color:${COLORS.charcoalMuted};">Privacy policy</a>.`,
    ].join(""),
  );

  const text = [
    greeting,
    "",
    "Thank you for taking the Mindset Test.",
    "",
    headline,
    details.oneLiner ?? "",
    "",
    `Read your full reading: ${details.resultUrl}`,
    "",
    "Bring this to a free 20-minute call. Sam will help you see what sits behind it.",
    `Book your free call: ${details.bookingUrl}`,
    "",
    "The Mindset Test is a reflection, not a clinical assessment. If you're struggling, you can call Samaritans free on 116 123 or contact NHS 111.",
    "",
    followUpLine,
  ].join("\n");

  return sendEmail({
    to: details.to,
    subject: "Your Mindset Test reading",
    html,
    text,
  });
}

export async function sendLeadNotification(details: {
  firstName: string | null;
  email: string;
  status: ResultStatus;
  archetypeTitles: string[];
  secondaryArchetypeTitle: string | null;
  source: ResponseSource | null;
  followUpConsent: boolean;
  resultUrl: string;
}) {
  const to = process.env.LENS_CHECK_NOTIFY_EMAIL || CONTACT_EMAIL;
  const result =
    details.status === "mixed"
      ? `Between: ${details.archetypeTitles.join(" / ")}`
      : details.status === "matched"
        ? `${details.archetypeTitles[0] ?? "Unknown"}${details.secondaryArchetypeTitle ? ` (also some ${details.secondaryArchetypeTitle})` : ""}`
        : details.status === "unclear"
          ? "No single pattern stood out"
          : "Not enough answers for a pattern";
  const from = details.source?.from ? `Article: ${details.source.from}` : "Direct";
  const consent = details.followUpConsent
    ? "YES. They'd like a short personal note in about a week."
    : "NO. Please don't email them beyond the automatic result email.";

  const rows: [string, string][] = [
    ["Name", details.firstName ?? "(not given)"],
    ["Email", details.email],
    ["Result", result],
    ["Came from", from],
    ["Follow-up consent", consent],
  ];

  const html = layout(
    [
      `<h1 style="margin:0 0 20px;font-family:${SERIF};font-size:24px;font-weight:400;color:${COLORS.charcoal};">New Mindset Test reading unlocked</h1>`,
      `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">${rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid ${COLORS.border};font-family:${SANS};font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${COLORS.charcoalMuted};vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:8px 0;border-bottom:1px solid ${COLORS.border};font-family:${SANS};font-size:15px;color:${COLORS.charcoal};">${escapeHtml(value)}</td></tr>`,
        )
        .join("")}</table>`,
      `<p style="margin:0;">${button(details.resultUrl, "View their reading", false)}</p>`,
    ].join(""),
    "Only follow up with people whose follow-up consent says YES. Sent automatically by the Mindset Test on sam-murgatroyd.co.uk.",
  );

  const text = [
    "New Mindset Test reading unlocked",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `View their reading: ${details.resultUrl}`,
    "",
    "Only follow up with people whose follow-up consent says YES.",
  ].join("\n");

  return sendEmail({
    to,
    subject: `Mindset Test: ${details.firstName ?? "someone"} unlocked their reading`,
    html,
    text,
  });
}
