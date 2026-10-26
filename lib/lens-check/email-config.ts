type Environment = Record<string, string | undefined>;

function realMailbox(value: string) {
  if (/[\r\n]/.test(value)) return false;
  const address = value.match(/<([^<>]+)>$/)?.[1] || value;
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(address)) return false;
  const domain = address.split("@")[1].toLowerCase();
  return !/(^|\.)(example\.(com|org|net)|invalid|example|test|localhost)$/.test(domain);
}

export function getEmailConfig(to: string, env: Environment = process.env) {
  const mode = env.LENS_CHECK_EMAIL_MODE;
  if (mode !== "test" && mode !== "live") return null;
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.LENS_CHECK_FROM_EMAIL?.trim();
  const replyTo = env.LENS_CHECK_REPLY_TO_EMAIL?.trim();
  if (!apiKey || !from || !replyTo || !realMailbox(from) || !realMailbox(replyTo) || !realMailbox(to)) return null;
  if (mode === "test") {
    const allowed = (env.LENS_CHECK_EMAIL_TEST_RECIPIENTS || "").split(",").map((address) => address.trim().toLowerCase());
    if (!allowed.includes(to.trim().toLowerCase())) return null;
  }
  return { apiKey, from, replyTo };
}
