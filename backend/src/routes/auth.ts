import { Router } from "express";
import { db } from "../data.js";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    return res.status(400).json({ error: "username and password are required" });
  }
  try {
    const user = await db.users.getByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({
      token: `admin-token-${user.username}`,
      displayName: user.display_name || user.username,
    });
  } catch (err) {
    res.status(500).json({ error: "Auth check failed", detail: String(err) });
  }
});

export default router;
