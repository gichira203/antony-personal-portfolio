import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const image = await db.images.getById(id);
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(image.data), {
      status: 200,
      headers: {
        "Content-Type": image.mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[api/uploads/:id] GET failed:", err);
    return NextResponse.json(
      { error: "Failed to load image", detail: String(err) },
      { status: 500 }
    );
  }
}
