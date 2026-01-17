"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// =============================================================================
// BADGE VARIANTS
// =============================================================================

const badgeVariants = cva(
  // Base styles
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-1.5",
    "font-medium",
    "transition-all",
    "duration-base",
    "whitespace-nowrap",
    "border",
  ],
  {
    variants: {
      variant: {
        // Default variants
        default: [
          "border-transparent",
          "bg-primary",
          "text-primary-foreground",
        ],
        secondary: [
          "border-transparent",
          "bg-secondary",
          "text-secondary-foreground",
        ],
        outline: [
          "border-border",
          "bg-transparent",
          "text-foreground",
        ],
        ghost: [
          "border-transparent",
          "bg-muted",
          "text-muted-foreground",
        ],

        // Semantic variants
        success: [
          "border-transparent",
          "bg-tactical-500/10",
          "text-tactical-600",
          "dark:bg-tactical-500/20",
          "dark:text-tactical-400",
        ],
        warning: [
          "border-transparent",
          "bg-warning-light",
          "text-warning-dark",
          "dark:bg-amber-500/20",
          "dark:text-amber-400",
        ],
        danger: [
          "border-transparent",
          "bg-danger-light",
          "text-danger-dark",
          "dark:bg-red-500/20",
          "dark:text-red-400",
        ],
        destructive: [
          "border-transparent",
          "bg-danger-light",
          "text-danger-dark",
          "dark:bg-red-500/20",
          "dark:text-red-400",
        ],
        info: [
          "border-transparent",
          "bg-info-light",
          "text-info-dark",
          "dark:bg-cyan-500/20",
          "dark:text-cyan-400",
        ],

        // Pipeline Stage Variants
        identified: [
          "border-stage-identified-border",
          "bg-stage-identified-bg",
          "text-stage-identified-text",
        ],
        researching: [
          "border-stage-researching-border",
          "bg-stage-researching-bg",
          "text-stage-researching-text",
        ],
        outreachPending: [
          "border-stage-outreachPending-border",
          "bg-stage-outreachPending-bg",
          "text-stage-outreachPending-text",
        ],
        outreachActive: [
          "border-stage-outreachActive-border",
          "bg-stage-outreachActive-bg",
          "text-stage-outreachActive-text",
        ],
        introMeeting: [
          "border-stage-introMeeting-border",
          "bg-stage-introMeeting-bg",
          "text-stage-introMeeting-text",
        ],
        deepDive: [
          "border-stage-deepDive-border",
          "bg-stage-deepDive-bg",
          "text-stage-deepDive-text",
        ],
        dueDiligence: [
          "border-stage-dueDiligence-border",
          "bg-stage-dueDiligence-bg",
          "text-stage-dueDiligence-text",
        ],
        termSheet: [
          "border-stage-termSheet-border",
          "bg-stage-termSheet-bg",
          "text-stage-termSheet-text",
        ],
        negotiation: [
          "border-stage-negotiation-border",
          "bg-stage-negotiation-bg",
          "text-stage-negotiation-text",
        ],
        legal: [
          "border-stage-legal-border",
          "bg-stage-legal-bg",
          "text-stage-legal-text",
        ],
        closed: [
          "border-stage-closed-border",
          "bg-stage-closed-bg",
          "text-stage-closed-text",
        ],
        portfolio: [
          "border-stage-portfolio-border",
          "bg-stage-portfolio-bg",
          "text-stage-portfolio-text",
        ],
        passed: [
          "border-stage-passed-border",
          "bg-stage-passed-bg",
          "text-stage-passed-text",
        ],
        lost: [
          "border-stage-lost-border",
          "bg-stage-lost-bg",
          "text-stage-lost-text",
        ],
        dormant: [
          "border-stage-dormant-border",
          "bg-stage-dormant-bg",
          "text-stage-dormant-text",
        ],

        // Brand variants
        navy: [
          "border-transparent",
          "bg-navy-500/10",
          "text-navy-600",
          "dark:bg-navy-500/20",
          "dark:text-navy-400",
        ],
        tactical: [
          "border-transparent",
          "bg-tactical-500/10",
          "text-tactical-600",
          "dark:bg-tactical-500/20",
          "dark:text-tactical-400",
        ],
      },

      size: {
        xs: "h-5 px-1.5 text-[10px] rounded-md [&_svg]:size-2.5",
        sm: "h-6 px-2 text-xs rounded-md [&_svg]:size-3",
        md: "h-7 px-2.5 text-xs rounded-lg [&_svg]:size-3.5",
        lg: "h-8 px-3 text-sm rounded-lg [&_svg]:size-4",
      },

      shape: {
        default: "",
        pill: "rounded-full",
      },

      interactive: {
        true: "cursor-pointer hover:opacity-80 active:scale-95",
        false: "",
      },
    },
    compoundVariants: [
      // Pills should always have full rounding regardless of size
      {
        shape: "pill",
        size: "xs",
        className: "rounded-full px-2",
      },
      {
        shape: "pill",
        size: "sm",
        className: "rounded-full px-2.5",
      },
      {
        shape: "pill",
        size: "md",
        className: "rounded-full px-3",
      },
      {
        shape: "pill",
        size: "lg",
        className: "rounded-full px-4",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "sm",
      shape: "pill",
      interactive: false,
    },
  }
);

