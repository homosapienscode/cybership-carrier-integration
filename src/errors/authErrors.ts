export class AuthError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = "AuthError";
  }
}