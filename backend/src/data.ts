// PostgreSQL-backed data layer for the admin panel.
// Uses node-postgres (pg) against Neon. Tables are created on first run
// via CREATE TABLE IF NOT EXISTS, so no separate migration step is needed.

import { Pool, PoolClient } from "pg";
import type { Pool as PoolType } from "pg";
import * as dotenv from "dotenv";

// Load .env so DATABASE_URL is available (tsx does not auto-load it).
dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

console.log("[data] DATABASE_URL:", (process.env.DATABASE_URL || "").slice(0, 40) + "...");

// ---- Pool setup ----

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("BACKEND: DATABASE_URL is not set in .env");
}

const pool: PoolType = new Pool({
  connectionString: connectionString + "&uselibpqcompat=true&sslmode=verify-full",
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err) => {
  console.error("[data] unexpected pool error:", err);
});

// ---- Table creation ----

async function ensureTables(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Project" (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        technologies TEXT[] NOT NULL DEFAULT '{}',
        images TEXT[] NOT NULL DEFAULT '{}',
        github TEXT NOT NULL DEFAULT '',
        demo TEXT,
        published BOOLEAN NOT NULL DEFAULT true
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Testimonial" (
        id TEXT PRIMARY KEY,
        quote TEXT NOT NULL,
        author TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT '',
        image TEXT NOT NULL DEFAULT '',
        highlightTitle TEXT NOT NULL DEFAULT '',
        published BOOLEAN NOT NULL DEFAULT true
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Message" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        subject TEXT NOT NULL DEFAULT '',
        body TEXT NOT NULL DEFAULT '',
        "time" TEXT NOT NULL DEFAULT '',
        read BOOLEAN NOT NULL DEFAULT false
      );
    `);
    await client.query(`
      ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "AdminUser" (
        username TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        display_name TEXT NOT NULL DEFAULT ''
      );
    `);
    await client.query(`
      INSERT INTO "AdminUser" (username, password, display_name)
      VALUES ('antony', '12anto34', 'Antony Muthii')
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log("[data] tables ready");
  } catch (err) {
    console.error("[data] table creation failed:", err);
    throw err;
  } finally {
    client.release();
  }
}

// One-time setup at module load. Failures here are non-fatal — the pool will
// still be usable, but data endpoints will 500 until the DB is reachable.
ensureTables().catch((err) => console.error("[data] ensureTables error:", err));

// ---- Shared client helper ----

/**
 * Run `fn` inside a client transaction-ish block. The client is released
 * back to the pool when `fn` resolves or rejects.
 */
async function withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

// ---- ID generation ----

/**
 * Always produce a fresh UUID. The caller should pass an empty string for new
 * rows (the backend overwrites it) — but even if a non-empty id is passed in
 * we still return a new UUID so that bulk replaceAll / create can never
 * accidentally reuse an existing id.
 */
