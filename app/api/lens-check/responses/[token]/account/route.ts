import { accountsEnabled } from "@/lib/lens-check/account-policy";
import { browserProof, claimAccountResponse, verifiedPrincipal } from "@/lib/lens-check/accounts";
import { RESULT_TOKEN_PATTERN } from "@/lib/lens-check/repository";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };
  const reply = (body: unknown, status = 200) => Response.json(body, { status, headers });
  if (!accountsEnabled()) return reply({ error: "Accounts are not available." }, 503);
  if (request.headers.get("origin") !== new URL(request.url).origin) return reply({ error: "Forbidden" }, 403);
  const { token } = await params;
  if (!RESULT_TOKEN_PATTERN.test(token)) return reply({ error: "Reading not found." }, 404);
  try {
    const principal = await verifiedPrincipal();
    if (!principal) return reply({ error: "Verify your email to save this reading." }, 401);
    const outcome = await claimAccountResponse(token, principal, await browserProof());
    return outcome === "owned" ? reply({ ok: true }) : reply({ error: "This reading could not be saved to your account. Open it in the browser where you completed it within 24 hours." }, 404);
  } catch {
    return reply({ error: "We couldn't save your reading. Please try again." }, 503);
  }
}
