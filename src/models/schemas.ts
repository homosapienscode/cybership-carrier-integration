import { z } from "zod";

/**
 * Address validation
 */
export const addressSchema = z.object({
  name: z.string().optional(),
  street1: z.string(),
  street2: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  postalCode: z.string(),
  countryCode: z.string().length(2),
});

/**
 * Package validation
 */
export const packageSchema = z.object({
  id: z.string().optional(),
  weightKg: z.number().positive(),

  lengthCm: z.number().positive().optional(),
  widthCm: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),

  packagingType: z.string().optional(),

  valueAmount: z.number().optional(),
  valueCurrency: z.string().optional(),
});

/**
 * Rate request validation
 */
export const rateRequestSchema = z.object({
  origin: addressSchema,
  destination: addressSchema,
  packages: z.array(packageSchema).min(1),

  serviceLevel: z.string().optional(),
  currency: z.string().optional(),
  shipDate: z.string().optional(),
});