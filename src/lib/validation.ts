/**
 * GUAKI DATA PERSISTENCE & API VALIDATION SCHEMAS
 * Strict schema validators for BusinessRecord, Inquiries, Reviews, and Audit Decisions.
 */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export type BusinessStatus =
  | 'draft'
  | 'in_audit'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'published'
  | 'rejected';

export interface BusinessSchedule {
  day: string;
  isOpen: boolean;
  hours: string;
}

export interface BusinessInquiry {
  id: string;
  businessId?: string;
  clientName: string;
  clientContact: string;
  email?: string;
  message: string;
  serviceRequested?: string;
  scheduledDate?: string;
  status: 'new' | 'contacted' | 'quoted' | 'scheduled' | 'closed';
  createdAt: string;
}

export interface BusinessReview {
  id: string;
  businessId?: string;
  authorName: string;
  rating: number;
  comment: string;
  verified?: boolean;
  reply?: string;
  createdAt: string;
}

export interface BusinessRecord {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  shortDescription?: string;
  city: string;
  address: string;
  lat?: number;
  lng?: number;
  phone: string;
  whatsapp: string;
  website: string;
  plan?: string;
  logoUrl?: string;
  heroImage?: string;
  images?: string[];
  services: string[];
  features: string[];
  schedule: BusinessSchedule[];
  inquiries?: BusinessInquiry[];
  reviews?: BusinessReview[];
  rating?: number;
  reviewCount?: number;
  profileCompletion?: number;
  guakiScore?: number;
  rankingStatus?: string;
  responseTime?: string;
  status: BusinessStatus;
  ownerId?: string | null;
  ownerEmail?: string | null;
  claimStatus?: 'unclaimed' | 'pending' | 'verified' | 'rejected';
  isVerified?: boolean;
  auditNotes?: string;
  rejectionReason?: string;
  source?: string;
  evidence?: string[];
  submittedAt?: string;
  approvedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

// Sanitization helpers
export function sanitizeString(val: unknown, fallback: string = ''): string {
  if (typeof val !== 'string') return fallback;
  return val.trim();
}

export function sanitizeSlug(val: string): string {
  return val
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/** Converts the provider's editable schedule text into the JSON shape persisted by Supabase. */
export function parseScheduleText(value: unknown): BusinessSchedule[] {
  if (typeof value !== 'string' || !value.trim()) return [];

  return value
    .split('|')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [dayPart, ...hoursParts] = entry.split('·');
      const day = dayPart.trim();
      const hours = hoursParts.join('·').trim();
      return { day, isOpen: Boolean(day && hours), hours };
    })
    .filter((entry) => entry.day && entry.hours);
}

/**
 * Validates new or partial Business Record data
 */
