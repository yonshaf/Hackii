import { NextRequest, NextResponse } from 'next/server';
import { DEMO_EVENTS } from '@/lib/events/demo-events';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    // First search in Supabase if connected
    const admin = createAdminClient();
    if (admin) {
      try {
        const { data: dbEvent, error } = await admin
          .from('events')
          .select('*')
          .or(`slug.eq.${slug},id.eq.${slug}`)
          .single();

        if (!error && dbEvent) {
          const event = {
            id: dbEvent.id,
            title: dbEvent.title,
            slug: dbEvent.slug,
            description: dbEvent.description,
            category: dbEvent.category,
            organizer: dbEvent.organizer,
            sourceUrl: dbEvent.source_url,
            registrationUrl: dbEvent.registration_url,
            startDate: dbEvent.start_date,
            endDate: dbEvent.end_date,
            registrationDeadline: dbEvent.registration_deadline,
            venue: dbEvent.venue,
            city: dbEvent.city,
            country: dbEvent.country,
            mode: dbEvent.mode,
            fee: dbEvent.fee ? Number(dbEvent.fee) : null,
            currency: dbEvent.currency || 'USD',
            isFree: dbEvent.is_free,
            eligibility: dbEvent.eligibility,
            technologies: dbEvent.technologies || [],
            tags: dbEvent.tags || [],
            imageUrl: dbEvent.image_url,
            lastVerifiedAt: dbEvent.last_verified_at,
            sourceType: dbEvent.source_type,
            createdAt: dbEvent.created_at,
            updatedAt: dbEvent.updated_at,
          };
          return NextResponse.json({ event });
        }
      } catch (err) {
        console.warn('Supabase single event query failed:', err);
      }
    }

    // Look in demo catalog
    const event = DEMO_EVENTS.find(
      (e) => e.slug === slug || e.id === slug || e.title.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
    );

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve event', message: err.message }, { status: 500 });
  }
}
