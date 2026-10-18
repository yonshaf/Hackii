import { EventItem } from '@/lib/types/event';
import { normalizeEvent } from '@/lib/events/normalize';
import { tinyFishClient } from './client';

const EVENT_EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Name of the hackathon, conference, or workshop' },
    description: { type: 'string', description: 'Detailed summary of the event schedule, prizes, tracks' },
    category: {
      type: 'string',
      enum: ['hackathon', 'workshop', 'conference', 'meetup', 'competition'],
      description: 'Primary event category',
    },
    organizer: { type: 'string', description: 'Host organization, university, or tech company' },
    startDate: { type: 'string', description: 'Event start date/time (ISO 8601 or YYYY-MM-DD)' },
    endDate: { type: 'string', description: 'Event end date/time' },
    registrationDeadline: { type: 'string', description: 'Last date to register or apply' },
    venue: { type: 'string', description: 'Building, campus, or address (or Virtual)' },
    city: { type: 'string', description: 'Host city' },
    country: { type: 'string', description: 'Host country' },
    mode: { type: 'string', enum: ['online', 'offline', 'hybrid'] },
    fee: { type: 'number', description: 'Registration fee amount in numbers (or 0 if free)' },
    currency: { type: 'string', description: 'Currency code, e.g. USD, EUR, INR' },
    isFree: { type: 'boolean', description: 'True if no fee is required' },
    eligibility: { type: 'string', description: 'Who can participate (e.g. Students only, Open to all)' },
    technologies: {
      type: 'array',
      items: { type: 'string' },
      description: 'Relevant tools/languages (AI, React, Python, Rust, Cloud)',
    },
    tags: { type: 'array', items: { type: 'string' } },
    imageUrl: { type: 'string', description: 'Event banner or logo image URL' },
    registrationUrl: {
      type: 'string',
      description: 'Direct link to apply, sign up, or buy tickets (Devpost, Luma, Eventbrite, Google Form)',
    },
  },
  required: ['title'],
};

/**
 * Extracts structured event details from any webpage using TinyFish Agent
 */
export async function extractEventFromUrl(url: string): Promise<EventItem | null> {
  if (!tinyFishClient.isConfigured()) {
    throw new Error('TinyFish API key is not configured.');
  }

  const goal = `Navigate to this event page (${url}). Extract all event metadata including the official event title, organizer/host name, start date, end date, registration deadline, venue and city, whether it is online or in-person, registration fee (or if free), eligibility requirements, technology tags/topics, and the direct registration or ticket link (e.g. Devpost, Luma, Ticket tailor, Google Form, or official sign-up form). Return structured JSON.`;

  const runResult = await tinyFishClient.runAutomation({
    url,
    goal,
    output_schema: EVENT_EXTRACTION_SCHEMA,
    browser_profile: 'lite',
    agent_config: {
      max_steps: 25,
      max_duration_seconds: 40,
    },
  });

  if (runResult.status !== 'COMPLETED' || !runResult.result) {
    return null;
  }

  return normalizeEvent(runResult.result, url);
}
