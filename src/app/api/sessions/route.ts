import { NextRequest, NextResponse } from 'next/server';
import { redis } from '../../../lib/redis';
import { db } from '../../../lib/services/database';

// GET /api/sessions/[sessionId] - Get session info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId required' },
        { status: 400 }
      );
    }

    // Get session from Redis
    const session = await redis.session.getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get conversation if exists
    let conversation = null;
    if (session.conversationId) {
      conversation = await db.getConversation(session.conversationId);
    }

    return NextResponse.json({ session, conversation });
  } catch (error) {
    console.error('❌ GET session error:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create or update session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId, conversationId, metadata } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId required' },
        { status: 400 }
      );
    }

    // Update session in Redis
    await redis.session.setSession(sessionId, {
      userId,
      conversationId,
      lastActivity: new Date().toISOString(),
      metadata: metadata || {}
    });

    // Track analytics
    await db.trackEvent({
      userId,
      sessionId,
      eventType: 'connection_established',
      eventData: { conversationId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ POST session error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
