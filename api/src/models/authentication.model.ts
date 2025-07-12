import { FromSchema } from "json-schema-to-ts";

export const createAuthenticationTokenSchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      format: "email",
      minLength: 1,
      nullable: false,
    },
    password: {
      type: "string",
      minLength: 1,
      nullable: false,
    },
  },
  required: ["email", "password"],
} as const;

export const updateAuthenticationTokenSchema = {
  type: "object",
  properties: {
    refreshToken: {
      type: "string",
      minLength: 1,
      nullable: false,
    },
  },
  required: ["refreshToken"],
} as const;

export const authenticationTokenSchema = {
  type: "object",
  properties: {
    idToken: {
      type: "string",
      minLength: 1,
      nullable: false,
    },
    refreshToken: {
      type: "string",
      minLength: 1,
      nullable: false,
    },
  },
  required: ["idToken", "refreshToken"],
} as const;

export type CreateAuthenticationTokenDTO = FromSchema<
  typeof createAuthenticationTokenSchema
>;

export type UpdateAuthenticationTokenDTO = FromSchema<
  typeof updateAuthenticationTokenSchema
>;

export type AuthenticationTokenDTO = FromSchema<
  typeof authenticationTokenSchema
>;
