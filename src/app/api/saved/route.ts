import { NextRequest, NextResponse } from 'next/server';
import { DEMO_EVENTS } from '@/lib/events/demo-events';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];

    if (eventIds.length === 0) {
      return NextResponse.json({ events: [] });
    }

    const matchedEvents = DEMO_EVENTS.filter((e) => eventIds.includes(e.id));
    return NextResponse.json({ events: matchedEvents });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch saved events', message: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { eventId, userId } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const admin = createAdminClient();
    if (admin && userId) {
      const { error } = await admin.from('saved_events').upsert({
        user_id: userId,
        event_id: eventId,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, eventId });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to save event', message: err.message }, { status: 500 });
  }
}
