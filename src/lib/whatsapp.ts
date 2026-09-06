const ALLOWED_FORMATTING = /[\s().-]/g;
const INTERNATIONAL_NUMBER = /^\+[1-9]\d{7,14}$/;
const NATIONAL_NUMBER = /^[1-9]\d{9,14}$/;

export function normalizeWhatsAppNumber(value: string | undefined): string | null {
  if (!value) return null;

  const compact = value.trim().replace(ALLOWED_FORMATTING, '');
  if (INTERNATIONAL_NUMBER.test(compact)) return compact.slice(1);
  if (NATIONAL_NUMBER.test(compact)) return compact;

  return null;
}
