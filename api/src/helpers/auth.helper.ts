import { httpErrors } from "@fastify/sensible";
import { FastifyReply, FastifyRequest } from "fastify";
import { CognitoWrapper } from "wrappers/cognito.wrapper";

export const checkAuthenticatedUser = async (
  request: FastifyRequest,
  _response: FastifyReply,
) => {
  const cognito = new CognitoWrapper();
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw httpErrors.unauthorized("Missing bearer token");
  }

  const token = authHeader.slice("Bearer ".length).trim();
  try {
    await cognito.verifyToken(token);
  } catch (_e) {
    throw httpErrors.unauthorized("Invalid or expired token");
  }
};
