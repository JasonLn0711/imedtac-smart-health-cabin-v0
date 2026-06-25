import cors from "@fastify/cors";
import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import type { HealthzResponse } from "@shc/contracts";
import { PostgresQuestionnaireRepository } from "./repositories/questionnaireRepository";
import { registerQuestionnaireRoutes } from "./routes/questionnaireRoutes";
import { QuestionnaireService } from "./services/questionnaireService";

export async function buildApp() {
  const app = Fastify({ logger: true });
  const repository = new PostgresQuestionnaireRepository();
  const questionnaireService = new QuestionnaireService(repository);

  await repository.ensurePhq9Seed();
  await app.register(cors, {
    origin: true
  });

  app.get("/healthz", async (): Promise<HealthzResponse> => ({
    status: "ok",
    service: "api-server",
    version: "0.1.0"
  }));

  app.post("/api/v1/kiosk/sessions", async () => ({
    session_id: `sess_${randomUUID()}`,
    status: "created"
  }));

  await registerQuestionnaireRoutes(app, questionnaireService);

  app.addHook("onClose", async () => {
    await repository.close();
  });

  return app;
}
