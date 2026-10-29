import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const count = await db.messages.unreadCount();
    return NextResponse.json({ count });
  } catch (err) {
    console.error("[api/messages/unread-count] GET failed:", err);
    return NextResponse.json(
      { error: "Failed to load unread count", detail: String(err) },
      { status: 500 }
    );
  }
}
