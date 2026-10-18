-- =====================================================================
-- EventScout Database Schema Migration
-- Supabase PostgreSQL with Row Level Security (RLS)
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE event_mode AS ENUM ('online', 'offline', 'hybrid');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE event_category AS ENUM ('hackathon', 'workshop', 'conference', 'meetup', 'competition');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. EVENTS CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category event_category NOT NULL DEFAULT 'hackathon',
  organizer TEXT NOT NULL,
  source_url TEXT NOT NULL,
  registration_url TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  venue TEXT,
  city TEXT,
  country TEXT,
  mode event_mode NOT NULL DEFAULT 'online',
  fee NUMERIC(10, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  is_free BOOLEAN NOT NULL DEFAULT true,
  eligibility TEXT,
  technologies TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_type TEXT DEFAULT 'tinyfish_discovery',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique index for duplicate prevention based on title + start_date + organizer
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_unique_dedup 
ON public.events (lower(title), coalesce(start_date, '1970-01-01'::timestamptz), lower(organizer));

CREATE INDEX IF NOT EXISTS idx_events_category ON public.events (category);
CREATE INDEX IF NOT EXISTS idx_events_mode ON public.events (mode);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events (start_date);
CREATE INDEX IF NOT EXISTS idx_events_registration_deadline ON public.events (registration_deadline);
CREATE INDEX IF NOT EXISTS idx_events_is_free ON public.events (is_free);
CREATE INDEX IF NOT EXISTS idx_events_technologies ON public.events USING GIN (technologies);
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING GIN (tags);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_events_fts ON public.events USING GIN (
  to_tsvector('english', title || ' ' || coalesce(description, '') || ' ' || organizer)
);

-- 5. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  technical_interests TEXT[] DEFAULT '{}',
  preferred_categories TEXT[] DEFAULT '{}',
  city TEXT,
  country TEXT,
  preferred_modes TEXT[] DEFAULT '{}',
  max_budget NUMERIC(10, 2) DEFAULT NULL,
  experience_level TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SAVED EVENTS TABLE (Bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_events_user ON public.saved_events (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_events_event ON public.saved_events (event_id);

-- 7. REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  days_before INTEGER NOT NULL CHECK (days_before IN (1, 3, 7)),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'cancelled')),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id, days_before)
);

CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON public.reminders (scheduled_for, status);

-- 8. EVENT CHANGES TABLE (Audit log of verified changes)
CREATE TABLE IF NOT EXISTS public.event_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_changes_event ON public.event_changes (event_id);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'deadline_reminder' CHECK (type IN ('deadline_reminder', 'event_change', 'recommendation', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id, is_read);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: users can read and update their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Events: anyone (including public guests) can read events; only service role / admin can write
CREATE POLICY "Public read access to events" 
ON public.events FOR SELECT USING (true);

-- 3. User Preferences: users manage only their own preferences
CREATE POLICY "Users view own preferences" 
ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own preferences" 
ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own preferences" 
ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- 4. Saved Events: users manage only their own bookmarks
CREATE POLICY "Users view own saved events" 
ON public.saved_events FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own saved events" 
ON public.saved_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own saved events" 
ON public.saved_events FOR DELETE USING (auth.uid() = user_id);

-- 5. Reminders: users manage only their own reminders
CREATE POLICY "Users view own reminders" 
ON public.reminders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own reminders" 
ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reminders" 
ON public.reminders FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own reminders" 
ON public.reminders FOR DELETE USING (auth.uid() = user_id);

-- 6. Event Changes: public read for event transparency
CREATE POLICY "Public read access to event changes" 
ON public.event_changes FOR SELECT USING (true);

-- 7. Notifications: users view and update own notifications
CREATE POLICY "Users view own notifications" 
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" 
ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
