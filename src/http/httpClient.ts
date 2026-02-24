import axios, { AxiosError } from "axios";
import { config } from "../config";
import { HttpError, NetworkError, TimeoutError } from "../errors/httpErrors";

export class HttpClient {
  async get<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
    return this.request<T>("GET", url, undefined, headers);
  }

  async post<T>(
    url: string,
    data?: unknown,
    headers: Record<string, string> = {}
  ): Promise<T> {
    return this.request<T>("POST", url, data, headers);
  }

  private async request<T>(
    method: "GET" | "POST",
    url: string,
    data?: unknown,
    headers: Record<string, string> = {}
  ): Promise<T> {
    try {
      const response = await axios({
        method,
        url,
        data,
        headers,
        timeout: config.http.timeoutMs,
      });

      return response.data as T;
    } catch (err) {
      if (err instanceof AxiosError) {
        // Timeout
        if (err.code === "ECONNABORTED") {
          throw new TimeoutError();
        }

        // Server responded (4xx / 5xx)
        if (err.response) {
          throw new HttpError(
            `HTTP ${err.response.status}`,
            err.response.status,
            err.response.data
          );
        }

        // No response (DNS, network down)
        throw new NetworkError(err.message);
      }

      throw err;
    }
  }
}