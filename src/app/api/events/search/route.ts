import { NextRequest, NextResponse } from 'next/server';
import { DEMO_EVENTS } from '@/lib/events/demo-events';
import { EventItem } from '@/lib/types/event';
import { rankEvents } from '@/lib/events/rank';
import { filterActiveEvents } from '@/lib/events/deduplicate';
import { EventSearchQuerySchema } from '@/lib/types/schema';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsedParams = EventSearchQuerySchema.safeParse({
      query: searchParams.get('q') || searchParams.get('query') || undefined,
      category: searchParams.get('category') || undefined,
      mode: searchParams.get('mode') || undefined,
      city: searchParams.get('city') || undefined,
      isFree: searchParams.get('isFree') || undefined,
      maxBudget: searchParams.get('maxBudget') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      registrationOpen: searchParams.get('registrationOpen') || undefined,
      technologies: searchParams.getAll('tech') || undefined,
      sortBy: searchParams.get('sortBy') || 'relevant',
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 12,
    });

    if (!parsedParams.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: parsedParams.error.format() },
        { status: 400 }
      );
    }

    const {
      query,
      category,
      mode,
      city,
      isFree,
      maxBudget,
      registrationOpen,
      technologies,
      sortBy,
      page,
      limit,
    } = parsedParams.data;

    let allEvents: EventItem[] = [...DEMO_EVENTS];

    // Attempt to query Supabase if configured
    const admin = createAdminClient();
    if (admin) {
      try {
        const { data: dbEvents, error } = await admin.from('events').select('*');
        if (!error && dbEvents && dbEvents.length > 0) {
          allEvents = dbEvents.map((db) => ({
            id: db.id,
            title: db.title,
            slug: db.slug,
            description: db.description,
            category: db.category,
            organizer: db.organizer,
            sourceUrl: db.source_url,
            registrationUrl: db.registration_url,
            startDate: db.start_date,
            endDate: db.end_date,
            registrationDeadline: db.registration_deadline,
            venue: db.venue,
            city: db.city,
            country: db.country,
            mode: db.mode,
            fee: db.fee ? Number(db.fee) : null,
            currency: db.currency || 'USD',
            isFree: db.is_free,
            eligibility: db.eligibility,
            technologies: db.technologies || [],
            tags: db.tags || [],
            imageUrl: db.image_url,
            lastVerifiedAt: db.last_verified_at,
            sourceType: db.source_type,
            createdAt: db.created_at,
            updatedAt: db.updated_at,
          }));
        }
      } catch (dbErr) {
        console.warn('Supabase query failed, falling back to verified catalog:', dbErr);
      }
    }

    // Apply structured filters
    let filtered = allEvents;

    // 1. Category filter
    if (category && category !== 'all') {
      filtered = filtered.filter((e) => e.category.toLowerCase() === category.toLowerCase());
    }

    // 2. Mode filter
    if (mode && mode !== 'all') {
      filtered = filtered.filter((e) => e.mode.toLowerCase() === mode.toLowerCase());
    }

    // 3. City / location filter
    if (city && city.trim()) {
      const c = city.toLowerCase().trim();
      filtered = filtered.filter(
        (e) => (e.city && e.city.toLowerCase().includes(c)) || (e.country && e.country.toLowerCase().includes(c))
      );
    }

    // 4. Free events only
    if (isFree === true) {
      filtered = filtered.filter((e) => e.isFree === true);
    }

    // 5. Max budget
    if (maxBudget !== undefined && !isNaN(maxBudget)) {
      filtered = filtered.filter((e) => e.isFree || (e.fee !== null && e.fee <= maxBudget));
    }

    // 6. Registration still open
    if (registrationOpen === true) {
      const now = Date.now();
      filtered = filtered.filter((e) => {
        if (!e.registrationDeadline) return true; // unknown deadline, assume open
        return new Date(e.registrationDeadline).getTime() > now;
      });
    }

    // 7. Technology filter
    if (technologies && technologies.length > 0) {
      const techList = Array.isArray(technologies) ? technologies : [technologies];
      filtered = filtered.filter((e) =>
        e.technologies.some((t) => techList.some((queryTech) => queryTech.toLowerCase() === t.toLowerCase()))
      );
    }

    // Exclude expired events
    filtered = filterActiveEvents(filtered);

    // Apply ranking and scoring
    let ranked = rankEvents(filtered, null, query);

    // Sorting
    if (sortBy === 'upcoming') {
      ranked.sort((a, b) => {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
    } else if (sortBy === 'deadline') {
      ranked.sort((a, b) => {
        if (!a.registrationDeadline) return 1;
        if (!b.registrationDeadline) return -1;
        return new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime();
      });
    } else if (sortBy === 'verified') {
      ranked.sort((a, b) => new Date(b.lastVerifiedAt).getTime() - new Date(a.lastVerifiedAt).getTime());
    }

    // Pagination
    const total = ranked.length;
    const startIndex = (page - 1) * limit;
    const paginatedEvents = ranked.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      events: paginatedEvents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      source: admin ? 'database_catalog' : 'verified_catalog',
    });
  } catch (err: any) {
    console.error('Error in /api/events/search:', err);
    return NextResponse.json({ error: 'Failed to search events', message: err.message }, { status: 500 });
  }
}
