/**
 * Mortis Atlas Design Token System
 * ================================
 * Brand: Deep Navy + Metallic Silver + Tactical Green
 * Style: Neumorphic cards with polished animations
 */

// =============================================================================
// COLOR TOKENS
// =============================================================================

export const colors = {
  // ---------------------------------------------------------------------------
  // Primary Colors
  // ---------------------------------------------------------------------------

  /** Deep Navy - Primary brand color */
  navy: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#0F172A',
  },

  /** Metallic Silver - Accent color for sophistication */
  silver: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
    // Metallic variants with slight blue tint
    metallic: {
      light: '#E8EDF5',
      base: '#94A3B8',
      dark: '#475569',
      shine: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 50%, #E2E8F0 100%)',
    },
  },

  /** Tactical Green - Action and success states */
  tactical: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
  },

  // ---------------------------------------------------------------------------
  // Semantic Colors
  // ---------------------------------------------------------------------------

  semantic: {
    success: {
      light: '#ECFDF5',
      base: '#10B981',
      dark: '#047857',
    },
    danger: {
      light: '#FEF2F2',
      base: '#DC2626',
      dark: '#991B1B',
    },
    warning: {
      light: '#FFFBEB',
      base: '#F59E0B',
      dark: '#B45309',
    },
    info: {
      light: '#ECFEFF',
      base: '#06B6D4',
      dark: '#0E7490',
    },
  },

  // ---------------------------------------------------------------------------
  // Deal Pipeline Stage Colors
  // ---------------------------------------------------------------------------

  stages: {
    // Sourcing & Early
    identified: { bg: '#EFF6FF', text: '#1E40AF', border: '#93C5FD' },
    researching: { bg: '#F0F9FF', text: '#0369A1', border: '#7DD3FC' },

    // Outreach
    outreachPending: { bg: '#FDF4FF', text: '#86198F', border: '#E879F9' },
    outreachActive: { bg: '#FAF5FF', text: '#7C3AED', border: '#C4B5FD' },

    // Engagement
    introMeeting: { bg: '#ECFEFF', text: '#0E7490', border: '#67E8F9' },
    deepDive: { bg: '#F0FDFA', text: '#0F766E', border: '#5EEAD4' },

    // Due Diligence
    dueDiligence: { bg: '#FFFBEB', text: '#B45309', border: '#FCD34D' },
    termSheet: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },

    // Closing
    negotiation: { bg: '#FFF7ED', text: '#C2410C', border: '#FDBA74' },
    legal: { bg: '#FFEDD5', text: '#9A3412', border: '#FB923C' },

    // Final States
    closed: { bg: '#ECFDF5', text: '#047857', border: '#6EE7B7' },
    portfolio: { bg: '#D1FAE5', text: '#065F46', border: '#34D399' },

    // Negative States
    passed: { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' },
    lost: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
    dormant: { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' },
  },

  // ---------------------------------------------------------------------------
  // Theme Colors (Light/Dark Mode)
  // ---------------------------------------------------------------------------

  light: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9',
      elevated: '#FFFFFF',
    },
    surface: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9',
      hover: '#F1F5F9',
      active: '#E2E8F0',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      tertiary: '#64748B',
      muted: '#94A3B8',
      inverse: '#FFFFFF',
    },
    border: {
      primary: '#E2E8F0',
      secondary: '#CBD5E1',
      focus: '#3B82F6',
    },
  },

  dark: {
    background: {
      primary: '#0F172A',
      secondary: '#1E293B',
      tertiary: '#334155',
      elevated: '#1E293B',
    },
    surface: {
      primary: '#1E293B',
      secondary: '#334155',
      tertiary: '#475569',
      hover: '#334155',
      active: '#475569',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      tertiary: '#94A3B8',
      muted: '#64748B',
      inverse: '#0F172A',
    },
    border: {
      primary: '#334155',
      secondary: '#475569',
      focus: '#60A5FA',
    },
  },
} as const;

// =============================================================================
// TYPOGRAPHY TOKENS
// =============================================================================

export const typography = {
  // ---------------------------------------------------------------------------
  // Font Families
  // ---------------------------------------------------------------------------

  fontFamily: {
    display: ['Inter Display', 'Inter', 'system-ui', 'sans-serif'],
    body: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },

  // ---------------------------------------------------------------------------
  // Font Sizes
  // ---------------------------------------------------------------------------

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
  },

  // ---------------------------------------------------------------------------
  // Font Weights
  // ---------------------------------------------------------------------------

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // ---------------------------------------------------------------------------
  // Line Heights
  // ---------------------------------------------------------------------------

  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // ---------------------------------------------------------------------------
  // Letter Spacing
  // ---------------------------------------------------------------------------

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// =============================================================================
// SPACING TOKENS (4px base unit)
// =============================================================================

export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const;

// =============================================================================
// BORDER RADIUS TOKENS
// =============================================================================

