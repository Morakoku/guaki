export interface BusinessAuditItem {
  id: string;
  name: string;
  category: string;
  city: string;
  status: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  website?: string;
  services: string[];
  lat?: number;
  lng?: number;
}

export interface AuditQueue {
  pending: BusinessAuditItem[];
  inReview: BusinessAuditItem[];
  approved: BusinessAuditItem[];
  rejected: BusinessAuditItem[];
}
