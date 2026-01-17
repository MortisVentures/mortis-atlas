"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

// =============================================================================
// BUTTON VARIANTS (Neumorphic Design System)
// =============================================================================

const buttonVariants = cva(
  // Base styles
  [
    "relative",
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-2",
    "whitespace-nowrap",
    "font-medium",
    "transition-all",
    "duration-base",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-ring",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-background",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        // Primary - Navy blue with glow
        primary: [
          "bg-navy-600",
          "text-white",
          "shadow-neu-subtle",
          "hover:bg-navy-500",
          "hover:shadow-neu-raised",
          "active:shadow-neu-pressed",
          // Dark mode
          "dark:bg-navy-500",
          "dark:hover:bg-navy-400",
          "dark:shadow-neu-dark-subtle",
          "dark:hover:shadow-neu-dark-glow-navy",
          "dark:active:shadow-neu-dark-pressed",
        ],

        // Secondary - Silver/gray neumorphic
        secondary: [
          "bg-silver-100",
          "text-silver-700",
          "shadow-neu-subtle",
          "hover:bg-silver-50",
          "hover:shadow-neu-raised",
          "active:shadow-neu-pressed",
          // Dark mode
          "dark:bg-silver-800",
          "dark:text-silver-200",
          "dark:shadow-neu-dark-subtle",
          "dark:hover:shadow-neu-dark-raised",
          "dark:active:shadow-neu-dark-pressed",
        ],

        // Outline - Bordered with neumorphic hover
        outline: [
          "border-2",
          "border-navy-300",
          "bg-transparent",
          "text-navy-600",
          "hover:bg-navy-50",
          "hover:border-navy-400",
          "hover:shadow-neu-subtle",
          "active:shadow-neu-pressed",
          // Dark mode
          "dark:border-navy-600",
          "dark:text-navy-400",
          "dark:hover:bg-navy-900/50",
          "dark:hover:border-navy-500",
          "dark:active:shadow-neu-dark-pressed",
        ],

        // Ghost - Transparent with hover effect
        ghost: [
          "bg-transparent",
          "text-foreground",
          "hover:bg-muted",
          "hover:text-foreground",
          "active:bg-muted/80",
          // Dark mode
          "dark:hover:bg-muted",
          "dark:active:bg-muted/60",
        ],

        // Danger - Red with warning glow
        danger: [
          "bg-danger-base",
          "text-white",
          "shadow-neu-subtle",
          "hover:bg-red-500",
          "hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]",
          "active:shadow-neu-pressed",
          // Dark mode
          "dark:bg-red-600",
          "dark:hover:bg-red-500",
          "dark:hover:shadow-[0_0_25px_rgba(220,38,38,0.4)]",
          "dark:active:shadow-neu-dark-pressed",
        ],

        // Destructive - Alias for danger (backward compatibility)
        destructive: [
          "bg-danger-base",
          "text-white",
          "shadow-neu-subtle",
          "hover:bg-red-500",
          "hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]",
          "active:shadow-neu-pressed",
          // Dark mode
          "dark:bg-red-600",
          "dark:hover:bg-red-500",
          "dark:hover:shadow-[0_0_25px_rgba(220,38,38,0.4)]",
          "dark:active:shadow-neu-dark-pressed",
        ],

        // Success - Tactical green
        success: [
          "bg-tactical-600",
          "text-white",
          "shadow-neu-subtle",
          "hover:bg-tactical-500",
          "hover:shadow-neu-dark-glow-green",
          "active:shadow-neu-pressed",
          // Dark mode
          "dark:bg-tactical-500",
          "dark:hover:bg-tactical-400",
          "dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]",
          "dark:active:shadow-neu-dark-pressed",
        ],

        // Link - Text only
        link: [
          "bg-transparent",
          "text-navy-600",
          "underline-offset-4",
          "hover:underline",
          "hover:text-navy-500",
          // Dark mode
          "dark:text-navy-400",
          "dark:hover:text-navy-300",
        ],

        // Neumorphic - Pure neumorphic style
        neumorphic: [
          "bg-card",
          "text-foreground",
          "shadow-neu-raised",
          "hover:shadow-neu-raised-hover",
          "active:shadow-neu-pressed",
          // Dark mode
          "dark:shadow-neu-dark-raised",
          "dark:hover:shadow-neu-dark-raised-hover",
          "dark:active:shadow-neu-dark-pressed",
        ],
      },

      size: {
        xs: [
          "h-7",
          "px-2.5",
          "text-xs",
          "rounded-atlas-sm",
          "[&_svg]:size-3",
        ],
        sm: [
          "h-8",
          "px-3",
          "text-sm",
          "rounded-atlas-sm",
          "[&_svg]:size-4",
        ],
        md: [
          "h-9",
          "px-4",
          "text-sm",
          "rounded-atlas-sm",
          "[&_svg]:size-4",
        ],
        lg: [
          "h-10",
          "px-6",
          "text-base",
          "rounded-atlas-md",
          "[&_svg]:size-5",
        ],
        xl: [
          "h-12",
          "px-8",
          "text-lg",
          "rounded-atlas-md",
          "[&_svg]:size-6",
        ],
        icon: [
          "h-9",
          "w-9",
          "rounded-atlas-sm",
          "[&_svg]:size-4",
        ],
        "icon-sm": [
          "h-8",
          "w-8",
          "rounded-atlas-sm",
          "[&_svg]:size-4",
        ],
        "icon-lg": [
          "h-10",
          "w-10",
          "rounded-atlas-md",
          "[&_svg]:size-5",
        ],
      },

      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

// =============================================================================
// LOADING SPINNER
// =============================================================================

const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// =============================================================================
// FRAMER MOTION VARIANTS
// =============================================================================

const buttonMotionVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 25,
};

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof buttonVariants> {
  /** Use Slot for composition */
  asChild?: boolean;
  /** Show loading spinner */
  loading?: boolean;
  /** Loading text (replaces children when loading) */
  loadingText?: string;
  /** Icon to show on the left */
  leftIcon?: React.ReactNode;
  /** Icon to show on the right */
  rightIcon?: React.ReactNode;
  /** Children content */
  children?: React.ReactNode;
  /** Disable animations */
  disableAnimation?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      disableAnimation = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Use Slot for asChild pattern
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size, fullWidth }), className)}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    // Animated button with framer-motion
    if (!disableAnimation) {
      return (
        <motion.button
          ref={ref}
          className={cn(
            buttonVariants({ variant, size, fullWidth }),
            className
          )}
          disabled={isDisabled}
          variants={buttonMotionVariants}
          initial="initial"
          whileHover={isDisabled ? undefined : "hover"}
          whileTap={isDisabled ? undefined : "tap"}
          transition={springTransition}
          {...(props as HTMLMotionProps<"button">)}
        >
          {/* Loading state */}
          {loading && (
            <LoadingSpinner
              className={cn(
                size === "xs" && "size-3",
                size === "sm" && "size-3.5",
                size === "md" && "size-4",
                size === "lg" && "size-5",
                size === "xl" && "size-6"
              )}
            />
          )}

          {/* Left icon (hidden when loading) */}
          {!loading && leftIcon && (
            <span className="inline-flex shrink-0">{leftIcon}</span>
          )}

          {/* Content */}
          {loading && loadingText ? (
            <span>{loadingText}</span>
          ) : loading ? (
            <span className="opacity-0">{children}</span>
          ) : (
            children
          )}

          {/* Right icon (hidden when loading) */}
          {!loading && rightIcon && (
            <span className="inline-flex shrink-0">{rightIcon}</span>
          )}
        </motion.button>
      );
    }

    // Non-animated fallback
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <LoadingSpinner
            className={cn(
              size === "xs" && "size-3",
              size === "sm" && "size-3.5",
              size === "md" && "size-4",
              size === "lg" && "size-5",
              size === "xl" && "size-6"
            )}
          />
        )}
        {!loading && leftIcon && (
          <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {loading && loadingText ? (
          <span>{loadingText}</span>
        ) : loading ? (
          <span className="opacity-0">{children}</span>
        ) : (
          children
        )}
        {!loading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

// =============================================================================
// ICON BUTTON COMPONENT
// =============================================================================

export interface IconButtonProps
  extends Omit<ButtonProps, "leftIcon" | "rightIcon" | "loadingText"> {
  /** Accessible label for screen readers */
  "aria-label": string;
  /** The icon to display */
  icon: React.ReactNode;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = "icon", children, ...props }, ref) => (
    <Button ref={ref} size={size} {...props}>
      {icon}
      {children}
    </Button>
  )
);
IconButton.displayName = "IconButton";

// =============================================================================
// BUTTON GROUP COMPONENT
// =============================================================================

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Attach buttons together */
  attached?: boolean;
  /** Orientation */
  orientation?: "horizontal" | "vertical";
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    { className, attached = false, orientation = "horizontal", children, ...props },
    ref
  ) => (
    <div
      ref={ref}
      role="group"
      className={cn(
        "inline-flex",
        orientation === "vertical" ? "flex-col" : "flex-row",
        attached && orientation === "horizontal" && [
          "[&>*:not(:first-child):not(:last-child)]:rounded-none",
          "[&>*:first-child]:rounded-r-none",
          "[&>*:last-child]:rounded-l-none",
          "[&>*:not(:last-child)]:border-r-0",
        ],
        attached && orientation === "vertical" && [
          "[&>*:not(:first-child):not(:last-child)]:rounded-none",
          "[&>*:first-child]:rounded-b-none",
          "[&>*:last-child]:rounded-t-none",
          "[&>*:not(:last-child)]:border-b-0",
        ],
        !attached && "gap-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
ButtonGroup.displayName = "ButtonGroup";

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Button,
  IconButton,
  ButtonGroup,
  buttonVariants,
  LoadingSpinner,
};