export const borderRadius = {
  none: '0px',
  sm: '6px',      // Inputs, small elements
  DEFAULT: '8px', // Default radius
  md: '12px',     // Cards, containers
  lg: '16px',     // Modals, large cards
  xl: '24px',     // Hero elements, feature cards
  '2xl': '32px',  // Extra large elements
  '3xl': '48px',  // Decorative elements
  full: '9999px', // Avatars, pills, badges
} as const;

// =============================================================================
// SHADOW TOKENS (Neumorphic Design)
// =============================================================================

export const shadows = {
  // ---------------------------------------------------------------------------
  // Standard Shadows
  // ---------------------------------------------------------------------------

  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

  // ---------------------------------------------------------------------------
  // Neumorphic Shadows - Light Mode
  // ---------------------------------------------------------------------------

  neumorphic: {
    light: {
      // Raised card effect
      raised: '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.8)',
      raisedHover: '12px 12px 24px rgba(0, 0, 0, 0.12), -12px -12px 24px rgba(255, 255, 255, 0.9)',

      // Pressed/inset effect
      pressed: 'inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.8)',
      pressedDeep: 'inset 4px 4px 8px rgba(0, 0, 0, 0.15), inset -4px -4px 8px rgba(255, 255, 255, 0.9)',

      // Subtle card
      subtle: '4px 4px 8px rgba(0, 0, 0, 0.08), -4px -4px 8px rgba(255, 255, 255, 0.6)',

      // Combined inner/outer
      combined: '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.8), inset 1px 1px 2px rgba(255, 255, 255, 0.5)',

      // Focus ring
      focus: '0 0 0 3px rgba(59, 130, 246, 0.3), 8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.8)',
    },

    // ---------------------------------------------------------------------------
    // Neumorphic Shadows - Dark Mode
    // ---------------------------------------------------------------------------

    dark: {
      // Raised card effect with subtle glow
      raised: '8px 8px 16px rgba(0, 0, 0, 0.5), -8px -8px 16px rgba(255, 255, 255, 0.03), 0 0 20px rgba(59, 130, 246, 0.05)',
      raisedHover: '12px 12px 24px rgba(0, 0, 0, 0.6), -12px -12px 24px rgba(255, 255, 255, 0.05), 0 0 30px rgba(59, 130, 246, 0.1)',

      // Pressed/inset effect
      pressed: 'inset 2px 2px 5px rgba(0, 0, 0, 0.3), inset -2px -2px 5px rgba(255, 255, 255, 0.02)',
      pressedDeep: 'inset 4px 4px 8px rgba(0, 0, 0, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.03)',

      // Subtle card
      subtle: '4px 4px 8px rgba(0, 0, 0, 0.4), -4px -4px 8px rgba(255, 255, 255, 0.02)',

      // Combined inner/outer with glow
      combined: '8px 8px 16px rgba(0, 0, 0, 0.5), -8px -8px 16px rgba(255, 255, 255, 0.03), inset 1px 1px 2px rgba(255, 255, 255, 0.05), 0 0 20px rgba(59, 130, 246, 0.05)',

      // Focus ring with glow
      focus: '0 0 0 3px rgba(96, 165, 250, 0.4), 8px 8px 16px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.15)',

      // Tactical green glow (for success/active states)
      glowGreen: '0 0 20px rgba(16, 185, 129, 0.2), 8px 8px 16px rgba(0, 0, 0, 0.5)',

      // Navy accent glow
      glowNavy: '0 0 20px rgba(59, 130, 246, 0.15), 8px 8px 16px rgba(0, 0, 0, 0.5)',
    },
  },
} as const;

// =============================================================================
// ANIMATION TOKENS
// =============================================================================

export const animation = {
  // ---------------------------------------------------------------------------
  // Durations
  // ---------------------------------------------------------------------------

  duration: {
    instant: '0ms',
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
    slower: '500ms',
    slowest: '700ms',
  },

  // ---------------------------------------------------------------------------
  // Timing Functions (Easings)
  // ---------------------------------------------------------------------------

  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // Spring-like physics
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    springGentle: 'cubic-bezier(0.25, 1, 0.5, 1)',
    springBouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

    // Smooth deceleration
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  },

  // ---------------------------------------------------------------------------
  // Predefined Animations
  // ---------------------------------------------------------------------------

  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    fadeOut: {
      from: { opacity: '1' },
      to: { opacity: '0' },
    },
    slideInUp: {
      from: { transform: 'translateY(10px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    slideInDown: {
      from: { transform: 'translateY(-10px)', opacity: '0' },
      to: { transform: 'translateY(0)', opacity: '1' },
    },
    slideInLeft: {
      from: { transform: 'translateX(-10px)', opacity: '0' },
      to: { transform: 'translateX(0)', opacity: '1' },
    },
    slideInRight: {
      from: { transform: 'translateX(10px)', opacity: '0' },
      to: { transform: 'translateX(0)', opacity: '1' },
    },
    scaleIn: {
      from: { transform: 'scale(0.95)', opacity: '0' },
      to: { transform: 'scale(1)', opacity: '1' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    // Neumorphic press animation
    neumorphicPress: {
      '0%': { boxShadow: '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.8)' },
      '100%': { boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.8)' },
    },
  },

  // ---------------------------------------------------------------------------
  // Animation Presets (combine duration + easing)
  // ---------------------------------------------------------------------------

  presets: {
    fadeIn: 'fadeIn 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    fadeOut: 'fadeOut 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slideUp: 'slideInUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    slideDown: 'slideInDown 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    scaleIn: 'scaleIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    shimmer: 'shimmer 2s linear infinite',
    spin: 'spin 1s linear infinite',
  },
} as const;

// =============================================================================
// BREAKPOINT TOKENS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Media query helpers
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  dark: '@media (prefers-color-scheme: dark)',
  light: '@media (prefers-color-scheme: light)',
  motion: '@media (prefers-reduced-motion: no-preference)',
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
} as const;

