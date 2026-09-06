export const IS_DEMO_DATA = true;

export interface AficheBusinessData {
  id: string;
  slug: string;
  name: string;
  rating?: number;
  reviewCount?: number;
  category: string;
  categoryIcon: string;
  description: string;
  shortDescription: string;
  city: string;
  lat?: number;
  lng?: number;
  address?: string;
  schedule?: string;
  phone?: string;
  whatsapp?: string;
  services: string[];
  imageUrl?: string;
  fallbackImageUrl?: string;
  isVerified?: boolean;
  isDemo: boolean;
  isOpenNow?: boolean;
  plan?: 'free' | 'verificado' | 'pro' | 'vip';
}
