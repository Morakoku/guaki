import type { TrustedRole } from './authorization';

export const CLAIM_STATES = ['PENDING', 'CLAIMED', 'IN_AUDIT', 'APPROVED', 'PUBLISHED'] as const;

export type ClaimState = typeof CLAIM_STATES[number];

export function canTransitionClaimState(
  from: ClaimState,
  to: ClaimState,
  role: TrustedRole,
  isOwner: boolean,
): boolean {
  if (from === 'PENDING' && to === 'CLAIMED') return role === 'provider' && isOwner;
  if (from === 'CLAIMED' && to === 'IN_AUDIT') return role === 'provider' && isOwner;
  if (from === 'IN_AUDIT' && to === 'APPROVED') return role === 'admin';
  if (from === 'APPROVED' && to === 'PUBLISHED') return role === 'admin';
  return false;
}
