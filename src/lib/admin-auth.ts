import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "cadastrobf_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; startedAt: number }>();

type SessionPayload = { email: string; exp: number; nonce: string };

function adminEmail() {
  return (process.env.ADMIN_EMAIL ?? "dimasricsilva@gmail.com").trim().toLowerCase();
}

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function isRateLimited(key: string, now = Date.now()) {
  const current = attempts.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    attempts.set(key, { count: 1, startedAt: now });
    return false;
  }
  if (current.count >= MAX_ATTEMPTS) return true;
  current.count += 1;
  return false;
}

/** Configura autenticação apenas com segredos server-side, sem persistir senha no navegador. */
export async function authenticateAdmin(emailInput: string, password: string) {
  const email = emailInput.trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const secret = sessionSecret();
  if (!isRateLimited("admin")) {
    const matches = Boolean(
      email && email.length <= 254 && password && password.length <= 1024 && expectedPassword && secret &&
      email === adminEmail() && safeEqual(password, expectedPassword),
    );
    if (matches && secret) {
      attempts.delete("admin");
      const payload: SessionPayload = {
        email,
        exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
        nonce: randomUUID(),
      };
      const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, `${encoded}.${sign(encoded, secret)}`, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: SESSION_SECONDS,
      });
      return { ok: true as const };
    }
  }
  return { ok: false as const };
}

export function verifyAdminToken(token: string | undefined, nowSeconds = Math.floor(Date.now() / 1000)) {
  const secret = sessionSecret();
  if (!secret || !token || token.length > 2048) return null;
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra !== undefined || !safeEqual(sign(encoded, secret), signature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<SessionPayload>;
    if (payload.email !== adminEmail() || typeof payload.exp !== "number" || payload.exp <= nowSeconds || typeof payload.nonce !== "string") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function getAuthorizedAdmin() {
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(COOKIE_NAME)?.value);
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 0,
  });
  redirect("/admin/login");
}

export async function requireAdmin() {
  const admin = await getAuthorizedAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
