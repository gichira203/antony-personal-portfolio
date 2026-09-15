import { PoolClient } from "pg";

// Verify crypto.randomUUID works correctly in a loop (like replaceAll does)
console.log("Testing crypto.randomUUID() in a loop (10 iterations):");
const ids = [];
for (let i = 0; i < 10; i++) {
  ids.push(crypto.randomUUID());
}
console.log("Generated IDs:", ids);
console.log("All unique?", new Set(ids).size === ids.length);

// Also test the exact pattern used in replaceAll
console.log("\nTesting exact replaceAll pattern:");
const items = [
  { title: "A", id: "" },
  { title: "B", id: "" },
  { title: "C", id: "" },
];
const generatedIds = [];
for (const p of items) {
  const id = crypto.randomUUID();
  generatedIds.push(id);
  console.log(`  item ${p.title}: id = ${id}`);
}
console.log("All unique?", new Set(generatedIds).size === generatedIds.length);
