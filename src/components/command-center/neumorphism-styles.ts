import { TOKENS } from '../../lib/design-tokens';

export const SOFT_UI = {
  bg: TOKENS.colors.bgMain,
  surfaceCard: TOKENS.colors.surface,
  surfaceCardDark: TOKENS.colors.surfaceElevated,
  surfaceInset: TOKENS.colors.surfaceInset,
  text: TOKENS.colors.textMain,
  muted: TOKENS.colors.textSecondary,
  accent: TOKENS.colors.emeraldDark,
  accentDark: TOKENS.colors.emeraldDeep,
  accentGlow: 'rgba(23, 56, 45, 0.25)',

  // Soft Organic Glass / Neumorphic Card
  card: {
    backgroundColor: TOKENS.colors.surface,
    borderRadius: TOKENS.radii.xl,
    boxShadow: TOKENS.shadows.card,
    border: `1px solid ${TOKENS.colors.borderLight}`,
    color: TOKENS.colors.textMain,
    transform: 'translateZ(0)',
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    transition: `transform ${TOKENS.motion.fast} ${TOKENS.motion.ease}, box-shadow ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
  },

  // Small Soft Card / Tile
  cardSmall: {
    backgroundColor: TOKENS.colors.surfaceElevated,
    borderRadius: TOKENS.radii.lg,
    boxShadow: TOKENS.shadows.card,
    border: `1px solid ${TOKENS.colors.borderLight}`,
    color: TOKENS.colors.textMain,
    transform: 'translateZ(0)',
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    transition: `transform ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
  },

  // Sunken Soft Inset
  inset: {
    backgroundColor: TOKENS.colors.surfaceInset,
    borderRadius: TOKENS.radii.md,
    boxShadow: TOKENS.shadows.inset,
    border: '1px solid rgba(255, 255, 255, 0.4)',
    color: TOKENS.colors.textMain,
  },

  // Soft Convex Button
  buttonConvex: {
    backgroundColor: TOKENS.colors.surface,
    borderRadius: TOKENS.radii.md,
    boxShadow: TOKENS.shadows.btnConvex,
    border: `1px solid ${TOKENS.colors.borderLight}`,
    color: TOKENS.colors.textMain,
    fontWeight: 700,
    cursor: 'pointer',
    transform: 'translateZ(0)',
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    transition: `transform ${TOKENS.motion.fast} ${TOKENS.motion.ease}, opacity ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
  },

  // Inset Pressed Button
  buttonPressed: {
    backgroundColor: TOKENS.colors.surfaceInset,
    borderRadius: TOKENS.radii.md,
    boxShadow: TOKENS.shadows.inset,
    border: `1px solid ${TOKENS.colors.greenPrimary}`,
    color: TOKENS.colors.emeraldDark,
    fontWeight: 700,
    cursor: 'pointer',
    transform: 'translateZ(0)',
    willChange: 'transform',
    transition: `transform ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
  },

  // Primary Dark Emerald Action Button
  buttonEmerald: {
    backgroundColor: TOKENS.colors.emeraldDark,
    borderRadius: TOKENS.radii.md,
    boxShadow: TOKENS.shadows.btnPrimary,
    border: 'none',
    color: TOKENS.colors.white,
    fontWeight: 800,
    cursor: 'pointer',
    transform: 'translateZ(0)',
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    transition: `transform ${TOKENS.motion.fast} ${TOKENS.motion.ease}, opacity ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
  },

  // Inset Input Field
  input: {
    backgroundColor: TOKENS.colors.surfaceInset,
    borderRadius: TOKENS.radii.md,
    boxShadow: TOKENS.shadows.inset,
    border: `1px solid ${TOKENS.colors.borderSubtle}`,
    color: TOKENS.colors.textMain,
    outline: 'none',
    padding: '13px 18px',
    fontSize: '0.94rem',
    transition: `border-color ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
  },

  // Pill Badge
  badge: {
    backgroundColor: TOKENS.colors.highlight,
    color: TOKENS.colors.emeraldDark,
    borderRadius: TOKENS.radii.pill,
    boxShadow: 'none',
    border: '1px solid rgba(23, 56, 45, 0.08)',
  },

  // Avatar
  avatar: {
    borderRadius: TOKENS.radii.lg,
    boxShadow: TOKENS.shadows.card,
    border: `1px solid ${TOKENS.colors.borderLight}`,
    transform: 'translateZ(0)',
    willChange: 'transform',
  },
};

