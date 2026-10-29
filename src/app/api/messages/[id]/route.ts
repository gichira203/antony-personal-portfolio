import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { id } = await params;
    const msg = await db.messages.getById(id);
    if (!msg) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    return NextResponse.json(msg);
  } catch (err) {
    console.error("[api/messages/:id] GET failed:", err);
    return NextResponse.json(
      { error: "Failed to load message", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const patch: Record<string, unknown> = {};
    if (body.body !== undefined && body.body !== null) patch.body = body.body;
    if (body.message !== undefined && body.message !== null) {
      patch.body = body.message;
    }
    if (body.read !== undefined) patch.read = !!body.read;
    if (body.name !== undefined && body.name !== null) patch.name = body.name;
    if (body.email !== undefined && body.email !== null) patch.email = body.email;
    if (body.subject !== undefined && body.subject !== null) {
      patch.subject = body.subject;
    }
    if (body.phone !== undefined && body.phone !== null) patch.phone = body.phone;

    const updated = await db.messages.update(id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[api/messages/:id] PATCH failed:", err);
    return NextResponse.json(
      { error: "Failed to update message", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { id } = await params;
    const ok = await db.messages.delete(id);
    if (!ok) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[api/messages/:id] DELETE failed:", err);
    return NextResponse.json(
      { error: "Failed to delete message", detail: String(err) },
      { status: 500 }
    );
  }
}
