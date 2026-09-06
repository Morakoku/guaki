-- ==============================================================================
-- GUAKI MARKETPLACE DDL SCHEMA v2.0
-- CockroachDB / PostgreSQL Compatible
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 🏢 TABLA DE PLANES SAAS
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE, -- 'Start', 'Growth', 'Pro', 'Premium', 'Enterprise'
    price_usd NUMERIC(10, 2) NOT NULL,
    features JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🏙️ TABLA DE CIUDADES & UBICACIONES
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🏷️ TABLA DE CATEGORÍAS DE SERVICIOS
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    depth INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 👤 TABLA DE USUARIOS CONSUMIDORES
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    full_name VARCHAR(150) NOT NULL,
    city_id UUID REFERENCES cities(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🏪 TABLA DE NEGOCIOS Y PROVEEDORES
CREATE TABLE IF NOT EXISTS businesses (
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
    owner_id UUID,
    owner_email TEXT,
    claim_status TEXT NOT NULL DEFAULT 'unclaimed' CHECK (claim_status IN ('unclaimed', 'pending', 'verified', 'rejected')),
    source TEXT DEFAULT 'Registro en red GUAKI',
    evidence JSONB DEFAULT '[]'::jsonb,
    audit_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Compatibilidad para instalaciones existentes: reclamar una ficha no publica cambios automáticamente.
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_id UUID;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS claim_status TEXT NOT NULL DEFAULT 'unclaimed';

-- 💬 TABLA DE CONSULTAS Y SOLICITUDES DE CITAS / COTIZACIONES
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_contact TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    service_requested TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'quoted', 'scheduled', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ⭐ TABLA DE RESEÑAS Y OPINIONES VERIFICADAS
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    verified_transaction BOOLEAN DEFAULT FALSE,
    reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ⚡ TABLA DE EVENTOS (EVENT BUS DE BRONZE DATA LAKE)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(100) NOT NULL,
    business_id TEXT REFERENCES businesses(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES DE ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_city_category ON businesses(city, category);
CREATE INDEX IF NOT EXISTS idx_businesses_guaki_score ON businesses(guaki_score DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_business_id ON inquiries(business_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_events_type_timestamp ON events(event_name, timestamp DESC);
