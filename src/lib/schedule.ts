// #44 "Hoy en tu ciudad": cálculo de "abierto ahora" reutilizable.
// Replica la lógica del directorio (offset -05:00, rangos "lunes a viernes",
// horas AM/PM) sin acoplar DirectoryClient.

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

function toMinutes(m: RegExpExecArray): number {
  let h = parseInt(m[1], 10) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + parseInt(m[2], 10);
}

function isOpenForSlot(slot: { day?: string; hours?: string; isOpen?: boolean }, dayIdx: number, currentMinutes: number): boolean {
  const slotDay = (slot.day || '').toLowerCase();
  const slotHours = (slot.hours || '').trim();
  const isOpen = slot.isOpen ?? true;

  // Rangos de día: "lunes a viernes" | día simple: "sabado", "domingo"
  let dayMatches = false;
  const rangeMatch = slotDay.match(/^(.+?)\s+a\s+(.+)$/);
  if (rangeMatch) {
    const startIdx = DAY_NAMES.findIndex((d) => rangeMatch[1].trim().startsWith(d.substring(0, 4)));
    const endIdx = DAY_NAMES.findIndex((d) => rangeMatch[2].trim().startsWith(d.substring(0, 4)));
    if (startIdx >= 0 && endIdx >= 0) {
      dayMatches =
        startIdx <= endIdx
          ? dayIdx >= startIdx && dayIdx <= endIdx
          : dayIdx >= startIdx || dayIdx <= endIdx;
    }
  } else {
    dayMatches = DAY_NAMES.some((d) => slotDay.startsWith(d.substring(0, 4)));
  }

  if (!dayMatches) return false;

  // Horas: "8:00 AM - 6:00 PM" (separador "–" o "-"); "cerrado" nunca abre.
  if (isOpen && slotHours && !/cerrado/i.test(slotHours)) {
    const times = Array.from(slotHours.matchAll(/(\d{1,2}):(\d{2})\s*(AM|PM)/gi));
    if (times.length >= 2) {
      return currentMinutes >= toMinutes(times[0]) && currentMinutes < toMinutes(times[1]);
    }
    if (times.length === 1) {
      return currentMinutes >= toMinutes(times[0]);
    }
    return false;
  }
  // Día marcado abierto sin horas específicas.
  return isOpen && !slotHours;
}

export function isOpenNowFromSchedule(schedule: unknown, now: Date = new Date()): boolean {
  if (!schedule) return false;
  try {
    const parsed = typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
    if (!Array.isArray(parsed)) return false;
    // Offset -05:00 (Colombia/Venezuela, sin DST).
    const localTime = new Date(now.getTime() - 5 * 60 * 60 * 1000);
    const dayIdx = localTime.getDay();
    const currentMinutes = localTime.getHours() * 60 + localTime.getMinutes();
    return parsed.some((slot) => slot && typeof slot === 'object' && isOpenForSlot(slot, dayIdx, currentMinutes));
  } catch {
    return false;
  }
}
