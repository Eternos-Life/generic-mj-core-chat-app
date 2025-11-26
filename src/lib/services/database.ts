import { PrismaClient } from '@prisma/client';
import type { Message as ZustandMessage } from '../../stores/chatStore';

// Singleton Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database service class
export class DatabaseService {
  // User management
  async createOrGetUser(email: string, displayName?: string) {
    try {
      return await prisma.user.upsert({
        where: { email },
        update: { 
          lastActiveAt: new Date(),
          displayName: displayName || undefined
        },
        create: {
          email,
          displayName,
          gdprConsentGiven: true,
          gdprConsentDate: new Date()
        }
      });
    } catch (error) {
      console.error('❌ Failed to create/get user:', error);
      throw error;
    }
  }

  // Conversation management
  async createConversation(data: {
    userId?: string;
    sessionId?: string;
    title?: string;
    metadata?: any;
  }) {
    try {
      return await prisma.conversation.create({
        data: {
          userId: data.userId,
          sessionId: data.sessionId,
          title: data.title || 'New Conversation',
          metadata: data.metadata || {}
        }
      });
    } catch (error) {
      console.error('❌ Failed to create conversation:', error);
      throw error;
    }
  }

  async getConversation(conversationId: string) {
    try {
      return await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          },
          user: {
            select: { id: true, email: true, displayName: true }
          }
        }
      });
    } catch (error) {
      console.error('❌ Failed to get conversation:', error);
      throw error;
    }
  }

  async getUserConversations(userId: string, limit: number = 20) {
    try {
      return await prisma.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    } catch (error) {
      console.error('❌ Failed to get user conversations:', error);
      throw error;
    }
  }

  // Message management
  async addMessage(conversationId: string, message: ZustandMessage) {
    try {
      // Safe timestamp handling - handle Date objects, strings, or create new Date
      let timestampString: string;
      if (message.timestamp instanceof Date) {
        timestampString = message.timestamp.toISOString();
      } else if (typeof message.timestamp === 'string') {
        // If it's already a string, assume it's an ISO string
        timestampString = message.timestamp;
      } else {
        // If timestamp is undefined or null, use current time
        timestampString = new Date().toISOString();
      }

      const dbMessage = await prisma.message.create({
        data: {
          conversationId,
          role: message.type as any, // Convert Zustand type to Prisma enum
          content: message.content,
          metadata: {
            timestamp: timestampString,
            messageType: message.type,
            ...message
          }
        }
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

      return dbMessage;
    } catch (error) {
      console.error('❌ Failed to add message:', error);
      throw error;
    }
  }

  // Analytics tracking
  async trackEvent(data: {
    userId?: string;
    sessionId?: string;
    eventType: string;
    eventData?: any;
  }) {
    try {
      return await prisma.analyticsEvent.create({
        data: {
          userId: data.userId,
          sessionId: data.sessionId,
          eventType: data.eventType as any,
          eventData: data.eventData || {}
        }
      });
    } catch (error) {
      console.error('❌ Failed to track event:', error);
      // Don't throw - analytics shouldn't break the app
    }
  }

  // GDPR compliance
  async deleteUserData(userId: string) {
    try {
      await prisma.$transaction([
        prisma.message.deleteMany({
          where: { conversation: { userId } }
        }),
        prisma.conversation.deleteMany({
          where: { userId }
        }),
        prisma.analyticsEvent.deleteMany({
          where: { userId }
        }),
        prisma.user.update({
          where: { id: userId },
          data: { dataDeletedAt: new Date() }
        })
      ]);
    } catch (error) {
      console.error('❌ Failed to delete user data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const db = new DatabaseService();