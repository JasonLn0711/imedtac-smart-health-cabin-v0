import type { FastifyInstance } from "fastify";
import { QuestionnaireValidationError } from "@shc/questionnaire-core";
import type { CompletedQuestionnaireRequest } from "@shc/contracts";
import type { QuestionnaireService } from "../services/questionnaireService";

function toErrorResponse(error: unknown) {
  if (error instanceof QuestionnaireValidationError) {
    return {
      statusCode: 400,
      body: {
        error: {
          code: "INVALID_QUESTIONNAIRE_RESPONSE",
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
}
