export interface ProviderMetricsInput {
  loginsCount: number;
  responseSlaSeconds: number;
  profileCompletionPct: number;
  positiveReviewsCount: number;
  paymentsOnTime: boolean;
}

export interface ScoreOutput {
  healthScore: number;  // 0 - 100
  guakiScore: number;   // 0 - 1000
  businessScore: number;// 0 - 100
  churnRisk: boolean;
}

export class ScoringEngine {
  public static calculateScores(metrics: ProviderMetricsInput): ScoreOutput {
    // 1. Health Score (0-100)
    let health = 0;
    health += Math.min(metrics.loginsCount * 5, 20); // Máx 20 pts
    health += metrics.responseSlaSeconds < 120 ? 30 : 15; // Máx 30 pts
    health += (metrics.profileCompletionPct / 100) * 15; // Máx 15 pts
    health += Math.min(metrics.positiveReviewsCount * 4, 20); // Máx 20 pts
    health += metrics.paymentsOnTime ? 15 : 0; // Máx 15 pts

    const finalHealth = Math.round(health);

    // 2. Guaki Score (Meritocracia)
    const guaki = Math.round((finalHealth / 100) * 800 + Math.min(metrics.positiveReviewsCount * 20, 200));

    // 3. Business Score (Madurez)
    const business = Math.round((metrics.profileCompletionPct * 0.4) + (finalHealth * 0.6));

    return {
      healthScore: finalHealth,
      guakiScore: Math.min(guaki, 1000),
      businessScore: business,
      churnRisk: finalHealth < 60,
    };
  }
}
