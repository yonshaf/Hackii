import { test, describe } from 'node:test';
import assert from 'node:assert';

// Core logic implementations tested against specification requirements

// 1. Normalization functions
function normalizeDate(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed || trimmed.toLowerCase() === 'tbd' || trimmed.toLowerCase() === 'not specified') return null;
  const parsed = Date.parse(trimmed);
  if (!isNaN(parsed)) return new Date(parsed).toISOString();
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {}
  return null;
}

function normalizeCategory(raw) {
  if (!raw) return 'hackathon';
  const val = raw.toLowerCase();
  if (val.includes('hack')) return 'hackathon';
  if (val.includes('work') || val.includes('bootcamp') || val.includes('train')) return 'workshop';
  if (val.includes('conf') || val.includes('summit') || val.includes('symposium')) return 'conference';
  if (val.includes('meet') || val.includes('user group')) return 'meetup';
  if (val.includes('comp') || val.includes('contest') || val.includes('challenge')) return 'competition';
  return 'hackathon';
}

function normalizeMode(rawMode, venue, city) {
  const text = `${rawMode || ''} ${venue || ''} ${city || ''}`.toLowerCase();
  if (text.includes('hybrid')) return 'hybrid';
  if (text.includes('online') || text.includes('virtual') || text.includes('remote')) return 'online';
  if (city || venue || text.includes('in-person') || text.includes('offline')) return 'offline';
  return 'online';
}

function normalizeFee(rawFee, rawCurrency = 'USD') {
  const currency = (rawCurrency || 'USD').toUpperCase().slice(0, 3);
  if (rawFee === undefined || rawFee === null) {
    return { fee: null, currency, isFree: false };
  }
  if (typeof rawFee === 'number') {
    return { fee: rawFee, currency, isFree: rawFee === 0 };
  }
  const str = String(rawFee).trim().toLowerCase();
  if (!str || str === 'not specified' || str === 'tbd' || str === 'unknown') {
    return { fee: null, currency, isFree: false };
  }
  if (str === 'free' || str === '$0' || str === '0') {
    return { fee: 0, currency, isFree: true };
  }
  const numericMatch = str.match(/[\d]+(?:\.\d{1,2})?/);
  if (numericMatch) {
    const val = parseFloat(numericMatch[0]);
    if (!isNaN(val)) {
      return { fee: val, currency, isFree: val === 0 };
    }
  }
  return { fee: null, currency, isFree: false };
}

function slugify(...parts) {
  return parts.filter(Boolean).join(' ').toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);
}

// 2. Deduplication & Expired Events
function getEventFingerprint(event) {
  const normTitle = event.title.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normOrg = event.organizer.toLowerCase().replace(/[^a-z0-9]/g, '');
  const dateStr = event.startDate ? event.startDate.slice(0, 10) : 'nodate';
  return `${normTitle}__${normOrg}__${dateStr}`;
}

function isEventExpired(event, referenceDate = new Date()) {
  if (event.endDate) {
    const end = new Date(event.endDate);
    if (!isNaN(end.getTime()) && end.getTime() < referenceDate.getTime() - 24 * 60 * 60 * 1000) {
      return true;
    }
  }
  if (!event.endDate && event.startDate) {
    const start = new Date(event.startDate);
    if (!isNaN(start.getTime()) && start.getTime() < referenceDate.getTime() - 3 * 24 * 60 * 60 * 1000) {
      return true;
    }
  }
  return false;
}

function deduplicateEvents(events) {
  const map = new Map();
  for (const event of events) {
    const fingerprint = getEventFingerprint(event);
    const existing = map.get(fingerprint);
    if (!existing) {
      map.set(fingerprint, event);
      continue;
    }
    const existingScore = (existing.registrationUrl ? 2 : 0) + (existing.description ? 1 : 0);
    const currentScore = (event.registrationUrl ? 2 : 0) + (event.description ? 1 : 0);
    if (currentScore > existingScore) {
      map.set(fingerprint, event);
    }
  }
  return Array.from(map.values());
}

// 3. Transparent Ranking
function calculateEventScore(event, preferences, searchQuery) {
  let score = 50;
  const reasons = [];

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    if (event.title.toLowerCase().includes(q)) {
      score += 30;
      reasons.push(`Direct title match for "${searchQuery}"`);
    } else if (event.technologies && event.technologies.some((t) => t.toLowerCase().includes(q))) {
      score += 20;
      reasons.push(`Technology tag matched "${searchQuery}"`);
    }
  }

  if (preferences) {
    if (preferences.technicalInterests && preferences.technicalInterests.length > 0) {
      const matched = (event.technologies || []).filter((t) =>
        preferences.technicalInterests.some((pref) => pref.toLowerCase() === t.toLowerCase())
      );
      if (matched.length > 0) {
        score += Math.min(25, matched.length * 10);
        reasons.push(`Matches your technical interests (${matched.join(', ')})`);
      }
    }

    if (preferences.preferredCategories && preferences.preferredCategories.includes(event.category)) {
      score += 15;
      reasons.push(`In your favored category (${event.category.toUpperCase()})`);
    }

    if (preferences.preferredModes && preferences.preferredModes.includes(event.mode)) {
      score += 10;
      reasons.push(`Preferred event mode (${event.mode})`);
    }
  }

  if (event.registrationUrl) {
    score += 5;
    reasons.push('Verified direct registration URL available');
  }

  return {
    total: Math.max(5, Math.min(100, Math.round(score))),
    reasons,
  };
}

