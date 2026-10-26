import { accountsEnabled } from "@/lib/lens-check/account-policy";
import { listAccountResults, verifiedPrincipal } from "@/lib/lens-check/accounts";

export async function GET() {
  const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };
  if (!accountsEnabled()) return Response.json({ error: "Accounts are not available." }, { status: 503, headers });
  try {
    const principal = await verifiedPrincipal();
    if (!principal) return Response.json({ error: "Sign in to see your readings." }, { status: 401, headers });
    return Response.json({ results: await listAccountResults(principal) }, { headers });
  } catch {
    return Response.json({ error: "Your readings are temporarily unavailable." }, { status: 503, headers });
  }
}
