import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image type. Use PNG, JPG, WEBP, GIF or AVIF." },
        { status: 415 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image is too large. Maximum size is 10MB." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await db.images.add(buffer, file.type);

    return NextResponse.json(
      { id: saved.id, url: `/api/uploads/${saved.id}` },
      { status: 201 }
    );
  } catch (err) {
    console.error("[api/uploads] POST failed:", err);
    return NextResponse.json(
      { error: "Failed to upload image", detail: String(err) },
      { status: 500 }
    );
  }
}