export function validateBusinessPayload(
  payload: Record<string, any>,
  isUpdate: boolean = false
): ValidationResult<Partial<BusinessRecord>> {
  const errors: Record<string, string> = {};

  if (!isUpdate || payload.name !== undefined) {
    const name = sanitizeString(payload.name);
    if (!name || name.length < 2) {
      errors.name = 'El nombre del negocio debe tener al menos 2 caracteres.';
    } else if (name.length > 200) {
      errors.name = 'El nombre del negocio no puede exceder 200 caracteres.';
    }
  }

  if (!isUpdate || payload.category !== undefined) {
    const category = sanitizeString(payload.category);
    if (!category) {
      errors.category = 'La categoría del negocio es requerida.';
    }
  }

  if (!isUpdate || payload.city !== undefined) {
    const city = sanitizeString(payload.city);
    if (!city) {
      errors.city = 'La ciudad es requerida.';
    }
  }

  if (payload.website !== undefined && payload.website !== null && payload.website !== '') {
    const website = sanitizeString(payload.website);
    if (website && !/^https?:\/\//i.test(website)) {
      errors.website = 'El sitio web debe comenzar con http:// o https://';
    }
  }

  if (payload.lat !== undefined && payload.lat !== null) {
    const lat = Number(payload.lat);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.lat = 'La latitud debe ser un valor numérico entre -90 y 90.';
    }
  }

  if (payload.lng !== undefined && payload.lng !== null) {
    const lng = Number(payload.lng);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.lng = 'La longitud debe ser un valor numérico entre -180 y 180.';
    }
  }

  if (payload.schedule !== undefined && payload.schedule !== null) {
    if (!Array.isArray(payload.schedule)) {
      errors.schedule = 'El horario debe ser un arreglo estructurado.';
    }
  }

  if (payload.services !== undefined && payload.services !== null) {
    if (!Array.isArray(payload.services)) {
      errors.services = 'Los servicios deben ser una lista de textos.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const sanitized: Partial<BusinessRecord> = {};

  if (payload.name !== undefined) sanitized.name = sanitizeString(payload.name);
  if (payload.slug !== undefined) {
    sanitized.slug = sanitizeSlug(payload.slug);
  } else if (payload.name) {
    sanitized.slug = sanitizeSlug(payload.name);
  }

  if (payload.category !== undefined) sanitized.category = sanitizeString(payload.category);
  if (payload.description !== undefined) sanitized.description = sanitizeString(payload.description);
  if (payload.shortDescription !== undefined) sanitized.shortDescription = sanitizeString(payload.shortDescription);
  if (payload.city !== undefined) sanitized.city = sanitizeString(payload.city);
  if (payload.address !== undefined) sanitized.address = sanitizeString(payload.address);
  if (payload.phone !== undefined) sanitized.phone = sanitizeString(payload.phone);
  if (payload.whatsapp !== undefined) sanitized.whatsapp = sanitizeString(payload.whatsapp);
  if (payload.website !== undefined) sanitized.website = sanitizeString(payload.website);
  if (payload.plan !== undefined) sanitized.plan = sanitizeString(payload.plan, 'pro');
  if (payload.logoUrl !== undefined) sanitized.logoUrl = sanitizeString(payload.logoUrl);
  if (payload.heroImage !== undefined) sanitized.heroImage = sanitizeString(payload.heroImage);
  if (Array.isArray(payload.images)) sanitized.images = payload.images.map((img: any) => String(img));
  if (Array.isArray(payload.services)) sanitized.services = payload.services.map((s: any) => String(s).trim()).filter(Boolean);
  if (Array.isArray(payload.features)) sanitized.features = payload.features.map((f: any) => String(f).trim()).filter(Boolean);
  if (Array.isArray(payload.schedule)) sanitized.schedule = payload.schedule;
  if (payload.lat !== undefined) sanitized.lat = Number(payload.lat);
  if (payload.lng !== undefined) sanitized.lng = Number(payload.lng);
  if (payload.status !== undefined) sanitized.status = payload.status;
  if (payload.ownerId !== undefined) sanitized.ownerId = payload.ownerId ? sanitizeString(payload.ownerId) : null;
  if (payload.ownerEmail !== undefined) sanitized.ownerEmail = payload.ownerEmail ? sanitizeString(payload.ownerEmail) : null;
  if (payload.claimStatus !== undefined) sanitized.claimStatus = payload.claimStatus;
  if (payload.auditNotes !== undefined) sanitized.auditNotes = sanitizeString(payload.auditNotes);

  return { success: true, data: sanitized };
}

/**
 * Validates inquiry / quote / appointment requests
 */
export function validateInquiryPayload(
  payload: Record<string, any>
): ValidationResult<Omit<BusinessInquiry, 'id' | 'createdAt' | 'status'>> {
  const errors: Record<string, string> = {};

  const clientName = sanitizeString(payload.clientName);
  if (!clientName || clientName.length < 2) {
    errors.clientName = 'El nombre del cliente debe tener al menos 2 caracteres.';
  }

  const clientContact = sanitizeString(payload.clientContact);
  if (!clientContact || clientContact.length < 5) {
    errors.clientContact = 'Se requiere un teléfono o número de WhatsApp válido.';
  }

  const message = sanitizeString(payload.message);
  if (!message || message.length < 3) {
    errors.message = 'Por favor incluye un mensaje o detalle de tu consulta.';
  } else if (message.length > 2500) {
    errors.message = 'El mensaje no puede exceder 2500 caracteres.';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      clientName,
      clientContact,
      email: payload.email ? sanitizeString(payload.email) : undefined,
      message,
      serviceRequested: payload.serviceRequested ? sanitizeString(payload.serviceRequested) : undefined,
      scheduledDate: payload.scheduledDate ? sanitizeString(payload.scheduledDate) : undefined,
    },
  };
}

/**
 * Validates review submission
 */
export function validateReviewPayload(
  payload: Record<string, any>
): ValidationResult<Omit<BusinessReview, 'id' | 'createdAt'>> {
  const errors: Record<string, string> = {};

  const authorName = sanitizeString(payload.authorName);
  if (!authorName || authorName.length < 2) {
    errors.authorName = 'El nombre del autor debe tener al menos 2 caracteres.';
  }

  const ratingNum = Number(payload.rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    errors.rating = 'La calificación debe ser un número entero entre 1 y 5 estrellas.';
  }

  const comment = sanitizeString(payload.comment);
  if (!comment || comment.length < 4) {
    errors.comment = 'El comentario debe contener al menos 4 caracteres.';
  } else if (comment.length > 1500) {
    errors.comment = 'El comentario no puede exceder 1500 caracteres.';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      authorName,
      rating: Math.round(ratingNum),
      comment,
      verified: false,
    },
  };
}

/**
 * Validates admin audit decision
 */
export function validateAuditDecision(
  payload: Record<string, any>
): ValidationResult<{ decision: 'approved' | 'rejected' | 'changes_requested' | 'published'; notes?: string }> {
  const errors: Record<string, string> = {};
  const rawDecision = sanitizeString(payload.decision).toLowerCase();

  let decision: 'approved' | 'rejected' | 'changes_requested' | 'published' | null = null;
  if (rawDecision === 'approve' || rawDecision === 'approved') {
    decision = 'approved';
  } else if (rawDecision === 'reject' || rawDecision === 'rejected') {
    decision = 'rejected';
  } else if (rawDecision === 'request_changes' || rawDecision === 'changes_requested') {
    decision = 'changes_requested';
  } else if (rawDecision === 'publish' || rawDecision === 'published') {
    decision = 'published';
  } else {
    errors.decision = 'Decisión inválida. Debe ser approve, request_changes, reject o publish.';
  }

  if (errors.decision) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      decision: decision!,
      notes: payload.notes ? sanitizeString(payload.notes) : undefined,
    },
  };
}
