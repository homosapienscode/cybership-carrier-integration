import { validateRateRequest } from "./models/validate";

const sample = {
  origin: {
    street1: "Kathmandu 1",
    city: "Kathmandu",
    postalCode: "44600",
    countryCode: "NP"
  },
  destination: {
    street1: "New York Street",
    city: "New York",
    postalCode: "10001",
    countryCode: "US"
  },
  packages: [
    { weightKg: 2 }
  ]
};

try {
  const valid = validateRateRequest(sample);
  console.log("VALID REQUEST:", valid);
} catch (e) {
  console.error("ERROR:", e);
}