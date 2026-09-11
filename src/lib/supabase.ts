import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { BusinessRecord, BusinessInquiry, BusinessReview, BusinessStatus } from './validation';

// ==============================================================================
// GUAKI MARKETPLACE SUPABASE CLIENT & TYPES (schema.sql DDL)
// ==============================================================================

let cachedClient: SupabaseClient | null = null;

// H-01 FIX (audit v2): PostgREST filters are string-interpolated; reject any id/slug
// that could inject filter operators (commas, dots, parentheses, quotes).
const SAFE_BUSINESS_IDENTIFIER = /^[A-Za-z0-9_-]{1,120}$/;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // M-03 FIX: Never fall back to SERVICE_ROLE_KEY — it bypasses RLS.
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey && anonKey !== 'your-anon-key-here' && url.startsWith('http'));
}

function getSupabaseConfig(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // M-03 FIX: Never fall back to SERVICE_ROLE_KEY.
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || anonKey === 'your-anon-key-here') {
    throw new Error('GUAKI_SUPABASE_NOT_CONFIGURED');
  }
  return { url, anonKey };
}

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const { url, anonKey } = getSupabaseConfig();
  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
    },
  });
  return cachedClient;
}

export function getSupabaseClientForAccessToken(accessToken: string): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export interface Plan {
  id: string;
  name: 'Start' | 'Growth' | 'Pro' | 'Premium' | 'Enterprise';
  price_usd: number;
  features: Record<string, any>;
  created_at?: string;
}

export interface City {
  id: string;
  country: string;
  state: string;
  city: string;
  slug: string;
  created_at?: string;
}

export interface Category {
  id: string;
  parent_id?: string | null;
  name: string;
  slug: string;
  depth: number;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  city_id?: string;
  created_at?: string;
}

export interface PublishedProviderRecord {
  id: string;
  slug: string;
  name: string;
  source: string;
  status: 'published';
  city: string;
  category: string;
  website: string;
  evidence: string[];
  description?: string | null;
  short_description?: string | null;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  rating?: number | null;
  review_count?: number;
  plan?: string | null;
}

export interface FactEvent {
  id?: string;
  event_name: string;
  business_id?: string | null;
  metadata: Record<string, any>;
  timestamp?: string;
}

function mapSupabaseRowToBusiness(row: any, inquiries: BusinessInquiry[] = [], reviews: BusinessReview[] = []): BusinessRecord {
  const business: BusinessRecord = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description || '',
    shortDescription: row.short_description || row.shortDescription || '',
    city: row.city,
    address: row.address || '',
    lat: row.lat ? Number(row.lat) : undefined,
    lng: row.lng ? Number(row.lng) : undefined,
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    website: row.website || '',
    plan: row.plan || undefined,
    logoUrl: row.logo_url || row.logoUrl,
    heroImage: row.hero_image || row.heroImage,
    images: Array.isArray(row.images) ? row.images : [],
    services: Array.isArray(row.services) ? row.services : [],
    features: Array.isArray(row.features) ? row.features : [],
    schedule: Array.isArray(row.schedule) ? row.schedule : [],
    inquiries: inquiries,
    reviews: reviews,
    rating: row.rating === null || row.rating === undefined ? undefined : Number(row.rating),
    reviewCount: row.review_count === null || row.review_count === undefined ? undefined : Number(row.review_count),
    profileCompletion: row.profile_completion === null || row.profile_completion === undefined ? undefined : Number(row.profile_completion),
    guakiScore: row.guaki_score === null || row.guaki_score === undefined ? undefined : Number(row.guaki_score),
    rankingStatus: row.ranking_status,
    status: (row.status || 'draft') as BusinessStatus,
    auditNotes: row.audit_notes,
    source: row.source || undefined,
    evidence: Array.isArray(row.evidence) ? row.evidence : [],
    submittedAt: row.submitted_at,
    approvedAt: row.approved_at,
    ownerId: row.owner_id || null,
    ownerEmail: row.owner_email || null,
    claimStatus: row.claim_status || (row.owner_id ? 'verified' : 'unclaimed'),
    updatedAt: row.updated_at || undefined,
    createdAt: row.created_at || undefined,
  };
  // FIX: strip undefined values. isPublishedProvider() rejects any record with a
  // single undefined field (Object.values().every(v => v !== undefined)), so rows
  // with NULL columns (lat/lng/logo/etc.) were silently invisible to the public API.
  const mapped: Record<string, unknown> = { ...business };
  for (const key of Object.keys(mapped)) {
    if (mapped[key] === undefined) delete mapped[key];
  }
  return mapped as unknown as BusinessRecord;
}