// 4. Change Detection
function detectEventChanges(oldEvent, newEvent) {
  const changes = [];
  const clean = (val) => (val ? String(val).trim() : null);

  if (clean(oldEvent.startDate) !== clean(newEvent.startDate)) {
    changes.push({ fieldName: 'Start Date', oldValue: oldEvent.startDate, newValue: newEvent.startDate });
  }
  if (clean(oldEvent.registrationDeadline) !== clean(newEvent.registrationDeadline)) {
    changes.push({ fieldName: 'Registration Deadline', oldValue: oldEvent.registrationDeadline, newValue: newEvent.registrationDeadline });
  }
  if (oldEvent.fee !== newEvent.fee || oldEvent.isFree !== newEvent.isFree) {
    changes.push({ fieldName: 'Participation Fee', oldValue: String(oldEvent.fee), newValue: String(newEvent.fee) });
  }
  if (clean(oldEvent.registrationUrl) !== clean(newEvent.registrationUrl)) {
    changes.push({ fieldName: 'Registration Link', oldValue: oldEvent.registrationUrl, newValue: newEvent.registrationUrl });
  }
  return changes;
}

// 5. TinyFish Client Simulation
class MockTinyFishClient {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
  }
  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes('placeholder'));
  }
  async search(query) {
    if (!this.isConfigured()) throw new Error('TinyFish API key not configured.');
    return [{ title: 'Discovered Hackathon', url: 'https://organizer.com/hack' }];
  }
  async runAutomation(url, goal) {
    if (!this.isConfigured()) throw new Error('TinyFish API key not configured.');
    return { status: 'COMPLETED', result: { title: 'Live Hackathon 2026', fee: 0 } };
  }
}

// 6. Reminder Validation
function validateReminderSchedule(deadlineIso, daysBefore, referenceTime = Date.now()) {
  const deadline = new Date(deadlineIso).getTime();
  if (isNaN(deadline)) return { valid: false, error: 'Invalid deadline date' };
  const scheduledTime = deadline - daysBefore * 24 * 60 * 60 * 1000;
  if (scheduledTime <= referenceTime) {
    return { valid: false, error: 'Reminder threshold is in the past' };
  }
  return { valid: true, scheduledIso: new Date(scheduledTime).toISOString() };
}

// =====================================================================
// RUN TEST SUITES
// =====================================================================

