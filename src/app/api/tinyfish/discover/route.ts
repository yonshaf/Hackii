import { NextRequest, NextResponse } from 'next/server';
import { discoverEventsWorkflow } from '@/lib/tinyfish/discover-events';
import { tinyFishClient } from '@/lib/tinyfish/client';
import { DEMO_EVENTS } from '@/lib/events/demo-events';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { query, category, city } = body;

    const isLiveConfigured = tinyFishClient.isConfigured();

    if (!isLiveConfigured) {
      // Return clear status explaining that credentials are required for live TinyFish agents
      return NextResponse.json({
        isLive: false,
        status: 'unconfigured',
        message: 'TINYFISH_API_KEY is not configured in .env.local. Operating in demo verified mode. To run live web agents, configure your TinyFish API key.',
        events: DEMO_EVENTS.slice(0, 4),
        totalDiscovered: DEMO_EVENTS.length,
      });
    }

    // Execute live TinyFish discovery
    const result = await discoverEventsWorkflow({
      query: query || undefined,
      category: category && category !== 'all' ? category : undefined,
      city: city || undefined,
    });

    return NextResponse.json({
      isLive: true,
      status: 'completed',
      message: result.message,
      events: result.events,
      totalDiscovered: result.totalFound,
      source: result.source,
    });
  } catch (err: any) {
    console.error('Error during TinyFish discovery:', err);
    return NextResponse.json(
      {
        isLive: false,
        status: 'error',
        error: 'TinyFish discovery failed',
        message: err.message,
      },
      { status: 500 }
    );
  }
}
