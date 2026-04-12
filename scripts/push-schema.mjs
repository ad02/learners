import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN env vars");
  process.exit(1);
}

const client = createClient({ url, authToken });
const sql = readFileSync(join(__dirname, "schema.sql"), "utf8");

const statements = sql
  .split(";")
  .map((s) =>
    s
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .trim()
  )
  .filter((s) => s.length > 0);

for (const stmt of statements) {
  const firstLine = stmt.split("\n")[0].slice(0, 80);
  console.log("Running:", firstLine);
  await client.execute(stmt);
}

console.log(`\nDone. Applied ${statements.length} statements.`);
