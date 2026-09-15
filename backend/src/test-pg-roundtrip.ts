import { PoolClient } from "pg";

// Minimal test: insert 3 rows with randomUUID inside withClient, then read them back
async function test() {
  console.log("=== pg round-trip test ===");

  // We can't import pool here (circular), so just test the INSERT/SELECT logic
  console.log("This test requires the pool — checking if pg works in tsx...");
  const { Pool } = await import("pg");
  const p = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await p.query(`DELETE FROM "Project"`);

  const insertedIds: string[] = [];
  for (let i = 0; i < 3; i++) {
    const id = crypto.randomUUID();
    insertedIds.push(id);
    await p.query(
      `INSERT INTO "Project" (id, title, category, description, technologies, images, github, demo, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, `Test${i}`, "Cat", "Desc", "js", "/img.png", "", "", true]
    );
    console.log(`Inserted: ${id} (len=${id.length})`);
  }

  const { rows } = await p.query(`SELECT id, title FROM "Project" ORDER BY id`);
  console.log(`\nRows in DB (${[rows].length}):`);
  rows.forEach((r: any) => console.log(`  ${r.id} (len=${r.id.length}) | ${r.title}`));

  const uniqueInDb = new Set(rows.map((r: any) => r.id));
  console.log(`\nUnique IDs in DB: ${uniqueInDb.size} / ${rows.length}`);
  console.log(`Expected: ${insertedIds.length}, Got: ${uniqueInDb.size}`);

  await p.end();

  if (uniqueInDb.size !== insertedIds.length) {
    console.log("\n*** BUG CONFIRMED: DB returned fewer unique IDs than inserted ***");
  } else {
    console.log("\n*** OK: all IDs unique in DB ***");
  }
}

test().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
