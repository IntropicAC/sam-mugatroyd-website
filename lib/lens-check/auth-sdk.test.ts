import { afterEach, expect, it, vi } from "vitest";
import { getLensCheckAuth } from "./auth";

afterEach(() => vi.unstubAllEnvs());

it("initializes the installed SDK with the configured cookie policy without contacting Neon", () => {
  vi.stubEnv("LENS_CHECK_AUTH_ENABLED", "true");
  vi.stubEnv("NEON_AUTH_BASE_URL", "https://isolated.neon.example/auth");
  vi.stubEnv("NEON_AUTH_COOKIE_SECRET", "s".repeat(32));
  vi.stubEnv("LENS_CHECK_AUTH_TEST_EMAILS", "tester@sample.org");
  const auth = getLensCheckAuth();
  expect(auth?.handler().POST).toBeTypeOf("function");
  expect(auth?.getSession).toBeTypeOf("function");
});
