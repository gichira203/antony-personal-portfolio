import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as any;
    const { name, phone, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "name, email and message are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const msg = await db.messages.add({
      id: "",
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : "",
      subject: "Contact form message",
      body: String(message).trim(),
      time: now,
      read: false,
    });

    return NextResponse.json({ ok: true, id: msg.id }, { status: 201 });
  } catch (err) {
    console.error("[api/contact] POST failed:", err);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
