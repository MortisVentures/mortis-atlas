"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRightIcon, HomeIcon } from "@radix-ui/react-icons";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const breadcrumbItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  },
};

const titleVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
      delay: 0.15,
    },
  },
};

const descriptionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: 0.25,
    },
  },
};

const actionsVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
      delay: 0.2,
    },
  },
};

// =============================================================================
// BREADCRUMB TYPES
// =============================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export type BreadcrumbInput = string | BreadcrumbItem;

// =============================================================================
// BREADCRUMBS COMPONENT
// =============================================================================

interface BreadcrumbsProps {
  items: BreadcrumbInput[];
  showHome?: boolean;
  separator?: React.ReactNode;
  className?: string;
}

function Breadcrumbs({
  items,
  showHome = true,
  separator,
  className,
}: BreadcrumbsProps) {
  // Normalize items to BreadcrumbItem format
  const normalizedItems: BreadcrumbItem[] = items.map((item, index) => {
    if (typeof item === "string") {
      // Generate href from label (lowercase, hyphenated)
      const isLast = index === items.length - 1;
      return {
        label: item,
        href: isLast ? undefined : `/${item.toLowerCase().replace(/\s+/g, "-")}`,
      };
    }
    return item;
  });

  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: "Home", href: "/dashboard", icon: <HomeIcon className="size-4" /> }, ...normalizedItems]
    : normalizedItems;

  const defaultSeparator = (
    <ChevronRightIcon className="size-4 text-muted-foreground/50 flex-shrink-0" />
  );

  return (
    <motion.nav
      aria-label="Breadcrumb"
      className={cn("flex items-center", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isFirst = index === 0;

          return (
            <motion.li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1.5"
              variants={breadcrumbItemVariants}
            >
              {/* Separator (not for first item) */}
              {!isFirst && (separator || defaultSeparator)}

              {/* Breadcrumb link or text */}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5",
                    "text-sm text-muted-foreground",
                    "hover:text-foreground",
                    "transition-colors duration-fast",
                    "rounded px-1.5 py-0.5 -mx-1.5",
                    "hover:bg-muted/50"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    "flex items-center gap-1.5",
                    "text-sm",
                    isLast
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              )}
            </motion.li>
          );
        })}
      </ol>
    </motion.nav>
  );
}

// =============================================================================
// PAGE TITLE VARIANTS
// =============================================================================

const pageTitleVariants = cva(
  [
    "font-display",
    "font-bold",
    "tracking-tight",
    "leading-tight",
  ],
  {
    variants: {
      size: {
        sm: "text-xl sm:text-2xl",
        md: "text-2xl sm:text-3xl",
        lg: "text-3xl sm:text-4xl",
        xl: "text-4xl sm:text-5xl",
      },
      gradient: {
        none: "text-foreground",
        brand: "bg-gradient-to-r from-tactical-400 via-navy-400 to-navy-600 bg-clip-text text-transparent",
        navy: "bg-gradient-to-r from-navy-400 to-navy-600 bg-clip-text text-transparent",
        tactical: "bg-gradient-to-r from-tactical-400 to-tactical-600 bg-clip-text text-transparent",
        silver: "bg-gradient-to-r from-silver-400 to-silver-600 bg-clip-text text-transparent",
        subtle: "bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent",
      },
    },
    defaultVariants: {
      size: "md",
      gradient: "none",
    },
  }
);

// =============================================================================
// PAGE HEADER COMPONENT
// =============================================================================

export interface PageHeaderProps extends VariantProps<typeof pageTitleVariants> {
  /** Breadcrumb items (strings or objects) */
  breadcrumbs?: BreadcrumbInput[];
  /** Show home icon in breadcrumbs */
  showHomeBreadcrumb?: boolean;
  /** Page title */
  title: string;
  /** Subtitle or description */
  description?: string;
  /** Action buttons/elements */
  actions?: React.ReactNode;
  /** Content below title (tags, metadata, etc.) */
  meta?: React.ReactNode;
  /** Icon to display before title */
  icon?: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Disable animations */
  disableAnimation?: boolean;
  /** Sticky header */
  sticky?: boolean;
}

export function PageHeader({
  breadcrumbs,
  showHomeBreadcrumb = true,
  title,
  description,
  actions,
  meta,
  icon,
  size,
  gradient,
  className,
  disableAnimation = false,
  sticky = false,
}: PageHeaderProps) {
  const content = (
    <>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          items={breadcrumbs}
          showHome={showHomeBreadcrumb}
          className="mb-3"
        />
      )}

      {/* Main header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left side: Title + Description */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title row */}
          <motion.div
            className="flex items-center gap-3"
            variants={disableAnimation ? undefined : titleVariants}
            initial={disableAnimation ? undefined : "hidden"}
            animate={disableAnimation ? undefined : "visible"}
          >
            {/* Icon */}
            {icon && (
              <span className="flex-shrink-0 text-muted-foreground">
                {icon}
              </span>
            )}

            {/* Title with optional gradient */}
            <h1 className={cn(pageTitleVariants({ size, gradient }))}>
              {title}
            </h1>
          </motion.div>

          {/* Description */}
          {description && (
            <motion.p
              className="text-sm sm:text-base text-muted-foreground max-w-2xl"
              variants={disableAnimation ? undefined : descriptionVariants}
              initial={disableAnimation ? undefined : "hidden"}
              animate={disableAnimation ? undefined : "visible"}
            >
              {description}
            </motion.p>
          )}

          {/* Meta content (tags, badges, etc.) */}
          {meta && (
            <motion.div
              className="flex items-center gap-2 flex-wrap pt-1"
              initial={disableAnimation ? undefined : { opacity: 0 }}
              animate={disableAnimation ? undefined : { opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {meta}
            </motion.div>
          )}
        </div>

        {/* Right side: Actions */}
        {actions && (
          <motion.div
            className="flex items-center gap-2 flex-shrink-0 sm:ml-4"
            variants={disableAnimation ? undefined : actionsVariants}
            initial={disableAnimation ? undefined : "hidden"}
            animate={disableAnimation ? undefined : "visible"}
          >
            {actions}
          </motion.div>
        )}
      </div>
    </>
  );

  return (
    <header
      className={cn(
        "pb-6",
        sticky && [
          "sticky top-0 z-sticky",
          "pt-4 -mt-4",
          "bg-gradient-to-b from-background via-background to-transparent",
          "backdrop-blur-sm",
        ],
        className
      )}
    >
      {content}
    </header>
  );
}

// =============================================================================
// PAGE HEADER SKELETON
// =============================================================================

export function PageHeaderSkeleton({
  showBreadcrumbs = true,
  showDescription = true,
  showActions = true,
}: {
  showBreadcrumbs?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
}) {
  return (
    <header className="pb-6 animate-pulse">
      {/* Breadcrumbs skeleton */}
      {showBreadcrumbs && (
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      )}

      {/* Main row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {/* Title skeleton */}
          <div className="h-8 w-64 bg-muted rounded" />
          {/* Description skeleton */}
          {showDescription && (
            <div className="h-5 w-96 bg-muted rounded" />
          )}
        </div>

        {/* Actions skeleton */}
        {showActions && (
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-muted rounded" />
            <div className="h-9 w-32 bg-muted rounded" />
          </div>
        )}
      </div>
    </header>
  );
}

// =============================================================================
// SECTION HEADER COMPONENT (for subsections)
// =============================================================================

export interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h2 className="font-display text-lg font-semibold text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export { Breadcrumbs, pageTitleVariants };