function mapBusinessToSupabaseRow(b: Partial<BusinessRecord>): Record<string, any> {
  const row: Record<string, any> = {};
  if (b.id !== undefined) row.id = b.id;
  if (b.slug !== undefined) row.slug = b.slug;
  if (b.name !== undefined) row.name = b.name;
  if (b.category !== undefined) row.category = b.category;
  if (b.description !== undefined) row.description = b.description;
  if (b.shortDescription !== undefined) row.short_description = b.shortDescription;
  if (b.city !== undefined) row.city = b.city;
  if (b.address !== undefined) row.address = b.address;
  if (b.lat !== undefined) row.lat = b.lat;
  if (b.lng !== undefined) row.lng = b.lng;
  if (b.phone !== undefined) row.phone = b.phone;
  if (b.whatsapp !== undefined) row.whatsapp = b.whatsapp;
  if (b.website !== undefined) row.website = b.website;
  if (b.plan !== undefined) row.plan = b.plan;
  if (b.logoUrl !== undefined) row.logo_url = b.logoUrl;
  if (b.heroImage !== undefined) row.hero_image = b.heroImage;
  if (b.images !== undefined) row.images = b.images;
  if (b.services !== undefined) row.services = b.services;
  if (b.features !== undefined) row.features = b.features;
  if (b.schedule !== undefined) row.schedule = b.schedule;
  if (b.rating !== undefined) row.rating = b.rating;
  if (b.reviewCount !== undefined) row.review_count = b.reviewCount;
  if (b.status !== undefined) row.status = b.status;
  if (b.auditNotes !== undefined) row.audit_notes = b.auditNotes;
  if (b.source !== undefined) row.source = b.source;
  if (b.evidence !== undefined) row.evidence = b.evidence;
  if (b.submittedAt !== undefined) row.submitted_at = b.submittedAt;
  if (b.approvedAt !== undefined) row.approved_at = b.approvedAt;
  if (b.ownerId !== undefined) row.owner_id = b.ownerId;
  if (b.ownerEmail !== undefined) row.owner_email = b.ownerEmail;
  if (b.claimStatus !== undefined) row.claim_status = b.claimStatus;
  row.updated_at = new Date().toISOString();
  return row;
}

