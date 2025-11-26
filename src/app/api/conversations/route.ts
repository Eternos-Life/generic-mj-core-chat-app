import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/services/database';
import { redis } from '../../../lib/redis';

// GET /api/conversations - Get user conversations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'userId or sessionId required' },
        { status: 400 }
      );
    }

    let conversations: any[] = [];

    if (userId) {
      conversations = await db.getUserConversations(userId);
    } else if (sessionId) {
      // For anonymous sessions, try to get from cache
      const cachedSession = await redis.session.getSession(sessionId);
      if (cachedSession?.conversationId) {
        const conversation = await db.getConversation(cachedSession.conversationId);
        conversations = conversation ? [conversation] : [];
      }
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('❌ GET conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create new conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId, title, metadata } = body;

    // Create conversation in database
    const conversation = await db.createConversation({
      userId,
      sessionId,
      title,
      metadata
    });

    // Cache session info in Redis
    if (sessionId) {
      await redis.session.setSession(sessionId, {
        userId,
        conversationId: conversation.id,
        lastActivity: new Date().toISOString(),
        metadata: metadata || {}
      });
    }

    // Track analytics
    await db.trackEvent({
      userId,
      sessionId,
      eventType: 'conversation_started',
      eventData: { conversationId: conversation.id }
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('❌ POST conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
