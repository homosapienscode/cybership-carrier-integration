import { HttpClient } from "../../http/httpClient";
import { AuthManager } from "../../auth/authManager";
import { config } from "../../config";
import { HttpError } from "../../errors/httpErrors";

export class UpsClient {
  private http = new HttpClient();
  private auth = new AuthManager();

  /**
   * Calls UPS Rating API
   */
  async rate(payload: unknown): Promise<any> {
    const token = await this.auth.getAccessToken();

    try {
      return await this.callRatingApi(payload, token);
    } catch (err) {
      // If token expired or invalid, retry once with new token
      if (err instanceof HttpError && err.status === 401) {
        const newToken = await this.auth.getAccessToken();
        return this.callRatingApi(payload, newToken);
      }

      throw err;
    }
  }

  private buildRatingUrl(): string {
    const base = `${config.ups.ratingUrl}/${config.ups.apiVersion}/${config.ups.requestOption}`;

    return base;
  }

  private async callRatingApi(
    payload: unknown,
    token: string,
  ): Promise<any> {
    const url = this.buildRatingUrl();

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      transId: `rate-${Date.now()}`,
      transactionSrc: "cybership",
    };
    const res = await this.http.post<any>(url, payload, headers);
    return res;
  }
}
