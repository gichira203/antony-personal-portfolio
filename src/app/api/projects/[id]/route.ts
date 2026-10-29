import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { AdminProject } from "@/data/adminData";

type Params = { params: Promise<{ id: string }> };

type ProjectPatch = Partial<Omit<AdminProject, "technologies">> & {
  technologies?: string[] | string;
};

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const p = await db.projects.getById(id);
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

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as ProjectPatch;

    const techs =
      body.technologies !== undefined
        ? Array.isArray(body.technologies)
          ? body.technologies
          : String(body.technologies)
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
        : undefined;

    const patch: ProjectPatch = {};
    if (body.title !== undefined) patch.title = body.title;
    if (body.category !== undefined) patch.category = body.category;
    if (body.description !== undefined) patch.description = body.description;
    if (techs !== undefined) patch.technologies = techs;
    if (body.images !== undefined) patch.images = body.images;
    if (body.github !== undefined) patch.github = body.github;
    if (body.demo !== undefined) patch.demo = body.demo;
    if (body.published !== undefined) patch.published = body.published;

    const updated = await db.projects.update(id, patch);
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

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { id } = await params;
    const project = await db.projects.getById(id);
    const ok = await db.projects.delete(id);
    if (!ok) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Remove any uploaded images that belonged to this project.
    if (project) {
      const uploadIds = project.images
        .map((url: string) => {
          const match = /^\/api\/uploads\/([^/?#]+)$/.exec(url);
          return match ? match[1] : null;
        })
        .filter((value: string | null): value is string => Boolean(value));
      await Promise.all(
        uploadIds.map((imageId: string) =>
          db.images.delete(imageId).catch(() => false)
        )
      );
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