describe('EventScout Core Engine Verification', () => {
  // Test Suite 1: Normalization
  describe('1. Normalization Engine', () => {
    test('normalizeDate converts valid date strings to UTC ISO', () => {
      const iso = normalizeDate('2026-11-20T09:00:00Z');
      assert.strictEqual(iso, '2026-11-20T09:00:00.000Z');
    });

    test('normalizeDate rejects invalid strings or TBD', () => {
      assert.strictEqual(normalizeDate(null), null);
      assert.strictEqual(normalizeDate('TBD'), null);
      assert.strictEqual(normalizeDate('not specified'), null);
    });

    test('normalizeCategory handles synonyms', () => {
      assert.strictEqual(normalizeCategory('AI Hackathon'), 'hackathon');
      assert.strictEqual(normalizeCategory('React Summit Conference'), 'conference');
      assert.strictEqual(normalizeCategory('Python Hands-on Bootcamp'), 'workshop');
      assert.strictEqual(normalizeCategory('Solana Community Meetup'), 'meetup');
      assert.strictEqual(normalizeCategory('Algorithmic Coding Contest'), 'competition');
    });

    test('normalizeFee distinguishes free vs paid vs UNKNOWN', () => {
      // Must not assume unknown is free!
      const unknownFee = normalizeFee(null);
      assert.strictEqual(unknownFee.fee, null);
      assert.strictEqual(unknownFee.isFree, false);

      const freeFee = normalizeFee('Free');
      assert.strictEqual(freeFee.fee, 0);
      assert.strictEqual(freeFee.isFree, true);

      const paidFee = normalizeFee('$250.00');
      assert.strictEqual(paidFee.fee, 250);
      assert.strictEqual(paidFee.isFree, false);
    });

    test('slugify generates clean kebab-case slugs', () => {
      assert.strictEqual(slugify('ETHGlobal San Francisco', 'ETHGlobal Foundation'), 'ethglobal-san-francisco-ethglobal-foundation');
    });
  });

  // Test Suite 2: Deduplication & Filtering
  describe('2. Deduplication & Active Filtering', () => {
    test('deduplicateEvents eliminates duplicate postings preserving richer record', () => {
      const e1 = {
        title: 'React Summit Global 2026',
        organizer: 'GitNation',
        startDate: '2026-11-14T08:30:00Z',
      };
      const e2 = {
        title: 'React Summit Global 2026',
        organizer: 'GitNation',
        startDate: '2026-11-14T08:30:00Z',
        description: 'Comprehensive React schedule',
        registrationUrl: 'https://reactsummit.com/tickets',
      };

      const result = deduplicateEvents([e1, e2]);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].registrationUrl, 'https://reactsummit.com/tickets');
    });

    test('isEventExpired identifies expired events', () => {
      const pastEvent = { title: 'Old 2024', endDate: '2024-05-01T00:00:00Z' };
      const futureEvent = { title: 'Future 2027', endDate: '2027-11-01T00:00:00Z' };
      const ref = new Date('2026-10-19T00:00:00Z');

      assert.strictEqual(isEventExpired(pastEvent, ref), true);
      assert.strictEqual(isEventExpired(futureEvent, ref), false);
    });
  });

  // Test Suite 3: Deterministic Relevance Ranking
  describe('3. Multi-Factor Transparent Ranking', () => {
    test('calculateEventScore boosts interest tags and provides transparent reasons', () => {
      const event = {
        title: 'AI Multi-Agent Hackathon',
        category: 'hackathon',
        technologies: ['AI', 'Python', 'React'],
        mode: 'online',
        registrationUrl: 'https://hackathon.io/apply',
      };

      const userPrefs = {
        technicalInterests: ['AI', 'Python'],
        preferredCategories: ['hackathon'],
        preferredModes: ['online'],
      };

      const score = calculateEventScore(event, userPrefs, 'Agent');
      assert.ok(score.total >= 75, `Expected score >= 75, received ${score.total}`);
      assert.ok(score.reasons.length >= 3);
      assert.ok(score.reasons.some((r) => r.includes('technical interests')));
    });
  });

  // Test Suite 4: Change Detection
  describe('4. Event Change Detection', () => {
    test('detectEventChanges flags updated deadlines, registration URLs, and fees', () => {
      const oldEvent = {
        startDate: '2026-11-20T00:00:00Z',
        registrationDeadline: '2026-11-01T00:00:00Z',
        fee: 0,
        isFree: true,
        registrationUrl: 'https://old.com',
      };

      const newEvent = {
        startDate: '2026-11-20T00:00:00Z', // unchanged
        registrationDeadline: '2026-11-05T00:00:00Z', // changed!
        fee: 50, // changed!
        isFree: false,
        registrationUrl: 'https://new.com/reg', // changed!
      };

      const changes = detectEventChanges(oldEvent, newEvent);
      assert.strictEqual(changes.length, 3);
      const fields = changes.map((c) => c.fieldName);
      assert.ok(fields.includes('Registration Deadline'));
      assert.ok(fields.includes('Participation Fee'));
      assert.ok(fields.includes('Registration Link'));
    });
  });

  // Test Suite 5: Deadline Reminders
  describe('5. Deadline Reminder Validation', () => {
    test('validates valid future deadline reminder', () => {
      const ref = new Date('2026-10-19T00:00:00Z').getTime();
      const deadline = '2026-11-10T00:00:00Z'; // 22 days in future
      const result = validateReminderSchedule(deadline, 7, ref);
      assert.strictEqual(result.valid, true);
    });

    test('rejects reminder when scheduled trigger time has already passed', () => {
      const ref = new Date('2026-10-19T00:00:00Z').getTime();
      const deadline = '2026-10-21T00:00:00Z'; // 2 days in future
      // 7-day reminder would be Oct 14 (already passed!)
      const result = validateReminderSchedule(deadline, 7, ref);
      assert.strictEqual(result.valid, false);
      assert.strictEqual(result.error, 'Reminder threshold is in the past');
    });
  });

  // Test Suite 6: TinyFish Client Safety & Error Handling
  describe('6. TinyFish Client Error Handling', () => {
    test('unconfigured client safely reports not configured without leaking errors', () => {
      const client = new MockTinyFishClient(null);
      assert.strictEqual(client.isConfigured(), false);
    });

    test('unconfigured client throws clear configuration error on search', async () => {
      const client = new MockTinyFishClient('');
      await assert.rejects(async () => {
        await client.search('hackathons');
      }, /TinyFish API key not configured/);
    });

    test('configured client returns structured mock response during testing', async () => {
      const client = new MockTinyFishClient('sk-tinyfish-test-key');
      assert.strictEqual(client.isConfigured(), true);
      const results = await client.search('hackathons');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].title, 'Discovered Hackathon');
    });
  });
});
