// src/lib/api/types.ts

import type { Message } from '../../stores/chatStore';

// Base API Response wrapper
export interface APIResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}

// Session Types
export interface CreateSessionRequest {
  sessionId: string;
  userId?: string;
  conversationId?: string;
  metadata?: Record<string, any>;
}

export interface CreateSessionResponse {
  success: boolean;
}

export interface GetSessionRequest {
  sessionId: string;
}

export interface GetSessionResponse {
  session: {
    sessionId: string;
    userId?: string;
    conversationId?: string;
    lastActivity: string;
    metadata: Record<string, any>;
  } | null;
  conversation?: {
    id: string;
    title?: string;
    messages: Array<{
      id: string;
      role: string;
      content: string;
      createdAt: string;
      metadata?: Record<string, any>;
    }>;
  } | null;
}

// Conversation Types
export interface CreateConversationRequest {
  userId?: string;
  sessionId?: string;
  title?: string;
  metadata?: Record<string, any>;
}

export interface CreateConversationResponse {
  conversation: {
    id: string;
    userId?: string;
    sessionId?: string;
    title: string;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
  };
}

export interface GetConversationsRequest {
  userId?: string;
  sessionId?: string;
  limit?: number;
}

export interface GetConversationsResponse {
  conversations: Array<{
    id: string;
    userId?: string;
    sessionId?: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages?: Array<{
      id: string;
      role: string;
      content: string;
      createdAt: string;
    }>;
  }>;
}

// Message Types
export interface CreateMessageRequest {
  conversationId: string;
  message: Message;
  sessionId?: string;
  userId?: string;
}

export interface CreateMessageResponse {
  message: {
    id: string;
    conversationId: string;
    role: string;
    content: string;
    createdAt: string;
    metadata: Record<string, any>;
  };
}

// Error Types
export interface APIError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Request Configuration
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// API Client Configuration
export interface APIClientConfig {
  baseUrl?: string;
  timeout?: number;
  defaultRetries?: number;
  defaultRetryDelay?: number;
}

// Pagination (for future use)
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Sync Status (for UI feedback)
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncState {
  status: SyncStatus;
  lastSyncAt?: Date;
  error?: string;
  pendingOperations?: number;
}