function mapInquiryRow(row: any): BusinessInquiry {
  return {
    id: row.id,
    businessId: row.business_id,
    clientName: row.client_name,
    clientContact: row.client_contact,
    email: row.email,
    message: row.message,
    serviceRequested: row.service_requested,
    scheduledDate: row.scheduled_date,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapReviewRow(row: any): BusinessReview {
  return {
    id: row.id,
    businessId: row.business_id,
    authorName: row.author_name,
    rating: row.rating,
    comment: row.comment,
    verified: row.verified_transaction,
    reply: row.reply,
    createdAt: row.created_at,
  };
}

// Data Access Service Layer for GUAKI Marketplace
export class GuakiDataService {
  static isConfigured(): boolean {
    return isSupabaseConfigured();
  }

  // Fetch Top Rated Providers
  static async getTopProviders(limit: number = 10): Promise<BusinessRecord[]> {
    if (!isSupabaseConfigured()) return [];
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('businesses')
      .select('*')
      .order('guaki_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((row) => mapSupabaseRowToBusiness(row));
  }

  static async getPublishedProviders(limit: number = 500): Promise<PublishedProviderRecord[]> {
    if (!isSupabaseConfigured()) return [];
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('businesses')
      .select('id,slug,name,source,status,city,category,website,evidence,description,short_description,address,phone,whatsapp,rating,review_count,plan')
      .eq('status', 'published')
      .limit(limit);

    if (error) throw error;
    return (data || []) as PublishedProviderRecord[];
  }

  static async getAllBusinesses(filters?: { status?: string; city?: string; category?: string }): Promise<BusinessRecord[]> {
    if (!isSupabaseConfigured()) return [];
    const client = getSupabaseClient();
    let query = client.from('businesses').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters?.category) {
      query = query.ilike('category', `%${filters.category}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => mapSupabaseRowToBusiness(row));
  }

  static async getBusinessesWithToken(
    accessToken: string,
    filters?: { status?: string; city?: string; category?: string; ownerId?: string },
  ): Promise<BusinessRecord[]> {
    if (!isSupabaseConfigured()) return [];
    const client = getSupabaseClientForAccessToken(accessToken);
    let query = client.from('businesses').select('*');
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.city) query = query.ilike('city', `%${filters.city}%`);
    if (filters?.category) query = query.ilike('category', `%${filters.category}%`);
    if (filters?.ownerId) query = query.eq('owner_id', filters.ownerId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => mapSupabaseRowToBusiness(row));
  }

  static async getBusinessById(id: string): Promise<BusinessRecord | null> {
    if (!isSupabaseConfigured()) return null;
    if (!SAFE_BUSINESS_IDENTIFIER.test(id)) return null;
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('businesses')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (error || !data) return null;

    // Fetch inquiries and reviews for this business
    const [inquiriesRes, reviewsRes] = await Promise.all([
      client.from('inquiries').select('*').eq('business_id', data.id).order('created_at', { ascending: false }),
      client.from('reviews').select('*').eq('business_id', data.id).order('created_at', { ascending: false }),
    ]);

    const inquiries: BusinessInquiry[] = (inquiriesRes.data || []).map((inq: any) => ({
      id: inq.id,
      businessId: inq.business_id,
      clientName: inq.client_name,
      clientContact: inq.client_contact,
      email: inq.email,
      message: inq.message,
      serviceRequested: inq.service_requested,
      scheduledDate: inq.scheduled_date,
      status: inq.status,
      createdAt: inq.created_at,
    }));

    const reviews: BusinessReview[] = (reviewsRes.data || []).map((rev: any) => ({
      id: rev.id,
      businessId: rev.business_id,
      authorName: rev.author_name,
      rating: rev.rating,
      comment: rev.comment,
      verified: rev.verified_transaction,
      reply: rev.reply,
      createdAt: rev.created_at,
    }));

    return mapSupabaseRowToBusiness(data, inquiries, reviews);
  }

  static async getBusinessByIdWithToken(id: string, accessToken: string): Promise<BusinessRecord | null> {
    if (!isSupabaseConfigured()) return null;
    if (!SAFE_BUSINESS_IDENTIFIER.test(id)) return null;
    const client = getSupabaseClientForAccessToken(accessToken);
    const { data, error } = await client.from('businesses').select('*').or(`id.eq.${id},slug.eq.${id}`).maybeSingle();
    if (error || !data) return null;
    return mapSupabaseRowToBusiness(data);
  }

  static async upsertBusiness(record: Partial<BusinessRecord>): Promise<BusinessRecord | null> {
    if (!isSupabaseConfigured()) return null;
    const client = getSupabaseClient();
    const row = mapBusinessToSupabaseRow(record);

    const { data, error } = await client
      .from('businesses')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return mapSupabaseRowToBusiness(data);
  }

  static async createBusinessWithToken(record: Partial<BusinessRecord>, accessToken: string): Promise<BusinessRecord> {
    if (!isSupabaseConfigured()) throw new Error('GUAKI_SUPABASE_NOT_CONFIGURED');
    const client = getSupabaseClientForAccessToken(accessToken);
    const row = mapBusinessToSupabaseRow(record);
    const { data, error } = await client.from('businesses').insert(row).select().single();
    if (error) throw error;
    return mapSupabaseRowToBusiness(data);
  }

  static async updateBusinessWithToken(id: string, record: Partial<BusinessRecord>, accessToken: string): Promise<BusinessRecord> {
    if (!isSupabaseConfigured()) throw new Error('GUAKI_SUPABASE_NOT_CONFIGURED');
    const client = getSupabaseClientForAccessToken(accessToken);
    const row = mapBusinessToSupabaseRow(record);
    delete row.id;
    delete row.owner_id;
    delete row.owner_email;
    delete row.claim_status;
    delete row.status;
    const { data, error } = await client.from('businesses').update(row).eq('id', id).select().single();
    if (error) throw error;
    return mapSupabaseRowToBusiness(data);
  }

  static async updateBusinessWorkflowWithToken(id: string, record: Partial<BusinessRecord>, accessToken: string): Promise<BusinessRecord> {
    if (!isSupabaseConfigured()) throw new Error('GUAKI_SUPABASE_NOT_CONFIGURED');
    const client = getSupabaseClientForAccessToken(accessToken);
    const row = mapBusinessToSupabaseRow(record);
    delete row.id;
    const { data, error } = await client.from('businesses').update(row).eq('id', id).select().single();
    if (error) throw error;
    return mapSupabaseRowToBusiness(data);
  }

  static async claimBusinessWithToken(id: string, accessToken: string, ownerEmail: string): Promise<BusinessRecord> {
    if (!isSupabaseConfigured()) throw new Error('GUAKI_SUPABASE_NOT_CONFIGURED');
    const client = getSupabaseClientForAccessToken(accessToken);
    const { data, error } = await client.rpc('claim_business', {
      p_business_id: id,
      p_owner_email: ownerEmail,
    });
    if (error || !data) throw error || new Error('BUSINESS_CLAIM_FAILED');
    return mapSupabaseRowToBusiness(data);
  }

  static async addInquiry(
    businessId: string,
    inquiry: Omit<BusinessInquiry, 'id' | 'createdAt' | 'status'>
  ): Promise<BusinessInquiry | null> {
    if (!isSupabaseConfigured()) return null;
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('inquiries')
      .insert([
        {
          business_id: businessId,
          client_name: inquiry.clientName,
          client_contact: inquiry.clientContact,
          email: inquiry.email,
          message: inquiry.message,
          service_requested: inquiry.serviceRequested,
          scheduled_date: inquiry.scheduledDate,
          status: 'new',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      businessId: data.business_id,
      clientName: data.client_name,
      clientContact: data.client_contact,
      email: data.email,
      message: data.message,
      serviceRequested: data.service_requested,
      scheduledDate: data.scheduled_date,
      status: data.status,
      createdAt: data.created_at,
    };
  }

  static async addInquiryWithToken(
    businessId: string,
    inquiry: Omit<BusinessInquiry, 'id' | 'createdAt' | 'status'>,
    accessToken: string,
    clientUserId: string,
  ): Promise<BusinessInquiry> {
    if (!isSupabaseConfigured()) throw new Error('GUAKI_SUPABASE_NOT_CONFIGURED');
    const client = getSupabaseClientForAccessToken(accessToken);
    const { data, error } = await client.from('inquiries').insert({
      business_id: businessId,
      client_user_id: clientUserId,
      client_name: inquiry.clientName,
      client_contact: inquiry.clientContact,
      email: inquiry.email,
      message: inquiry.message,
      service_requested: inquiry.serviceRequested,
      scheduled_date: inquiry.scheduledDate,
      status: 'new',
    }).select().single();
    if (error || !data) throw error || new Error('INQUIRY_CREATE_FAILED');
    return mapInquiryRow(data);
  }

  static async updateInquiryStatus(inquiryId: string, status: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const client = getSupabaseClient();
    const { error } = await client
      .from('inquiries')
      .update({ status })
      .eq('id', inquiryId);

    return !error;
  }

  static async updateInquiryStatusWithToken(inquiryId: string, status: string, accessToken: string): Promise<boolean> {
    if (!isSupabaseConfigured()) throw new Error('GUAKI_SUPABASE_NOT_CONFIGURED');
    const client = getSupabaseClientForAccessToken(accessToken);
    const { data, error } = await client.from('inquiries').update({ status }).eq('id', inquiryId).select('id');
    if (error) throw error;
    return Boolean(data?.length);
  }

  static async addReview(
    businessId: string,
    review: Omit<BusinessReview, 'id' | 'createdAt'>
  ): Promise<BusinessReview | null> {
    if (!isSupabaseConfigured()) return null;
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reviews')
      .insert([
        {
          business_id: businessId,
          author_name: review.authorName,
          rating: review.rating,
          comment: review.comment,
          verified_transaction: false,
          moderation_status: 'submitted',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Recalculate average rating & review count for business
    const { data: allReviews } = await client
      .from('reviews')
      .select('rating')
      .eq('business_id', businessId);

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
      await client
        .from('businesses')
        .update({
          rating: Math.round(avg * 100) / 100,
          review_count: allReviews.length,
          updated_at: new Date().toISOString(),
        })
        .eq('id', businessId);
    }

    return {
      id: data.id,
      businessId: data.business_id,
      authorName: data.author_name,
      rating: data.rating,
      comment: data.comment,
      verified: data.verified_transaction,
      reply: data.reply,
      createdAt: data.created_at,
    };
  }

  static async addReviewWithToken(
    businessId: string,
    review: Omit<BusinessReview, 'id' | 'createdAt'>,
    accessToken: string,
    authorUserId: string,
  ): Promise<BusinessReview> {
    if (!isSupabaseConfigured()) throw new Error('GUAKI_SUPABASE_NOT_CONFIGURED');
    const client = getSupabaseClientForAccessToken(accessToken);
    const { data, error } = await client.from('reviews').insert({
      business_id: businessId,
      author_user_id: authorUserId,
      author_name: review.authorName,
      rating: review.rating,
      comment: review.comment,
      verified_transaction: false,
      moderation_status: 'submitted',
    }).select().single();
    if (error || !data) throw error || new Error('REVIEW_CREATE_FAILED');
    return mapReviewRow(data);
  }

  // Record Interaction Event in the verified remote events contract.
  static async recordEvent(eventName: string, metadata: Record<string, any>, businessId?: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const client = getSupabaseClient();
    const { error } = await client
      .from('events')
      .insert([{ event_name: eventName, metadata, business_id: businessId }]);

    if (error) throw error;
  }

  static async recordEventWithToken(
    eventName: string,
    metadata: Record<string, any>,
    accessToken: string,
    actorUserId: string,
    businessId?: string,
  ): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('GUAKI_SUPABASE_NOT_CONFIGURED');
    const client = getSupabaseClientForAccessToken(accessToken);
    const { error } = await client.from('events').insert([{
      event_name: eventName,
      metadata,
      business_id: businessId,
      actor_user_id: actorUserId,
    }]);
    if (error) throw error;
  }
}
