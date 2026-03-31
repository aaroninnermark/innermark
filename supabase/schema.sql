-- =============================================
-- Innermark Database Schema
-- Complete & Authoritative — Run Once
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  subscription_status text DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive', 'active', 'trialing', 'canceled', 'past_due')),
  subscription_id text,
  customer_id text,
  plan text DEFAULT 'free'
    CHECK (plan IN ('free', 'premium')),
  onboarding_complete boolean DEFAULT false,
  reminder_time time,
  celebrations_enabled boolean DEFAULT true,
  marketing_consent boolean DEFAULT false,
  marketing_consent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TOPICS
-- =============================================
CREATE TABLE IF NOT EXISTS public.topics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  emoji text NOT NULL DEFAULT '⭐',
  position integer NOT NULL DEFAULT 0,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Topic limit: 8 free, 25 premium
DROP TRIGGER IF EXISTS before_topic_insert ON public.topics;
DROP FUNCTION IF EXISTS public.check_topic_limit();

CREATE FUNCTION public.check_topic_limit()
RETURNS TRIGGER AS $$
DECLARE
  topic_count INTEGER;
  is_premium BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO topic_count
  FROM public.topics
  WHERE user_id = NEW.user_id AND archived = false;

  SELECT (plan = 'premium' OR subscription_status = 'active') INTO is_premium
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF is_premium AND topic_count >= 25 THEN
    RAISE EXCEPTION 'Premium plan allows a maximum of 25 topics';
  ELSIF NOT is_premium AND topic_count >= 8 THEN
    RAISE EXCEPTION 'Free plan allows a maximum of 8 topics. Upgrade to Premium for more.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER before_topic_insert
  BEFORE INSERT ON public.topics
  FOR EACH ROW EXECUTE FUNCTION public.check_topic_limit();

-- =============================================
-- CHECK-INS
-- =============================================
CREATE TABLE IF NOT EXISTS public.checkins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  day_note text CHECK (char_length(day_note) <= 500),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);

-- =============================================
-- TOPIC ENTRIES
-- =============================================
CREATE TABLE IF NOT EXISTS public.topic_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkin_id uuid NOT NULL REFERENCES public.checkins(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('red', 'yellow', 'green')),
  note text CHECK (char_length(note) <= 300),
  created_at timestamptz DEFAULT now(),
  UNIQUE (checkin_id, topic_id)
);

-- =============================================
-- INTENTIONS
-- =============================================
CREATE TABLE IF NOT EXISTS public.intentions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE CASCADE,
  month text,
  text text NOT NULL CHECK (char_length(text) <= 300),
  type text NOT NULL CHECK (type IN ('topic', 'monthly')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- STRIPE EVENTS LOG
-- =============================================
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  data jsonb,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own topics" ON public.topics;
DROP POLICY IF EXISTS "Users can insert own topics" ON public.topics;
DROP POLICY IF EXISTS "Users can update own topics" ON public.topics;
DROP POLICY IF EXISTS "Users can delete own topics" ON public.topics;
CREATE POLICY "Users can view own topics" ON public.topics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own topics" ON public.topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own topics" ON public.topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own topics" ON public.topics FOR DELETE USING (auth.uid() = user_id);

-- Check-ins
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own checkins" ON public.checkins;
DROP POLICY IF EXISTS "Users can insert own checkins" ON public.checkins;
DROP POLICY IF EXISTS "Users can update own checkins" ON public.checkins;
DROP POLICY IF EXISTS "Users can delete own checkins" ON public.checkins;
CREATE POLICY "Users can view own checkins" ON public.checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checkins" ON public.checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checkins" ON public.checkins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checkins" ON public.checkins FOR DELETE USING (auth.uid() = user_id);

-- Topic entries
ALTER TABLE public.topic_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own topic entries" ON public.topic_entries;
DROP POLICY IF EXISTS "Users can insert own topic entries" ON public.topic_entries;
DROP POLICY IF EXISTS "Users can update own topic entries" ON public.topic_entries;
DROP POLICY IF EXISTS "Users can delete own topic entries" ON public.topic_entries;
CREATE POLICY "Users can view own topic entries" ON public.topic_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.checkins WHERE checkins.id = topic_entries.checkin_id AND checkins.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own topic entries" ON public.topic_entries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.checkins WHERE checkins.id = topic_entries.checkin_id AND checkins.user_id = auth.uid())
  );
CREATE POLICY "Users can update own topic entries" ON public.topic_entries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.checkins WHERE checkins.id = topic_entries.checkin_id AND checkins.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own topic entries" ON public.topic_entries
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.checkins WHERE checkins.id = topic_entries.checkin_id AND checkins.user_id = auth.uid())
  );

-- Intentions
ALTER TABLE public.intentions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own intentions" ON public.intentions;
DROP POLICY IF EXISTS "Users can insert own intentions" ON public.intentions;
DROP POLICY IF EXISTS "Users can update own intentions" ON public.intentions;
DROP POLICY IF EXISTS "Users can delete own intentions" ON public.intentions;
CREATE POLICY "Users can view own intentions" ON public.intentions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own intentions" ON public.intentions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own intentions" ON public.intentions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own intentions" ON public.intentions FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS topics_user_id_idx ON public.topics(user_id);
CREATE INDEX IF NOT EXISTS topics_user_archived_idx ON public.topics(user_id, archived);
CREATE INDEX IF NOT EXISTS checkins_user_date_idx ON public.checkins(user_id, date DESC);
CREATE INDEX IF NOT EXISTS topic_entries_checkin_idx ON public.topic_entries(checkin_id);
CREATE INDEX IF NOT EXISTS topic_entries_topic_idx ON public.topic_entries(topic_id);
CREATE INDEX IF NOT EXISTS intentions_user_id_idx ON public.intentions(user_id);

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS set_topics_updated_at ON public.topics;
DROP TRIGGER IF EXISTS set_checkins_updated_at ON public.checkins;
DROP TRIGGER IF EXISTS set_intentions_updated_at ON public.intentions;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_checkins_updated_at BEFORE UPDATE ON public.checkins FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_intentions_updated_at BEFORE UPDATE ON public.intentions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
