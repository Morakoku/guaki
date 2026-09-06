/**
 * GUAKI OFFICIAL DESIGN TOKENS
 * Style: Soft Neumorphism (#E0E0E0 / #E7ECE7 / #F4F7F2) + Dark Emerald Accents (#17382D) + Editorial Craft
 */

export const TOKENS = {
  colors: {
    // 🌿 Base & Surfaces (Level 1 & 2)
    bgMain: '#E7ECE7',
    bgAlt: '#EEF2ED',
    bgLight: '#F4F7F2',
    surface: '#E8EDE8',
    surfaceElevated: '#EDF1EC',
    surfaceGlass: 'rgba(232, 237, 232, 0.75)',
    surfaceGlassElevated: 'rgba(237, 241, 236, 0.90)',
    surfaceInset: '#DEE4DE',

    // 🖋️ Editorial Typography & Contrast
    textMain: '#16231D',
    textSecondary: '#5A6E63',
    textMuted: '#84968C',
    textInverse: '#F8FAF7',

    // 🌲 Dark Emerald & Sage Accents (Level 3)
    emeraldDark: '#17382D',
    emeraldDeep: '#102B22',
    greenPrimary: '#5F8F67',
    greenSoft: '#AFC8AD',
    highlight: '#DCE9D5',
    accentCyan: '#2E8B7B',
    white: '#FFFFFF',
    borderLight: 'rgba(255, 255, 255, 0.75)',
    borderSubtle: 'rgba(22, 35, 29, 0.08)',
    danger: '#B91C1C',
    warning: '#B45309',
    success: '#15803D',
  },

  radii: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '22px',
    xl: '28px',
    hero: '32px',
    pill: '9999px',
  },

  shadows: {
    // 🛋️ LEVEL 1: Superficie & Glass
    surface: 'none',
    glass: '0 12px 36px rgba(20, 40, 30, 0.08)',
    glassHover: '0 16px 44px rgba(20, 40, 30, 0.12)',

    // 🛋️ LEVEL 2: Cards & Paneles Neumórficos
    card: '8px 8px 18px rgba(90, 110, 95, 0.14), -6px -6px 16px rgba(255, 255, 255, 0.88)',
    cardHover: '10px 10px 22px rgba(90, 110, 95, 0.18), -8px -8px 20px rgba(255, 255, 255, 0.98)',
    cardSubtle: '5px 5px 12px rgba(90, 110, 95, 0.10), -4px -4px 10px rgba(255, 255, 255, 0.80)',

    // 🛋️ LEVEL 3: Botones & Acciones Interactivas
    btnConvex: '5px 6px 14px rgba(90, 110, 95, 0.16), -4px -4px 10px rgba(255, 255, 255, 0.92)',
    btnPrimary: '0 10px 24px rgba(23, 56, 45, 0.24), inset 0 2px 4px rgba(255, 255, 255, 0.25)',
    btnPressed: 'inset 3px 3px 6px rgba(90, 110, 95, 0.20), inset -3px -3px 6px rgba(255, 255, 255, 0.85)',
    inset: 'inset 4px 4px 8px rgba(90, 110, 95, 0.16), inset -4px -4px 8px rgba(255, 255, 255, 0.85)',
  },

  typography: {
    display: {
      fontSize: 'clamp(2rem, 5vw, 2.75rem)',
      fontWeight: 800,
      letterSpacing: '-0.03em',
      lineHeight: 1.15,
    },
    h1: {
      fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.25rem',
      fontWeight: 700,
      letterSpacing: '-0.015em',
      lineHeight: 1.25,
    },
    h3: {
      fontSize: '1.05rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    body: {
      fontSize: '0.95rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    small: {
      fontSize: '0.82rem',
      fontWeight: 500,
      lineHeight: 1.45,
    },
    caption: {
      fontSize: '0.72rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      lineHeight: 1.3,
    },
    button: {
      fontSize: '0.88rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
      lineHeight: 1,
    },
  },

  motion: {
    ease: 'cubic-bezier(0.23, 1, 0.32, 1)',
    easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
    easeInOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
    easeDrawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
    press: '160ms',
    fast: '160ms',
    normal: '220ms',
    modal: '260ms',
  },
} as const;

export type DesignTokens = typeof TOKENS;
