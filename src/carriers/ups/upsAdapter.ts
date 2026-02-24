import { CarrierAdapter } from "../carrier";
import { RateRequest, RateQuote, Package, Address } from "../../models/domain";
import { UpsClient } from "./upsClient";
import { config } from "../../config";
import { cmToInches, kgToLbs } from "../../utils/units";

export class UPSAdapter implements CarrierAdapter {
  name = "UPS";
  private client = new UpsClient();

  async getRates(req: RateRequest): Promise<RateQuote[]> {
    const payload = this.buildUpsPayload(req);

    const response = await this.client.rate(payload); 

    console.log(response);

    return this.parseUpsResponse(response);
  }

  // Build UPS Request
  private buildUpsPayload(req: RateRequest): any {
    const shipperNumber = config.ups.shipperNumber || config.ups.accountNumber;

    const shipment: any = {
      Shipper: {
        Name: req.origin.name ?? "Shipper",
        ShipperNumber: shipperNumber,
        Address: {
          AddressLine: [req.origin.street1, req.origin.street2].filter(Boolean),
          City: req.origin.city,
          StateProvinceCode: req.origin.state,
          PostalCode: req.origin.postalCode,
          CountryCode: req.origin.countryCode,
        },
      },

      ShipTo: {
        Name: req.destination.name ?? "ShipTo",
        Address: {
          AddressLine: [
            req.destination.street1,
            req.destination.street2,
          ].filter(Boolean),
          City: req.destination.city,
          StateProvinceCode: req.destination.state,
          PostalCode: req.destination.postalCode,
          CountryCode: req.destination.countryCode,
        },
      },

      ShipFrom: {
        Name: req.origin.name ?? "ShipFrom",
        Address: {
          AddressLine: [req.origin.street1, req.origin.street2].filter(Boolean),
          City: req.origin.city,
          StateProvinceCode: req.origin.state,
          PostalCode: req.origin.postalCode,
          CountryCode: req.origin.countryCode,
        },
      },

      PaymentDetails: {
        ShipmentCharge: [
          {
            Type: "01",
            BillShipper: { AccountNumber: shipperNumber },
          },
        ],
      },
      Service: req.serviceLevel
        ? { Code: req.serviceLevel, Description: "" }
        : undefined,

      NumOfPieces: String(req.packages.length),
      Package: this.mapPackages(req.packages),
    };

    const body = {
      RateRequest: {
        Request: {
          TransactionReference: {
            CustomerContext: "Rate Request",
          },
          RequestOption: "Rate",
        },
        Shipment: shipment,
      },
    };

    return body;
  }

  private mapPackages(pkgs: Package[]) {
    return pkgs.map((p, idx) => {
      const weightLbs = kgToLbs(p.weightKg);
      const hasDimensions = p.lengthCm && p.widthCm && p.heightCm;

      const packageValue: any = {
        Description: p.packagingType ?? "Package",
        PackagingType: {
          Code: "02",
          Description: "Customer Supplied Package",
        },
        PackageWeight: {
          UnitOfMeasurement: {
            Code: "LBS",
            Description: "Pounds",
          },
          Weight: String(weightLbs),
        },
      };

      if (hasDimensions) {
        packageValue.Dimensions = {
          UnitOfMeasurement: {
            Code: "IN",
            Description: "Inches",
          },
          Length: String(Math.round(cmToInches(p.lengthCm!))),
          Width: String(Math.round(cmToInches(p.widthCm!))),
          Height: String(Math.round(cmToInches(p.heightCm!))),
        };
      }

      return packageValue;
    });
  }

  private assertNoUpsError(data: any) {
  if (data?.Fault) {
    const message =
      data.Fault?.detail?.Errors?.ErrorDetail?.PrimaryErrorCode?.Description ||
      "UPS returned an error";

    throw new Error(`UPS Error: ${message}`);
  }
}

  // Parse UPS Response
  private parseUpsResponse(data: any): RateQuote[] {
    if (!data) return [];

    const rated = data?.RateResponse?.RatedShipment ?? data?.RateResponse;

    const shipments = Array.isArray(rated) ? rated : rated ? [rated] : [];

    return shipments.map((s: any): RateQuote => {

      const totalCharges = s?.TotalCharges ?? s?.BillingWeight ?? null;
      const monetary = totalCharges?.MonetaryValue ?? s?.TotalCharges?.MonetaryValue ?? 0;
      const currency = totalCharges?.CurrencyCode ?? "USD";

      // transit info
      const transitDays = s?.GuaranteedDelivery?.BusinessDaysInTransit
        ? Number(s.GuaranteedDelivery.BusinessDaysInTransit)
        : undefined;

      const estimatedDelivery = s?.GuaranteedDelivery?.DeliveryDate ?? undefined;

      return {
        carrier: "UPS",
        serviceCode: s?.Service?.Code ?? s?.Service?.Code ?? "UNKNOWN",
        serviceName: s?.Service?.Description ?? s?.Service?.Code ?? `UPS Service ${s?.Service?.Code}`,
        totalAmount: Number(monetary),
        currency,
        transitDays,
        estimatedDelivery,
        raw: s,
      };
    });

  }
}
