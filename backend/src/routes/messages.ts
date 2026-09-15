import { Router } from "express";
import { db } from "../data.js";

const router = Router();

// GET /api/messages
router.get("/", async (_req, res) => {
  try {
    res.json(await db.messages.getAll());
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages", detail: String(err) });
  }
});

// GET /api/messages/:id
router.get("/:id", async (req, res) => {
  try {
    const msg = await db.messages.getById(req.params.id);
    if (!msg) return res.status(404).json({ error: "Message not found" });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: "Failed to load message", detail: String(err) });
  }
});

// GET /api/messages/unread-count
router.get("/unread-count", async (_req, res) => {
  try {
    const count = await db.messages.unreadCount();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Failed to load unread count", detail: String(err) });
  }
});

// POST /api/messages  (also handles bulk replace when body.replaceAll is set)
router.post("/", async (req, res) => {
  const body = req.body as any;
  if (body?.replaceAll && Array.isArray(body.items)) {
    try {
      const replaced = await db.messages.replaceAll(body.items);
      return res.status(200).json(replaced);
    } catch (err) {
      return res.status(500).json({ error: "Bulk replace failed", detail: String(err) });
    }
  }
  const partial = req.body as any;
  if (!partial.name || !partial.email || !partial.subject || !partial.body) {
    return res.status(400).json({ error: "name, email, subject, body are required" });
  }

  const phone: string = partial.phone || "";

  // Determine the time field. The admin UI now sends ISO timestamps (via
  // new Date().toISOString()), preserve them so they survive a reload.
  // For inbound messages from the public contact form we synthesise one.
  const time: string = partial.time
    ? String(partial.time)
    : formatTimeAgo(new Date());

  try {
    const newMsg = await db.messages.add({
      id: "",
      name: partial.name,
      email: partial.email,
      phone,
      subject: partial.subject,
      body: partial.body,
      time,
      read: false,
    });
    res.status(201).json(newMsg);
  } catch (err) {
    res.status(500).json({ error: "Failed to create message", detail: String(err) });
  }
});

// PATCH /api/messages/:id
router.patch("/:id", async (req, res) => {
  const id = req.params.id;
  const partial = req.body as any;
  const patch: any = {};

  // The admin messages UI sends the updated body as `body`; also accept
  // `message` for any older consumers.
  if (partial.body !== undefined && partial.body !== null) patch.body = partial.body;
  if (partial.message !== undefined && partial.message !== null) patch.body = partial.message;
  if (partial.read !== undefined) patch.read = !!partial.read;
  if (partial.name !== undefined && partial.name !== null) patch.name = partial.name;
  if (partial.email !== undefined && partial.email !== null) patch.email = partial.email;
  if (partial.subject !== undefined && partial.subject !== null) patch.subject = partial.subject;
  if (partial.phone !== undefined && partial.phone !== null) patch.phone = partial.phone;

  try {
    const updated = await db.messages.update(id, patch);
    if (!updated) return res.status(404).json({ error: "Message not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update message", detail: String(err) });
  }
});

// DELETE /api/messages/:id
router.delete("/:id", async (req, res) => {
  try {
    const ok = await db.messages.delete(req.params.id);
    if (!ok) return res.status(404).json({ error: "Message not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete message", detail: String(err) });
  }
});

// Helpers
function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  if (diffDay === 1) return "1 day ago";
  return `${diffDay} days ago`;
}

export default router;
