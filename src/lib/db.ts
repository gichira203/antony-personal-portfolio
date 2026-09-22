import pg from "pg";
import { randomUUID } from "crypto";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — cannot connect to Neon");
}

// Match the backend's connection string augmentation
const pool = new Pool({
  connectionString: connectionString + "&uselibpqcompat=true&sslmode=verify-full",
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err: Error) => {
  console.error("[db] unexpected pool error:", err);
});

// ---- One-time table setup ----

async function ensureTables(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`\n      CREATE TABLE IF NOT EXISTS \"Project\" (\n        id TEXT PRIMARY KEY,\n        title TEXT NOT NULL,\n        category TEXT NOT NULL,\n        description TEXT NOT NULL,\n        technologies TEXT[] NOT NULL DEFAULT '{}',\n        images TEXT[] NOT NULL DEFAULT '{}',\n        github TEXT NOT NULL DEFAULT '',\n        demo TEXT,\n        published BOOLEAN NOT NULL DEFAULT true\n      );\n    `);
    await client.query(`\n      CREATE TABLE IF NOT EXISTS \"Testimonial\" (\n        id TEXT PRIMARY KEY,\n        quote TEXT NOT NULL,\n        author TEXT NOT NULL,\n        role TEXT NOT NULL DEFAULT '',\n        image TEXT NOT NULL DEFAULT '',\n        highlightTitle TEXT NOT NULL DEFAULT '',\n        published BOOLEAN NOT NULL DEFAULT true\n      );\n    `);
    await client.query(`\n      CREATE TABLE IF NOT EXISTS \"Message\" (\n        id TEXT PRIMARY KEY,\n        name TEXT NOT NULL DEFAULT '',\n        email TEXT NOT NULL DEFAULT '',\n        phone TEXT NOT NULL DEFAULT '',\n        subject TEXT NOT NULL DEFAULT '',\n        body TEXT NOT NULL DEFAULT '',\n        \"time\" TEXT NOT NULL DEFAULT '',\n        read BOOLEAN NOT NULL DEFAULT false\n      );\n    `);
    await client.query(`\n      CREATE TABLE IF NOT EXISTS \"AdminUser\" (\n        username TEXT PRIMARY KEY,\n        password TEXT NOT NULL,\n        display_name TEXT NOT NULL DEFAULT ''\n      );\n    `);
    await client.query(`\n      INSERT INTO \"AdminUser\" (username, password, display_name)\n      VALUES ('antony', '12anto34', 'Antony Muthii')\n      ON CONFLICT (username) DO NOTHING;\n    `);
    console.log("[db] tables ready");
  } catch (err) {
    console.error("[db] table creation failed:", err);
    throw err;
  } finally {
    client.release();
  }
}

// Run once at module load (cold start on Vercel). Failures are fatal — the API
// routes will 500 until the DB is reachable, which is the correct behaviour.
ensureTables().catch((err) => {
  console.error("[db] ensureTables fatal:", err);
  process.exit(1);
});

// ---- Helpers ----

