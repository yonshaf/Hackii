import { EventItem } from '@/lib/types/event';

/**
 * Creates a unique signature for duplicate detection
 */
export function getEventFingerprint(event: EventItem): string {
  const normTitle = event.title.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normOrg = event.organizer.toLowerCase().replace(/[^a-z0-9]/g, '');
  const dateStr = event.startDate ? event.startDate.slice(0, 10) : 'nodate';
  return `${normTitle}__${normOrg}__${dateStr}`;
}

/**
 * Checks if an event is expired (ended in the past)
 */
export function isEventExpired(event: EventItem, referenceDate: Date = new Date()): boolean {
  // If endDate is provided, check if end date has passed
  if (event.endDate) {
    const end = new Date(event.endDate);
    if (!isNaN(end.getTime()) && end.getTime() < referenceDate.getTime() - 24 * 60 * 60 * 1000) {
      return true;
    }
  }

  // If no endDate but startDate is provided, check if start date is more than 3 days in the past
  if (!event.endDate && event.startDate) {
    const start = new Date(event.startDate);
    if (!isNaN(start.getTime()) && start.getTime() < referenceDate.getTime() - 3 * 24 * 60 * 60 * 1000) {
      return true;
    }
  }

  return false;
}

/**
 * Deduplicates a list of events, preserving the most complete record
 */
export function deduplicateEvents(events: EventItem[]): EventItem[] {
  const map = new Map<string, EventItem>();

  for (const event of events) {
    const fingerprint = getEventFingerprint(event);
    const existing = map.get(fingerprint);

    if (!existing) {
      map.set(fingerprint, event);
      continue;
    }

    // Merge strategy: choose the one with more information (e.g. registrationUrl, description, imageUrl)
    const existingScore = (existing.registrationUrl ? 2 : 0) +
      (existing.description ? 1 : 0) +
      (existing.imageUrl ? 1 : 0) +
      (existing.venue ? 1 : 0);

    const currentScore = (event.registrationUrl ? 2 : 0) +
      (event.description ? 1 : 0) +
      (event.imageUrl ? 1 : 0) +
      (event.venue ? 1 : 0);

    if (currentScore > existingScore) {
      map.set(fingerprint, event);
    }
  }

  return Array.from(map.values());
}

/**
 * Filters out expired events unless specifically requested
 */
export function filterActiveEvents(events: EventItem[], allowExpired: boolean = false): EventItem[] {
  if (allowExpired) return events;
  const now = new Date();
  return events.filter((e) => !isEventExpired(e, now));
}
