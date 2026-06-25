import fs from "node:fs";
import path from "node:path";

export function findRepoRoot(start = process.cwd()): string {
  let current = start;

  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, "modules", "questionnaire", "seed"))) {
      return current;
    }
    current = path.dirname(current);
  }

  throw new Error("Cannot locate repo root with modules/questionnaire/seed");
}

export const repoRoot = findRepoRoot();

export const databaseUrl =
  process.env.DATABASE_URL ??
  "postgres://smart_health_cabin:smart_health_cabin_dev@localhost:5432/smart_health_cabin";

export const apiPort = Number(process.env.PORT ?? 3000);
