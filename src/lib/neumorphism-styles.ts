import { TOKENS } from './design-tokens';

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

export const NM = SOFT_UI;
export const NM_PEARL = SOFT_UI;
export const CLAY = SOFT_UI;
