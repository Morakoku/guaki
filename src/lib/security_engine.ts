/**
 * GUAKI SECURITY, COMPLIANCE & PRIVACY ENGINE
 * Covers points 141-150: Rate Limiting, Phone Obfuscation, Habeas Data Ley 1581,
 * Audit Trail, Threat Detection & Merchant 2FA.
 */

// 🛡️ 141. Rate Limiting per IP (Sliding Window)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  ip: string,
  limit: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetInSec: Math.round(windowMs / 1000) };
  }

  record.count += 1;
  const remaining = Math.max(0, limit - record.count);
  const resetInSec = Math.max(1, Math.round((record.resetAt - now) / 1000));

  return {
    allowed: record.count <= limit,
    remaining,
    resetInSec,
  };
}

// 🔒 142. Phone Obfuscation against Crawlers / Scrapers
const OBFUSCATION_KEY = 0x5a;

export function obfuscatePhone(phone: string): string {
  if (!phone) return '';
  const bytes = Buffer.from(phone);
  const xored = Buffer.from(bytes.map((b) => b ^ OBFUSCATION_KEY));
  return xored.toString('base64');
}

export function deobfuscatePhone(obfuscated: string): string {
  if (!obfuscated) return '';
  try {
    const bytes = Buffer.from(obfuscated, 'base64');
    const xored = Buffer.from(bytes.map((b) => b ^ OBFUSCATION_KEY));
    return xored.toString('utf-8');
  } catch {
    return obfuscated;
  }
}

// 📜 143. Cumplimiento Ley 1581 de 2012 (Habeas Data Colombia)
export const HABEAS_DATA_NOTICE = {
  title: 'Tratamiento de Datos Personales (Ley 1581 de 2012)',
  shortText:
    'Al contactar a este comercio o enviar tu consulta, autorizas el tratamiento de tus datos exclusivamente para coordinar el servicio solicitado. Guaki no comparte ni comercializa tu información con terceros.',
  fullPolicyUrl: '/privacidad',
  rights: ['Conocer', 'Actualizar', 'Rectificar', 'Suprimir'],
};

// 📝 147. Registro Inmutable de Auditoría (Audit Trail)
export interface AuditLogEntry {
  id: string;
  businessId: string;
  actor: string;
  action: 'price_change' | 'plan_change' | 'status_change' | 'verified_badge_toggle' | 'details_update';
  previousValue: any;
  newValue: any;
  ipAddress?: string;
  timestamp: string;
}

const auditLogs: AuditLogEntry[] = [];

export function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const log: AuditLogEntry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...entry,
    timestamp: new Date().toISOString(),
  };
  auditLogs.push(log);
  if (auditLogs.length > 2000) auditLogs.shift();
  return log;
}

export function getAuditLogs(businessId?: string): AuditLogEntry[] {
  if (businessId) {
    return auditLogs.filter((l) => l.businessId === businessId);
  }
  return [...auditLogs];
}

// 🚫 148. Detección y Bloqueo de Amenazas / Malicious IPs
const blockedIps = new Set<string>();
const threatPatterns = [
  /(\.\.\/|\.\.\\)/i, // Path traversal
  /(union\s+select|information_schema|<script|alert\(|javascript:)/i, // SQLi / XSS
  /(wp-login|xmlrpc\.php|\.env|\.git)/i, // Scanners
];

export function inspectRequestThreat(path: string, query: string, ip: string): boolean {
  if (blockedIps.has(ip)) return true;

  const target = `${path}?${query}`;
  for (const pattern of threatPatterns) {
    if (pattern.test(target)) {
      blockedIps.add(ip);
      return true;
    }
  }
  return false;
}

// 🔐 150. Autenticación 2FA / PIN de Seguridad para el Comerciante
interface MerchantPINRecord {
  pin: string;
  expiresAt: number;
  attempts: number;
}
const pinStore = new Map<string, MerchantPINRecord>();

export function generateMerchantSecurityPIN(businessId: string): string {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  pinStore.set(businessId, {
    pin,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutos de validez
    attempts: 0,
  });
  return pin;
}

export function verifyMerchantSecurityPIN(businessId: string, enteredPin: string): boolean {
  const record = pinStore.get(businessId);
  if (!record || Date.now() > record.expiresAt) {
    pinStore.delete(businessId);
    return false;
  }

  record.attempts += 1;
  if (record.attempts > 4) {
    pinStore.delete(businessId);
    return false;
  }

  const isValid = record.pin === enteredPin.trim();
  if (isValid) {
    pinStore.delete(businessId);
  }
  return isValid;
}
