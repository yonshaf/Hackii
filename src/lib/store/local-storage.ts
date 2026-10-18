import { EventItem, EventReminder, UserPreferences } from '@/lib/types/event';

const SAVED_EVENTS_KEY = 'eventscout_saved_events';
const USER_PREFS_KEY = 'eventscout_user_prefs';
const REMINDERS_KEY = 'eventscout_reminders';

export const DEFAULT_PREFERENCES: UserPreferences = {
  technicalInterests: ['AI', 'React', 'TypeScript', 'Rust', 'Cloud'],
  preferredCategories: ['hackathon', 'workshop', 'conference'],
  city: 'San Francisco',
  country: 'United States',
  preferredModes: ['online', 'hybrid', 'offline'],
  maxBudget: null,
  experienceLevel: 'all',
};

// Client-side helper safely checking localStorage
function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function getLocalSavedEvents(): string[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(SAVED_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleLocalSavedEvent(eventId: string): { isSaved: boolean; allSaved: string[] } {
  if (!isClient()) return { isSaved: false, allSaved: [] };
  const current = getLocalSavedEvents();
  let updated: string[];
  let isSaved = false;

  if (current.includes(eventId)) {
    updated = current.filter((id) => id !== eventId);
    isSaved = false;
  } else {
    updated = [...current, eventId];
    isSaved = true;
  }

  try {
    localStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(updated));
  } catch {}

  return { isSaved, allSaved: updated };
}

export function isLocalEventSaved(eventId: string): boolean {
  return getLocalSavedEvents().includes(eventId);
}

export function getLocalUserPreferences(): UserPreferences {
  if (!isClient()) return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(USER_PREFS_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveLocalUserPreferences(prefs: UserPreferences): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(USER_PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

export function getLocalReminders(): EventReminder[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addLocalReminder(eventId: string, daysBefore: 1 | 3 | 7, deadlineIso: string): EventReminder {
  const deadline = new Date(deadlineIso);
  const scheduledTime = new Date(deadline.getTime() - daysBefore * 24 * 60 * 60 * 1000);

  const newReminder: EventReminder = {
    id: `rem_${Date.now()}_${daysBefore}`,
    userId: 'guest_user',
    eventId,
    daysBefore,
    scheduledFor: scheduledTime.toISOString(),
    status: 'pending',
    deliveredAt: null,
    createdAt: new Date().toISOString(),
  };

  if (isClient()) {
    const existing = getLocalReminders().filter(
      (r) => !(r.eventId === eventId && r.daysBefore === daysBefore)
    );
    try {
      localStorage.setItem(REMINDERS_KEY, JSON.stringify([...existing, newReminder]));
    } catch {}
  }

  return newReminder;
}

export function removeLocalReminder(reminderId: string): void {
  if (!isClient()) return;
  const current = getLocalReminders();
  const updated = current.filter((r) => r.id !== reminderId);
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
  } catch {}
}
