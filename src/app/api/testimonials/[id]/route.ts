import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const t = await db.testimonials.getById(id);
    if (!t) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }
    return NextResponse.json(t);
  } catch (err) {
    console.error("[api/testimonials/:id] GET failed:", err);
    return NextResponse.json(
      { error: "Failed to load testimonial", detail: String(err) },
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
    const body = await req.json().catch(() => ({})) as any;

    const patch: any = {};
    if (body.quote !== undefined) patch.quote = body.quote;
    if (body.author !== undefined) patch.author = body.author;
    if (body.role !== undefined) patch.role = body.role;
    if (body.image !== undefined) patch.image = body.image;
    if (body.highlightTitle !== undefined) patch.highlightTitle = body.highlightTitle;
    if (body.published !== undefined) patch.published = body.published;

    const updated = await db.testimonials.update(id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[api/testimonials/:id] PATCH failed:", err);
    return NextResponse.json(
      { error: "Failed to update testimonial", detail: String(err) },
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
    const ok = await db.testimonials.delete(id);
    if (!ok) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[api/testimonials/:id] DELETE failed:", err);
    return NextResponse.json(
      { error: "Failed to delete testimonial", detail: String(err) },
      { status: 500 }
    );
  }
}
