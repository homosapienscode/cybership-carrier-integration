export class HttpError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends Error {
  constructor() {
    super("Request timed out");
    this.name = "TimeoutError";
  }
}