import fastify, { FastifyInstance } from "fastify";

export const createApp = (): FastifyInstance => {
  const app = fastify({
    logger: true,
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
