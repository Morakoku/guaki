export function isContactable(row) {
  return Boolean(String(row?.phone ?? row?.whatsapp ?? '').trim() || String(row?.email ?? '').trim());
}

export function summarizeProspects(metrics = {}, recent = metrics.recent ?? []) {
  const captured = Number(metrics.companies_found ?? 0);
  const contactable = recent.filter(isContactable).length;
  const sent = Number(metrics.emails?.sent ?? 0);
  return {
    captured,
    contactable,
    uncontactable: Math.max(0, recent.length - contactable),
    leads: Number(metrics.leads ?? 0),
    emails: Number(metrics.companies_with_email ?? 0),
    sent,
  };
}
