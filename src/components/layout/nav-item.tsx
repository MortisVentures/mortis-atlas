"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  HomeIcon,
  BackpackIcon,
  PersonIcon,
  RocketIcon,
  BarChartIcon,
  ActivityLogIcon,
  DashboardIcon,
} from "@radix-ui/react-icons";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// =============================================================================
// ICONS MAP
// =============================================================================

export const navIcons = {
  dashboard: DashboardIcon,
  companies: BackpackIcon,
  contacts: PersonIcon,
  deals: RocketIcon,
  portfolio: HomeIcon,
  activities: ActivityLogIcon,
  analytics: BarChartIcon,
} as const;

export type NavIconKey = keyof typeof navIcons;

// =============================================================================
// NAV ITEM VARIANTS
// =============================================================================

const navItemVariants = cva(
  [
    "group",
    "relative",
    "flex",
    "items-center",
    "gap-3",
    "w-full",
    "rounded-atlas-sm",
    "transition-all",
    "duration-fast",
    "cursor-pointer",
    "select-none",
  ],
  {
    variants: {
      size: {
        sm: "h-9 px-2.5 text-sm",
        md: "h-10 px-3 text-sm",
        lg: "h-11 px-3.5 text-base",
      },
      state: {
        default: [
          "text-muted-foreground",
          "hover:text-foreground",
          "hover:bg-muted/50",
          // Neumorphic hover
          "hover:shadow-neu-subtle",
          "dark:hover:shadow-neu-dark-subtle",
        ],
        active: [
          "text-tactical-500",
          "bg-tactical-500/10",
          "dark:bg-tactical-500/15",
        ],
        disabled: [
          "text-muted-foreground/50",
          "pointer-events-none",
          "opacity-50",
        ],
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  }
);

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const itemAnimationVariants = {
  hidden: {
    opacity: 0,
    x: -8,
  },
  visible: (delay: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: delay * 0.05,
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  }),
  hover: {
    scale: 1.02,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
  tap: {
    scale: 0.98,
  },
};

const labelAnimationVariants = {
  hidden: {
    opacity: 0,
    width: 0,
    marginLeft: 0,
  },
  visible: {
    opacity: 1,
    width: "auto",
    marginLeft: 12,
    transition: {
      opacity: { duration: 0.2, delay: 0.1 },
      width: { duration: 0.2 },
      marginLeft: { duration: 0.15 },
    },
  },
  exit: {
    opacity: 0,
    width: 0,
    marginLeft: 0,
    transition: {
      opacity: { duration: 0.1 },
      width: { duration: 0.15 },
      marginLeft: { duration: 0.1 },
    },
  },
};

const activeIndicatorVariants = {
  hidden: {
    scaleY: 0,
    opacity: 0,
  },
  visible: {
    scaleY: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

const badgeAnimationVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 500,
      damping: 25,
      delay: 0.1,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.1 },
  },
};

// =============================================================================
// TOOLTIP CONTENT
// =============================================================================

interface NavTooltipProps {
  label: string;
  badge?: number | string;
  children: React.ReactNode;
  disabled?: boolean;
}

function NavTooltip({ label, badge, children, disabled }: NavTooltipProps) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <Tooltip.Provider delayDuration={100}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            sideOffset={12}
            className={cn(
              "z-tooltip",
              "px-3 py-2",
              "rounded-atlas-sm",
              "bg-popover",
              "text-popover-foreground",
              "text-sm font-medium",
              "shadow-lg",
              "border border-border",
              // Animation
              "animate-in fade-in-0 zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "data-[side=right]:slide-in-from-left-2"
            )}
          >
            <div className="flex items-center gap-2">
              <span>{label}</span>
              {badge !== undefined && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-tactical-500/20 text-tactical-500 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <Tooltip.Arrow className="fill-popover" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

// =============================================================================
// NAV ITEM COMPONENT
// =============================================================================

export interface NavItemProps extends VariantProps<typeof navItemVariants> {
  /** Navigation label */
  label: string;
  /** Navigation href */
  href: string;
  /** Icon component or icon key */
  icon: React.ReactNode | NavIconKey;
  /** Badge count/text */
  badge?: number | string;
  /** Whether the sidebar is expanded */
  isExpanded?: boolean;
  /** Disable the navigation item */
  disabled?: boolean;
  /** Animation delay index for stagger */
  index?: number;
  /** Group identifier for future grouping */
  group?: string;
  /** Callback when item is clicked */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

export const NavItem = React.forwardRef<HTMLAnchorElement, NavItemProps>(
  (
    {
      label,
      href,
      icon,
      badge,
      isExpanded = true,
      disabled = false,
      index = 0,
      group,
      size,
      onClick,
      className,
    },
    ref
  ) => {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    // Resolve icon
    const IconComponent =
      typeof icon === "string" && icon in navIcons
        ? navIcons[icon as NavIconKey]
        : null;

    const iconElement = IconComponent ? (
      <IconComponent className="size-5" />
    ) : (
      icon
    );

    const state = disabled ? "disabled" : isActive ? "active" : "default";

    const content = (
      <motion.div
        className={cn(navItemVariants({ size, state }), className)}
        data-group={group}
        data-active={isActive}
        custom={index}
        variants={itemAnimationVariants}
        initial="hidden"
        animate="visible"
        whileHover={!disabled ? "hover" : undefined}
        whileTap={!disabled ? "tap" : undefined}
      >
        {/* Active indicator bar */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-tactical-500 rounded-r-full origin-center"
              variants={activeIndicatorVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              layoutId="navActiveIndicator"
            />
          )}
        </AnimatePresence>

        {/* Icon container */}
        <span
          className={cn(
            "relative flex-shrink-0 flex items-center justify-center",
            "transition-transform duration-fast",
            "group-hover:scale-110",
            isActive && "text-tactical-500"
          )}
        >
          {iconElement}

          {/* Icon glow effect on hover */}
          <motion.span
            className="absolute inset-0 rounded-full blur-md pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{
              opacity: 0.4,
              backgroundColor: isActive
                ? "rgba(16, 185, 129, 0.4)"
                : "rgba(59, 130, 246, 0.3)",
            }}
          />

          {/* Badge dot when collapsed */}
          {!isExpanded && badge !== undefined && (
            <motion.span
              className="absolute -top-1 -right-1 size-2 bg-tactical-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            />
          )}
        </span>

        {/* Label */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.span
              className="flex-1 text-left font-medium whitespace-nowrap overflow-hidden"
              variants={labelAnimationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Badge (when expanded) */}
        <AnimatePresence>
          {isExpanded && badge !== undefined && (
            <motion.span
              className={cn(
                "flex-shrink-0",
                "px-2 py-0.5",
                "text-xs font-semibold",
                "rounded-full",
                isActive
                  ? "bg-tactical-500/20 text-tactical-500"
                  : "bg-muted text-muted-foreground"
              )}
              variants={badgeAnimationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {typeof badge === "number" && badge > 99 ? "99+" : badge}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    );

    // Wrap with tooltip when collapsed
    const wrappedContent = !isExpanded ? (
      <NavTooltip label={label} badge={badge} disabled={disabled}>
        {content}
      </NavTooltip>
    ) : (
      content
    );

    if (disabled) {
      return <div className="w-full">{wrappedContent}</div>;
    }

    return (
      <Link ref={ref} href={href} onClick={onClick} className="block w-full">
        {wrappedContent}
      </Link>
    );
  }
);
NavItem.displayName = "NavItem";

// =============================================================================
// NAV GROUP COMPONENT (for future Phase 3)
// =============================================================================

export interface NavGroupProps {
  /** Group identifier */
  id: string;
  /** Group label (shown when expanded) */
  label?: string;
  /** Navigation items in this group */
  items: Omit<NavItemProps, "group" | "isExpanded">[];
  /** Whether the sidebar is expanded */
  isExpanded?: boolean;
  /** Whether the group is collapsed */
  isGroupCollapsed?: boolean;
  /** Callback when group header is clicked */
  onToggle?: () => void;
  /** Start index for stagger animation */
  startIndex?: number;
  /** Additional className */
  className?: string;
}

export function NavGroup({
  id,
  label,
  items,
  isExpanded = true,
  isGroupCollapsed = false,
  onToggle,
  startIndex = 0,
  className,
}: NavGroupProps) {
  return (
    <div className={cn("w-full", className)} data-nav-group={id}>
      {/* Group header */}
      {label && isExpanded && (
        <motion.button
          type="button"
          onClick={onToggle}
          className={cn(
            "w-full flex items-center justify-between",
            "px-3 py-2 mb-1",
            "text-[10px] font-semibold uppercase tracking-widest",
            "text-muted-foreground",
            "hover:text-foreground",
            "transition-colors duration-fast",
            onToggle && "cursor-pointer"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: startIndex * 0.05 }}
        >
          <span>{label}</span>
          {onToggle && (
            <motion.span
              animate={{ rotate: isGroupCollapsed ? -90 : 0 }}
              transition={{ duration: 0.2 }}
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.span>
          )}
        </motion.button>
      )}

      {/* Group items */}
      <AnimatePresence>
        {!isGroupCollapsed && (
          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {items.map((item, index) => (
              <NavItem
                key={item.href}
                {...item}
                group={id}
                isExpanded={isExpanded}
                index={startIndex + index + (label ? 1 : 0)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// PREDEFINED NAVIGATION CONFIG
// =============================================================================

export const defaultNavItems: NavItemProps[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
  },
  {
    label: "Companies",
    href: "/companies",
    icon: "companies",
  },
  {
    label: "Contacts",
    href: "/contacts",
    icon: "contacts",
  },
  {
    label: "Deals",
    href: "/deals",
    icon: "deals",
    badge: 12,
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: "portfolio",
  },
  {
    label: "Activities",
    href: "/activities",
    icon: "activities",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: "analytics",
  },
];

// =============================================================================
// EXPORTS
// =============================================================================

export { navItemVariants };
