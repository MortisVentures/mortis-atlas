import type { Config } from "tailwindcss";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  zIndex,
} from "./src/lib/design/tokens";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // Tremor charts
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  // Safelist for dynamic classes (Tremor, stage colors, etc.)
  safelist: [
    // Tremor chart colors
    {
      pattern:
        /^(bg|text|border|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)$/,
      variants: ["hover", "focus", "dark"],
    },
    // Mortis Atlas brand colors
    {
      pattern: /^(bg|text|border)-(navy|silver|tactical)-(50|100|200|300|400|500|600|700|800|900|950)$/,
      variants: ["hover", "focus", "dark"],
    },
    // Stage colors
    {
      pattern: /^(bg|text|border)-stage-/,
    },
    // Neumorphic shadows
    {
      pattern: /^shadow-neu/,
      variants: ["hover", "focus", "active", "dark"],
    },
  ],
  theme: {
    // Override screens with our breakpoints
    screens: { ...breakpoints },

    extend: {
      // =======================================================================
      // COLORS - Mortis Atlas Design System + shadcn/ui compatibility
      // =======================================================================
      colors: {
        // shadcn/ui CSS variable colors (keep for compatibility)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },

        // Mortis Atlas brand colors
        navy: { ...colors.navy },
        silver: { ...colors.silver },
        tactical: { ...colors.tactical },

        // Semantic colors
        success: { ...colors.semantic.success },
        danger: { ...colors.semantic.danger },
        warning: { ...colors.semantic.warning },
        info: { ...colors.semantic.info },

        // Deal pipeline stage colors
        stage: { ...colors.stages },
      },

      // =======================================================================
      // TYPOGRAPHY
      // =======================================================================
      fontFamily: {
        display: ["var(--font-display)", ...typography.fontFamily.display],
        body: ["var(--font-body)", ...typography.fontFamily.body],
        mono: ["var(--font-mono)", ...typography.fontFamily.mono],
        // Aliases for convenience
        sans: ["var(--font-body)", ...typography.fontFamily.body],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
      },
      fontWeight: { ...typography.fontWeight },
      lineHeight: { ...typography.lineHeight },
      letterSpacing: { ...typography.letterSpacing },

      // =======================================================================
      // SPACING
      // =======================================================================
      spacing: { ...spacing },

      // =======================================================================
      // BORDER RADIUS
      // =======================================================================
      borderRadius: {
        // shadcn/ui CSS variable radius (keep for compatibility)
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Mortis Atlas explicit values
        none: borderRadius.none,
        "atlas-sm": borderRadius.sm,
        "atlas-md": borderRadius.md,
        "atlas-lg": borderRadius.lg,
        "atlas-xl": borderRadius.xl,
        "atlas-2xl": borderRadius["2xl"],
        "atlas-3xl": borderRadius["3xl"],
        full: borderRadius.full,
      },

      // =======================================================================
      // BOX SHADOWS - Including Neumorphic Shadows
      // =======================================================================
      boxShadow: {
        // Standard shadows
        none: shadows.none,
        sm: shadows.sm,
        DEFAULT: shadows.DEFAULT,
        md: shadows.md,
        lg: shadows.lg,
        xl: shadows.xl,
        "2xl": shadows["2xl"],
        inner: shadows.inner,

        // Neumorphic shadows - Light mode
        "neu-raised": shadows.neumorphic.light.raised,
        "neu-raised-hover": shadows.neumorphic.light.raisedHover,
        "neu-pressed": shadows.neumorphic.light.pressed,
        "neu-pressed-deep": shadows.neumorphic.light.pressedDeep,
        "neu-subtle": shadows.neumorphic.light.subtle,
        "neu-combined": shadows.neumorphic.light.combined,
        "neu-focus": shadows.neumorphic.light.focus,

        // Neumorphic shadows - Dark mode (use with dark: prefix)
        "neu-dark-raised": shadows.neumorphic.dark.raised,
        "neu-dark-raised-hover": shadows.neumorphic.dark.raisedHover,
        "neu-dark-pressed": shadows.neumorphic.dark.pressed,
        "neu-dark-pressed-deep": shadows.neumorphic.dark.pressedDeep,
        "neu-dark-subtle": shadows.neumorphic.dark.subtle,
        "neu-dark-combined": shadows.neumorphic.dark.combined,
        "neu-dark-focus": shadows.neumorphic.dark.focus,
        "neu-dark-glow-green": shadows.neumorphic.dark.glowGreen,
        "neu-dark-glow-navy": shadows.neumorphic.dark.glowNavy,
      },

      // =======================================================================
      // ANIMATIONS
      // =======================================================================
      transitionDuration: { ...animation.duration },
      transitionTimingFunction: { ...animation.easing },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeOut: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        slideInUp: {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        slideInDown: {
          from: { transform: "translateY(-10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        slideInLeft: {
          from: { transform: "translateX(-10px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          from: { transform: "translateX(10px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        scaleIn: {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        // Mortis Atlas animations
        "fade-in": "fadeIn 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        "fade-out": "fadeOut 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up": "slideInUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-down": "slideInDown 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        "scale-in": "scaleIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        shimmer: "shimmer 2s linear infinite",
        spin: "spin 1s linear infinite",
        // Tailwind animate plugin compatibility
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },

      // =======================================================================
      // Z-INDEX
      // =======================================================================
      zIndex: {
        hide: "-1",
        base: "0",
        dropdown: "1000",
        sticky: "1100",
        banner: "1200",
        overlay: "1300",
        modal: "1400",
        popover: "1500",
        toast: "1600",
        tooltip: "1700",
        max: "9999",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
