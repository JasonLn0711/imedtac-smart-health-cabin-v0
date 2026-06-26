import type { FastifyInstance } from "fastify";
import { QuestionnaireValidationError } from "@shc/questionnaire-core";
import type {
  CompletedQuestionnaireRequest,
  CreateQuestionnaireTemplateRequest,
  CreateQuestionnaireVersionRequest
} from "@shc/contracts";
import type { QuestionnaireService } from "../services/questionnaireService";

function toErrorResponse(error: unknown) {
  if (error instanceof QuestionnaireValidationError) {
    const code = error.message.includes("SurveyJS") ? "INVALID_SURVEYJS_JSON" : "INVALID_QUESTIONNAIRE_RESPONSE";
    return {
      statusCode: 400,
      body: {
        error: {
          code,
          message: error.message
        }
      }
    };
  }

  return {
    statusCode: 500,
    body: {
      error: {
        code: "QUESTIONNAIRE_SERVICE_ERROR",
        message: error instanceof Error ? error.message : "Unexpected questionnaire service error"
      }
    }
  };
}

export async function registerQuestionnaireRoutes(
  app: FastifyInstance,
  questionnaireService: QuestionnaireService
): Promise<void> {
  app.get("/api/v1/providers/status", async (_request, reply) => {
    try {
      return await questionnaireService.getProviderStatus();
    } catch (error) {
      const response = toErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.get("/api/v1/questionnaires/active", async (_request, reply) => {
    try {
      return await questionnaireService.getActiveQuestionnaire();
    } catch (error) {
      const response = toErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.post<{ Body: CompletedQuestionnaireRequest }>(
    "/api/v1/questionnaire-responses",
    async (request, reply) => {
      try {
        const response = await questionnaireService.submitResponse(request.body);
        return reply.status(201).send(response);
      } catch (error) {
        const response = toErrorResponse(error);
        return reply.status(response.statusCode).send(response.body);
      }
    }
  );

  app.get("/api/v1/admin/questionnaire-templates", async (_request, reply) => {
    try {
      return await questionnaireService.listTemplates();
    } catch (error) {
      const response = toErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.post<{ Body: CreateQuestionnaireTemplateRequest }>(
    "/api/v1/admin/questionnaire-templates",
    async (request, reply) => {
      try {
        return await questionnaireService.createTemplate(request.body);
      } catch (error) {
        const response = toErrorResponse(error);
        return reply.status(response.statusCode).send(response.body);
      }
    }
  );

  app.post<{ Body: CreateQuestionnaireVersionRequest }>(
    "/api/v1/admin/questionnaire-versions",
    async (request, reply) => {
      try {
        return await questionnaireService.createVersion(request.body);
      } catch (error) {
        const response = toErrorResponse(error);
        return reply.status(response.statusCode).send(response.body);
      }
    }
  );

  app.post<{ Params: { id: string } }>("/api/v1/admin/questionnaire-versions/:id/publish", async (request, reply) => {
    try {
      return await questionnaireService.publishVersion(request.params.id);
    } catch (error) {
      const response = toErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.get("/api/v1/admin/questionnaire-responses", async (_request, reply) => {
    try {
      return await questionnaireService.listResponses();
    } catch (error) {
      const response = toErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.get<{ Params: { token: string } }>("/api/v1/reports/:token/public", async (request, reply) => {
    try {
      const report = await questionnaireService.getPublicReport(request.params.token);
      if (!report) {
        return reply.status(404).send({ error: { code: "PUBLIC_REPORT_NOT_FOUND", message: "Report not found" } });
      }
      return report;
    } catch (error) {
      const response = toErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.post<{ Body: { session_id?: string } }>("/api/v1/agent-sessions", async (request, reply) => {
    try {
      return await questionnaireService.createAgentSession(request.body?.session_id);
    } catch (error) {
      const response = toErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.post<{
    Body: {
      agent_session_id?: string;
      session_id?: string;
      question_name?: string;
      audio_text?: string;
      audio_base64?: string;
      audio_format?: string;
      transcript?: string;
    };
  }>("/api/v1/agent-turns/asr", async (request, reply) => {
    try {
      return await questionnaireService.runAsr(request.body);
    } catch (error) {
      const response = toErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.post<{
    Body: {
      agent_session_id?: string;
      session_id?: string;
      question_name?: string;
      next_question_name?: string;
      transcript?: string;
      answer_text?: string;
      purpose?: string;
    };
  }>(
    "/api/v1/agent-turns/respond",
    async (request, reply) => {
      try {
        return await questionnaireService.buildGuidance(request.body);
      } catch (error) {
        const response = toErrorResponse(error);
        return reply.status(response.statusCode).send(response.body);
      }
    }
  );

  app.post<{ Body: { agent_session_id?: string; session_id?: string; question_name?: string; text?: string } }>(
    "/api/v1/agent-turns/tts",
    async (request, reply) => {
      try {
        return await questionnaireService.runTts(request.body);
      } catch (error) {
        const response = toErrorResponse(error);
        return reply.status(response.statusCode).send(response.body);
      }
    }
  );

  app.post<{ Body: { agent_session_id?: string; session_id?: string; question_name?: string; text?: string } }>(
    "/api/v1/agent-turns/tts/stream",
    async (request, reply) => {
      try {
        return await questionnaireService.describeTtsStream(request.body);
      } catch (error) {
        const response = toErrorResponse(error);
        return reply.status(response.statusCode).send(response.body);
      }
    }
  );

  app.post<{
    Body: {
      agent_session_id?: string;
      session_id?: string;
      question_name: string;
      transcript: string;
      asr_confidence?: number;
    };
  }>(
    "/api/v1/agent-turns/map-answer",
    async (request, reply) => {
      try {
        return await questionnaireService.mapVoiceAnswer(request.body);
      } catch (error) {
        const response = toErrorResponse(error);
        return reply.status(response.statusCode).send(response.body);
      }
    }
  );
}
