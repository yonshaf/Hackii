import { EventItem, EventChangeRecord } from '@/lib/types/event';

export function detectEventChanges(
  oldEvent: EventItem,
  newEvent: EventItem
): EventChangeRecord[] {
  const changes: EventChangeRecord[] = [];
  const nowIso = new Date().toISOString();

  // Helper to trim and normalize string
  const clean = (val: string | null | undefined) => (val ? val.trim() : null);

  // 1. Check startDate change
  if (clean(oldEvent.startDate) !== clean(newEvent.startDate)) {
    changes.push({
      id: `chg_${Math.random().toString(36).substring(2, 9)}`,
      eventId: oldEvent.id,
      fieldName: 'Start Date',
      oldValue: oldEvent.startDate,
      newValue: newEvent.startDate,
      detectedAt: nowIso,
    });
  }

  // 2. Check endDate change
  if (clean(oldEvent.endDate) !== clean(newEvent.endDate)) {
    changes.push({
      id: `chg_${Math.random().toString(36).substring(2, 9)}`,
      eventId: oldEvent.id,
      fieldName: 'End Date',
      oldValue: oldEvent.endDate,
      newValue: newEvent.endDate,
      detectedAt: nowIso,
    });
  }

  // 3. Check registration deadline change
  if (clean(oldEvent.registrationDeadline) !== clean(newEvent.registrationDeadline)) {
    changes.push({
      id: `chg_${Math.random().toString(36).substring(2, 9)}`,
      eventId: oldEvent.id,
      fieldName: 'Registration Deadline',
      oldValue: oldEvent.registrationDeadline,
      newValue: newEvent.registrationDeadline,
      detectedAt: nowIso,
    });
  }

  // 4. Check fee change
  if (oldEvent.fee !== newEvent.fee || oldEvent.isFree !== newEvent.isFree) {
    changes.push({
      id: `chg_${Math.random().toString(36).substring(2, 9)}`,
      eventId: oldEvent.id,
      fieldName: 'Participation Fee',
      oldValue: oldEvent.isFree ? 'Free' : oldEvent.fee !== null ? `${oldEvent.currency} ${oldEvent.fee}` : 'Not specified',
      newValue: newEvent.isFree ? 'Free' : newEvent.fee !== null ? `${newEvent.currency} ${newEvent.fee}` : 'Not specified',
      detectedAt: nowIso,
    });
  }

  // 5. Check venue change
  if (clean(oldEvent.venue) !== clean(newEvent.venue) || clean(oldEvent.city) !== clean(newEvent.city)) {
    changes.push({
      id: `chg_${Math.random().toString(36).substring(2, 9)}`,
      eventId: oldEvent.id,
      fieldName: 'Venue Location',
      oldValue: [oldEvent.venue, oldEvent.city].filter(Boolean).join(', ') || 'Not specified',
      newValue: [newEvent.venue, newEvent.city].filter(Boolean).join(', ') || 'Not specified',
      detectedAt: nowIso,
    });
  }

  // 6. Check registration URL change
  if (clean(oldEvent.registrationUrl) !== clean(newEvent.registrationUrl)) {
    changes.push({
      id: `chg_${Math.random().toString(36).substring(2, 9)}`,
      eventId: oldEvent.id,
      fieldName: 'Registration Link',
      oldValue: oldEvent.registrationUrl,
      newValue: newEvent.registrationUrl,
      detectedAt: nowIso,
    });
  }

  // 7. Check eligibility change
  if (clean(oldEvent.eligibility) !== clean(newEvent.eligibility)) {
    changes.push({
      id: `chg_${Math.random().toString(36).substring(2, 9)}`,
      eventId: oldEvent.id,
      fieldName: 'Eligibility Requirements',
      oldValue: oldEvent.eligibility,
      newValue: newEvent.eligibility,
      detectedAt: nowIso,
    });
  }

  return changes;
}
