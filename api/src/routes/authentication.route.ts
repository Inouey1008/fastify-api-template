import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { AuthenticationController } from "controllers/authentication.controller";

import {
  authenticationTokenSchema,
  createAuthenticationTokenSchema,
  updateAuthenticationTokenSchema,
} from "models/authentication.model";
import { errorSchema } from "models/error.model";
import { CognitoWrapper } from "wrappers/cognito.wrapper";

const authenticationRoutes: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify,
) => {
  const cognito = new CognitoWrapper();
  const controller = new AuthenticationController(cognito);

  fastify.post(
    "/authentication/token",
    {
      schema: {
        body: createAuthenticationTokenSchema,
        response: {
          201: authenticationTokenSchema,
          default: errorSchema,
        },
      },
    },
    async (request, response) => {
      const { email, password } = request.body;
      const authToken = await controller.create(email, password);
      response.status(201).send(authToken);
    },
  );

  fastify.put(
    "/authentication/token",
    {
      schema: {
        body: updateAuthenticationTokenSchema,
        response: {
          201: authenticationTokenSchema,
          default: errorSchema,
        },
      },
    },
    async (request, response) => {
      const authToken = await controller.refresh(request.body.refreshToken);
      response.status(201).send(authToken);
    },
  );
};

export default authenticationRoutes;
