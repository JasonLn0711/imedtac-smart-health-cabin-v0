import { apiPort } from "./config";
import { buildApp } from "./app";

const app = await buildApp();

try {
  await app.listen({ port: apiPort, host: "0.0.0.0" });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
