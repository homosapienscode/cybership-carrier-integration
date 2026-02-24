import { HttpClient } from "../http/httpClient";
import { config } from "../config";
import { AuthError } from "../errors/authErrors";

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

export class AuthManager {
  private http = new HttpClient();

  private cachedToken?: {
    token: string;
    expiresAt: number;
  };

  /**
   * Public method used by UPS client
   */
  async getAccessToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.cachedToken!.token;
    }

    return this.fetchNewToken();
  }

  /**
   * Checks if cached token still usable
   */
  private isTokenValid(): boolean {
    if (!this.cachedToken) return false;

    // refresh 30 seconds early
    return Date.now() < this.cachedToken.expiresAt - 30_000;
  }

  /**
   * Fetch token from UPS OAuth server
   */
  private async fetchNewToken(): Promise<string> {
    try {
      const basicAuth = Buffer.from(
        `${config.ups.clientId}:${config.ups.clientSecret}`,
      ).toString("base64");

      const body = new URLSearchParams({
        grant_type: "client_credentials",
      }).toString();

      const headers = {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "x-merchant-id": config.ups.accountNumber,
      };

      const response = await this.http.post<TokenResponse>(
        config.ups.tokenUrl,
        body,
        headers,
      );

      if (!response || !response.access_token) {
        throw new AuthError("Token response missing access_token", response);
      }

      const expiresIn = response.expires_in ?? 3600;
      const expiresAt = Date.now() + expiresIn * 1000;

      this.cachedToken = {
        token: response.access_token,
        expiresAt,
      };

      return response.access_token;
    } catch (err) {
      throw new AuthError("Failed to obtain UPS OAuth token", err);
    }
  }
}
