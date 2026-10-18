import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { eventId, daysBefore, deadline, userId } = await request.json().catch(() => ({}));

    if (!eventId || !daysBefore || !deadline) {
      return NextResponse.json({ error: 'Missing required reminder parameters' }, { status: 400 });
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return NextResponse.json({ error: 'Invalid deadline date' }, { status: 400 });
    }

    const scheduledDate = new Date(deadlineDate.getTime() - daysBefore * 24 * 60 * 60 * 1000);
    const now = new Date();

    if (scheduledDate.getTime() <= now.getTime()) {
      return NextResponse.json({
        error: `Cannot schedule reminder: the ${daysBefore}-day reminder date has already passed.`,
      }, { status: 400 });
    }

    const admin = createAdminClient();
    if (admin && userId) {
      const { data, error } = await admin.from('reminders').upsert({
        user_id: userId,
        event_id: eventId,
        days_before: daysBefore,
        scheduled_for: scheduledDate.toISOString(),
        status: 'pending',
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      scheduledFor: scheduledDate.toISOString(),
      daysBefore,
      message: `Reminder scheduled for ${daysBefore} day${daysBefore > 1 ? 's' : ''} prior to registration deadline (${scheduledDate.toLocaleDateString()}).`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to schedule reminder', message: err.message }, { status: 500 });
  }
}
