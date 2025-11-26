import { redisManager } from './client';
import type { Message } from '../../stores/chatStore';

export interface CachedConversation {
  conversationId: string;
  userId?: string;
  title?: string;
  messages: Message[];
  lastUpdated: string;
  metadata: Record<string, any>;
}

export class ConversationCache {
  private readonly prefix = 'conversation:';
  private readonly ttl = 7200; // 2 hours

  async setConversation(conversationId: string, data: Omit<CachedConversation, 'conversationId' | 'lastUpdated'>): Promise<void> {
    try {
      const redis = await redisManager.getClient();
      const key = `${this.prefix}${conversationId}`;
      const conversationData: CachedConversation = {
        conversationId,
        ...data,
        lastUpdated: new Date().toISOString()
      };

      await redis.setEx(key, this.ttl, JSON.stringify(conversationData));
      console.log(`💬 Conversation cached: ${conversationId}`);
    } catch (error) {
      console.error('❌ Failed to cache conversation:', error);
    }
  }

  async getConversation(conversationId: string): Promise<CachedConversation | null> {
    try {
      const redis = await redisManager.getClient();
      const key = `${this.prefix}${conversationId}`;
      const data = await redis.get(key);

      if (!data) return null;

      return JSON.parse(data) as CachedConversation;
    } catch (error) {
      console.error('❌ Failed to get cached conversation:', error);
      return null;
    }
  }

  async addMessage(conversationId: string, message: Message): Promise<void> {
    try {
      const conversation = await this.getConversation(conversationId);
      if (conversation) {
        conversation.messages.push(message);
        conversation.lastUpdated = new Date().toISOString();
        await this.setConversation(conversationId, conversation);
      }
    } catch (error) {
      console.error('❌ Failed to add message to cache:', error);
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const redis = await redisManager.getClient();
      const key = `${this.prefix}${conversationId}`;
      await redis.del(key);
      console.log(`🗑️ Conversation cache deleted: ${conversationId}`);
    } catch (error) {
      console.error('❌ Failed to delete conversation cache:', error);
    }
  }
}

// Export singleton instance
export const conversationCache = new ConversationCache();
