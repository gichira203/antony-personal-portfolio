import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent, saveContentSection } from "@/lib/content";
import { isContentSection } from "@/data/siteContentDefaults";

export async function GET() {
  try {
    const content = await getSiteContent();
    return NextResponse.json(content, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[api/content] GET failed:", err);
    return NextResponse.json(
      { error: "Failed to load content" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      section?: string;
      value?: unknown;
    };
    const section = String(body.section || "");
    if (!isContentSection(section)) {
      return NextResponse.json(
        { error: "Unknown content section" },
        { status: 400 }
      );
    }

    if (body.value === undefined || body.value === null) {
      return NextResponse.json({ error: "value is required" }, { status: 400 });
    }

    const serialized = JSON.stringify(body.value);
    if (serialized.length > 500_000) {
      return NextResponse.json(
        { error: "Content section is too large" },
        { status: 413 }
      );
    }

    await saveContentSection(section, body.value);
    return NextResponse.json({ ok: true, section });
  } catch (err) {
    console.error("[api/content] PUT failed:", err);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}
