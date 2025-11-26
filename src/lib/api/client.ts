// src/lib/api/client.ts

import type {
  APIClientConfig,
  APIError,
  RequestConfig,
  CreateSessionRequest,
  CreateSessionResponse,
  GetSessionRequest,
  GetSessionResponse,
  CreateConversationRequest,
  CreateConversationResponse,
  GetConversationsRequest,
  GetConversationsResponse,
  CreateMessageRequest,
  CreateMessageResponse,
  SyncStatus
} from './types';

export class APIClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultRetryDelay: number;

  constructor(config: APIClientConfig = {}) {
    this.baseUrl = config.baseUrl || '';
    this.defaultTimeout = config.timeout || 10000;
    this.defaultRetries = config.defaultRetries || 3;
    this.defaultRetryDelay = config.defaultRetryDelay || 1000;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay
    } = config;

    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestOptions: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    let lastError: APIError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🔗 API Request [${attempt + 1}/${retries + 1}]: ${options.method || 'GET'} ${endpoint}`);
        
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }

          const apiError: APIError = {
            message: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
            details: errorData
          };

          // Don't retry on client errors (4xx), only server errors (5xx) and network issues
          if (response.status >= 400 && response.status < 500) {
            throw apiError;
          }

          lastError = apiError;
          if (attempt < retries) {
            console.log(`⚠️ API Request failed (${response.status}), retrying in ${retryDelay}ms...`);
            await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
            continue;
          }
          throw apiError;
        }

        const result = await response.json();
        console.log(`✅ API Request successful: ${endpoint}`);
        return result as T;

      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof TypeError && error.message.includes('fetch')) {
          // Network error
          lastError = {
            message: 'Network error - please check your connection',
            status: 0,
            details: error
          };
        } else if (error instanceof Error && error.name === 'AbortError') {
          // Timeout error
          lastError = {
            message: `Request timeout after ${timeout}ms`,
            status: 408,
            details: error
          };
        } else if ((error as APIError).status) {
          // API error we already formatted
          lastError = error as APIError;
        } else {
          // Unknown error
          lastError = {
            message: error instanceof Error ? error.message : 'Unknown error',
            status: 500,
            details: error
          };
        }

        if (attempt < retries && lastError.status !== 400) {
          console.log(`⚠️ API Request failed (${lastError.message}), retrying in ${retryDelay}ms...`);
          await this.delay(retryDelay * Math.pow(2, attempt));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError!;
  }

  // Session Management
  async createSession(data: CreateSessionRequest, config?: RequestConfig): Promise<CreateSessionResponse> {
    return this.makeRequest<CreateSessionResponse>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }, config);
  }

  async getSession(data: GetSessionRequest, config?: RequestConfig): Promise<GetSessionResponse> {
    const params = new URLSearchParams({ sessionId: data.sessionId });
    return this.makeRequest<GetSessionResponse>(`/api/sessions?${params}`, {
      method: 'GET',
    }, config);
  }

  // Conversation Management
  async createConversation(data: CreateConversationRequest, config?: RequestConfig): Promise<CreateConversationResponse> {
    return this.makeRequest<CreateConversationResponse>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    }, config);
  }

  async getConversations(data: GetConversationsRequest, config?: RequestConfig): Promise<GetConversationsResponse> {
    const params = new URLSearchParams();
    if (data.userId) params.append('userId', data.userId);
    if (data.sessionId) params.append('sessionId', data.sessionId);
    if (data.limit) params.append('limit', data.limit.toString());

    return this.makeRequest<GetConversationsResponse>(`/api/conversations?${params}`, {
      method: 'GET',
    }, config);
  }

  // Message Management
  async createMessage(data: CreateMessageRequest, config?: RequestConfig): Promise<CreateMessageResponse> {
    return this.makeRequest<CreateMessageResponse>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }, config);
  }

  // Health Check
  async ping(config?: RequestConfig): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest<{ status: string; timestamp: string }>('/api/health', {
      method: 'GET',
    }, config);
  }

  // Batch Operations (for future use)
  async batchCreateMessages(messages: CreateMessageRequest[], config?: RequestConfig): Promise<CreateMessageResponse[]> {
    const results: CreateMessageResponse[] = [];
    const errors: APIError[] = [];

    // Process in parallel but with concurrency limit
    const concurrencyLimit = 3;
    for (let i = 0; i < messages.length; i += concurrencyLimit) {
      const batch = messages.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map(async (messageData, index) => {
        try {
          const result = await this.createMessage(messageData, config);
          return { index: i + index, result, error: null };
        } catch (error) {
          return { index: i + index, result: null, error: error as APIError };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      for (const { index, result, error } of batchResults) {
        if (result) {
          results[index] = result;
        } else if (error) {
          errors[index] = error;
        }
      }
    }

    if (errors.length > 0) {
      console.warn(`⚠️ Batch operation completed with ${errors.length} errors:`, errors);
    }

    return results.filter(Boolean); // Remove undefined entries
  }
}

// Create and export singleton instance
export const apiClient = new APIClient({
  timeout: 10000,
  defaultRetries: 3,
  defaultRetryDelay: 1000
});

// Utility function to check if error is retryable
export function isRetryableError(error: APIError): boolean {
  // Retry on server errors (5xx) and network issues, but not client errors (4xx)
  return error.status >= 500 || error.status === 0 || error.status === 408;
}

// Utility function to get user-friendly error message
export function getErrorMessage(error: APIError): string {
  switch (error.status) {
    case 0:
      return 'Unable to connect. Please check your internet connection.';
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please sign in.';
    case 403:
      return 'Permission denied.';
    case 404:
      return 'Resource not found.';
    case 408:
      return 'Request timeout. Please try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
}