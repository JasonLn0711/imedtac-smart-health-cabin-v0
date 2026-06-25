import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { databaseUrl, repoRoot } from "../config";

const { Client } = pg;
const migrationsDir = path.join(repoRoot, "infra", "migrations");
const client = new Client({ connectionString: databaseUrl });

await client.connect();

try {
  await client.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await fs.readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    const existing = await client.query("select filename from schema_migrations where filename = $1", [file]);
    if (existing.rowCount) {
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
    await client.query("begin");
    await client.query(sql);
    await client.query("insert into schema_migrations (filename) values ($1)", [file]);
    await client.query("commit");
    console.log(`applied ${file}`);
  }
} catch (error) {
  await client.query("rollback").catch(() => undefined);
  throw error;
} finally {
  await client.end();
}
