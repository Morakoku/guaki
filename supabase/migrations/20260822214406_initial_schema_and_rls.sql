-- ==============================================================================
-- GUAKI MARKETPLACE SUPABASE / POSTGRESQL INITIALIZATION SCHEMA v2.0
-- High-Performance Cloud Database Persistence for Businesses, Reviews & Inquiries
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 🏢 PLANS
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    price_usd NUMERIC(10, 2) NOT NULL,
    features JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🏙️ CITIES
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🏷️ CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    depth INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🏪 BUSINESSES / PROVIDERS
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
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 💬 INQUIRIES / LEADS / APPOINTMENT REQUESTS
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_contact TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    service_requested TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'quoted', 'scheduled', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ⭐ VERIFIED REVIEWS & RATINGS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    verified_transaction BOOLEAN DEFAULT FALSE,
    reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ⚡ AUDIT & FACT EVENTS (BRONZE DATA LAKE)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(100) NOT NULL,
    business_id TEXT REFERENCES public.businesses(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🚀 INDEXES
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON public.businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_city_category ON public.businesses(city, category);
CREATE INDEX IF NOT EXISTS idx_businesses_guaki_score ON public.businesses(guaki_score DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_business_id ON public.inquiries(business_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_events_name_time ON public.events(event_name, timestamp DESC);

-- Grant privileges for PostgREST anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- Insert default seed business if not exists
INSERT INTO public.businesses (
    id, slug, name, category, description, short_description, city, address,
    lat, lng, phone, whatsapp, website, plan, status, rating, review_count,
    profile_completion, guaki_score, source, evidence, approved_at
)
VALUES
(
    'GKI-0001290',
    'veterinaria-pets-care-poblado',
    'Veterinaria Pets & Care Poblado',
    'Veterinarias',
    'Centro médico veterinario integral 24 horas en El Poblado, Medellín. Especialistas en urgencias médicas, cirugía de tejidos blandos, laboratorio clínico automatizado, odontología canina/felina y spa dermatológico.',
    'Urgencias 24h, cirugía especializada y spa veterinario en El Poblado.',
    'Medellín',
    'Carrera 43A # 14-27, El Poblado, Medellín, Colombia',
    6.2112,
    -75.5710,
    '+57 304 333 8899',
    '+57 304 333 8899',
    'https://petscarepoblado.co',
    'pro',
    'published',
    4.95,
    148,
    100,
    920,
    'Registro Oficial Auditado por GUAKI S.A.S.',
    '["https://petscarepoblado.co/certificacion", "RUT Comercial y Cámara de Comercio Medellín Verificada", "Geolocalización GPS en Sede Física Validada"]'::jsonb,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    city = EXCLUDED.city,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    whatsapp = EXCLUDED.whatsapp,
    website = EXCLUDED.website,
    status = EXCLUDED.status,
    rating = EXCLUDED.rating,
    review_count = EXCLUDED.review_count,
    profile_completion = EXCLUDED.profile_completion,
    guaki_score = EXCLUDED.guaki_score,
    source = EXCLUDED.source,
    evidence = EXCLUDED.evidence,
    updated_at = CURRENT_TIMESTAMP;

NOTIFY pgrst, 'reload schema';

ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS client_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS author_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_client_user_id ON public.inquiries(client_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_author_user_id ON public.reviews(author_user_id);
CREATE INDEX IF NOT EXISTS idx_events_actor_user_id ON public.events(actor_user_id);

REVOKE ALL ON public.plans, public.cities, public.categories, public.businesses, public.inquiries, public.reviews, public.events FROM anon, authenticated;
GRANT SELECT ON public.plans, public.cities, public.categories TO anon, authenticated;
GRANT SELECT ON public.businesses, public.reviews TO anon, authenticated;
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
CREATE POLICY businesses_public_read ON public.businesses FOR SELECT TO anon, authenticated USING (status = 'published' OR owner_id = (select auth.uid()) OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin');
CREATE POLICY businesses_owner_insert ON public.businesses FOR INSERT TO authenticated WITH CHECK (owner_id = (select auth.uid()) OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin');
CREATE POLICY businesses_owner_update ON public.businesses FOR UPDATE TO authenticated USING (owner_id = (select auth.uid()) OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin') WITH CHECK (owner_id = (select auth.uid()) OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin');
CREATE POLICY businesses_owner_delete ON public.businesses FOR DELETE TO authenticated USING (owner_id = (select auth.uid()) OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin');

CREATE POLICY inquiries_participant_read ON public.inquiries FOR SELECT TO authenticated USING (client_user_id = (select auth.uid()) OR business_id IN (SELECT id FROM public.businesses WHERE owner_id = (select auth.uid())) OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin');
CREATE POLICY inquiries_client_insert ON public.inquiries FOR INSERT TO authenticated WITH CHECK (client_user_id = (select auth.uid()));
CREATE POLICY inquiries_provider_update ON public.inquiries FOR UPDATE TO authenticated USING (business_id IN (SELECT id FROM public.businesses WHERE owner_id = (select auth.uid())) OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin') WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE owner_id = (select auth.uid())) OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin');
CREATE POLICY inquiries_owner_delete ON public.inquiries FOR DELETE TO authenticated USING (client_user_id = (select auth.uid()) OR business_id IN (SELECT id FROM public.businesses WHERE owner_id = (select auth.uid())) OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin');

CREATE POLICY reviews_public_read ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY reviews_author_insert ON public.reviews FOR INSERT TO authenticated WITH CHECK (author_user_id = (select auth.uid()));
CREATE POLICY reviews_author_update ON public.reviews FOR UPDATE TO authenticated USING (author_user_id = (select auth.uid()) OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin') WITH CHECK (author_user_id = (select auth.uid()) OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin');
CREATE POLICY reviews_author_delete ON public.reviews FOR DELETE TO authenticated USING (author_user_id = (select auth.uid()) OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin');

CREATE POLICY events_actor_read ON public.events FOR SELECT TO authenticated USING (actor_user_id = (select auth.uid()) OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin');
CREATE POLICY events_actor_insert ON public.events FOR INSERT TO authenticated WITH CHECK (actor_user_id = (select auth.uid()) OR (select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin');