// =============================================================================
// BADGE COMPONENT
// =============================================================================

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Icon to display on the left */
  icon?: React.ReactNode;
  /** Icon to display on the right */
  rightIcon?: React.ReactNode;
  /** Show animated pulse effect */
  pulse?: boolean;
  /** Disable animations */
  disableAnimation?: boolean;
  /** Make the badge removable (shows X button) */
  removable?: boolean;
  /** Callback when remove button is clicked */
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      interactive,
      icon,
      rightIcon,
      pulse = false,
      disableAnimation = false,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    const badgeContent = (
      <>
        {/* Pulse indicator */}
        {pulse && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
          </span>
        )}

        {/* Left icon */}
        {icon && <span className="inline-flex shrink-0">{icon}</span>}

        {/* Content */}
        {children}

        {/* Right icon */}
        {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}

        {/* Remove button */}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="ml-0.5 -mr-1 inline-flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors"
            aria-label="Remove"
          >
            <svg
              className="size-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </>
    );

    // Animated badge
    if (!disableAnimation && (interactive || pulse)) {
      return (
        <motion.span
          ref={ref}
          className={cn(badgeVariants({ variant, size, shape, interactive }), className)}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={interactive ? { scale: 1.05 } : undefined}
          whileTap={interactive ? { scale: 0.95 } : undefined}
          transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
        >
          {badgeContent}
        </motion.span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, shape, interactive }), className)}
        {...props}
      >
        {badgeContent}
      </span>
    );
  }
);
Badge.displayName = "Badge";

// =============================================================================
// STAGE BADGE COMPONENT (Convenience wrapper)
// =============================================================================

/** Map of human-readable stage names to badge variants */
export const stageVariantMap = {
  // Sourcing
  IDENTIFIED: "identified",
  RESEARCHING: "researching",
  // Outreach
  OUTREACH_PENDING: "outreachPending",
  OUTREACH_ACTIVE: "outreachActive",
  // Engagement
  INTRO_MEETING: "introMeeting",
  DEEP_DIVE: "deepDive",
  // Due Diligence
  DUE_DILIGENCE: "dueDiligence",
  TERM_SHEET: "termSheet",
  // Closing
  NEGOTIATION: "negotiation",
  LEGAL: "legal",
  // Final
  CLOSED: "closed",
  PORTFOLIO: "portfolio",
  // Negative
  PASSED: "passed",
  LOST: "lost",
  DORMANT: "dormant",
} as const;

export type StageKey = keyof typeof stageVariantMap;

/** Human-readable labels for stages */
export const stageLabels: Record<StageKey, string> = {
  IDENTIFIED: "Identified",
  RESEARCHING: "Researching",
  OUTREACH_PENDING: "Outreach Pending",
  OUTREACH_ACTIVE: "Outreach Active",
  INTRO_MEETING: "Intro Meeting",
  DEEP_DIVE: "Deep Dive",
  DUE_DILIGENCE: "Due Diligence",
  TERM_SHEET: "Term Sheet",
  NEGOTIATION: "Negotiation",
  LEGAL: "Legal Review",
  CLOSED: "Closed",
  PORTFOLIO: "Portfolio",
  PASSED: "Passed",
  LOST: "Lost",
  DORMANT: "Dormant",
};

export interface StageBadgeProps extends Omit<BadgeProps, "variant"> {
  /** The stage key */
  stage: StageKey | string;
  /** Show human-readable label */
  showLabel?: boolean;
}

const StageBadge = React.forwardRef<HTMLSpanElement, StageBadgeProps>(
  ({ stage, showLabel = true, children, ...props }, ref) => {
    const stageKey = stage as StageKey;
    const variant = stageVariantMap[stageKey] || "default";
    const label = showLabel ? stageLabels[stageKey] || stage : undefined;

    return (
      <Badge ref={ref} variant={variant as BadgeProps["variant"]} {...props}>
        {children || label}
      </Badge>
    );
  }
);
StageBadge.displayName = "StageBadge";

// =============================================================================
// BADGE GROUP COMPONENT
// =============================================================================

export interface BadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum badges to show before collapsing */
  max?: number;
  /** Size of all badges in the group */
  size?: BadgeProps["size"];
}

const BadgeGroup = React.forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ max, size, className, children, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const visibleChildren = max ? childArray.slice(0, max) : childArray;
    const hiddenCount = max ? Math.max(0, childArray.length - max) : 0;

    return (
      <div
        ref={ref}
        className={cn("inline-flex flex-wrap items-center gap-1.5", className)}
        {...props}
      >
        {visibleChildren.map((child, index) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<BadgeProps>, {
                size: size || (child.props as BadgeProps).size,
                key: index,
              })
            : child
        )}
        {hiddenCount > 0 && (
          <Badge variant="ghost" size={size}>
            +{hiddenCount}
          </Badge>
        )}
      </div>
    );
  }
);
BadgeGroup.displayName = "BadgeGroup";

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Badge,
  StageBadge,
  BadgeGroup,
  badgeVariants,
};
