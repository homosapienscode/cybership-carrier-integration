import nock from "nock";
import { UPSAdapter } from "../../carriers/ups/upsAdapter";
import { config } from "../../config";

describe("UPS Integration", () => {
  const adapter = new UPSAdapter();

  beforeEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.restore();
  });

  it("should fetch token and return normalized rate quotes", async () => {
    const tokenScope = nock("https://wwwcie.ups.com")
      .post("/security/v1/oauth/token")
      .reply(200, {
        access_token: "mocked_token",
        expires_in: 3600,
        token_type: "Bearer",
      });

    const ratingScope = nock("https://wwwcie.ups.com")
      .post(`/api/rating/${config.ups.apiVersion}/${config.ups.requestOption}`)
      .reply(200, {
        RateResponse: {
          RatedShipment: [
            {
              Service: {
                Code: "03",
                Description: "Ground",
              },
              TotalCharges: {
                CurrencyCode: "USD",
                MonetaryValue: "12.34",
              },
              GuaranteedDelivery: {
                BusinessDaysInTransit: "3",
                DeliveryDate: "2026-03-01",
              },
            },
          ],
        },
      });

    const request = {
      origin: {
        street1: "123 Origin St",
        city: "New York",
        postalCode: "10001",
        countryCode: "US",
      },
      destination: {
        street1: "456 Dest Ave",
        city: "Los Angeles",
        postalCode: "90001",
        countryCode: "US",
      },
      packages: [
        {
          weightKg: 1,
        },
      ],
    };

    const result = await adapter.getRates(request);

    console.log(result);

    expect(result).toHaveLength(1);

    expect(result[0]).toEqual({
      carrier: "UPS",
      serviceCode: "03",
      serviceName: "Ground",
      totalAmount: 12.34,
      currency: "USD",
      transitDays: 3,
      estimatedDelivery: "2026-03-01",
      raw: expect.any(Object),
    });

    expect(tokenScope.isDone()).toBe(true);
    expect(ratingScope.isDone()).toBe(true);
  });

  it("should throw error when UPS returns 500", async () => {
    nock.cleanAll();

    // Mock token
    nock("https://wwwcie.ups.com").post("/security/v1/oauth/token").reply(200, {
      access_token: "valid_token",
      expires_in: 3600,
      token_type: "Bearer",
    });

    // Mock UPS internal error
    nock("https://wwwcie.ups.com")
      .post(`/api/rating/${config.ups.apiVersion}/${config.ups.requestOption}`)
      .reply(500, { message: "Internal Server Error" });

    const request = {
      origin: {
        street1: "A",
        city: "NY",
        postalCode: "10001",
        countryCode: "US",
      },
      destination: {
        street1: "B",
        city: "LA",
        postalCode: "90001",
        countryCode: "US",
      },
      packages: [{ weightKg: 1 }],
    };

    await expect(adapter.getRates(request)).rejects.toThrow();
  });
});
