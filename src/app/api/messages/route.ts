import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/services/database';
import { redis } from '../../../lib/redis';

// POST /api/messages - Add message to conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message, sessionId, userId } = body;

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'conversationId and message required' },
        { status: 400 }
      );
    }

    // Save message to database
    const dbMessage = await db.addMessage(conversationId, message);

    // Update conversation cache in Redis
    await redis.conversation.addMessage(conversationId, message);

    // Update session activity
    if (sessionId) {
      await redis.session.updateLastActivity(sessionId);
    }

    // Track analytics
    await db.trackEvent({
      userId,
      sessionId,
      eventType: 'message_sent',
      eventData: {
        conversationId,
        messageType: message.type,
        messageLength: message.content.length
      }
    });

    return NextResponse.json({ message: dbMessage });
  } catch (error) {
    console.error('❌ POST messages error:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}
