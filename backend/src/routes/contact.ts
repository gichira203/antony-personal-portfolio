import { Router } from "express";
import { db } from "../data.js";

const router = Router();

// POST /api/contact  — receive messages from the public contact form
router.post("/", async (req, res) => {
  const body = req.body as any;
  const { name, phone, email, message } = body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email and message are required" });
  }

  try {
    const now = new Date().toISOString();
    const msg = await db.messages.add({
      id: "",
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : "",
      subject: "Contact form message",
      body: String(message).trim(),
      time: now,
      read: false,
    });
    res.status(201).json({ ok: true, id: msg.id });
  } catch (err) {
    console.error("[contact] failed to save:", err);
    res.status(500).json({ error: "Failed to save message" });
  }
});

export default router;
