import { EventItem, EventSearchParams, UserPreferences } from '@/lib/types/event';
import { tinyFishClient, TinyFishSearchResultItem } from './client';
import { extractEventFromUrl } from './extract-event';
import { deduplicateEvents, filterActiveEvents } from '@/lib/events/deduplicate';
import { rankEvents } from '@/lib/events/rank';
import { normalizeEvent } from '@/lib/events/normalize';

// In-memory cache for discovery runs (prevents duplicate costly runs within 10 minutes)
const discoveryCache = new Map<string, { timestamp: number; events: EventItem[] }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export interface DiscoveryResult {
  events: EventItem[];
  source: 'tinyfish_live' | 'cache' | 'demo_fallback';
  totalFound: number;
  message: string;
}

/**
 * Builds targeted search queries across developer communities, university portals, and platforms
 */
export function buildDiscoveryQueries(params: EventSearchParams): string[] {
  const q = params.query ? params.query.trim() : '';
  const cat = params.category && params.category !== 'all' ? params.category : 'tech event';
  const loc = params.city ? params.city.trim() : '';

  const queries: string[] = [];

  if (q) {
    queries.push(`${q} ${cat} 2026 registration deadline dates`);
    if (loc) {
      queries.push(`${q} ${cat} in ${loc} 2026`);
    }
  } else {
    // Broad discovery
    queries.push(`upcoming hackathons conferences workshops 2026 developer registration open`);
    if (loc) {
      queries.push(`developer tech conferences hackathons in ${loc} 2026`);
    } else {
      queries.push(`international AI tech hackathons and developer summits 2026`);
    }
  }

  return queries.slice(0, 2); // limit to 2 targeted queries to protect rate limits
}

/**
 * Executes full discovery workflow with TinyFish Search and bounded Agent extraction
 */
export async function discoverEventsWorkflow(
  params: EventSearchParams,
  preferences?: UserPreferences | null
): Promise<DiscoveryResult> {
  const cacheKey = JSON.stringify({ query: params.query, category: params.category, city: params.city });
  const cached = discoveryCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    const ranked = rankEvents(cached.events, preferences, params.query);
    return {
      events: ranked,
      source: 'cache',
      totalFound: ranked.length,
      message: 'Retrieved from cached discovery session',
    };
  }

  if (!tinyFishClient.isConfigured()) {
    throw new Error('TINYFISH_API_KEY is not configured.');
  }

  const queries = buildDiscoveryQueries(params);
  const discoveredPages: TinyFishSearchResultItem[] = [];

  // 1. Search using TinyFish Search API
  for (const q of queries) {
    try {
      const results = await tinyFishClient.search({
        query: q,
        purpose: 'Discover upcoming developer hackathons, coding competitions, technical workshops and conferences with active registration',
        location: 'US',
        recencyMinutes: 10080, // past 7 days freshness
      });
      discoveredPages.push(...results);
    } catch (err: any) {
      console.warn(`TinyFish search query failed for "${q}":`, err.message);
    }
  }

  // Deduplicate discovered URLs
  const uniqueUrls = Array.from(new Set(discoveredPages.map((p) => p.url))).filter((u) => {
    // Avoid non-event or generic sites
    const lower = u.toLowerCase();
    return !lower.includes('wikipedia.org') && !lower.includes('youtube.com');
  });

  // 2. Concurrency limit for extraction (extract up to 3 pages per search to respect quotas & timeouts)
  const candidateUrls = uniqueUrls.slice(0, 3);
  const extractedEvents: EventItem[] = [];

  for (const url of candidateUrls) {
    try {
      const event = await extractEventFromUrl(url);
      if (event && event.title && event.title !== 'Untitled Event') {
        extractedEvents.push(event);
      }
    } catch (err: any) {
      // If full agent extraction fails or times out, create a preliminary normalized event from search snippet
      const matchingSnippet = discoveredPages.find((p) => p.url === url);
      if (matchingSnippet) {
        const fallback = normalizeEvent(
          {
            title: matchingSnippet.title.replace(/[-|].*$/, '').trim(),
            description: matchingSnippet.snippet,
            sourceUrl: matchingSnippet.url,
            category: params.category !== 'all' ? params.category : 'hackathon',
            organizer: 'Discovered Host',
          },
          matchingSnippet.url
        );
        extractedEvents.push(fallback);
      }
    }
  }

  // 3. Normalization, Deduplication, and Exclude Expired
  const deduped = deduplicateEvents(extractedEvents);
  const activeEvents = filterActiveEvents(deduped);
  const ranked = rankEvents(activeEvents, preferences, params.query);

  // Store in cache
  discoveryCache.set(cacheKey, { timestamp: Date.now(), events: ranked });

  return {
    events: ranked,
    source: 'tinyfish_live',
    totalFound: ranked.length,
    message: `Discovered and verified ${ranked.length} opportunities across ${candidateUrls.length} live web sources via TinyFish`,
  };
}
