import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<any> }
) {
  try {
    const { id } = await params;
    const p = await db.projects.getById(id as string);
    if (!p) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(p);
  } catch (err) {
    console.error("[api/projects/:id] GET failed:", err);
    return NextResponse.json(
      { error: "Failed to load project", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<any> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({})) as any;

    const techs =
      body.technologies !== undefined
        ? Array.isArray(body.technologies)
          ? body.technologies
          : String(body.technologies)
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
        : undefined;

    const patch: any = {};
    if (body.title !== undefined) patch.title = body.title;
    if (body.category !== undefined) patch.category = body.category;
    if (body.description !== undefined) patch.description = body.description;
    if (techs !== undefined) patch.technologies = techs;
    if (body.images !== undefined) patch.images = body.images;
    if (body.github !== undefined) patch.github = body.github;
    if (body.demo !== undefined) patch.demo = body.demo;
    if (body.published !== undefined) patch.published = body.published;

    const updated = await db.projects.update(id as string, patch);
    if (!updated) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[api/projects/:id] PATCH failed:", err);
    return NextResponse.json(
      { error: "Failed to update project", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<any> }
) {
  try {
    const { id } = await params;
    const ok = await db.projects.delete(id as string);
    if (!ok) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[api/projects/:id] DELETE failed:", err);
    return NextResponse.json(
      { error: "Failed to delete project", detail: String(err) },
      { status: 500 }
    );
  }
}
