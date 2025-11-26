import { createClient } from 'redis';

type RedisClientType = ReturnType<typeof createClient>;

class RedisManager {
  private client: RedisClientType | null = null;
  private isConnecting = false;

  async getClient(): Promise<RedisClientType> {
    if (this.client && this.client.isOpen) {
      return this.client;
    }

    if (this.isConnecting) {
      // Wait for existing connection attempt
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getClient();
    }

    this.isConnecting = true;

    try {
      // For rediss:// URLs, disable certificate validation
      if (process.env.REDIS_URL?.startsWith('rediss://')) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      }
      
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 500),
          connectTimeout: 5000
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected');
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.client.isOpen) {
      await this.client.quit();
      this.client = null;
    }
  }
}

// Singleton instance
const redisManager = new RedisManager();

export { redisManager };
export type { RedisClientType };
