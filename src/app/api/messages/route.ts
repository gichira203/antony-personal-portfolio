import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const items = await db.messages.getAll();
    return NextResponse.json(items, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[api/messages] GET failed:", err);
    return NextResponse.json(
      { error: "Failed to load messages", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      body?: string;
      time?: string;
      isOutbound?: boolean;
      parentId?: string;
    };

    const message = String(body.body || "").trim();
    const email = String(body.email || "").trim();
    if (!message || !email) {
      return NextResponse.json(
        { error: "email and body are required" },
        { status: 400 }
      );
    }

    const outbound = body.isOutbound !== false;
    const newMsg = await db.messages.add({
      id: "",
      name: String(body.name || admin.displayName).trim(),
      email,
      phone: String(body.phone || "").trim(),
      subject: String(body.subject || "Re: your message").trim(),
      body: message,
      time: body.time ? String(body.time) : new Date().toISOString(),
      read: outbound,
      isOutbound: outbound,
      parentId: body.parentId || null,
    });

    return NextResponse.json(newMsg, { status: 201 });
  } catch (err) {
    console.error("[api/messages] POST failed:", err);
    return NextResponse.json(
      { error: "Failed to create message", detail: String(err) },
      { status: 500 }
    );
  }
}
