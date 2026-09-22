import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json().catch(() => ({})) as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json(
        { error: "username and password are required" },
        { status: 400 }
      );
    }

    const user = await db.users.getByUsername(username);
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({
      token: `admin-token-${user.username}`,
      displayName: user.display_name || user.username,
    });
  } catch (err) {
    console.error("[api/auth/login] POST failed:", err);
    return NextResponse.json(
      { error: "Auth check failed", detail: String(err) },
      { status: 500 }
    );
  }
}
