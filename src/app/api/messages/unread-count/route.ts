import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
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
