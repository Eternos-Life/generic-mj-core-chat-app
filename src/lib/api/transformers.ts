// src/lib/api/transformers.ts

import type { Message } from '../../stores/chatStore';
import type {
  CreateMessageRequest,
  CreateMessageResponse,
  GetConversationsResponse,
  GetSessionResponse
} from './types';

// Database message format (what comes from API)
export interface DatabaseMessage {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Transform Zustand Message to Database format for API requests
export function messageToApiFormat(
  message: Message,
  conversationId: string,
  sessionId?: string,
  userId?: string
): CreateMessageRequest {
  // Ensure timestamp is a proper Date object
  let timestamp: Date;
  if (message.timestamp instanceof Date) {
    timestamp = message.timestamp;
  } else if (typeof message.timestamp === 'string') {
    timestamp = new Date(message.timestamp);
  } else {
    timestamp = new Date();
  }

  return {
    conversationId,
    message: {
      type: message.type,
      content: message.content,
      timestamp: timestamp
    },
    sessionId,
    userId
  };
}

// Transform Database message to Zustand Message format
export function messageFromApiFormat(dbMessage: DatabaseMessage): Message {
  // Map database 'role' field to Zustand 'type' field
  const messageType = mapRoleToType(dbMessage.role);
  
  return {
    type: messageType,
    content: dbMessage.content,
    timestamp: new Date(dbMessage.createdAt)
  };
}

// Transform array of database messages to Zustand messages
export function messagesFromApiFormat(dbMessages: DatabaseMessage[]): Message[] {
  return dbMessages
    .map(messageFromApiFormat)
    .sort((a, b) => {
      // Sort by timestamp, oldest first
      const timeA = a.timestamp?.getTime() || 0;
      const timeB = b.timestamp?.getTime() || 0;
      return timeA - timeB;
    });
}

// Map database role to Zustand message type
function mapRoleToType(role: string): Message['type'] {
  switch (role.toLowerCase()) {
    case 'user':
      return 'user';
    case 'assistant':
      return 'assistant';
    case 'system':
      return 'status';
    case 'error':
      return 'error';
    case 'debug':
      return 'debug';
    case 'special':
      return 'special';
    default:
      console.warn(`Unknown role: ${role}, defaulting to 'status'`);
      return 'status';
  }
}

// Map Zustand message type to database role
function mapTypeToRole(type: Message['type']): string {
  switch (type) {
    case 'user':
      return 'user';
    case 'assistant':
      return 'assistant';
    case 'status':
      return 'system';
    case 'error':
      return 'error';
    case 'debug':
      return 'debug';
    case 'special':
      return 'special';
    default:
      return 'system';
  }
}

// Transform conversation data from API format
export interface ConversationSummary {
  id: string;
  title: string;
  lastMessageAt: Date;
  messageCount: number;
  lastMessage?: string;
}

export function conversationsFromApiFormat(
  apiResponse: GetConversationsResponse
): ConversationSummary[] {
  return apiResponse.conversations.map(conv => ({
    id: conv.id,
    title: conv.title,
    lastMessageAt: new Date(conv.updatedAt),
    messageCount: conv.messages?.length || 0,
    lastMessage: conv.messages?.[0]?.content // API returns latest message first
  }));
}

// Transform session data from API format
export interface SessionData {
  sessionId: string;
  userId?: string;
  conversationId?: string;
  lastActivity: Date;
  messages: Message[];
  conversationTitle?: string;
}

export function sessionFromApiFormat(apiResponse: GetSessionResponse): SessionData | null {
  if (!apiResponse.session) {
    return null;
  }

  const session = apiResponse.session;
  const conversation = apiResponse.conversation;

  return {
    sessionId: session.sessionId,
    userId: session.userId,
    conversationId: session.conversationId,
    lastActivity: new Date(session.lastActivity),
    messages: conversation?.messages ? messagesFromApiFormat(
      conversation.messages.map(msg => ({
        id: msg.id,
        conversationId: conversation.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
        metadata: msg.metadata
      }))
    ) : [],
    conversationTitle: conversation?.title
  };
}

// Utility function to validate message before transformation
export function validateMessage(message: Message): boolean {
  if (!message.content || typeof message.content !== 'string') {
    console.warn('Invalid message: content is required and must be a string');
    return false;
  }

  if (!message.type) {
    console.warn('Invalid message: type is required');
    return false;
  }

  const validTypes: Message['type'][] = ['user', 'assistant', 'status', 'error', 'debug', 'special'];
  if (!validTypes.includes(message.type)) {
    console.warn(`Invalid message type: ${message.type}`);
    return false;
  }

  return true;
}

// Utility function to create a clean message for API
export function createCleanMessage(
  type: Message['type'],
  content: string,
  timestamp?: Date
): Message {
  return {
    type,
    content: content.trim(),
    timestamp: timestamp || new Date()
  };
}

// Utility function to sanitize message content
export function sanitizeMessageContent(content: string): string {
  // Remove excessive whitespace
  return content
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
    .trim();
}

// Error transformation
export interface TransformError {
  type: 'validation' | 'conversion' | 'unknown';
  message: string;
  originalData?: any;
}

export function createTransformError(
  type: TransformError['type'],
  message: string,
  originalData?: any
): TransformError {
  return {
    type,
    message,
    originalData
  };
}

// Batch transformation utilities
export function batchTransformMessagesToApi(
  messages: Message[],
  conversationId: string,
  sessionId?: string,
  userId?: string
): CreateMessageRequest[] {
  return messages
    .filter(validateMessage)
    .map(message => messageToApiFormat(message, conversationId, sessionId, userId));
}

export function batchTransformMessagesFromApi(dbMessages: DatabaseMessage[]): {
  messages: Message[];
  errors: TransformError[];
} {
  const messages: Message[] = [];
  const errors: TransformError[] = [];

  for (const dbMessage of dbMessages) {
    try {
      if (!dbMessage.content || !dbMessage.role) {
        errors.push(createTransformError(
          'validation',
          'Database message missing required fields',
          dbMessage
        ));
        continue;
      }

      const message = messageFromApiFormat(dbMessage);
      messages.push(message);
    } catch (error) {
      errors.push(createTransformError(
        'conversion',
        error instanceof Error ? error.message : 'Unknown conversion error',
        dbMessage
      ));
    }
  }

  return { messages, errors };
}