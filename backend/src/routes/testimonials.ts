import { Router } from "express";
import { db } from "../data.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    res.json(await db.testimonials.getAll());
  } catch (err) {
    res.status(500).json({ error: "Failed to load testimonials", detail: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const t = await db.testimonials.getById(req.params.id);
    if (!t) return res.status(404).json({ error: "Testimonial not found" });
    res.json(t);
  } catch (err) {
    res.status(500).json({ error: "Failed to load testimonial", detail: String(err) });
  }
});

router.post("/", async (req, res) => {
  const body = req.body as any;
  if (body?.replaceAll && Array.isArray(body.items)) {
    try {
      const replaced = await db.testimonials.replaceAll(body.items);
      return res.status(200).json(replaced);
    } catch (err) {
      return res.status(500).json({ error: "Bulk replace failed", detail: String(err) });
    }
  }
  const partial = req.body as any;
  if (!partial.quote || !partial.author) {
    return res.status(400).json({ error: "quote and author are required" });
  }
  try {
    const newT = await db.testimonials.add({
      id: "",
      quote: partial.quote,
      author: partial.author,
      role: partial.role || "",
      image: partial.image || "/images/person-m-7.webp",
      highlightTitle: partial.highlightTitle || "",
      published: partial.published ?? true,
    });
    res.status(201).json(newT);
  } catch (err) {
    res.status(500).json({ error: "Failed to create testimonial", detail: String(err) });
  }
});

router.patch("/:id", async (req, res) => {
  const body = req.body as any;
  const patch: any = {};
  if (body.quote !== undefined) patch.quote = body.quote;
  if (body.author !== undefined) patch.author = body.author;
  if (body.role !== undefined) patch.role = body.role;
  if (body.image !== undefined) patch.image = body.image;
  if (body.highlightTitle !== undefined) patch.highlightTitle = body.highlightTitle;
  if (body.published !== undefined) patch.published = body.published;

  try {
    const updated = await db.testimonials.update(req.params.id, patch);
    if (!updated) return res.status(404).json({ error: "Testimonial not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update testimonial", detail: String(err) });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const ok = await db.testimonials.delete(req.params.id);
    if (!ok) return res.status(404).json({ error: "Testimonial not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete testimonial", detail: String(err) });
  }
});

export default router;
