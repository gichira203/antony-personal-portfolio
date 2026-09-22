import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const items = await db.messages.getAll();
    return NextResponse.json(items);
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
    const body = await req.json().catch(() => ({})) as any;

    // Bulk replace
    if (body?.replaceAll && Array.isArray(body.items)) {
      try {
        const replaced = await db.messages.replaceAll(body.items);
        return NextResponse.json(replaced, { status: 200 });
      } catch (err) {
        return NextResponse.json(
          { error: "Bulk replace failed", detail: String(err) },
          { status: 500 }
        );
      }
    }

    // Single create
    if (!body.name || !body.email || !body.subject || !body.body) {
      return NextResponse.json(
        { error: "name, email, subject, body are required" },
        { status: 400 }
      );
    }

    const phone: string = body.phone || "";
    const time: string = body.time ? String(body.time) : new Date().toISOString();

    const newMsg = await db.messages.add({
      id: "",
      name: body.name,
      email: body.email,
      phone,
      subject: body.subject,
      body: body.body,
      time,
      read: false,
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
