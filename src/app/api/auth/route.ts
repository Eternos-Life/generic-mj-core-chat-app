import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // For development: return the API key securely
    // In production: implement proper token exchange/JWT
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' }, 
        { status: 500 }
      );
    }

    // Return the key for client use
    // Note: In production, you'd return a JWT or temporary token
    return NextResponse.json({ 
      apiKey,
      expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour
    });
    
  } catch (error) {
    console.error('Auth endpoint error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' }, 
      { status: 500 }
    );
  }
}