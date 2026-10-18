import { EventItem, UserPreferences } from '@/lib/types/event';

export interface ScoreBreakdown {
  total: number;
  reasons: string[];
}

/**
 * Calculates a transparent multi-factor relevance score (0 - 100)
 * based on user preferences, search intent, and deadline urgency.
 */
export function calculateEventScore(
  event: EventItem,
  preferences?: UserPreferences | null,
  searchQuery?: string
): ScoreBreakdown {
  let score = 50; // base score for verified upcoming events
  const reasons: string[] = [];

  // Factor 1: Search query match (Title, description, organizer, tags)
  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    const titleMatch = event.title.toLowerCase().includes(q);
    const orgMatch = event.organizer.toLowerCase().includes(q);
    const tagMatch = event.tags.some((t) => t.toLowerCase().includes(q));
    const techMatch = event.technologies.some((t) => t.toLowerCase().includes(q));

    if (titleMatch) {
      score += 30;
      reasons.push(`Direct title match for "${searchQuery}"`);
    } else if (techMatch || tagMatch) {
      score += 20;
      reasons.push(`Technology tag matched "${searchQuery}"`);
    } else if (orgMatch) {
      score += 15;
      reasons.push(`Hosted by searched organizer "${event.organizer}"`);
    }
  }

  if (preferences) {
    // Factor 2: Technical interests match (Up to +25 points)
    if (preferences.technicalInterests && preferences.technicalInterests.length > 0) {
      const matchedTechs = event.technologies.filter((t) =>
        preferences.technicalInterests.some((pref) => pref.toLowerCase() === t.toLowerCase())
      );
      if (matchedTechs.length > 0) {
        const techBoost = Math.min(25, matchedTechs.length * 10);
        score += techBoost;
        reasons.push(`Matches your technical interests (${matchedTechs.join(', ')})`);
      }
    }

    // Factor 3: Preferred categories match (+15 points)
    if (
      preferences.preferredCategories &&
      preferences.preferredCategories.length > 0 &&
      preferences.preferredCategories.includes(event.category)
    ) {
      score += 15;
      reasons.push(`In your favored category (${event.category.toUpperCase()})`);
    }

    // Factor 4: Mode format preference (+10 points)
    if (
      preferences.preferredModes &&
      preferences.preferredModes.length > 0 &&
      preferences.preferredModes.includes(event.mode)
    ) {
      score += 10;
      reasons.push(`Preferred event mode (${event.mode})`);
    }

    // Factor 5: Location compatibility (+10 points)
    if (preferences.city && event.city) {
      if (event.city.toLowerCase() === preferences.city.toLowerCase()) {
        score += 10;
        reasons.push(`Located in your home city (${event.city})`);
      }
    }

    // Factor 6: Budget compatibility
    if (preferences.maxBudget !== null && preferences.maxBudget !== undefined) {
      if (event.isFree) {
        score += 10;
        reasons.push('Free registration aligns with your budget');
      } else if (event.fee !== null && event.fee <= preferences.maxBudget) {
        score += 5;
        reasons.push(`Fee ($${event.fee}) within your budget ($${preferences.maxBudget})`);
      }
    }
  }

  // Factor 7: Verified Registration link availability (+5 points)
  if (event.registrationUrl) {
    score += 5;
    reasons.push('Verified direct registration URL available');
  }

  // Factor 8: Registration deadline urgency & upcoming window
  if (event.registrationDeadline) {
    const deadline = new Date(event.registrationDeadline).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    if (diffDays > 0 && diffDays <= 7) {
      score += 10;
      reasons.push(`Registration deadline approaching in ${diffDays} day${diffDays === 1 ? '' : 's'}`);
    } else if (diffDays < 0) {
      score -= 30; // registration passed
    }
  }

  // Normalize between 0 and 100
  const normalized = Math.max(5, Math.min(100, Math.round(score)));

  if (reasons.length === 0) {
    reasons.push('Curated technical event matching global developer schedule');
  }

  return {
    total: normalized,
    reasons,
  };
}

/**
 * Ranks an array of events by calculated score and adds explanation metadata
 */
export function rankEvents(
  events: EventItem[],
  preferences?: UserPreferences | null,
  searchQuery?: string
): EventItem[] {
  return events
    .map((event) => {
      const { total, reasons } = calculateEventScore(event, preferences, searchQuery);
      return {
        ...event,
        relevanceScore: total,
        matchReasons: reasons,
      };
    })
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
}
