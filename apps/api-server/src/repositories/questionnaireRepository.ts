import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import type {
  CompletedQuestionnaireResponse,
  InternalScore,
  PublicSummary,
  SafetyFlags
} from "@shc/contracts";
import { databaseUrl, repoRoot } from "../config";

const { Pool } = pg;

export interface QuestionnaireVersionRecord {
  id: string;
  questionnaireCode: "phq9";
  version: "0.1.0";
  surveyjsJson: unknown;
  scoringConfig: unknown;
}

export interface SaveQuestionnaireResponseInput {
  sessionId: string;
  questionnaireVersionId: string;
  rawAnswers: Record<string, unknown>;
  internalScore: InternalScore;
  safetyFlags: SafetyFlags;
  publicSummary: PublicSummary;
}

export interface QuestionnaireRepository {
  ensurePhq9Seed(): Promise<void>;
  getActiveQuestionnaire(): Promise<QuestionnaireVersionRecord>;
  saveQuestionnaireResponse(input: SaveQuestionnaireResponseInput): Promise<CompletedQuestionnaireResponse>;
  close(): Promise<void>;
}

async function readJson(relativePath: string): Promise<unknown> {
  const file = await fs.readFile(path.join(repoRoot, relativePath), "utf8");
  return JSON.parse(file);
}

export class PostgresQuestionnaireRepository implements QuestionnaireRepository {
  private readonly pool = new Pool({ connectionString: databaseUrl });

  async ensurePhq9Seed(): Promise<void> {
    const surveyjsJson = await readJson("modules/questionnaire/seed/phq9.zh-TW.surveyjs.json");
    const scoringConfig = await readJson("modules/questionnaire/scoring/phq9.public-scoring-config.json");

    await this.pool.query(
      `
        insert into questionnaire_versions (
          tenant_id,
          questionnaire_code,
          version,
          status,
          title,
          surveyjs_json,
          scoring_config,
          published_at
        )
        values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, now())
        on conflict (tenant_id, questionnaire_code, version)
        do update set
          status = excluded.status,
          title = excluded.title,
          surveyjs_json = excluded.surveyjs_json,
          scoring_config = excluded.scoring_config,
          published_at = coalesce(questionnaire_versions.published_at, now())
      `,
      [
        "demo",
        "phq9",
        "0.1.0",
        "published",
        "病人健康狀況問卷-9（PHQ-9）",
        JSON.stringify(surveyjsJson),
        JSON.stringify(scoringConfig)
      ]
    );
  }

  async getActiveQuestionnaire(): Promise<QuestionnaireVersionRecord> {
    const result = await this.pool.query<{
      id: string;
      questionnaire_code: "phq9";
      version: "0.1.0";
      surveyjs_json: unknown;
      scoring_config: unknown;
    }>(
      `
        select id, questionnaire_code, version, surveyjs_json, scoring_config
        from questionnaire_versions
        where tenant_id = $1
          and questionnaire_code = $2
          and status = $3
        order by published_at desc nulls last, created_at desc
        limit 1
      `,
      ["demo", "phq9", "published"]
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error("No published PHQ-9 questionnaire version found");
    }

    return {
      id: row.id,
      questionnaireCode: row.questionnaire_code,
      version: row.version,
      surveyjsJson: row.surveyjs_json,
      scoringConfig: row.scoring_config
    };
  }

  async saveQuestionnaireResponse(
    input: SaveQuestionnaireResponseInput
  ): Promise<CompletedQuestionnaireResponse> {
    const client = await this.pool.connect();

    try {
      await client.query("begin");
      await client.query(
        `
          insert into sessions (id, tenant_id, status)
          values ($1, $2, $3)
          on conflict (id) do nothing
        `,
        [input.sessionId, "demo", "completed"]
      );

      const responseResult = await client.query<{ id: string }>(
        `
          insert into questionnaire_responses (
            tenant_id,
            session_id,
            questionnaire_version_id,
            raw_answers,
            internal_score_json,
            safety_flags,
            public_summary_json,
            completed_at
          )
          values ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, now())
          returning id
        `,
        [
          "demo",
          input.sessionId,
          input.questionnaireVersionId,
          JSON.stringify(input.rawAnswers),
          JSON.stringify(input.internalScore),
          JSON.stringify(input.safetyFlags),
          JSON.stringify(input.publicSummary)
        ]
      );

      const responseId = responseResult.rows[0]?.id;
      if (!responseId) {
        throw new Error("Questionnaire response insert did not return an id");
      }

      await client.query(
        `
          insert into report_sections (
            tenant_id,
            session_id,
            section_type,
            payload
          )
          values ($1, $2, $3, $4::jsonb)
        `,
        ["demo", input.sessionId, "questionnaire_public_summary.v1", JSON.stringify(input.publicSummary)]
      );

      await client.query(
        `
          insert into outbox_events (
            tenant_id,
            aggregate_type,
            aggregate_id,
            event_type,
            payload
          )
          values ($1, $2, $3, $4, $5::jsonb)
        `,
        [
          "demo",
          "questionnaire_response",
          responseId,
          "questionnaire_response.completed.v1",
          JSON.stringify({ response_id: responseId, session_id: input.sessionId })
        ]
      );

      await client.query("commit");

      return {
        response_id: responseId,
        session_id: input.sessionId,
        questionnaire_code: "phq9",
        questionnaire_version: "0.1.0",
        internal_score: input.internalScore,
        safety_flags: input.safetyFlags,
        public_summary: input.publicSummary
      };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
