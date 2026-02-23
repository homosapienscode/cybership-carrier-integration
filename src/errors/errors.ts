export class ValidationError extends Error {
  constructor(public details: unknown) {
    super("Invalid request data");
    this.name = "ValidationError";
  }
}