// =============================================================================
// Z-INDEX TOKENS
// =============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
  tooltip: 1700,
  max: 9999,
} as const;

// =============================================================================
// TAILWIND THEME EXTENSION
// =============================================================================

export const tailwindThemeExtension = {
  colors: {
    navy: colors.navy,
    silver: colors.silver,
    tactical: colors.tactical,
    success: colors.semantic.success,
    danger: colors.semantic.danger,
    warning: colors.semantic.warning,
    info: colors.semantic.info,
  },
  fontFamily: {
    display: typography.fontFamily.display,
    body: typography.fontFamily.body,
    mono: typography.fontFamily.mono,
  },
  fontSize: typography.fontSize,
  fontWeight: typography.fontWeight,
  lineHeight: typography.lineHeight,
  letterSpacing: typography.letterSpacing,
  spacing: spacing,
  borderRadius: borderRadius,
  boxShadow: {
    ...shadows,
    'neu-raised': shadows.neumorphic.light.raised,
    'neu-raised-hover': shadows.neumorphic.light.raisedHover,
    'neu-pressed': shadows.neumorphic.light.pressed,
    'neu-subtle': shadows.neumorphic.light.subtle,
    'neu-dark-raised': shadows.neumorphic.dark.raised,
    'neu-dark-raised-hover': shadows.neumorphic.dark.raisedHover,
    'neu-dark-pressed': shadows.neumorphic.dark.pressed,
    'neu-dark-glow': shadows.neumorphic.dark.glowNavy,
  },
  transitionDuration: animation.duration,
  transitionTimingFunction: animation.easing,
  keyframes: animation.keyframes,
  animation: animation.presets,
  screens: breakpoints,
  zIndex: zIndex,
} as const;

// =============================================================================
// CSS CUSTOM PROPERTIES GENERATOR
// =============================================================================

export function generateCSSVariables(mode: 'light' | 'dark' = 'light'): Record<string, string> {
  const theme = mode === 'light' ? colors.light : colors.dark;

  return {
    // Background
    '--background-primary': theme.background.primary,
    '--background-secondary': theme.background.secondary,
    '--background-tertiary': theme.background.tertiary,
    '--background-elevated': theme.background.elevated,

    // Surface
    '--surface-primary': theme.surface.primary,
    '--surface-secondary': theme.surface.secondary,
    '--surface-tertiary': theme.surface.tertiary,
    '--surface-hover': theme.surface.hover,
    '--surface-active': theme.surface.active,

    // Text
    '--text-primary': theme.text.primary,
    '--text-secondary': theme.text.secondary,
    '--text-tertiary': theme.text.tertiary,
    '--text-muted': theme.text.muted,
    '--text-inverse': theme.text.inverse,

    // Border
    '--border-primary': theme.border.primary,
    '--border-secondary': theme.border.secondary,
    '--border-focus': theme.border.focus,

    // Brand colors
    '--color-navy': colors.navy[600],
    '--color-silver': colors.silver.metallic.base,
    '--color-tactical': colors.tactical[500],

    // Semantic colors
    '--color-success': colors.semantic.success.base,
    '--color-danger': colors.semantic.danger.base,
    '--color-warning': colors.semantic.warning.base,
    '--color-info': colors.semantic.info.base,

    // Neumorphic shadows
    '--shadow-neu-raised': mode === 'light'
      ? shadows.neumorphic.light.raised
      : shadows.neumorphic.dark.raised,
    '--shadow-neu-pressed': mode === 'light'
      ? shadows.neumorphic.light.pressed
      : shadows.neumorphic.dark.pressed,
  };
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ColorToken = typeof colors;
export type TypographyToken = typeof typography;
export type SpacingToken = typeof spacing;
export type BorderRadiusToken = typeof borderRadius;
export type ShadowToken = typeof shadows;
export type AnimationToken = typeof animation;
export type BreakpointToken = typeof breakpoints;
export type ZIndexToken = typeof zIndex;

export type StageKey = keyof typeof colors.stages;
export type SemanticColorKey = keyof typeof colors.semantic;

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  mediaQueries,
  zIndex,
  tailwindThemeExtension,
  generateCSSVariables,
} as const;

export default tokens;