function newId(): string {
  // crypto.randomUUID() is available in Node 19+ and in tsx/Node 18+ with
  // the crypto global. Fall back to a v4-style UUID built from random bytes
  // if for some reason it is absent.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback (Node < 19 without polyfill): v4 UUID from random bytes.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// ---- Projects ----

export const projects = {
  getAll: (): Promise<any[]> => withClient((client) =>
    client.query('SELECT id, title, category, description, technologies, images, github, demo, published FROM "Project" ORDER BY id ASC').then((r) =>
      r.rows.map(normalizeProject)
    )
  ),

  getById: (id: string): Promise<any | null> => withClient((client) =>
    client.query('SELECT id, title, category, description, technologies, images, github, demo, published FROM "Project" WHERE id = $1', [id]).then((r) =>
      (r.rows[0] as any) ? normalizeProject(r.rows[0]) : null
    )
  ),

  add: (item: any): Promise<any> => withClient(async (client) => {
    const id = newId();
    const techs = Array.isArray(item.technologies) ? item.technologies : [];
    const images = Array.isArray(item.images) ? item.images : [];
    await client.query(
      `INSERT INTO "Project" (id, title, category, description, technologies, images, github, demo, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, item.title, item.category, item.description, techs, images, item.github || "", item.demo || null, !!item.published]
    );
    return { ...item, id, technologies: techs, images };
  }),

  update: (id: string, patch: any): Promise<any | null> => withClient(async (client) => {
    const existing = await client.query(
      'SELECT id, title, category, description, technologies, images, github, demo, published FROM "Project" WHERE id = $1',
      [id]
    );
    if (existing.rows.length === 0) return null;

    const row = existing.rows[0];
    const techs = Array.isArray(patch.technologies) ? patch.technologies : row.technologies;
    const images = Array.isArray(patch.images) ? patch.images : row.images;

    await client.query(
      `UPDATE "Project" SET
         title = $1,
         category = $2,
         description = $3,
         technologies = $4,
         images = $5,
         github = $6,
         demo = $7,
         published = $8
       WHERE id = $9`,
      [
        patch.title !== undefined ? patch.title : row.title,
        patch.category !== undefined ? patch.category : row.category,
        patch.description !== undefined ? patch.description : row.description,
        techs,
        images,
        patch.github !== undefined ? patch.github : row.github,
        patch.demo !== undefined ? patch.demo : row.demo,
        patch.published !== undefined ? patch.published : row.published,
        id,
      ]
    );
    return {
      id,
      title: patch.title !== undefined ? patch.title : row.title,
      category: patch.category !== undefined ? patch.category : row.category,
      description: patch.description !== undefined ? patch.description : row.description,
      technologies: techs,
      images,
      github: patch.github !== undefined ? patch.github : row.github,
      demo: patch.demo !== undefined ? patch.demo : row.demo,
      published: patch.published !== undefined ? patch.published : row.published,
    };
  }),

  delete: (id: string): Promise<boolean> => withClient((client) =>
    client.query('DELETE FROM "Project" WHERE id = $1', [id]).then((r) => (r.rowCount ?? 0) > 0)
  ),

  replaceAll: (items: any[]): Promise<any[]> => withClient(async (client) => {
    // Delete rows not in the incoming set so deletions stick.
    const incomingIds = new Set(items.map((it) => it.id));
    if (incomingIds.size > 0) {
      await client.query(
        `DELETE FROM "Project" WHERE id NOT IN (${Array.from(incomingIds).map((_, i) => `$${i + 1}`).join(", ")})`,
        Array.from(incomingIds)
      );
    }
    const upsertValues: any[] = [];
    const sql = `
      INSERT INTO "Project" (id, title, category, description, technologies, images, github, demo, published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        description = EXCLUDED.description,
        technologies = EXCLUDED.technologies,
        images = EXCLUDED.images,
        github = EXCLUDED.github,
        demo = EXCLUDED.demo,
        published = EXCLUDED.published
    `;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const techs = Array.isArray(it.technologies) ? it.technologies : [];
      const images = Array.isArray(it.images) ? it.images : [];
      upsertValues.push(
        [it.id, it.title, it.category, it.description, techs, images, it.github || "", it.demo || null, !!it.published]
      );
      await client.query(sql, [it.id, it.title, it.category, it.description, techs, images, it.github || "", it.demo || null, !!it.published]);
    }
    // Read back the rows we just wrote so the caller sees the real stored ids.
    return Promise.all(
      upsertValues.map(([, title, category, description, id]) =>
        client.query('SELECT id, title, category, description, technologies, images, github, demo, published FROM "Project" WHERE id = $1', [id]).then((r) => (r.rows[0] as any) ? normalizeProject(r.rows[0]) : null)
      )
    ).then((rows) => rows.filter(Boolean) as any[]);
  }),
};

// ---- Testimonials ----

export const testimonials = {
  getAll: (): Promise<any[]> => withClient((client) =>
    client.query('SELECT id, quote, author, role, image, highlightTitle, published FROM "Testimonial" ORDER BY id ASC').then((r) =>
      r.rows.map(normalizeTestimonial)
    )
  ),

  getById: (id: string): Promise<any | null> => withClient((client) =>
    client.query('SELECT id, quote, author, role, image, highlightTitle, published FROM "Testimonial" WHERE id = $1', [id]).then((r) =>
      (r.rows[0] as any) ? normalizeTestimonial(r.rows[0]) : null
    )
  ),

  add: (item: any): Promise<any> => withClient(async (client) => {
    const id = newId();
    await client.query(
      `INSERT INTO "Testimonial" (id, quote, author, role, image, highlightTitle, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, item.quote, item.author, item.role || "", item.image || "", item.highlightTitle || "", !!item.published]
    );
    return { ...item, id };
  }),

  update: (id: string, patch: any): Promise<any | null> => withClient(async (client) => {
    const existing = await client.query(
      'SELECT id, quote, author, role, image, highlightTitle, published FROM "Testimonial" WHERE id = $1',
      [id]
    );
    if (existing.rows.length === 0) return null;

    const row = existing.rows[0];
    await client.query(
      `UPDATE "Testimonial" SET
         quote = $1,
         author = $2,
         role = $3,
         image = $4,
         highlightTitle = $5,
         published = $6
       WHERE id = $7`,
      [
        patch.quote !== undefined ? patch.quote : row.quote,
        patch.author !== undefined ? patch.author : row.author,
        patch.role !== undefined ? patch.role : row.role,
        patch.image !== undefined ? patch.image : row.image,
        patch.highlightTitle !== undefined ? patch.highlightTitle : row.highlightTitle,
        patch.published !== undefined ? patch.published : row.published,
        id,
      ]
    );
    return {
      id,
      quote: patch.quote !== undefined ? patch.quote : row.quote,
      author: patch.author !== undefined ? patch.author : row.author,
      role: patch.role !== undefined ? patch.role : row.role,
      image: patch.image !== undefined ? patch.image : row.image,
      highlightTitle: patch.highlightTitle !== undefined ? patch.highlightTitle : row.highlightTitle,
      published: patch.published !== undefined ? patch.published : row.published,
    };
  }),

  delete: (id: string): Promise<boolean> => withClient((client) =>
    client.query('DELETE FROM "Testimonial" WHERE id = $1', [id]).then((r) => (r.rowCount ?? 0) > 0)
  ),

  replaceAll: (items: any[]): Promise<any[]> => withClient(async (client) => {
    // Delete rows not in the incoming set so deletions stick.
    const incomingIds = new Set(items.map((it) => it.id));
    if (incomingIds.size > 0) {
      await client.query(
        `DELETE FROM "Testimonial" WHERE id NOT IN (${Array.from(incomingIds).map((_, i) => `$${i + 1}`).join(", ")})`,
        Array.from(incomingIds)
      );
    }
    const upsertValues: any[] = [];
    const sql = `
      INSERT INTO "Testimonial" (id, quote, author, role, image, highlightTitle, published)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        quote = EXCLUDED.quote,
        author = EXCLUDED.author,
        role = EXCLUDED.role,
        image = EXCLUDED.image,
        highlightTitle = EXCLUDED.highlightTitle,
        published = EXCLUDED.published
    `;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      upsertValues.push([it.id, it.quote, it.author, it.role, it.image, it.highlightTitle, !!it.published]);
      await client.query(sql, [it.id, it.quote, it.author, it.role || "", it.image || "", it.highlightTitle || "", !!it.published]);
    }
    return Promise.all(
      upsertValues.map(([, quote, author]) =>
        client.query('SELECT id, quote, author, role, image, highlightTitle, published FROM "Testimonial" WHERE id = $1', [upsertValues.find((v) => v[1] === quote && v[2] === author)?.[0]]).then((r) => (r.rows[0] as any) ? normalizeTestimonial(r.rows[0]) : null)
      )
    ).then((rows) => rows.filter(Boolean) as any[]);
  }),
};

// ---- Messages ----

export const messages = {
  getAll: (): Promise<any[]> => withClient((client) =>
    client.query('SELECT id, name, email, subject, body, "time", read FROM "Message" ORDER BY id ASC').then((r) =>
      r.rows.map(normalizeMessage)
    )
  ),

  getById: (id: string): Promise<any | null> => withClient((client) =>
    client.query('SELECT id, name, email, subject, body, "time", read FROM "Message" WHERE id = $1', [id]).then((r) =>
      (r.rows[0] as any) ? normalizeMessage(r.rows[0]) : null
    )
  ),

  add: (item: any): Promise<any> => withClient(async (client) => {
    const id = newId();
    await client.query(
      `INSERT INTO "Message" (id, name, email, phone, subject, body, "time", read)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, item.name || "", item.email || "", item.phone || "", item.subject || "", item.body || "", item.time || "", !!item.read]
    );
    return { ...item, id };
  }),

  update: (id: string, patch: any): Promise<any | null> => withClient(async (client) => {
    const existing = await client.query(
      'SELECT id, name, email, phone, subject, body, "time", read FROM "Message" WHERE id = $1',
      [id]
    );
    if (existing.rows.length === 0) return null;

    const row = existing.rows[0];
    await client.query(
      `UPDATE "Message" SET
         name = $1,
         email = $2,
         phone = $3,
         subject = $4,
         body = $5,
         "time" = $6,
         read = $7
       WHERE id = $8`,
      [
        patch.name !== undefined ? patch.name : row.name,
        patch.email !== undefined ? patch.email : row.email,
        patch.phone !== undefined ? patch.phone : row.phone,
        patch.subject !== undefined ? patch.subject : row.subject,
        patch.body !== undefined ? patch.body : row.body,
        patch.time !== undefined ? patch.time : row.time,
        patch.read !== undefined ? patch.read : row.read,
        id,
      ]
    );
    return {
      id,
      name: patch.name !== undefined ? patch.name : row.name,
      email: patch.email !== undefined ? patch.email : row.email,
      phone: patch.phone !== undefined ? patch.phone : row.phone,
      subject: patch.subject !== undefined ? patch.subject : row.subject,
      body: patch.body !== undefined ? patch.body : row.body,
      time: patch.time !== undefined ? patch.time : row.time,
      read: patch.read !== undefined ? patch.read : row.read,
    };
  }),

  delete: (id: string): Promise<boolean> => withClient((client) =>
    client.query('DELETE FROM "Message" WHERE id = $1', [id]).then((r) => (r.rowCount ?? 0) > 0)
  ),

  markRead: (id: string): Promise<any | null> => withClient(async (client) => {
    const existing = await client.query('SELECT id, name, email, subject, body, "time", read FROM "Message" WHERE id = $1', [id]);
    if (existing.rows.length === 0) return null;
    await client.query('UPDATE "Message" SET read = true WHERE id = $1', [id]);
    const r = existing.rows[0] as any;
    return { ...normalizeMessage(r), read: true };
  }),

  unreadCount: (): Promise<number> => withClient((client) =>
    client.query('SELECT COUNT(*)::int FROM "Message" WHERE read = false').then((r) => r.rows[0].count)
  ),

  replaceAll: (items: any[]): Promise<any[]> => withClient(async (client) => {
    const incomingIds = new Set(items.map((it) => it.id));
    if (incomingIds.size > 0) {
      await client.query(
        `DELETE FROM "Message" WHERE id NOT IN (${Array.from(incomingIds).map((_, i) => `$${i + 1}`).join(", ")})`,
        Array.from(incomingIds)
      );
    }
    const upsertValues: any[] = [];
    const sql = `
      INSERT INTO "Message" (id, name, email, phone, subject, body, "time", read)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        subject = EXCLUDED.subject,
        body = EXCLUDED.body,
        "time" = EXCLUDED."time",
        read = EXCLUDED.read
    `;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      upsertValues.push([it.id, it.name, it.email, it.phone, it.subject, it.body, it.time, !!it.read]);
      await client.query(sql, [it.id, it.name || "", it.email || "", it.phone || "", it.subject || "", it.body || "", it.time || "", !!it.read]);
    }
    return Promise.all(
      upsertValues.map(([, id]) =>
        client.query('SELECT id, name, email, phone, subject, body, "time", read FROM "Message" WHERE id = $1', [id]).then((r) => (r.rows[0] as any) ? normalizeMessage(r.rows[0]) : null)
      )
    ).then((rows) => rows.filter(Boolean) as any[]);
  }),
};

// ---- Users (admin auth) ----

export const users = {
  getByUsername: (username: string): Promise<any | null> => withClient((client) =>
    client.query('SELECT username, password, display_name FROM "AdminUser" WHERE username = $1', [username]).then((r) =>
      (r.rows[0] as any) ?? null
    )
  ),
};

export const db = {
  projects,
  testimonials,
  messages,
  users,
};

// ---- Helpers ----

function normalizeProject(row: any): any {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    technologies: Array.isArray(row.technologies) ? row.technologies : [],
    images: Array.isArray(row.images) ? row.images : [],
    github: row.github || "",
    demo: row.demo || undefined,
    published: !!row.published,
  };
}

function normalizeTestimonial(row: any): any {
  return {
    id: row.id,
    quote: row.quote,
    author: row.author,
    role: row.role || "",
    image: row.image || "",
    highlightTitle: row.highlightTitle || "",
    published: !!row.published,
  };
}

function normalizeMessage(row: any): any {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || "",
    phone: row.phone || "",
    subject: row.subject || "",
    body: row.body || "",
    time: row.time || "",
    read: !!row.read,
    isOutbound: row.isOutbound || false,
  };
}
