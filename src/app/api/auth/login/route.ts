import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from "@/lib/sessionToken";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      username?: string;
      password?: string;
    };
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "username and password are required" },
        { status: 400 }
      );
    }

    const user = await db.users.getByUsername(username);
    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Upgrade legacy plaintext passwords on the first successful login.
    if (!user.password.startsWith("scrypt$")) {
      await db.users.updatePassword(user.username, hashPassword(password));
    }

    const session = {
      username: user.username,
      displayName: user.display_name || user.username,
      role: user.role,
    };
    const token = createSessionToken(session);

    const res = NextResponse.json({ user: session });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return res;
  } catch (err) {
    console.error("[api/auth/login] POST failed:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
