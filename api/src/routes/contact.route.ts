import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { ContactController } from "controllers/contact.controller";
import { checkAuthenticatedUser } from "helpers/auth.helper";
import { checkDateRange } from "helpers/validation.helpers";

import {
  contactListSchema,
  contactSchema,
  createContactSchema,
  updateContactSchema,
} from "models/contact.model";
import { errorSchema } from "models/error.model";
import {
  fromSchema,
  limitSchema,
  sortSchema,
  toSchema,
} from "models/query-parts.model";
import { ContactRepository } from "repositories/contact.repository";

const contactRoutes: FastifyPluginAsyncJsonSchemaToTs = async (fastify) => {
  const repository = new ContactRepository();
  const controller = new ContactController(repository);

  fastify.get(
    "/contacts/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              minLength: 1,
              nullable: false,
            },
          },
          required: ["id"],
        },
        response: {
          200: contactSchema,
          default: errorSchema,
        },
      },
      preHandler: [checkAuthenticatedUser],
    },
    async (request, response) => {
      const { id } = request.params;
      const contact = await controller.find(id);
      response.status(200).send(contact);
    },
  );

  fastify.get(
    "/contacts",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            from: fromSchema,
            to: toSchema,
            sort: sortSchema,
            limit: limitSchema,
          },
          required: [],
        },
        response: {
          200: contactListSchema,
          default: errorSchema,
        },
      },
      preHandler: [checkDateRange, checkAuthenticatedUser],
    },
    async (request, response) => {
      const { from, to, limit, sort } = request.query;
      const contacts = await controller.findList(from, to, sort, limit);
      response.status(200).send(contacts);
    },
  );

  fastify.post(
    "/contacts",
    {
      schema: {
        body: createContactSchema,
        response: {
          201: contactSchema,
          default: errorSchema,
        },
      },
    },
    async (request, response) => {
      const contact = await controller.create(request.body);
      response.status(201).send(contact);
    },
  );

  fastify.put(
    "/contacts/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              minLength: 1,
              nullable: false,
            },
          },
          required: ["id"],
        },
        body: updateContactSchema,
        response: {
          200: contactSchema,
          default: errorSchema,
        },
      },
      preHandler: [checkAuthenticatedUser],
    },
    async (request, response) => {
      const { id } = request.params;
      const contact = await controller.update(id, request.body);
      response.status(200).send(contact);
    },
  );

  fastify.delete(
    "/contacts/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              minLength: 1,
              nullable: false,
            },
          },
          required: ["id"],
        },
        response: {
          204: {},
          default: errorSchema,
        },
      },
      preHandler: [checkAuthenticatedUser],
    },
    async (request, response) => {
      const { id } = request.params;
      await controller.delete(id);
      response.status(204).send({});
    },
  );
};

export default contactRoutes;
