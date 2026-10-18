import { z } from 'zod';

export const EventModeSchema = z.enum(['online', 'offline', 'hybrid']);
export const EventCategorySchema = z.enum([
  'hackathon',
  'workshop',
  'conference',
  'meetup',
  'competition',
]);

export const RawExtractedEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  category: z.string().optional(),
  organizer: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  registrationUrl: z.string().url().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  registrationDeadline: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  mode: z.string().optional(),
  fee: z.union([z.number(), z.string()]).nullable().optional(),
  currency: z.string().optional(),
  isFree: z.boolean().optional(),
  eligibility: z.string().nullable().optional(),
  technologies: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const UserPreferencesSchema = z.object({
  technicalInterests: z.array(z.string()).default([]),
  preferredCategories: z.array(EventCategorySchema).default([]),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  preferredModes: z.array(EventModeSchema).default(['online', 'hybrid', 'offline']),
  maxBudget: z.number().nullable().optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'all']).default('all'),
});

export const EventSearchQuerySchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  mode: z.string().optional(),
  city: z.string().optional(),
  isFree: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  maxBudget: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
  startDate: z.string().optional(),
  registrationOpen: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  technologies: z.union([z.string(), z.array(z.string())]).optional(),
  sortBy: z.enum(['relevant', 'upcoming', 'deadline', 'verified']).default('relevant'),
  page: z.preprocess((val) => (val ? Number(val) : 1), z.number().default(1)),
  limit: z.preprocess((val) => (val ? Number(val) : 12), z.number().default(12)),
});
