import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "../../apps/api-server/node_modules/pg/lib/index.js";

const { Pool } = pg;

function parseArgs(argv) {
  const args = {
    intervalMs: 1000,
    durationSec: 120,
    databaseUrl:
      process.env.DATABASE_URL ??
      "postgres://smart_health_cabin:smart_health_cabin_dev@localhost:5432/smart_health_cabin"
  };
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--output") {
      args.output = value;
      i += 1;
    } else if (key === "--run-id") {
      args.runId = value;
      i += 1;
    } else if (key === "--interval-ms") {
      args.intervalMs = Number(value);
      i += 1;
    } else if (key === "--duration-sec") {
      args.durationSec = Number(value);
      i += 1;
    } else if (key === "--database-url") {
      args.databaseUrl = value;
      i += 1;
    } else if (key === "--include-existing") {
      args.includeExisting = true;
    }
  }
  if (!args.output || !args.runId) {
    throw new Error("Usage: monitor_agent_turns.mjs --run-id <id> --output <dir>");
  }
  return args;
}

function appendJsonl(filePath, payload) {
  fs.appendFileSync(filePath, `${JSON.stringify(payload)}\n`, "utf8");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const args = parseArgs(process.argv);
  fs.mkdirSync(args.output, { recursive: true });
  const rowsPath = path.join(args.output, "agent_turn_rows.jsonl");
  const summaryPath = path.join(args.output, "agent_turn_monitor_summary.json");
  const pool = new Pool({ connectionString: args.databaseUrl });
  let lastCreatedAt = new Date(0).toISOString();
  let lastId = "00000000-0000-0000-0000-000000000000";
  const seenIds = new Set();
  let rowCount = 0;
  const startedAt = new Date();
  const endAt = Date.now() + args.durationSec * 1000;

  try {
    if (!args.includeExisting) {
      const baseline = await pool.query(
        `
          select id, created_at::text as created_at_text
          from agent_turns
          order by created_at desc, id desc
          limit 1
        `
      );
      const row = baseline.rows[0];
      if (row) {
        lastCreatedAt = row.created_at_text;
        lastId = row.id;
        seenIds.add(row.id);
      }
    }

    while (Date.now() < endAt) {
      const result = await pool.query(
        `
          select
            id,
            agent_session_id,
            session_id,
            turn_type,
            question_name,
            transcript,
            payload,
            created_at,
            created_at::text as created_at_text
          from agent_turns
          where (created_at, id) > ($1::timestamptz, $2::uuid)
          order by created_at asc, id asc
          limit 100
        `,
        [lastCreatedAt, lastId]
      );
      for (const row of result.rows) {
        lastCreatedAt = row.created_at_text;
        lastId = row.id;
        if (seenIds.has(row.id)) {
          continue;
        }
        seenIds.add(row.id);
        rowCount += 1;
        appendJsonl(rowsPath, {
          run_id: args.runId,
          observed_at: new Date().toISOString(),
          row
        });
      }
      await sleep(args.intervalMs);
    }
  } finally {
    await pool.end();
  }

  const summary = {
    run_id: args.runId,
    started_at: startedAt.toISOString(),
    ended_at: new Date().toISOString(),
    duration_sec: args.durationSec,
    rows_observed: rowCount,
    rows_path: rowsPath
  };
  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
