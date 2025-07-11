import dotenv from "dotenv";

import fastify, { FastifyInstance } from "fastify";

import autoLoad from "@fastify/autoload";
import { ErrorDTO } from "models/error.model";
import { join } from "path";

dotenv.config();

export const createApp = (): FastifyInstance => {
  const app = fastify({
    logger: true,
  });

  // Set error handler
  app.setErrorHandler((error, _request, reply) => {
    console.error("error", error);
    const responce: ErrorDTO = {
      statusCode: error.statusCode ?? 500,
      error: error.name,
      message: error.message,
    };
    reply.status(error.statusCode ?? 500).send(responce);
  });

  // Register routes
  app.register(autoLoad, {
    dir: join(__dirname, "routes"),
  });

  return app;
};

const startApp = async () => {
  try {
    const app = createApp();
    await app.listen({ port: 3000 });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
};

if (require.main === module) {
  // called directly i.e. "node index.js"
  startApp();
}
