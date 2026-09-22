import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const items = await db.projects.getAll();
    return NextResponse.json(items);
  } catch (err) {
    console.error("[api/projects] GET failed:", err);
    return NextResponse.json(
      { error: "Failed to load projects", detail: String(err) },
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
        const replaced = await db.projects.replaceAll(body.items);
        return NextResponse.json(replaced, { status: 200 });
      } catch (err) {
        return NextResponse.json(
          { error: "Bulk replace failed", detail: String(err) },
          { status: 500 }
        );
      }
    }

    // Single create
    if (!body.title || !body.category || !body.description) {
      return NextResponse.json(
        { error: "title, category, and description are required" },
        { status: 400 }
      );
    }

    const techs: string[] =
      Array.isArray(body.technologies)
        ? body.technologies
        : String(body.technologies || "")
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean);

    const images: string[] =
      Array.isArray(body.images) && body.images.length
        ? body.images
        : ["/images/portfolio-1.webp"];

    const newProject = await db.projects.add({
      id: "",
      title: body.title,
      category: body.category,
      description: body.description,
      technologies: techs,
      images,
      github: body.github || "",
      demo: body.demo || undefined,
      published: body.published ?? true,
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (err) {
    console.error("[api/projects] POST failed:", err);
    return NextResponse.json(
      { error: "Failed to create project", detail: String(err) },
      { status: 500 }
    );
  }
}