/** Map backend-style row to clean project object. */
function normalizeProject(row: any) {
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

/** Map backend-style row to clean testimonial object. */
function normalizeTestimonial(row: any) {
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

/** Map backend-style row to clean message object. */
function normalizeMessage(row: any) {
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

// ---- Projects ----

export const projects = {
  getAll: () =>
    pool
      .query(
        'SELECT id, title, category, description, technologies, images, github, demo, published FROM "Project" ORDER BY id ASC'
      )
      .then((r) => r.rows.map(normalizeProject)),

  getById: (id: string) =>
    pool
      .query(
        'SELECT id, title, category, description, technologies, images, github, demo, published FROM "Project" WHERE id = $1',
        [id]
      )
      .then((r) => (r.rows[0] ? normalizeProject(r.rows[0]) : null)),

  add: (item: any) =>
    pool
      .query(
        `INSERT INTO "Project" (id, title, category, description, technologies, images, github, demo, published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          randomUUID(),
          item.title,
          item.category,
          item.description,
          Array.isArray(item.technologies) ? item.technologies : [],
          Array.isArray(item.images) ? item.images : [],
          item.github || "",
          item.demo || null,
          !!item.published,
        ]
      )
      .then((r) => ({
        id: r.rows[0].id,
        title: item.title,
        category: item.category,
        description: item.description,
        technologies: Array.isArray(item.technologies) ? item.technologies : [],
        images: Array.isArray(item.images) ? item.images : [],
        github: item.github || "",
        demo: item.demo || undefined,
        published: !!item.published,
      })),

  update: (id: string, patch: any) =>
    pool
      .query(
        'SELECT id, title, category, description, technologies, images, github, demo, published FROM "Project" WHERE id = $1',
        [id]
      )
      .then((existing) => {
        if (existing.rows.length === 0) return null;
        const row = existing.rows[0];
        const techs =
          patch.technologies !== undefined
            ? Array.isArray(patch.technologies)
              ? patch.technologies
              : []
            : row.technologies;
        const images =
          patch.images !== undefined
            ? Array.isArray(patch.images)
              ? patch.images
              : []
            : row.images;
        return pool.query(
          `UPDATE "Project" SET
             title = $1, category = $2, description = $3,
             technologies = $4, images = $5, github = $6,
             demo = $7, published = $8
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
        ).then(() => ({
          id,
          title: patch.title !== undefined ? patch.title : row.title,
          category: patch.category !== undefined ? patch.category : row.category,
          description: patch.description !== undefined ? patch.description : row.description,
          technologies: techs,
          images,
          github: patch.github !== undefined ? patch.github : row.github,
          demo: patch.demo !== undefined ? patch.demo : row.demo,
          published: patch.published !== undefined ? patch.published : row.published,
        }));
      }),

  delete: (id: string) =>
    pool
      .query('DELETE FROM "Project" WHERE id = $1', [id])
      .then((r) => (r.rowCount ?? 0) > 0),

  replaceAll: (items: any[]) =>
    pool.query("BEGIN").then(() => {
      const incomingIds = new Set(items.map((it) => it.id));
      if (incomingIds.size > 0) {
        const placeholders = Array.from(incomingIds)
          .map((_, i) => `$${i + 1}`)
          .join(", ");
        return pool.query(
          `DELETE FROM "Project" WHERE id NOT IN (${placeholders})`,
          Array.from(incomingIds)
        ).then(() => pool.query("SELECT 1"));
      }
      return pool.query("SELECT 1");
    }).then(() => {
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
      const promises: Promise<any>[] = [];
      for (const it of items) {
        const techs = Array.isArray(it.technologies) ? it.technologies : [];
        const images = Array.isArray(it.images) ? it.images : [];
        promises.push(
          pool
            .query(sql, [
              it.id,
              it.title,
              it.category,
              it.description,
              techs,
              images,
              it.github || "",
              it.demo || null,
              !!it.published,
            ])
            .then(() =>
              pool
                .query(
                  'SELECT id, title, category, description, technologies, images, github, demo, published FROM "Project" WHERE id = $1',
                  [it.id]
                )
                .then((r) => (r.rows[0] ? normalizeProject(r.rows[0]) : null))
            )
        );
      }
      return Promise.all(promises).then((rows) => rows.filter(Boolean) as any[]);
    }),
};

// ---- Testimonials ----

export const testimonials = {
  getAll: () =>
    pool
      .query(
        'SELECT id, quote, author, role, image, highlightTitle, published FROM "Testimonial" ORDER BY id ASC'
      )
      .then((r) => r.rows.map(normalizeTestimonial)),

  getById: (id: string) =>
    pool
      .query(
        'SELECT id, quote, author, role, image, highlightTitle, published FROM "Testimonial" WHERE id = $1',
        [id]
      )
      .then((r) => (r.rows[0] ? normalizeTestimonial(r.rows[0]) : null)),

  add: (item: any) =>
    pool
      .query(
        `INSERT INTO "Testimonial" (id, quote, author, role, image, highlightTitle, published)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          randomUUID(),
          item.quote,
          item.author,
          item.role || "",
          item.image || "",
          item.highlightTitle || "",
          !!item.published,
        ]
      )
      .then((r) => ({
        id: r.rows[0].id,
        quote: item.quote,
        author: item.author,
        role: item.role || "",
        image: item.image || "",
        highlightTitle: item.highlightTitle || "",
        published: !!item.published,
      })),

  update: (id: string, patch: any) =>
    pool
      .query(
        'SELECT id, quote, author, role, image, highlightTitle, published FROM "Testimonial" WHERE id = $1',
        [id]
      )
      .then((existing) => {
        if (existing.rows.length === 0) return null;
        const row = existing.rows[0];
        return pool.query(
          `UPDATE "Testimonial" SET
             quote = $1, author = $2, role = $3,
             image = $4, highlightTitle = $5, published = $6
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
        ).then(() => ({
          id,
          quote: patch.quote !== undefined ? patch.quote : row.quote,
          author: patch.author !== undefined ? patch.author : row.author,
          role: patch.role !== undefined ? patch.role : row.role,
          image: patch.image !== undefined ? patch.image : row.image,
          highlightTitle:
            patch.highlightTitle !== undefined ? patch.highlightTitle : row.highlightTitle,
          published: patch.published !== undefined ? patch.published : row.published,
        }));
      }),

  delete: (id: string) =>
    pool
      .query('DELETE FROM "Testimonial" WHERE id = $1', [id])
      .then((r) => (r.rowCount ?? 0) > 0),

  replaceAll: (items: any[]) =>
    pool.query("BEGIN").then(() => {
      const incomingIds = new Set(items.map((it) => it.id));
      if (incomingIds.size > 0) {
        const placeholders = Array.from(incomingIds)
          .map((_, i) => `$${i + 1}`)
          .join(", ");
        return pool.query(
          `DELETE FROM "Testimonial" WHERE id NOT IN (${placeholders})`,
          Array.from(incomingIds)
        ).then(() => pool.query("SELECT 1"));
      }
      return pool.query("SELECT 1");
    }).then(() => {
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
      const promises: Promise<any>[] = [];
      for (const it of items) {
        promises.push(
          pool
            .query(sql, [
              it.id,
              it.quote,
              it.author,
              it.role || "",
              it.image || "",
              it.highlightTitle || "",
              !!it.published,
            ])
            .then(() =>
              pool
                .query(
                  'SELECT id, quote, author, role, image, highlightTitle, published FROM "Testimonial" WHERE id = $1',
                  [it.id]
                )
                .then((r) => (r.rows[0] ? normalizeTestimonial(r.rows[0]) : null))
            )
        );
      }
      return Promise.all(promises).then((rows) => rows.filter(Boolean) as any[]);
    }),
};

