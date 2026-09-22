import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const items = await db.testimonials.getAll();
    return NextResponse.json(items);
  } catch (err) {
    console.error("[api/testimonials] GET failed:", err);
    return NextResponse.json(
      { error: "Failed to load testimonials", detail: String(err) },
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
        const replaced = await db.testimonials.replaceAll(body.items);
        return NextResponse.json(replaced, { status: 200 });
      } catch (err) {
        return NextResponse.json(
          { error: "Bulk replace failed", detail: String(err) },
          { status: 500 }
        );
      }
    }

    // Single create
    if (!body.quote || !body.author) {
      return NextResponse.json(
        { error: "quote and author are required" },
        { status: 400 }
      );
    }

    const newT = await db.testimonials.add({
      id: "",
      quote: body.quote,
      author: body.author,
      role: body.role || "",
      image: body.image || "/images/person-m-7.webp",
      highlightTitle: body.highlightTitle || "",
      published: body.published ?? true,
    });

    return NextResponse.json(newT, { status: 201 });
  } catch (err) {
    console.error("[api/testimonials] POST failed:", err);
    return NextResponse.json(
      { error: "Failed to create testimonial", detail: String(err) },
      { status: 500 }
    );
  }
}
