import { FromSchema } from "json-schema-to-ts";

export const errorSchema = {
  type: "object",
  properties: {
    statusCode: {
      type: "integer",
      nullable: false,
    },
    error: {
      type: "string",
      minLength: 1,
      nullable: false,
    },
    message: {
      type: "string",
      minLength: 1,
      nullable: false,
    },
  },
  required: ["statusCode", "error", "message"],
} as const;

export type ErrorDTO = FromSchema<typeof errorSchema>;