// ---- Messages ----

export const messages = {
  getAll: () =>
    pool
      .query('SELECT id, name, email, phone, subject, body, "time", read FROM "Message" ORDER BY id ASC')
      .then((r) => r.rows.map(normalizeMessage)),

  getById: (id: string) =>
    pool
      .query('SELECT id, name, email, phone, subject, body, "time", read FROM "Message" WHERE id = $1', [
        id,
      ])
      .then((r) => (r.rows[0] ? normalizeMessage(r.rows[0]) : null)),

  add: (item: any) =>
    pool
      .query(
        `INSERT INTO "Message" (id, name, email, phone, subject, body, "time", read)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          randomUUID(),
          item.name || "",
          item.email || "",
          item.phone || "",
          item.subject || "",
          item.body || "",
          item.time || "",
          !!item.read,
        ]
      )
      .then((r) => ({
        id: r.rows[0].id,
        name: item.name || "",
        email: item.email || "",
        phone: item.phone || "",
        subject: item.subject || "",
        body: item.body || "",
        time: item.time || "",
        read: !!item.read,
        isOutbound: item.isOutbound || false,
      })),

  update: (id: string, patch: any) =>
    pool
      .query(
        'SELECT id, name, email, phone, subject, body, "time", read FROM "Message" WHERE id = $1',
        [id]
      )
      .then((existing) => {
        if (existing.rows.length === 0) return null;
        const row = existing.rows[0];
        return pool.query(
          `UPDATE "Message" SET
             name = $1, email = $2, phone = $3, subject = $4,
             body = $5, "time" = $6, read = $7
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
        ).then(() => ({
          id,
          name: patch.name !== undefined ? patch.name : row.name,
          email: patch.email !== undefined ? patch.email : row.email,
          phone: patch.phone !== undefined ? patch.phone : row.phone,
          subject: patch.subject !== undefined ? patch.subject : row.subject,
          body: patch.body !== undefined ? patch.body : row.body,
          time: patch.time !== undefined ? patch.time : row.time,
          read: patch.read !== undefined ? patch.read : row.read,
        }));
      }),

  delete: (id: string) =>
    pool
      .query('DELETE FROM "Message" WHERE id = $1', [id])
      .then((r) => (r.rowCount ?? 0) > 0),

  unreadCount: () =>
    pool
      .query('SELECT COUNT(*)::int FROM "Message" WHERE read = false')
      .then((r) => r.rows[0].count),

  replaceAll: (items: any[]) =>
    pool.query("BEGIN").then(() => {
      const incomingIds = new Set(items.map((it) => it.id));
      if (incomingIds.size > 0) {
        const placeholders = Array.from(incomingIds)
          .map((_, i) => `$${i + 1}`)
          .join(", ");
        return pool.query(
          `DELETE FROM "Message" WHERE id NOT IN (${placeholders})`,
          Array.from(incomingIds)
        ).then(() => pool.query("SELECT 1"));
      }
      return pool.query("SELECT 1");
    }).then(() => {
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
      const promises: Promise<any>[] = [];
      for (const it of items) {
        promises.push(
          pool
            .query(sql, [
              it.id,
              it.name || "",
              it.email || "",
              it.phone || "",
              it.subject || "",
              it.body || "",
              it.time || "",
              !!it.read,
            ])
            .then(() =>
              pool
                .query(
                  'SELECT id, name, email, phone, subject, body, "time", read FROM "Message" WHERE id = $1',
                  [it.id]
                )
                .then((r) => (r.rows[0] ? normalizeMessage(r.rows[0]) : null))
            )
        );
      }
      return Promise.all(promises).then((rows) => rows.filter(Boolean) as any[]);
    }),
};

// ---- Users (admin auth) ----

export const users = {
  getByUsername: (username: string) =>
    pool
      .query('SELECT username, password, display_name FROM "AdminUser" WHERE username = $1', [
        username,
      ])
      .then((r) => (r.rows[0] ? (r.rows[0] as any) : null)),
};

// ---- Explicit db object (mirrors backend's shape) ----

export const db = {
  projects,
  testimonials,
  messages,
  users,
};
