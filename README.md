# Cybership Carrier Integration

This project implements a shipping rate service that integrates with the UPS Rating API using OAuth2 Client Credentials authentication.

The system accepts shipment details (origin, destination, packages) and returns normalized rate quotes independent of carrier-specific formats.


The implementation focuses on:

- Clean architecture
- Extensibility for additional carriers
- Robust error handling
- Token lifecycle management
- Integration testing using mocked carrier responses

## Key Design Principle

The application never exposes carrier-specific structures outside the adapter. This allows adding new carriers (FedEx, DHL, etc.) without modifying business logic.


## Features

### 1. OAuth2 Client Credentials

- Retrieves UPS access token
- Caches token in memory
- Automatically refreshes when expired
- Retries request after 401 Unauthorized

### 2. Rating Integration
- Builds UPS-compliant shipment request
- Supports multiple packages
- Converts units (kg → lbs, cm → inches)
- Normalizes carrier response into generic RateQuote

### 3. Error Handling
- Handles multiple failure scenarios:
- Network failures
- Carrier 5xx responses
- Expired tokens
- Carrier logical errors
- Malformed responses

### 4. Validation

Incoming requests are validated using zod runtime schemas.

### 5. Integration Testing

- OAuth token endpoint
- Rating endpoint
- Retry logic

No real UPS API calls are made.

## No real UPS API calls are made.

```
src/ 
    auth/ OAuth token lifecycle 
    carriers/ 
        carrier.ts Carrier interface 
        ups/ UPS implementation 
    config/ Environment configuration 
    errors/ Error types 
    http/ HTTP client wrapper 
    models/ Domain models + validation 
    services/ Rate orchestration 
    tests/ Integration tests
    utils/ Utility functions
```

## Environment Variables

Create `.env` from `.env.example`:

```
# UPS OAuth
UPS_ACCOUNT_NUMBER=
UPS_CLIENT_ID=
UPS_CLIENT_SECRET=
UPS_TOKEN_URL=https://wwwcie.ups.com/security/v1/oauth/token

# UPS Merchant/Account number
UPS_ACCOUNT_NUMBER=
UPS_SHIPPER_NUMBER=

# UPS API
UPS_RATING_URL=https://wwwcie.ups.com/api/rating

UPS_API_VERSION=v1
UPS_REQUEST_OPTION=Rate

# App
NODE_ENV=development
PORT=3000

# HTTP Settings
HTTP_TIMEOUT_MS=5000
```

Values are not required for running tests because endpoints are mocked.  

## Running the Project

Install dependencies:

```
npm install
```

Run TypeScript:
```
npm run start
```

Run tests:
```
npm test
```

## Extending to New Carriers

To add another carrier:

1. Implement CarrierAdapter
2. Add client implementation
3. Map request/response

No changes required in domain models or services.

## Design Decisions

- Adapter pattern isolates carrier formats
- Centralized HttpClient normalizes errors
- Token caching avoids unnecessary auth calls
- Runtime validation prevents invalid input propagation
- Integration tests simulate real carrier behavior