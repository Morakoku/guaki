export const STALE_DATA_MESSAGE = 'Unable to refresh live data. Showing the last successful snapshot.';

const EMPTY_BUSINESS_MRI_INTAKE = {
  received: 0,
  pendingReview: 0,
  approved: 0,
  reportSent: 0,
  interested: 0,
  meeting: 0,
  proposal: 0,
  won: 0,
  lost: 0,
  intakeReview: { total: 0, pending: 0, completed: 0 },
};

function sanitizeRow(row = {}) {
  const { id, name, city, contactable, capturedAt } = row;
  return { id, name, city: city ?? null, contactable: Boolean(contactable), capturedAt: capturedAt ?? null };
}

export function sanitizeCoordinationSummary(summary = {}) {
  const { recent, discoveryRecent, businessMriIntake, ...operational } = summary;
  return {
    ...operational,
    businessMriIntake: {
      ...EMPTY_BUSINESS_MRI_INTAKE,
      ...businessMriIntake,
      intakeReview: {
        ...EMPTY_BUSINESS_MRI_INTAKE.intakeReview,
        ...businessMriIntake?.intakeReview,
      },
    },
    ...(recent ? { recent: recent.map(sanitizeRow) } : {}),
    ...(discoveryRecent ? { discoveryRecent: discoveryRecent.map(sanitizeRow) } : {}),
  };
}

export function keepLastSuccessfulSnapshot(previous, next) {
  if (next) return { ...next, stale: false, staleReason: undefined };
  if (!previous) return null;
  return { ...previous, stale: true, staleReason: STALE_DATA_MESSAGE };
}

export function buildDependencyHealth({ mapache, hermesBridge, hermesDashboard = null, relay, checkedAt = new Date().toISOString() }) {
  const dependencies = {
    mapache: mapache ? 'PASS' : 'BLOCKED',
    hermesBridge: hermesBridge ? 'PASS' : 'BLOCKED',
    hermesDashboard: hermesDashboard === null ? 'UNKNOWN' : hermesDashboard ? 'PASS' : 'BLOCKED',
    relay: relay ? 'PASS' : 'BLOCKED',
  };
  const available = Object.values(dependencies).filter((status) => status === 'PASS').length;
  return { status: available === 3 ? 'PASS' : available ? 'PARTIAL' : 'BLOCKED', checkedAt, dependencies };
}

export function inventoryBadge(status) {
  return `DOCUMENTED: ${status}`;
}

export function liveStatusLabel(status, isLive) {
  return isLive && status ? status : status ? inventoryBadge(status) : 'UNKNOWN';
}

export function lastKnownStateMessage() {
  return 'The Command Center hit an unexpected error. Retry restores the UI; any previously loaded operational data may be stale.';
}
