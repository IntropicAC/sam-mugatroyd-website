import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { attemptKey, hashProof, resultAccess, safeReturnTo } from "./account-policy";

const proof = randomBytes(32).toString("base64url");
const pending = { accountRequired: true, ownerAccountId: null, claimHash: hashProof(proof), claimExpiresAt: new Date("2030-01-01") };

describe("account result access policy", () => {
  it("requires the original browser and a live deadline for an unclaimed result", () => {
    expect(resultAccess(pending, null, proof)).toBe("pending");
    expect(resultAccess(pending, "someone-else", null)).toBe("denied");
    expect(resultAccess(pending, null, randomBytes(32).toString("base64url"))).toBe("denied");
    expect(resultAccess(pending, null, proof, new Date("2030-01-01"))).toBe("denied");
  });
  it("accepts only the owner after claiming, regardless of browser proof or setup flag", () => {
    const owned = { ...pending, ownerAccountId: "account-a", claimHash: null, claimExpiresAt: null };
    expect(resultAccess(owned, "account-a", null)).toBe("owner");
    expect(resultAccess(owned, "account-b", proof)).toBe("denied");
    expect(resultAccess(owned, null, proof)).toBe("denied");
  });
  it("isolates submission retries by browser instead of treating a client ID as proof", () => {
    expect(attemptKey(proof, "attempt-a")).toBe(attemptKey(proof, "attempt-a"));
    expect(attemptKey(proof, "attempt-a")).not.toBe(attemptKey(randomBytes(32).toString("base64url"), "attempt-a"));
  });
  it("does not infer account ownership for legacy email submissions", () => {
    expect(resultAccess({ ...pending, accountRequired: false }, "account-a", proof)).toBe("legacy");
  });
  it("restricts sign-in return paths to readings and history", () => {
    const path = `/lens-check/result?t=${proof}`;
    expect(safeReturnTo(path)).toBe(path);
    for (const value of ["https://evil.invalid", "//evil.invalid", "/api/auth/sign-out", path + "&evil=true", undefined]) {
      expect(safeReturnTo(value)).toBe("/lens-check/my-results");
    }
  });
});
