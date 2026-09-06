import { GuakiDataService } from '@/lib/supabase';

export interface AtlasRecommendation {
  providerId: string;
  matchScore: number;
  reasoning: string;
}

export class AtlasAICore {
  private static instance: AtlasAICore;

  private constructor() {}

  public static getInstance(): AtlasAICore {
    if (!AtlasAICore.instance) AtlasAICore.instance = new AtlasAICore();
    return AtlasAICore.instance;
  }

  public async getRecommendations(userIntent: string, city: string): Promise<AtlasRecommendation[]> {
    const providers = await GuakiDataService.getTopProviders(50);
    const intent = userIntent.trim().toLowerCase();
    const location = city.trim().toLowerCase();
    return providers
      .filter((provider) => !intent || provider.name.toLowerCase().includes(intent))
      .map((provider) => ({
        providerId: provider.id,
        matchScore: Number(provider.guakiScore ?? (provider as any).guaki_score ?? 500) / 1000,
        reasoning: `Coincidencia basada en datos del proveedor para ${location || 'la ciudad solicitada'}.`,
      }));
  }
}

export const atlasCore = AtlasAICore.getInstance();
