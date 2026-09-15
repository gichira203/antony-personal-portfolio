import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import projectsRouter from "./routes/projects.js";
import testimonialsRouter from "./routes/testimonials.js";
import messagesRouter from "./routes/messages.js";
import authRouter from "./routes/auth.js";
import contactRouter from "./routes/contact.js";

console.log("[index] DATABASE_URL set:", !!process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(cors({ origin: true }));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount routes
app.use("/api/projects", projectsRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/auth", authRouter);
app.use("/api/contact", contactRouter);

const server = createServer(app);

server.on("close", () => {
  console.log("[index] HTTP server closed");
});

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`  GET  /api/health`);
  console.log(`  GET  /api/projects`);
  console.log(`  POST /api/projects`);
  console.log(`  GET  /api/testimonials`);
  console.log(`  POST /api/testimonials`);
  console.log(`  GET  /api/messages`);
  console.log(`  POST /api/messages`);
  console.log(`  PATCH /api/messages/:id`);
  console.log(`  DELETE /api/messages/:id`);
});

// Graceful shutdown
async function shutdown() {
  console.log("[index] shutting down...");
  server.close(() => {
    console.log("[index] HTTP server closed");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
