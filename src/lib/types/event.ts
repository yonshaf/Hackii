export type EventMode = 'online' | 'offline' | 'hybrid';

export type EventCategory =
  | 'hackathon'
  | 'workshop'
  | 'conference'
  | 'meetup'
  | 'competition';

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: EventCategory;
  organizer: string;
  sourceUrl: string;
  registrationUrl: string | null;
  startDate: string | null; // ISO 8601 string
  endDate: string | null;
  registrationDeadline: string | null;
  venue: string | null;
  city: string | null;
  country: string | null;
  mode: EventMode;
  fee: number | null;
  currency: string;
  isFree: boolean;
  eligibility: string | null;
  technologies: string[];
  tags: string[];
  imageUrl: string | null;
  lastVerifiedAt: string;
  sourceType: string;
  createdAt: string;
  updatedAt: string;
  // Ranking & scoring metadata (calculated at runtime)
  relevanceScore?: number;
  matchReasons?: string[];
}

export interface UserPreferences {
  technicalInterests: string[];
  preferredCategories: EventCategory[];
  city: string | null;
  country: string | null;
  preferredModes: EventMode[];
  maxBudget: number | null;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';
}

export interface SavedEventRecord {
  id: string;
  userId: string;
  eventId: string;
  event?: EventItem;
  createdAt: string;
}

export interface EventReminder {
  id: string;
  userId: string;
  eventId: string;
  daysBefore: 1 | 3 | 7;
  scheduledFor: string;
  status: 'pending' | 'delivered' | 'cancelled';
  deliveredAt: string | null;
  createdAt: string;
}

export interface EventChangeRecord {
  id: string;
  eventId: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  detectedAt: string;
}

export interface EventNotification {
  id: string;
  userId: string;
  eventId: string | null;
  title: string;
  message: string;
  type: 'deadline_reminder' | 'event_change' | 'recommendation' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface EventSearchParams {
  query?: string;
  category?: EventCategory | 'all';
  mode?: EventMode | 'all';
  city?: string;
  isFree?: boolean;
  maxBudget?: number;
  startDate?: string;
  registrationOpen?: boolean;
  technologies?: string[];
  sortBy?: 'relevant' | 'upcoming' | 'deadline' | 'verified';
  page?: number;
  limit?: number;
}
