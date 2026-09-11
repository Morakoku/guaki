// Loop transaccional de Guaki (spec v1.0 — EVIDENCE/GUAKI_LOOP_TRANSACCIONAL_v1.md)
// Plantillas de los 4 mensajes del flujo de auditoría + envío por proveedor.
//
// Activación: define RESEND_API_KEY (y opcional EMAIL_FROM) en el entorno y el
// envío real queda operativo sin cambios de código. Sin proveedor, los envíos
// quedan registrados como traza en public.events (capa `notify_*`) y no se
// envía nada — nunca se miente al usuario sobre un correo que no salió.

import { GuakiDataService } from './supabase';

export type BusinessNotificationKind =
  | 'audit_received'
  | 'audit_approved'
  | 'audit_rejected'
  | 'audit_reminder';

export interface NotificationContext {
  businessName: string;
  businessId?: string;
  ownerName?: string | null;
  recipientEmail?: string | null;
  notes?: string | null;
  checklist?: string[] | null;
}

interface RenderedEmail {
  subject: string;
  text: string;
}

function ownerFirstName(ctx: NotificationContext): string {
  const raw = (ctx.ownerName || ctx.recipientEmail?.split('@')[0] || '').trim();
  if (!raw) return 'comerciante';
  return raw.split(/[\s._-]+/)[0];
}

function formatDate(date = new Date()): string {
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function buildAuditReceivedEmail(ctx: NotificationContext, date = new Date()): RenderedEmail {
  return {
    subject: 'Tu afiche fue enviado a revisión — Guaki',
    text: [
      `Hola ${ownerFirstName(ctx)},`,
      '',
      `Recibimos tu afiche "${ctx.businessName}" el ${formatDate(date)}.`,
      '',
      'Ya está en cola de revisión. Nuestro equipo lo revisa en un plazo máximo de 24 horas hábiles y te avisamos por este mismo canal cuando esté aprobado o si necesita algún ajuste.',
      '',
      'No necesitas hacer nada por ahora. Si tienes preguntas, responde este mensaje.',
      '',
      '— Equipo Guaki',
    ].join('\n'),
  };
}

export function buildAuditApprovedEmail(ctx: NotificationContext, date = new Date()): RenderedEmail {
  return {
    subject: 'Tu afiche fue aprobado — Guaki',
    text: [
      `Hola ${ownerFirstName(ctx)},`,
      '',
      `¡Buena noticia! Tu afiche "${ctx.businessName}" fue aprobado y está visible en Guaki desde ahora mismo.`,
      '',
      'Resumen:',
      `  - Título: ${ctx.businessName}`,
      `  - Fecha de publicación: ${formatDate(date)}`,
      '  - Estado: Publicado',
      '',
      'Si necesitas el link de tu afiche o editarlo, responde este mensaje y te lo enviamos.',
      '',
      '— Equipo Guaki',
    ].join('\n'),
  };
}

export function buildAuditRejectedEmail(ctx: NotificationContext, date = new Date()): RenderedEmail {
  const checklist = (ctx.checklist && ctx.checklist.length > 0
    ? ctx.checklist
    : (ctx.notes || '').split(/[\n;]+/).map((s) => s.trim()).filter(Boolean));
  const points = checklist.length > 0 ? checklist : ['Revisa los datos del afiche y vuelve a enviarlo.'];

  return {
    subject: 'Tu afiche necesita un ajuste — Guaki',
    text: [
      `Hola ${ownerFirstName(ctx)},`,
      '',
      `Revisamos tu afiche "${ctx.businessName}" y para publicarlo necesitamos que corrijas los siguientes puntos:`,
      '',
      ...points.map((point, index) => `  ${index + 1}. ${point}`),
      '',
      'Cuando estén corregidos, guarda tu afiche y envíalo de nuevo a revisión desde tu panel.',
      'Si no estás seguro de cómo corregir alguno de estos puntos, responde este mensaje y te guiamos.',
      '',
      '— Equipo Guaki',
    ].join('\n'),
  };
}

export function buildAuditReminderEmail(ctx: NotificationContext, since = new Date()): RenderedEmail {
  return {
    subject: 'Recordatorio: tu afiche está pendiente de revisión — Guaki',
    text: [
      `Hola ${ownerFirstName(ctx)},`,
      '',
      `Te escribimos porque tu afiche "${ctx.businessName}" sigue en cola de revisión desde el ${formatDate(since)}, y aún no hemos recibido tu respuesta o tu reenvío con los ajustes.`,
      '',
      'Lo que necesitas hacer:',
      '  1. Revisa los puntos del checklist que te enviamos.',
      '  2. Edita tu afiche con los ajustes.',
      '  3. Reenvíalo para que lo volvamos a revisar.',
      '',
      'Si ya enviaste el ajuste y no viste este correo, disculpa — responde este mensaje y lo revisamos.',
      '',
      'Si ya no estás interesado en este afiche, avísanos y lo retiramos de la cola para que no te siga recordando.',
      '',
      '— Equipo Guaki',
    ].join('\n'),
  };
}

function renderEmail(kind: BusinessNotificationKind, ctx: NotificationContext, date?: Date): RenderedEmail {
  switch (kind) {
    case 'audit_received':
      return buildAuditReceivedEmail(ctx, date);
    case 'audit_approved':
      return buildAuditApprovedEmail(ctx, date);
    case 'audit_rejected':
      return buildAuditRejectedEmail(ctx, date);
    case 'audit_reminder':
      return buildAuditReminderEmail(ctx, date);
  }
}

async function sendViaProvider(email: RenderedEmail, to: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;
  const from = process.env.EMAIL_FROM?.trim() || 'Guaki <onboarding@resend.dev>';
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject: email.subject, text: email.text }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export interface NotificationResult {
  queued: boolean;
  sent: boolean;
  reason?: string;
}

/**
 * Dispara una notificación del loop transaccional.
 * - Siempre deja traza en `public.events` como `notify_<kind>` (observabilidad del loop).
 * - Si hay proveedor configurado y destinatario, envía; si no, queda `queued`.
 */
export async function notifyBusinessAudit(
  kind: BusinessNotificationKind,
  ctx: NotificationContext,
): Promise<NotificationResult> {
  const email = renderEmail(kind, ctx);
  const to = typeof ctx.recipientEmail === 'string' && ctx.recipientEmail.includes('@') ? ctx.recipientEmail : null;

  let traced = false;
  try {
    await GuakiDataService.recordEvent(
      `notify_${kind}`,
      {
        business: ctx.businessName,
        has_recipient: Boolean(to),
        subject: email.subject,
        sent: false,
      },
      ctx.businessId,
    );
    traced = true;
  } catch {
    /* la traza no debe bloquear el flujo */
  }

  if (!to) return { queued: traced, sent: false, reason: 'NO_RECIPIENT' };

  const sent = await sendViaProvider(email, to);
  return sent
    ? { queued: traced, sent: true }
    : { queued: traced, sent: false, reason: 'EMAIL_PROVIDER_NOT_CONFIGURED' };
}
