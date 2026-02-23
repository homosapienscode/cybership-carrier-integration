import { rateRequestSchema } from "./schemas";
import { ValidationError } from "../errors/errors";
import { RateRequest } from "./domain";

export function validateRateRequest(input: unknown): RateRequest {
  const result = rateRequestSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(result.error.format());
  }

  return result.data;
}