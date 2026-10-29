import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { verifyAdminToken } from "./admin-auth";

const originalEmail = process.env.ADMIN_EMAIL;
const originalSecret = process.env.ADMIN_SESSION_SECRET;

function token(payload: Record<string, unknown>, secret: string) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

afterEach(() => {
  if (originalEmail === undefined) delete process.env.ADMIN_EMAIL;
  else process.env.ADMIN_EMAIL = originalEmail;
  if (originalSecret === undefined) delete process.env.ADMIN_SESSION_SECRET;
  else process.env.ADMIN_SESSION_SECRET = originalSecret;
});

describe("admin signed session", () => {
  it("accepts only a signed, non-expired token for the configured email", () => {
    const secret = "test-only-secret-with-32-characters-minimum";
    process.env.ADMIN_EMAIL = "admin@example.test";
    process.env.ADMIN_SESSION_SECRET = secret;
    const value = token({ email: "admin@example.test", exp: 2000, nonce: "n1" }, secret);
    expect(verifyAdminToken(value, 1000)).toEqual({ email: "admin@example.test" });
    expect(verifyAdminToken(`${value}tampered`, 1000)).toBeNull();
    expect(verifyAdminToken(token({ email: "other@example.test", exp: 2000, nonce: "n1" }, secret), 1000)).toBeNull();
    expect(verifyAdminToken(token({ email: "admin@example.test", exp: 999, nonce: "n1" }, secret), 1000)).toBeNull();
  });

  it("fails closed when the session secret is absent or too short", () => {
    process.env.ADMIN_EMAIL = "admin@example.test";
    const value = token({ email: "admin@example.test", exp: 2000, nonce: "n1" }, "not-long-enough");
    process.env.ADMIN_SESSION_SECRET = "not-long-enough";
    expect(verifyAdminToken(value, 1000)).toBeNull();
    delete process.env.ADMIN_SESSION_SECRET;
    expect(verifyAdminToken(value, 1000)).toBeNull();
  });
});
