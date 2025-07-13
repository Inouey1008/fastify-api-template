export const limitSchema = {
  type: "integer",
  minimum: 1,
} as const;

export enum Sort {
  ASC = "asc",
  DESC = "desc",
}

export const sortSchema = {
  type: "string",
  enum: Object.values(Sort),
  default: Sort.DESC,
} as const;

export const fromSchema = {
  type: "string",
  format: "date-time",
} as const;

export const toSchema = {
  type: "string",
  format: "date-time",
} as const;

export interface DateRange {
  from?: string;
  to?: string;
}
