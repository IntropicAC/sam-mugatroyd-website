import { NextResponse, type NextRequest } from "next/server";
import { getLensCheckAuth } from "@/lib/lens-check/auth";

// Private response headers. Reporting pages and endpoints verify account roles themselves.
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/lens-check/auth/callback") {
    const auth = getLensCheckAuth();
    // Let the SDK exchange its challenge/verifier for cookies and strip the
    // verifier. Report permissions are checked separately on the server.
    const response = auth ? await auth.middleware({ loginUrl: "/lens-check/account?error=social" })(request)
      : NextResponse.redirect(new URL("/lens-check/account", request.url));
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Robots-Tag", "noindex");
    return response;
  }
  const isAdmin = request.nextUrl.pathname.startsWith("/lens-check/admin") || request.nextUrl.pathname.startsWith("/api/lens-check/admin/");
  if (!isAdmin) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Robots-Tag", "noindex");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export const config = {
  matcher: ["/lens-check/admin", "/lens-check/admin/:path*", "/api/lens-check/admin/:path*", "/lens-check/result", "/lens-check/account", "/lens-check/my-results", "/lens-check/auth/callback"],
};
