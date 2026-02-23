// Represents ISO country code (NP, US, CA etc.)
export type CountryCode = string;

/**
 * Address used for shipping
 */
export interface Address {
  name?: string;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode: string;
  countryCode: CountryCode;
}

/**
 * A single package inside a shipment
 */
export interface Package {
  id?: string;
  weightKg: number;

  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;

  packagingType?: string; // e.g. box, envelope

  valueAmount?: number;
  valueCurrency?: string;
}

/**
 * The request coming into our service
 * (carrier-agnostic)
 */
export interface RateRequest {
  origin: Address;
  destination: Address;
  packages: Package[];

  serviceLevel?: string; // optional hint like "express"
  currency?: string;
  shipDate?: string;
}

/**
 * Normalized rate quote returned to user
 */
export interface RateQuote {
  carrier: string;
  serviceCode: string;
  serviceName: string;

  totalAmount: number;
  currency: string;

  transitDays?: number;
  estimatedDelivery?: string;

  raw?: unknown; // store original carrier response
}