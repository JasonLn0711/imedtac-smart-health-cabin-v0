import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import type {
  AdminQuestionnaireResponseSummary,
  CompletedQuestionnaireResponse,
  InternalScore,
  PublicReportResponse,
  PublicSummary,
  QuestionnaireTemplateSummary,
  QuestionnaireVersionStatus,
  QuestionnaireVersionSummary,
  SafetyFlags,
  ShcEventEnvelope,
  ShcEventType
} from "@shc/contracts";
import { SHC_EVENT_TOPICS } from "@shc/contracts";
import { buildPublicReportSection } from "@shc/report-core";
import { databaseUrl, publicReportBaseUrl, repoRoot } from "../config";

const { Pool } = pg;

export interface QuestionnaireVersionRecord {
  id: string;
  templateId: string;
  questionnaireCode: "phq9";
  version: string;
  title: string;
  surveyjsJson: unknown;
  scoringConfig: unknown;
}

export interface SaveQuestionnaireResponseInput {
  sessionId: string;
  questionnaireVersion: QuestionnaireVersionRecord;
  rawAnswers: Record<string, unknown>;
  internalScore: InternalScore;
  safetyFlags: SafetyFlags;
  publicSummary: PublicSummary;
}

export interface CreateTemplateInput {
  code: "phq9";
  title: string;
  description: string;
}

export interface CreateVersionInput {
  templateId: string;
  version: string;
  surveyjsJson: unknown;
  scoringConfigCode: "phq9_public_v1";
  status: QuestionnaireVersionStatus;
}

export interface SaveAgentTurnInput {
  agentSessionId?: string;
  sessionId?: string;
  turnType: "asr" | "respond" | "tts" | "tts_stream" | "map_answer";
  questionName?: string;
  transcript?: string;
  payload: Record<string, unknown>;
}

export interface QuestionnaireRepository {
  ensurePhq9Seed(): Promise<void>;
  getActiveQuestionnaire(): Promise<QuestionnaireVersionRecord>;
  listTemplates(): Promise<QuestionnaireTemplateSummary[]>;
  createTemplate(input: CreateTemplateInput): Promise<QuestionnaireTemplateSummary>;
  createVersion(input: CreateVersionInput): Promise<QuestionnaireVersionSummary>;
  publishVersion(versionId: string): Promise<QuestionnaireVersionSummary>;
  saveQuestionnaireResponse(input: SaveQuestionnaireResponseInput): Promise<CompletedQuestionnaireResponse>;
  listResponses(): Promise<AdminQuestionnaireResponseSummary[]>;
  getPublicReport(token: string): Promise<PublicReportResponse | null>;
  createAgentSession(sessionId?: string): Promise<string>;
  saveAgentTurn(input: SaveAgentTurnInput): Promise<string>;
  close(): Promise<void>;
}

