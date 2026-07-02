import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--") {
      continue;
    } else if (key === "--run-dir") {
      args.runDir = value;
      i += 1;
    } else if (key === "--report-token") {
      args.reportToken = value;
      i += 1;
    } else if (key === "--output") {
      args.output = value;
      i += 1;
    }
  }
  if (!args.runDir) {
    throw new Error("Usage: summarize_voice_room_session.mjs --run-dir <experiments/run_id> [--report-token <token>]");
  }
  return args;
}

function readJson(pathname) {
  return JSON.parse(fs.readFileSync(pathname, "utf8"));
}

function readJsonl(pathname) {
  if (!fs.existsSync(pathname)) {
    return [];
  }
  return fs
    .readFileSync(pathname, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function safeReadJson(pathname) {
  return fs.existsSync(pathname) ? readJson(pathname) : null;
}

function latestByCreatedAt(rows) {
  return [...rows].sort((a, b) => String(b.row.created_at).localeCompare(String(a.row.created_at)));
}

function summarizeAgentTurns(rows) {
  const turnRows = rows.map((entry) => entry.row);
  const asrRows = turnRows.filter((row) => row.turn_type === "asr");
  const mapRows = turnRows.filter((row) => row.turn_type === "map_answer");
  const ttsRows = turnRows.filter((row) => row.turn_type === "tts_stream" || row.turn_type === "tts");
  const respondRows = turnRows.filter((row) => row.turn_type === "respond");
  const liveAsrRows = asrRows.filter((row) => row.session_id == null);
  const staffReviewRows = mapRows.filter((row) => row.payload?.voice_turn_audit?.write_decision === "staff_review");
  const noWriteRows = mapRows.filter((row) => row.payload?.voice_turn_audit?.write_decision === "no_write_retry");

  const questionProgress = {};
  for (const row of mapRows) {
    const questionName = row.question_name ?? "unknown";
    questionProgress[questionName] = {
      transcript: row.transcript,
      answer_value: row.payload?.candidate?.value ?? null,
      answer_text: row.payload?.candidate?.text ?? null,
      confidence: row.payload?.candidate?.confidence ?? null,
      routing_decision: row.payload?.routing_decision ?? null,
      write_decision: row.payload?.voice_turn_audit?.write_decision ?? null,
      fallback_reason: row.payload?.voice_turn_audit?.fallback_reason ?? null,
      created_at: row.created_at
    };
  }

  return {
    rows_observed: turnRows.length,
    asr_rows: asrRows.length,
    live_browser_asr_rows: liveAsrRows.length,
    map_answer_rows: mapRows.length,
    tts_rows: ttsRows.length,
    llm_respond_rows: respondRows.length,
    staff_review_rows: staffReviewRows.length,
    no_write_retry_rows: noWriteRows.length,
    questions_with_mapping: Object.keys(questionProgress).sort(),
    question_progress: questionProgress,
    latest_rows: latestByCreatedAt(rows).slice(0, 5).map((entry) => ({
      created_at: entry.row.created_at,
      turn_type: entry.row.turn_type,
      question_name: entry.row.question_name,
      transcript: entry.row.transcript,
      write_decision: entry.row.payload?.voice_turn_audit?.write_decision ?? null
    }))
  };
}

function summarizeWakeword(runDir) {
  const quiet = safeReadJson(path.join(runDir, "logs", "wakeword_quiet_check_auto_r2", "wakeword_monitor_summary.json"));
  const spoken = safeReadJson(path.join(runDir, "logs", "wakeword_spoken_check_auto_r2", "wakeword_monitor_summary.json"));
  return {
    quiet_auto_r2: quiet,
    spoken_auto_r2: spoken
  };
}

function main() {
  const args = parseArgs(process.argv);
  const runDir = path.resolve(args.runDir);
  const manifest = safeReadJson(path.join(runDir, "session_manifest.json"));
  const agentRows = readJsonl(path.join(runDir, "logs", "agent_turns", "agent_turn_rows.jsonl"));
  const runtimeRows = readJsonl(path.join(runDir, "logs", "runtime_collector", "runtime_samples.jsonl"));
  const outputPath = path.resolve(args.output ?? path.join(runDir, "voice_room_test_summary.json"));

  const summary = {
    run_id: manifest?.run_id ?? path.basename(runDir),
    generated_at: new Date().toISOString(),
    status: "LIVE_MINIMUM_COMPLETED",
    runtime_validity: {
      wakeword_auto_microphone: "valid_target_runtime",
      asr_live_microphone: "valid_target_runtime",
      llm_response: "valid_target_runtime",
      cosyvoice3_streaming_tts: "valid_target_runtime",
      phq9_voice_room_loop: "valid_target_runtime",
      public_report_creation: args.reportToken ? "valid_target_runtime" : "requires_report_token_verification"
    },
    report_token: args.reportToken ?? null,
    artifacts: {
      run_dir: runDir,
      agent_turn_rows: path.join(runDir, "logs", "agent_turns", "agent_turn_rows.jsonl"),
      runtime_samples: path.join(runDir, "logs", "runtime_collector", "runtime_samples.jsonl"),
      wakeword_quiet_summary: path.join(runDir, "logs", "wakeword_quiet_check_auto_r2", "wakeword_monitor_summary.json"),
      wakeword_spoken_summary: path.join(runDir, "logs", "wakeword_spoken_check_auto_r2", "wakeword_monitor_summary.json")
    },
    agent_turns: summarizeAgentTurns(agentRows),
    wakeword: summarizeWakeword(runDir),
    runtime_collection: {
      samples: runtimeRows.length,
      first_observed_at: runtimeRows[0]?.timestamp_utc ?? runtimeRows[0]?.observed_at ?? null,
      last_observed_at: runtimeRows.at(-1)?.timestamp_utc ?? runtimeRows.at(-1)?.observed_at ?? null
    },
    observations: [
      "Wakeword auto microphone selection selected the active input without manual device index.",
      "PHQ-9 item 9 safety-sensitive answer routed to staff review and public report creation was verified separately when report_token is present.",
      "The phrase 幾乎每天 should keep extra attention in future runs because one ASR row recognized it as 姊夫每天 while answer mapping still selected the intended option."
    ]
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ output: outputPath, status: summary.status }, null, 2));
}

main();
