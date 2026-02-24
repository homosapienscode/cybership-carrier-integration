import { validateRateRequest } from "./models/validate";
import { UPSAdapter } from "./carriers/ups/upsAdapter";

async function main() {
  console.log("Cybership Carrier Integration");
  const input = {
    origin: {
      name: "Warehouse",
      street1: "123 Origin St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      countryCode: "US",
    },
    destination: {
      name: "Customer",
      street1: "456 Destination Ave",
      city: "Los Angeles",
      state: "CA",
      postalCode: "90001",
      countryCode: "US",
    },
    packages: [
      {
        weightKg: 1.2,
        lengthCm: 20,
        widthCm: 15,
        heightCm: 10,
      },
    ],
  };

  try {
    const request = validateRateRequest(input);
    console.log("Request validated");

    const adapter = new UPSAdapter();
    const rates = await adapter.getRates(request);

    console.log("\nAvailable Rates:");
    console.table(
      rates.map(r => ({
        Carrier: r.carrier,
        Service: r.serviceName,
        Price: `${r.totalAmount} ${r.currency}`,
        TransitDays: r.transitDays ?? "-",
        Delivery: r.estimatedDelivery ?? "-",
      }))
    );

  } catch (err: any) {
    console.error("\nError while fetching rates:");
    console.error(err.message || err);
  }
}

main();