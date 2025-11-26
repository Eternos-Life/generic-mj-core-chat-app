import { redisManager } from './client';
import { sessionCache } from './sessionCache';
import { conversationCache } from './conversationCache';

export { redisManager };
export { sessionCache, type CachedSession } from './sessionCache';
export { conversationCache, type CachedConversation } from './conversationCache';

export const redis = {
  session: sessionCache,
  conversation: conversationCache,
  
  async ping(): Promise<boolean> {
    try {
      const client = await redisManager.getClient();
      const result = await client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis ping failed:', error);
      return false;
    }
  },

  async cleanup(): Promise<void> {
    await redisManager.disconnect();
  }
};