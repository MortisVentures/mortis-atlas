"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// =============================================================================
// CARD VARIANTS (Neumorphic Design System)
// =============================================================================

const cardVariants = cva(
  // Base styles
  [
    "relative",
    "bg-card",
    "text-card-foreground",
    "transition-all",
    "duration-base",
  ],
  {
    variants: {
      variant: {
        flat: [
          "border",
          "border-border",
          "shadow-sm",
        ],
        raised: [
          // Light mode neumorphic raised
          "shadow-neu-raised",
          "hover:shadow-neu-raised-hover",
          // Dark mode with glow
          "dark:shadow-neu-dark-raised",
          "dark:hover:shadow-neu-dark-raised-hover",
        ],
        pressed: [
          // Inset shadow effect
          "shadow-neu-pressed",
          "dark:shadow-neu-dark-pressed",
        ],
        subtle: [
          // Subtle neumorphic
          "shadow-neu-subtle",
          "dark:shadow-neu-dark-subtle",
        ],
        glass: [
          // Glassmorphism variant
          "backdrop-blur-lg",
          "bg-card/80",
          "border",
          "border-border/30",
          "shadow-lg",
        ],
        glow: [
          // Glowing card (dark mode optimized)
          "shadow-neu-dark-raised",
          "hover:shadow-neu-dark-glow-navy",
          "dark:hover:shadow-neu-dark-glow-navy",
        ],
        "glow-tactical": [
          // Tactical green glow
          "shadow-neu-dark-raised",
          "hover:shadow-neu-dark-glow-green",
          "dark:hover:shadow-neu-dark-glow-green",
        ],
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-atlas-sm",
        md: "rounded-atlas-md",
        lg: "rounded-atlas-lg",
        xl: "rounded-atlas-xl",
        full: "rounded-full",
      },
      interactive: {
        true: [
          "cursor-pointer",
          "hover:scale-[1.01]",
          "active:scale-[0.99]",
          "active:shadow-neu-pressed",
          "dark:active:shadow-neu-dark-pressed",
        ],
        false: "",
      },
    },
    defaultVariants: {
      variant: "raised",
      padding: "none",
      rounded: "md",
      interactive: false,
    },
  }
);

// =============================================================================
// CARD COMPONENT
// =============================================================================

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, rounded, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, padding, rounded, interactive }),
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

// =============================================================================
// CARD HEADER
// =============================================================================

const cardHeaderVariants = cva(
  ["flex", "flex-col", "space-y-1.5"],
  {
    variants: {
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      },
      withBorder: {
        true: "border-b border-border pb-4",
        false: "",
      },
      layout: {
        default: "",
        row: "flex-row items-center justify-between space-y-0",
        centered: "items-center text-center",
      },
    },
    defaultVariants: {
      padding: "lg",
      withBorder: false,
      layout: "default",
    },
  }
);

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  (
    {
      className,
      padding,
      withBorder,
      layout,
      icon,
      badge,
      action,
      children,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ padding, withBorder, layout }), className)}
      {...props}
    >
      {icon || badge || action ? (
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                {icon}
              </div>
            )}
            <div className="flex-1 space-y-1.5">{children}</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {badge}
            {action}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  )
);
CardHeader.displayName = "CardHeader";

// =============================================================================
// CARD TITLE
// =============================================================================

const cardTitleVariants = cva(
  [
    "font-display",
    "font-semibold",
    "leading-none",
    "tracking-tight",
    "text-foreground",
  ],
  {
    variants: {
      size: {
        sm: "text-base",
        md: "text-lg",
        lg: "text-xl",
        xl: "text-2xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof cardTitleVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span";
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size, as: Component = "h3", ...props }, ref) => (
    <Component
      ref={ref as React.Ref<HTMLHeadingElement>}
      className={cn(cardTitleVariants({ size }), className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

// =============================================================================
// CARD DESCRIPTION
// =============================================================================

const cardDescriptionVariants = cva(["text-muted-foreground"], {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof cardDescriptionVariants> {}

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, size, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(cardDescriptionVariants({ size }), className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// =============================================================================
// CARD CONTENT
// =============================================================================

const cardContentVariants = cva([], {
  variants: {
    padding: {
      none: "p-0",
      sm: "p-3 pt-0",
      md: "p-4 pt-0",
      lg: "p-6 pt-0",
    },
    noPaddingTop: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      padding: "sm",
      noPaddingTop: false,
      className: "p-3",
    },
    {
      padding: "md",
      noPaddingTop: false,
      className: "p-4",
    },
    {
      padding: "lg",
      noPaddingTop: false,
      className: "p-6",
    },
  ],
  defaultVariants: {
    padding: "lg",
    noPaddingTop: true,
  },
});

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding, noPaddingTop, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ padding, noPaddingTop }), className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

// =============================================================================
// CARD FOOTER
// =============================================================================

const cardFooterVariants = cva(["flex", "items-center"], {
  variants: {
    padding: {
      none: "p-0",
      sm: "p-3 pt-0",
      md: "p-4 pt-0",
      lg: "p-6 pt-0",
    },
    withBorder: {
      true: "border-t border-border pt-4 mt-4",
      false: "",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
  },
  defaultVariants: {
    padding: "lg",
    withBorder: false,
    justify: "start",
  },
});

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {
  metadata?: React.ReactNode;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, padding, withBorder, justify, metadata, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardFooterVariants({ padding, withBorder, justify }), className)}
      {...props}
    >
      {metadata ? (
        <>
          <div className="flex-1">{children}</div>
          <div className="flex-shrink-0 text-sm text-muted-foreground">
            {metadata}
          </div>
        </>
      ) : (
        children
      )}
    </div>
  )
);
CardFooter.displayName = "CardFooter";

// =============================================================================
// CARD METRIC (Bonus - for VC dashboard metrics)
// =============================================================================

export interface CardMetricProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  change?: {
    value: string | number;
    trend: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
}

const CardMetric = React.forwardRef<HTMLDivElement, CardMetricProps>(
  ({ className, value, label, change, icon, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      <div className="flex items-center justify-between">
        <span className="metric-label">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="metric-value">{value}</span>
        {change && (
          <span
            className={cn(
              "text-sm font-medium",
              change.trend === "up" && "text-tactical-500",
              change.trend === "down" && "text-danger-base",
              change.trend === "neutral" && "text-muted-foreground"
            )}
          >
            {change.trend === "up" && "↑"}
            {change.trend === "down" && "↓"}
            {change.value}
          </span>
        )}
      </div>
    </div>
  )
);
CardMetric.displayName = "CardMetric";

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardMetric,
  // Export variants for external use
  cardVariants,
  cardHeaderVariants,
  cardTitleVariants,
  cardDescriptionVariants,
  cardContentVariants,
  cardFooterVariants,
};
