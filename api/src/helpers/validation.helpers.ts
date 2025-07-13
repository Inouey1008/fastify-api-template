import { httpErrors } from "@fastify/sensible";
import { FastifyReply, FastifyRequest } from "fastify";
import { DateRange } from "models/query-parts.model";

export const checkDateRange = async (
  request: FastifyRequest,
  _reply: FastifyReply,
) => {
  const { from, to } = request.query as DateRange;
  if (!from || !to) return;

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate.getTime())) {
    throw httpErrors.badRequest(
      "'from' must be a valid ISO 8601 date-time string",
    );
  }

  if (isNaN(toDate.getTime())) {
    throw httpErrors.badRequest(
      "'to' must be a valid ISO 8601 date-time string",
    );
  }

  if (fromDate >= toDate) {
    throw httpErrors.badRequest("'to' must be later than 'from'");
  }
};
