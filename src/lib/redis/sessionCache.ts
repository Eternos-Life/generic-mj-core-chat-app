import { redisManager } from './client';

export interface CachedSession {
  sessionId: string;
  userId?: string;
  conversationId?: string;
  lastActivity: string;
  metadata: Record<string, any>;
}

export class SessionCache {
  private readonly prefix = 'session:';
  private readonly ttl = 3600;

  async setSession(sessionId: string, data: Omit<CachedSession, 'sessionId'>): Promise<void> {
    try {
      const redis = await redisManager.getClient();
      const key = `${this.prefix}${sessionId}`;
      const sessionData: CachedSession = {
        sessionId,
        ...data,
        lastActivity: new Date().toISOString()
      };

      await redis.setEx(key, this.ttl, JSON.stringify(sessionData));
      console.log(`📝 Session cached: ${sessionId}`);
    } catch (error) {
      console.error('❌ Failed to cache session:', error);
    }
  }

  async getSession(sessionId: string): Promise<CachedSession | null> {
    try {
      const redis = await redisManager.getClient();
      const key = `${this.prefix}${sessionId}`;
      const data = await redis.get(key);

      if (!data) return null;

      return JSON.parse(data) as CachedSession;
    } catch (error) {
      console.error('❌ Failed to get session:', error);
      return null;
    }
  }

  async updateLastActivity(sessionId: string): Promise<void> {
    try {
      const redis = await redisManager.getClient();
      const key = `${this.prefix}${sessionId}`;
      const current = await redis.get(key);
      
      if (current) {
        const session = JSON.parse(current) as CachedSession;
        session.lastActivity = new Date().toISOString();
        await redis.setEx(key, this.ttl, JSON.stringify(session));
      }
    } catch (error) {
      console.error('❌ Failed to update session activity:', error);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const redis = await redisManager.getClient();
      const key = `${this.prefix}${sessionId}`;
      await redis.del(key);
      console.log(`🗑️ Session deleted: ${sessionId}`);
    } catch (error) {
      console.error('❌ Failed to delete session:', error);
    }
  }
}

export const sessionCache = new SessionCache();