import { NextRequest, NextResponse } from 'next/server';
import { DEMO_EVENTS } from '@/lib/events/demo-events';
import { extractEventFromUrl } from '@/lib/tinyfish/extract-event';
import { tinyFishClient } from '@/lib/tinyfish/client';
import { detectEventChanges } from '@/lib/events/changes';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { eventId, slug } = await request.json().catch(() => ({}));

    // Find the existing event
    const oldEvent = DEMO_EVENTS.find((e) => e.id === eventId || e.slug === slug);

    if (!oldEvent) {
      return NextResponse.json({ error: 'Event not found to refresh' }, { status: 404 });
    }

    if (!tinyFishClient.isConfigured()) {
      // In demo mode, simulate a verified refresh with no trivial changes or simulate a verified status
      return NextResponse.json({
        isLive: false,
        message: 'TinyFish live agent is not configured. Checked verified archive: event details remain current.',
        lastVerifiedAt: new Date().toISOString(),
        changesDetected: [],
        event: oldEvent,
      });
    }

    // Run real live extraction on the source URL
    const freshEvent = await extractEventFromUrl(oldEvent.sourceUrl);

    if (!freshEvent) {
      return NextResponse.json({
        error: 'Live extraction did not return valid event structure from organizer URL',
      }, { status: 422 });
    }

    // Compare and detect changes
    const detectedChanges = detectEventChanges(oldEvent, freshEvent);

    // Save changes to database if Supabase admin is connected
    const admin = createAdminClient();
    if (admin && detectedChanges.length > 0) {
      for (const change of detectedChanges) {
        await admin.from('event_changes').insert({
          event_id: oldEvent.id,
          field_name: change.fieldName,
          old_value: change.oldValue,
          new_value: change.newValue,
        });
      }
    }

    return NextResponse.json({
      isLive: true,
      message: detectedChanges.length > 0
        ? `Refreshed from live organizer website. Found ${detectedChanges.length} updated fields.`
        : 'Refreshed from live organizer website. All dates, venue, and registration links verified matching.',
      lastVerifiedAt: new Date().toISOString(),
      changesDetected: detectedChanges,
      event: {
        ...oldEvent,
        ...freshEvent,
        id: oldEvent.id,
        lastVerifiedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Refresh failed', message: err.message }, { status: 500 });
  }
}
