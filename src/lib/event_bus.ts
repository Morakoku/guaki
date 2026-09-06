/**
 * GUAKI EVENT BUS & EVENT-DRIVEN KAFKA/REDIS ABSTRACTION v1.0
 * Módulo para emitir y registrar todos los eventos inmutables del ecosistema.
 */

export interface GuakiEvent {
  eventType: string;
  userId?: string;
  providerId?: string;
  payload: Record<string, any>;
  timestamp: string;
}

export class GuakiEventBus {
  private static instance: GuakiEventBus;

  private constructor() {}

  public static getInstance(): GuakiEventBus {
    if (!GuakiEventBus.instance) {
      GuakiEventBus.instance = new GuakiEventBus();
    }
    return GuakiEventBus.instance;
  }

  /**
   * Emite un evento inmutable al Event Bus y Data Lake (Bronze).
   */
  public async emit(event: Omit<GuakiEvent, 'timestamp'>): Promise<GuakiEvent> {
    const fullEvent: GuakiEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    console.log(`[EVENT_BUS] ⚡ Event Emitted: ${fullEvent.eventType}`, {
      userId: fullEvent.userId,
      providerId: fullEvent.providerId,
      timestamp: fullEvent.timestamp,
    });

    // TODO: En Sprint 9 se conecta directamente a Apache Kafka / Redis Stream.
    return fullEvent;
  }
}

export const eventBus = GuakiEventBus.getInstance();
