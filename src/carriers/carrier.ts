import { RateRequest, RateQuote } from "../models/domain";

/**
 * Contract every carrier must implement.
 */
export interface CarrierAdapter {
  name: string;

  /**
   * Returns normalized rate quotes
   * regardless of carrier-specific response format
   */
  getRates(request: RateRequest): Promise<RateQuote[]>;
}
