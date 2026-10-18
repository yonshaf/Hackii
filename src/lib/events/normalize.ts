import { EventCategory, EventItem, EventMode } from '@/lib/types/event';

/**
 * Creates a clean URL-friendly slug from string parts
 */
export function slugify(...parts: (string | null | undefined)[]): string {
  const combined = parts.filter(Boolean).join(' ');
  return combined
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

/**
 * Normalizes date strings to ISO-8601 UTC string or null
 */
export function normalizeDate(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.toLowerCase() === 'tbd' || trimmed.toLowerCase() === 'not specified') {
    return null;
  }

  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }

  // Handle common human formats like "November 15, 2026"
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Normalizes category into one of the known 5 categories
 */
export function normalizeCategory(raw: string | null | undefined): EventCategory {
  if (!raw) return 'hackathon';
  const val = raw.toLowerCase();
  if (val.includes('hack')) return 'hackathon';
  if (val.includes('work') || val.includes('bootcamp') || val.includes('train')) return 'workshop';
  if (val.includes('conf') || val.includes('summit') || val.includes('symposium')) return 'conference';
  if (val.includes('meet') || val.includes('user group') || val.includes('gathering')) return 'meetup';
  if (val.includes('comp') || val.includes('contest') || val.includes('challenge')) return 'competition';
  return 'hackathon';
}

/**
 * Normalizes mode (online, offline, hybrid)
 */
export function normalizeMode(
  rawMode: string | null | undefined,
  venue: string | null | undefined,
  city: string | null | undefined
): EventMode {
  const text = `${rawMode || ''} ${venue || ''} ${city || ''}`.toLowerCase();
  if (text.includes('hybrid')) return 'hybrid';
  if (text.includes('online') || text.includes('virtual') || text.includes('remote') || text.includes('zoom')) {
    return 'online';
  }
  if (city || venue || text.includes('in-person') || text.includes('offline') || text.includes('onsite')) {
    return 'offline';
  }
  return 'online';
}

/**
 * Normalizes fee, currency, and isFree flag.
 * CRITICAL RULE: Unknown fees must be treated as unknown (null), NOT as free!
 */
export function normalizeFee(
  rawFee: number | string | null | undefined,
  rawCurrency?: string | null
): { fee: number | null; currency: string; isFree: boolean } {
  const currency = (rawCurrency || 'USD').toUpperCase().slice(0, 3);

  if (rawFee === undefined || rawFee === null) {
    return { fee: null, currency, isFree: false };
  }

  if (typeof rawFee === 'number') {
    return {
      fee: rawFee,
      currency,
      isFree: rawFee === 0,
    };
  }

  const str = String(rawFee).trim().toLowerCase();
  if (!str || str === 'not specified' || str === 'tbd' || str === 'unknown') {
    return { fee: null, currency, isFree: false };
  }

  if (str === 'free' || str === '$0' || str === '0' || str === '0.00' || str === 'free admission') {
    return { fee: 0, currency, isFree: true };
  }

  // Extract digits and decimal point
  const numericMatch = str.match(/[\d]+(?:\.\d{1,2})?/);
  if (numericMatch) {
    const val = parseFloat(numericMatch[0]);
    if (!isNaN(val)) {
      return {
        fee: val,
        currency,
        isFree: val === 0,
      };
    }
  }

  return { fee: null, currency, isFree: false };
}

/**
 * Normalizes extracted raw event into strongly typed EventItem
 */
export function normalizeEvent(raw: any, sourceFallbackUrl?: string): EventItem {
  const title = (raw.title || raw.name || 'Untitled Event').trim();
  const organizer = (raw.organizer || raw.host || raw.organization || 'Community Organizer').trim();
  const category = normalizeCategory(raw.category);
  const startDate = normalizeDate(raw.startDate || raw.start_date || raw.date);
  const endDate = normalizeDate(raw.endDate || raw.end_date);
  const registrationDeadline = normalizeDate(raw.registrationDeadline || raw.deadline || raw.registration_deadline);

  const city = raw.city ? String(raw.city).trim() : null;
  const country = raw.country ? String(raw.country).trim() : null;
  const venue = raw.venue ? String(raw.venue).trim() : null;
  const mode = normalizeMode(raw.mode, venue, city);

  const { fee, currency, isFree } = normalizeFee(raw.fee ?? raw.price, raw.currency);

  const rawTech = Array.isArray(raw.technologies)
    ? raw.technologies
    : typeof raw.technologies === 'string'
    ? raw.technologies.split(/[,|]/)
    : [];

  const rawTags = Array.isArray(raw.tags)
    ? raw.tags
    : typeof raw.tags === 'string'
    ? raw.tags.split(/[,|]/)
    : [];

  const technologies: string[] = Array.from(
    new Set<string>(rawTech.map((t: string) => String(t).trim()).filter(Boolean))
  );

  const tags: string[] = Array.from(
    new Set<string>([...rawTags.map((t: string) => String(t).trim()).filter(Boolean), category, mode])
  );

  const sourceUrl = (raw.sourceUrl || raw.url || sourceFallbackUrl || 'https://eventscout.io').trim();
  const registrationUrl = raw.registrationUrl && String(raw.registrationUrl).startsWith('http')
    ? String(raw.registrationUrl).trim()
    : null;

  const id = raw.id || `evt_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  const slug = raw.slug || `${slugify(title, organizer)}-${id.slice(-6)}`;

  const nowIso = new Date().toISOString();

  return {
    id,
    title,
    slug,
    description: raw.description ? String(raw.description).trim() : null,
    category,
    organizer,
    sourceUrl,
    registrationUrl,
    startDate,
    endDate,
    registrationDeadline,
    venue,
    city,
    country,
    mode,
    fee,
    currency,
    isFree,
    eligibility: raw.eligibility ? String(raw.eligibility).trim() : null,
    technologies,
    tags,
    imageUrl: raw.imageUrl && String(raw.imageUrl).startsWith('http') ? String(raw.imageUrl).trim() : null,
    lastVerifiedAt: raw.lastVerifiedAt || nowIso,
    sourceType: raw.sourceType || 'tinyfish_discovery',
    createdAt: raw.createdAt || nowIso,
    updatedAt: raw.updatedAt || nowIso,
  };
}
