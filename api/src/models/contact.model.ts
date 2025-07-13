import { FromSchema } from "json-schema-to-ts";

export const createContactSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    email: { type: "string", format: "email", minLength: 1 },
    message: { type: "string", minLength: 1 },
  },
  required: ["name", "email", "message"],
} as const;

export const updateContactSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    email: { type: "string", format: "email", minLength: 1 },
    message: { type: "string", minLength: 1 },
  },
  required: ["name", "email", "message"],
} as const;

export const contactSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid", minLength: 1 },
    timestamp: { type: "string", format: "date-time", minLength: 1 },
    name: { type: "string", minLength: 1 },
    email: { type: "string", format: "email", minLength: 1 },
    message: { type: "string", minLength: 1 },
    createdAt: { type: "string", format: "date-time", minLength: 1 },
    updatedAt: { type: "string", format: "date-time", minLength: 1 },
  },
  required: [
    "id",
    "timestamp",
    "name",
    "email",
    "message",
    "createdAt",
    "updatedAt",
  ],
} as const;

export const contactListSchema = {
  type: "array",
  items: contactSchema,
} as const;

export type CreateContactDTO = FromSchema<typeof createContactSchema>;

export type UpdateContactDTO = FromSchema<typeof updateContactSchema>;

export type ContactDTO = FromSchema<typeof contactSchema>;

export type ContactListDTO = FromSchema<typeof contactListSchema>;

export type ContactEntity = {
  id: string;
  userID: string;
  timestamp: string;
  email: string;
  name: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};
