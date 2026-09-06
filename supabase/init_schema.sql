-- GUAKI local bootstrap schema. Real records only; no synthetic seed data.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  price_usd NUMERIC(10, 2) NOT NULL,
  features JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  depth INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS public.businesses (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  city TEXT NOT NULL,
  address TEXT,
  lat NUMERIC(10, 6),
  lng NUMERIC(10, 6),
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  plan TEXT DEFAULT 'pro',
  logo_url TEXT,
  hero_image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  services JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  schedule JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  profile_completion INT DEFAULT 0,
  guaki_score INT DEFAULT 500,
  ranking_status TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  source TEXT DEFAULT 'Registro en red GUAKI',
  evidence JSONB DEFAULT '[]'::jsonb,
  audit_notes TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_email TEXT,
  claim_status TEXT NOT NULL DEFAULT 'unclaimed',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  client_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_contact TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  service_requested TEXT,
  scheduled_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  author_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  verified_transaction BOOLEAN NOT NULL DEFAULT FALSE,
  moderation_status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (moderation_status IN ('submitted', 'approved', 'rejected')),
  reply TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name VARCHAR(100) NOT NULL,
  business_id TEXT REFERENCES public.businesses(id) ON DELETE SET NULL,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_city_category ON public.businesses(city, category);
CREATE INDEX IF NOT EXISTS idx_businesses_guaki_score ON public.businesses(guaki_score DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_business_id ON public.inquiries(business_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_moderation_status ON public.reviews(moderation_status);
CREATE INDEX IF NOT EXISTS idx_events_name_time ON public.events(event_name, timestamp DESC);

REVOKE ALL ON public.plans, public.cities, public.categories, public.businesses,
  public.inquiries, public.reviews, public.events FROM anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.plans, public.cities, public.categories TO anon, authenticated;
GRANT SELECT ON public.businesses TO anon, authenticated;
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT ON public.inquiries, public.reviews, public.events TO authenticated;
GRANT UPDATE, DELETE ON public.businesses, public.inquiries, public.reviews TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY plans_public_read ON public.plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY cities_public_read ON public.cities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY categories_public_read ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY businesses_public_read ON public.businesses FOR SELECT TO anon, authenticated
  USING (status = 'published' OR owner_id = (select auth.uid())
    OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin');
CREATE POLICY reviews_public_approved_read ON public.reviews FOR SELECT TO anon, authenticated
  USING (moderation_status = 'approved');
CREATE POLICY reviews_author_insert ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (author_user_id = (select auth.uid())
    AND verified_transaction = false AND moderation_status = 'submitted');
CREATE POLICY reviews_author_update ON public.reviews FOR UPDATE TO authenticated
  USING (author_user_id = (select auth.uid())
    OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin')
  WITH CHECK ((author_user_id = (select auth.uid())
    AND verified_transaction = false AND moderation_status = 'submitted')
    OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin');
CREATE POLICY reviews_author_delete ON public.reviews FOR DELETE TO authenticated
  USING (author_user_id = (select auth.uid())
    OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin');

NOTIFY pgrst, 'reload schema';
