export class PaymentIntegrations {
  public static async createCheckoutSession(
    _providerId: string,
    _planName: string,
    _amountUsd: number,
  ): Promise<never> {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }
}
