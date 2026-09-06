const VALID_CLAIM_STATUSES = new Set(['unclaimed', 'pending', 'verified', 'rejected']);

export function claimBusiness(business, actor) {
  if (!actor?.userId || !actor?.email) return { ok: false, code: 'ACTOR_REQUIRED' };
  if (business.ownerId && business.ownerId !== actor.userId) {
    return { ok: false, code: 'BUSINESS_ALREADY_CLAIMED' };
  }
  const claimStatus = business.claimStatus || 'unclaimed';
  if (!VALID_CLAIM_STATUSES.has(claimStatus)) return { ok: false, code: 'INVALID_CLAIM_STATUS' };
  if (claimStatus === 'verified') return { ok: true, business };

  return {
    ok: true,
    business: {
      ...business,
      ownerId: actor.userId,
      ownerEmail: actor.email,
      claimStatus: 'pending',
      status: 'in_audit',
      submittedAt: business.submittedAt || new Date().toISOString(),
    },
  };
}

export function canEditBusiness(business, actor) {
  if (!actor?.id) return false;
  if (actor.role === 'admin') return true;
  return Boolean(business.ownerId && business.ownerId === actor.id);
}

export function transitionBusinessStatus(business, nextStatus) {
  if (nextStatus === 'published' && business.claimStatus !== 'verified') {
    return { ok: false, code: 'CLAIM_NOT_VERIFIED' };
  }
  return { ok: true, business: { ...business, status: nextStatus } };
}
