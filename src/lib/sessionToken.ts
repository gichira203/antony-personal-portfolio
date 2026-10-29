import { createHash, createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  username: string;
  displayName: string;
  role: "admin" | "cashier";
  exp: number;
}

function sessionSecret(): string {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  // Fall back to a value derived from the database URL so deploys still work
  // before AUTH_SECRET is configured. Set AUTH_SECRET in production.
  return createHash("sha256")
    .update(`portfolio-session:${process.env.DATABASE_URL || "local-dev"}`)
    .digest("hex");
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(
  user: Omit<SessionUser, "exp">,
  maxAgeSeconds: number = SESSION_MAX_AGE_SECONDS
): string {
  const payload: SessionUser = {
    ...user,
    exp: Date.now() + maxAgeSeconds * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionUser | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SessionUser;
    if (!payload?.username || !payload?.role || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
