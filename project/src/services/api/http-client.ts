import { HttpClient } from '../types/api.types';
import { ApiError, NetworkError, handleApiError } from '../../utils/errors';

export class FetchHttpClient implements HttpClient {
  private readonly defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  constructor(
    private readonly timeout: number = 10000,
    private readonly retries: number = 3
  ) {}

  async get<T>(url: string): Promise<T> {
    return this.request<T>('GET', url);
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>('POST', url, data);
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>('PUT', url, data);
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>('DELETE', url);
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    attempt: number = 1
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const config: RequestInit = {
        method,
        headers: this.defaultHeaders,
        signal: controller.signal,
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(url, config);
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        throw new ApiError(
          errorData.code || 'HTTP_ERROR',
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          { url, method, attempt }
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle network errors and retries
      if (this.shouldRetry(error, attempt)) {
        await this.delay(this.getRetryDelay(attempt));
        return this.request<T>(method, url, data, attempt + 1);
      }

      // Handle AbortError (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError('Request timeout', { url, method, timeout: this.timeout });
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new NetworkError('Network request failed', { url, method, originalError: error.message });
      }

      // Re-throw our custom errors
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle unknown errors
      handleApiError(error);
    }
  }

  private async parseErrorResponse(response: Response): Promise<{ code?: string; message?: string }> {
    try {
      const data = await response.json();
      return {
        code: data.error?.code || data.code,
        message: data.error?.message || data.message || data.error,
      };
    } catch {
      return {
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  }

  private shouldRetry(error: unknown, attempt: number): boolean {
    if (attempt >= this.retries) {
      return false;
    }

    // Retry on network errors
    if (error instanceof NetworkError) {
      return true;
    }

    // Retry on 5xx server errors
    if (error instanceof ApiError && error.statusCode >= 500) {
      return true;
    }

    // Retry on timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return true;
    }

    return false;
  }

  private getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * Math.pow(2, attempt - 1), 5000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}