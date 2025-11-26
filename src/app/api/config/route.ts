import { NextResponse } from 'next/server';

// Force this route to be dynamic (not statically generated)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      model: process.env.AZURE_OPENAI_MODEL || 'gpt-4o-realtime-preview',
      searchEndpoint: process.env.AZURE_SEARCH_ENDPOINT,
      searchIndex: process.env.AZURE_SEARCH_INDEX,
      voiceDeploymentId: process.env.VOICE_DEPLOYMENT_ID,
      customVoiceName: process.env.CUSTOM_VOICE_NAME,
      // Note: We don't send API keys to client - handle auth differently
      hasApiKey: !!process.env.AZURE_OPENAI_API_KEY,
      hasSearchApiKey: !!process.env.AZURE_SEARCH_API_KEY,
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Config endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to load configuration' }, 
      { status: 500 }
    );
  }
}