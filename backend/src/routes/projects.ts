import { Router } from "express";
import { db } from "../data.js";

const router = Router();

// GET /api/projects — return all (frontend filters published vs draft)
router.get("/", async (_req, res) => {
  try {
    const items = await db.projects.getAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to load projects", detail: String(err) });
  }
});

// GET /api/projects/:id
router.get("/:id", async (req, res) => {
  try {
    const p = await db.projects.getById(req.params.id);
    if (!p) return res.status(404).json({ error: "Project not found" });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: "Failed to load project", detail: String(err) });
  }
});

// POST /api/projects  (also handles bulk replace when body.replaceAll is set)
router.post("/", async (req, res) => {
  const body = req.body as any;
  if (body?.replaceAll && Array.isArray(body.items)) {
    try {
      const replaced = await db.projects.replaceAll(body.items);
      return res.status(200).json(replaced);
    } catch (err) {
      return res.status(500).json({ error: "Bulk replace failed", detail: String(err) });
    }
  }
  const partial = req.body as any;
  if (!partial.title || !partial.category || !partial.description) {
    return res.status(400).json({ error: "title, category, and description are required" });
  }
  try {
    const techs: string[] =
      Array.isArray(partial.technologies)
        ? partial.technologies
        : (partial.technologies || "")
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean);
    const newProject = await db.projects.add({
      id: "",
      title: partial.title,
      category: partial.category,
      description: partial.description,
      technologies: techs,
      images: Array.isArray(partial.images) && partial.images.length
        ? partial.images
        : ["/images/portfolio-1.webp"],
      github: partial.github || "",
      demo: partial.demo || undefined,
      published: partial.published ?? true,
    });
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ error: "Failed to create project", detail: String(err) });
  }
});

// PATCH /api/projects/:id
router.patch("/:id", async (req, res) => {
  const body = req.body as any;
  const techs = body.technologies !== undefined
    ? (Array.isArray(body.technologies) ? body.technologies : String(body.technologies).split(",").map((t: string) => t.trim()).filter(Boolean))
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

  try {
    const updated = await db.projects.update(req.params.id, patch);
    if (!updated) return res.status(404).json({ error: "Project not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update project", detail: String(err) });
  }
});

// DELETE /api/projects/:id
router.delete("/:id", async (req, res) => {
  try {
    const ok = await db.projects.delete(req.params.id);
    if (!ok) return res.status(404).json({ error: "Project not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project", detail: String(err) });
  }
});

export default router;