/** Command Center-only dark neumorphic surface tokens. */
export const NM_DARK = {
  bg: '#0B0F0D',
  surfaceCard: '#131A17',
  surfaceCardDark: '#1A211E',
  surfaceInset: '#0E1411',
  text: '#F5F7F5',
  muted: '#A7B3AD',
  accent: TOKENS.colors.emeraldDark,
  accentDark: TOKENS.colors.emeraldDeep,
  accentGlow: 'rgba(23, 56, 45, 0.35)',

  card: {
    backgroundColor: '#131A17',
    borderRadius: TOKENS.radii.xl,
    boxShadow: '8px 8px 18px rgba(0, 0, 0, 0.42), -6px -6px 16px rgba(255, 255, 255, 0.025)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#F5F7F5',
    transform: 'translateZ(0)',
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    transition: `transform ${TOKENS.motion.fast} ${TOKENS.motion.ease}, box-shadow ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
  },

  cardSmall: {
    backgroundColor: '#1A211E',
    borderRadius: TOKENS.radii.lg,
    boxShadow: '6px 6px 14px rgba(0, 0, 0, 0.36), -4px -4px 12px rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    color: '#F5F7F5',
    transform: 'translateZ(0)',
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    transition: `transform ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
  },

  inset: {
    backgroundColor: '#0E1411',
    borderRadius: TOKENS.radii.md,
    boxShadow: 'inset 4px 4px 8px rgba(0, 0, 0, 0.42), inset -4px -4px 8px rgba(255, 255, 255, 0.025)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    color: '#F5F7F5',
  },

  buttonConvex: {
    backgroundColor: '#131A17',
    borderRadius: TOKENS.radii.md,
    boxShadow: '5px 6px 14px rgba(0, 0, 0, 0.38), -4px -4px 10px rgba(255, 255, 255, 0.025)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#F5F7F5',
    fontWeight: 700,
    cursor: 'pointer',
    transform: 'translateZ(0)',
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    transition: `transform ${TOKENS.motion.fast} ${TOKENS.motion.ease}, opacity ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
  },

  buttonPressed: {
    backgroundColor: '#0E1411',
    borderRadius: TOKENS.radii.md,
    boxShadow: 'inset 3px 3px 6px rgba(0, 0, 0, 0.42), inset -3px -3px 6px rgba(255, 255, 255, 0.025)',
    border: `1px solid ${TOKENS.colors.greenPrimary}`,
    color: '#B8E0B8',
    fontWeight: 700,
    cursor: 'pointer',
    transform: 'translateZ(0)',
    willChange: 'transform',
    transition: `transform ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
  },

  buttonEmerald: {
    backgroundColor: TOKENS.colors.emeraldDark,
    borderRadius: TOKENS.radii.md,
    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.36), inset 0 2px 4px rgba(255, 255, 255, 0.12)',
    border: 'none',
    color: TOKENS.colors.white,
    fontWeight: 800,
    cursor: 'pointer',
    transform: 'translateZ(0)',
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    transition: `transform ${TOKENS.motion.fast} ${TOKENS.motion.ease}, opacity ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
  },

  input: {
    backgroundColor: '#0E1411',
    borderRadius: TOKENS.radii.md,
    boxShadow: 'inset 4px 4px 8px rgba(0, 0, 0, 0.42), inset -4px -4px 8px rgba(255, 255, 255, 0.025)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    color: '#F5F7F5',
    outline: 'none',
    padding: '13px 18px',
    fontSize: '0.94rem',
    transition: `border-color ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
  },

  badge: {
    backgroundColor: '#1C3328',
    color: '#B8E0B8',
    borderRadius: TOKENS.radii.pill,
    boxShadow: 'none',
    border: '1px solid rgba(184, 224, 184, 0.16)',
  },

  avatar: {
    borderRadius: TOKENS.radii.lg,
    boxShadow: '6px 6px 14px rgba(0, 0, 0, 0.36), -4px -4px 12px rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transform: 'translateZ(0)',
    willChange: 'transform',
  },
};

export const NM = SOFT_UI;
export const NM_PEARL = SOFT_UI;
export const CLAY = SOFT_UI;