async function readJson(relativePath: string): Promise<unknown> {
  const file = await fs.readFile(path.join(repoRoot, relativePath), "utf8");
  return JSON.parse(file);
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function reportUrl(token: string): string {
  return `${publicReportBaseUrl}/${token}/public`;
}

function buildEventEnvelope(input: {
  id: string;
  type: ShcEventType;
  source: string;
  subject: string;
  sessionId?: string;
  data: Record<string, unknown>;
}): ShcEventEnvelope {
  return {
    specversion: "1.0",
    id: input.id,
    source: input.source,
    type: input.type,
    subject: input.subject,
    time: new Date().toISOString(),
    tenant_id: "tenant_demo",
    kiosk_id: "kiosk_demo",
    session_id: input.sessionId,
    data: input.data
  };
}

function voiceSafetyEventType(input: SaveAgentTurnInput): ShcEventType | null {
  if (input.turnType === "asr") {
    return "voice.asr.completed.v1";
  }
  if (input.turnType !== "map_answer") {
    return null;
  }

  const rerankerTrace = input.payload.reranker_trace as { mode?: string } | undefined;
  if (rerankerTrace?.mode === "unavailable") {
    return "reranker.unavailable.v1";
  }
  if (rerankerTrace) {
    return "reranker.rerank.completed.v1";
  }
  if ((input.payload.voice_evidence_metadata as { confirmationRequired?: boolean } | undefined)?.confirmationRequired) {
    return "voice.confirmation_required.v1";
  }
  return "voice.routing_decided.v1";
}

export class PostgresQuestionnaireRepository implements QuestionnaireRepository {
  private readonly pool = new Pool({ connectionString: databaseUrl });

  async ensurePhq9Seed(): Promise<void> {
    const surveyjsJson = await readJson("modules/questionnaire/seed/phq9.zh-TW.surveyjs.json");
    const scoringConfig = await readJson("modules/questionnaire/scoring/phq9.public-scoring-config.json");

    await this.pool.query(
      `
        insert into questionnaire_templates (id, tenant_id, code, title, description)
        values ($1, $2, $3, $4, $5)
        on conflict (tenant_id, code) do update set
          title = excluded.title,
          description = excluded.description,
          updated_at = now()
      `,
      ["qtpl_phq9", "demo", "phq9", "病人健康狀況問卷-9（PHQ-9）", "健康自我檢測問卷"]
    );

    await this.pool.query(
      `
        insert into questionnaire_versions (
          tenant_id,
          template_id,
          questionnaire_code,
          version,
          status,
          title,
          surveyjs_json,
          scoring_config,
          scoring_config_code,
          published_at
        )
        values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, now())
        on conflict (tenant_id, questionnaire_code, version)
        do update set
          template_id = excluded.template_id,
          title = excluded.title,
          surveyjs_json = excluded.surveyjs_json,
          scoring_config = excluded.scoring_config,
          scoring_config_code = excluded.scoring_config_code
      `,
      [
        "demo",
        "qtpl_phq9",
        "phq9",
        "0.1.0",
        "published",
        "病人健康狀況問卷-9（PHQ-9）",
        JSON.stringify(surveyjsJson),
        JSON.stringify(scoringConfig),
        "phq9_public_v1"
      ]
    );

    await this.pool.query(
      `
        update questionnaire_versions
        set is_active = true
        where tenant_id = $1
          and questionnaire_code = $2
          and version = $3
          and not exists (
            select 1
            from questionnaire_versions active
            where active.tenant_id = questionnaire_versions.tenant_id
              and active.questionnaire_code = questionnaire_versions.questionnaire_code
              and active.status = 'published'
              and active.is_active = true
          )
      `,
      ["demo", "phq9", "0.1.0"]
    );
  }

  async getActiveQuestionnaire(): Promise<QuestionnaireVersionRecord> {
    const result = await this.pool.query<{
      id: string;
      template_id: string;
      questionnaire_code: "phq9";
      version: string;
      title: string;
      surveyjs_json: unknown;
      scoring_config: unknown;
    }>(
      `
        select id, template_id, questionnaire_code, version, title, surveyjs_json, scoring_config
        from questionnaire_versions
        where tenant_id = $1
          and questionnaire_code = $2
          and status = $3
          and is_active = true
        order by published_at desc nulls last, created_at desc
        limit 1
      `,
      ["demo", "phq9", "published"]
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error("No active published PHQ-9 questionnaire version found");
    }

    return {
      id: row.id,
      templateId: row.template_id,
      questionnaireCode: row.questionnaire_code,
      version: row.version,
      title: row.title,
      surveyjsJson: row.surveyjs_json,
      scoringConfig: row.scoring_config
    };
  }

  async listTemplates(): Promise<QuestionnaireTemplateSummary[]> {
    const result = await this.pool.query<{
      id: string;
      code: "phq9";
      title: string;
      description: string;
      active_version_id: string | null;
      active_version: string | null;
      status: QuestionnaireVersionStatus | null;
      updated_at: Date;
    }>(
      `
        select
          t.id,
          t.code,
          t.title,
          t.description,
          active.id as active_version_id,
          active.version as active_version,
          active.status,
          t.updated_at
        from questionnaire_templates t
        left join questionnaire_versions active
          on active.template_id = t.id
         and active.tenant_id = t.tenant_id
         and active.is_active = true
         and active.status = 'published'
        where t.tenant_id = $1
        order by t.updated_at desc
      `,
      ["demo"]
    );

    return result.rows.map((row) => ({
      id: row.id,
      code: row.code,
      title: row.title,
      description: row.description,
      active_version_id: row.active_version_id,
      active_version: row.active_version,
      status: row.status ?? "none",
      updated_at: row.updated_at.toISOString()
    }));
  }

  async createTemplate(input: CreateTemplateInput): Promise<QuestionnaireTemplateSummary> {
    const id = `qtpl_${input.code}`;
    await this.pool.query(
      `
        insert into questionnaire_templates (id, tenant_id, code, title, description)
        values ($1, $2, $3, $4, $5)
        on conflict (tenant_id, code) do update set
          title = excluded.title,
          description = excluded.description,
          updated_at = now()
      `,
      [id, "demo", input.code, input.title, input.description]
    );
    await this.insertAuditEvent("admin.questionnaire_template.upserted", "questionnaire_template", id, { ...input });
    const templates = await this.listTemplates();
    return templates.find((template) => template.id === id) ?? templates[0]!;
  }

  async createVersion(input: CreateVersionInput): Promise<QuestionnaireVersionSummary> {
    const scoringConfig = await readJson("modules/questionnaire/scoring/phq9.public-scoring-config.json");
    const result = await this.pool.query<{
      id: string;
      template_id: string;
      questionnaire_code: "phq9";
      version: string;
      status: QuestionnaireVersionStatus;
      is_active: boolean;
    }>(
      `
        insert into questionnaire_versions (
          tenant_id,
          template_id,
          questionnaire_code,
          version,
          status,
          title,
          surveyjs_json,
          scoring_config,
          scoring_config_code
        )
        values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9)
        returning id, template_id, questionnaire_code, version, status, is_active
      `,
      [
        "demo",
        input.templateId,
        "phq9",
        input.version,
        input.status,
        "病人健康狀況問卷-9（PHQ-9）",
        JSON.stringify(input.surveyjsJson),
        JSON.stringify(scoringConfig),
        input.scoringConfigCode
      ]
    );

    const version = toVersionSummary(result.rows[0]!);
    await this.insertAuditEvent("admin.questionnaire_version.created", "questionnaire_version", version.id, {
      template_id: input.templateId,
      version: input.version,
      status: input.status
    });
    return version;
  }

  async publishVersion(versionId: string): Promise<QuestionnaireVersionSummary> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const target = await client.query<{ template_id: string; questionnaire_code: "phq9" }>(
        "select template_id, questionnaire_code from questionnaire_versions where id = $1 and tenant_id = $2",
        [versionId, "demo"]
      );
      const row = target.rows[0];
      if (!row) {
        throw new Error(`Questionnaire version not found: ${versionId}`);
      }

      await client.query(
        `
          update questionnaire_versions
          set status = 'archived',
              is_active = false,
              archived_at = now()
          where tenant_id = $1
            and questionnaire_code = $2
            and id <> $3
            and is_active = true
        `,
        ["demo", row.questionnaire_code, versionId]
      );

      const result = await client.query<{
        id: string;
        template_id: string;
        questionnaire_code: "phq9";
        version: string;
        status: QuestionnaireVersionStatus;
        is_active: boolean;
      }>(
        `
          update questionnaire_versions
          set status = 'published',
              is_active = true,
              published_at = now(),
              archived_at = null
          where id = $1 and tenant_id = $2
          returning id, template_id, questionnaire_code, version, status, is_active
        `,
        [versionId, "demo"]
      );

      await this.insertAuditEventWithClient(client, "admin.questionnaire_version.published", "questionnaire_version", versionId, {
        questionnaire_code: row.questionnaire_code
      });

      await client.query("commit");
      return toVersionSummary(result.rows[0]!);
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async saveQuestionnaireResponse(
    input: SaveQuestionnaireResponseInput
  ): Promise<CompletedQuestionnaireResponse> {
    const client = await this.pool.connect();
    const reportToken = `rpt_${randomUUID()}`;

    try {
      await client.query("begin");
      await client.query(
        `
          insert into sessions (id, tenant_id, status)
          values ($1, $2, $3)
          on conflict (id) do update set status = excluded.status
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
          input.questionnaireVersion.id,
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

      const section = buildPublicReportSection(input.publicSummary);
      await client.query(
        `
          insert into report_sections (
            tenant_id,
            session_id,
            response_id,
            section_type,
            title,
            public_status_code,
            safe_summary,
            disclaimer,
            payload
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
        `,
        [
          "demo",
          input.sessionId,
          responseId,
          "questionnaire_public_summary.v1",
          section.title,
          section.public_status_code,
          section.summary,
          section.disclaimer,
          JSON.stringify(section)
        ]
      );

      await client.query(
        `
          insert into report_access_tokens (
            tenant_id,
            session_id,
            response_id,
            token,
            token_hash
          )
          values ($1, $2, $3, $4, $5)
        `,
        ["demo", input.sessionId, responseId, reportToken, tokenHash(reportToken)]
      );

      await this.insertOutboxEventWithClient(client, {
        aggregateType: "questionnaire_response",
        aggregateId: responseId,
        eventType: "shc.questionnaire.response.completed.v1",
        sessionId: input.sessionId,
        source: "shc/kiosk/kiosk_demo/questionnaire",
        subject: `session/${input.sessionId}`,
        data: {
          questionnaire_code: input.questionnaireVersion.questionnaireCode,
          questionnaire_version: input.questionnaireVersion.version,
          public_status_code: input.publicSummary.public_status_code,
          safety_flag: input.safetyFlags.requires_human_review
        }
      });

      await this.insertOutboxEventWithClient(client, {
        aggregateType: "report",
        aggregateId: responseId,
        eventType: "shc.report.created.v1",
        sessionId: input.sessionId,
        source: "shc/kiosk/kiosk_demo/report",
        subject: `response/${responseId}`,
        data: {
          response_id: responseId,
          public_status_code: input.publicSummary.public_status_code
        }
      });

      await this.insertAuditEventWithClient(client, "system.report.created", "questionnaire_response", responseId, {
        report_token: reportToken,
        public_report_url: reportUrl(reportToken)
      });

      await client.query("commit");

      return {
        response_id: responseId,
        session_id: input.sessionId,
        questionnaire_code: input.questionnaireVersion.questionnaireCode,
        questionnaire_version: input.questionnaireVersion.version,
        internal_score: input.internalScore,
        safety_flags: input.safetyFlags,
        public_summary: input.publicSummary,
        public_report_token: reportToken,
        public_report_url: reportUrl(reportToken),
        qr_payload: reportUrl(reportToken)
      };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async listResponses(): Promise<AdminQuestionnaireResponseSummary[]> {
    const result = await this.pool.query<{
      response_id: string;
      session_id: string;
      questionnaire_code: "phq9";
      questionnaire_version: string;
      public_status_code: PublicSummary["public_status_code"];
      requires_human_review: boolean;
      token: string | null;
      created_at: Date;
    }>(
      `
        select
          r.id as response_id,
          r.session_id,
          qv.questionnaire_code,
          qv.version as questionnaire_version,
          r.public_summary_json->>'public_status_code' as public_status_code,
          coalesce((r.safety_flags->>'requires_human_review')::boolean, false) as requires_human_review,
          rat.token,
          r.created_at
        from questionnaire_responses r
        join questionnaire_versions qv on qv.id = r.questionnaire_version_id
        left join report_access_tokens rat on rat.response_id = r.id
        where r.tenant_id = $1
        order by r.created_at desc
        limit 50
      `,
      ["demo"]
    );

    return result.rows.map((row) => ({
      response_id: row.response_id,
      session_id: row.session_id,
      questionnaire_code: row.questionnaire_code,
      questionnaire_version: row.questionnaire_version,
      public_status_code: row.public_status_code,
      requires_human_review: row.requires_human_review,
      public_report_token: row.token,
      public_report_url: row.token ? reportUrl(row.token) : null,
      created_at: row.created_at.toISOString()
    }));
  }

  async getPublicReport(token: string): Promise<PublicReportResponse | null> {
    const result = await this.pool.query<{
      report_id: string;
      token: string;
      title: PublicSummary["title"];
      public_status_code: PublicSummary["public_status_code"];
      safe_summary: string;
      disclaimer: string;
    }>(
      `
        select
          rs.id as report_id,
          rat.token,
          rs.title,
          rs.public_status_code,
          rs.safe_summary,
          rs.disclaimer
        from report_access_tokens rat
        join report_sections rs on rs.response_id = rat.response_id
        where rat.tenant_id = $1
          and rat.token = $2
          and rat.revoked_at is null
        order by rs.sort_order, rs.created_at
      `,
      ["demo", token]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return {
      report_id: result.rows[0]!.report_id,
      token,
      sections: result.rows.map((row) => ({
        module_id: "questionnaire",
        title: row.title,
        public_status_code: row.public_status_code,
        summary: row.safe_summary,
        disclaimer: row.disclaimer
      }))
    };
  }

  async createAgentSession(sessionId?: string): Promise<string> {
    if (sessionId) {
      await this.pool.query(
        `
          insert into sessions (id, tenant_id, status)
          values ($1, $2, $3)
          on conflict (id) do nothing
        `,
        [sessionId, "demo", "active"]
      );
    }

    const result = await this.pool.query<{ id: string }>(
      `
        insert into agent_sessions (tenant_id, session_id, status)
        values ($1, $2, $3)
        returning id
      `,
      ["demo", sessionId ?? null, "active"]
    );

    return result.rows[0]!.id;
  }

  async saveAgentTurn(input: SaveAgentTurnInput): Promise<string> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const result = await client.query<{ id: string }>(
        `
          insert into agent_turns (
            tenant_id,
            agent_session_id,
            session_id,
            turn_type,
            question_name,
            transcript,
            payload
          )
          values ($1, $2, $3, $4, $5, $6, $7::jsonb)
          returning id
        `,
        [
          "demo",
          input.agentSessionId ?? null,
          input.sessionId ?? null,
          input.turnType,
          input.questionName ?? null,
          input.transcript ?? null,
          JSON.stringify(input.payload)
        ]
      );

      const turnId = result.rows[0]!.id;
      await this.insertOutboxEventWithClient(client, {
        aggregateType: "agent_turn",
        aggregateId: turnId,
        eventType: "shc.agent.turn.created.v1",
        sessionId: input.sessionId,
        source: "shc/kiosk/kiosk_demo/agent",
        subject: `agent_turn/${turnId}`,
        data: {
          turn_id: turnId,
          turn_type: input.turnType,
          question_name: input.questionName
        }
      });
      const safetyEventType = voiceSafetyEventType(input);
      if (safetyEventType) {
        await this.insertOutboxEventWithClient(client, {
          aggregateType: "agent_turn",
          aggregateId: turnId,
          eventType: safetyEventType,
          sessionId: input.sessionId,
          source: "shc/kiosk/kiosk_demo/voice-safety",
          subject: `agent_turn/${turnId}`,
          data: {
            turn_id: turnId,
            turn_type: input.turnType,
            question_name: input.questionName,
            transcript: input.transcript,
            routing_decision: input.payload.routing_decision,
            confirmation_required: (input.payload.voice_evidence_metadata as { confirmationRequired?: boolean } | undefined)
              ?.confirmationRequired,
            reranker_mode: (input.payload.reranker_trace as { mode?: string } | undefined)?.mode
          }
        });
      }

      await client.query("commit");
      return turnId;
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

  private async insertAuditEvent(
    action: string,
    targetType: string,
    targetId: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      await this.insertAuditEventWithClient(client, action, targetType, targetId, payload);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  private async insertAuditEventWithClient(
    client: pg.PoolClient,
    action: string,
    targetType: string,
    targetId: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    const auditResult = await client.query<{ id: string }>(
      `
        insert into audit_events (tenant_id, actor, action, target_type, target_id, payload)
        values ($1, $2, $3, $4, $5, $6::jsonb)
        returning id
      `,
      ["demo", "system", action, targetType, targetId, JSON.stringify(payload)]
    );

    const auditId = auditResult.rows[0]!.id;
    await this.insertOutboxEventWithClient(client, {
      aggregateType: "audit_event",
      aggregateId: auditId,
      eventType: "shc.audit.event.created.v1",
      source: "shc/api/audit",
      subject: `audit/${auditId}`,
      data: {
        action,
        target_type: targetType,
        target_id: targetId
      }
    });
  }

  private async insertOutboxEventWithClient(
    client: pg.PoolClient,
    input: {
      aggregateType: string;
      aggregateId: string;
      eventType: ShcEventType;
      source: string;
      subject: string;
      sessionId?: string;
      data: Record<string, unknown>;
    }
  ): Promise<void> {
    const eventId = `evt_${randomUUID()}`;
    const envelope = buildEventEnvelope({
      id: eventId,
      type: input.eventType,
      source: input.source,
      subject: input.subject,
      sessionId: input.sessionId,
      data: input.data
    });

    await client.query(
      `
        insert into outbox_events (
          tenant_id,
          aggregate_type,
          aggregate_id,
          event_type,
          topic,
          payload
        )
        values ($1, $2, $3, $4, $5, $6::jsonb)
      `,
      [
        "demo",
        input.aggregateType,
        input.aggregateId,
        input.eventType,
        SHC_EVENT_TOPICS[input.eventType],
        JSON.stringify(envelope)
      ]
    );
  }
}

function toVersionSummary(row: {
  id: string;
  template_id: string;
  questionnaire_code: "phq9";
  version: string;
  status: QuestionnaireVersionStatus;
  is_active: boolean;
}): QuestionnaireVersionSummary {
  return {
    id: row.id,
    template_id: row.template_id,
    questionnaire_code: row.questionnaire_code,
    version: row.version,
    status: row.status,
    is_active: row.is_active
  };
}
