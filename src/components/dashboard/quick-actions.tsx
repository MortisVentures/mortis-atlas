"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  PlusIcon,
  PersonIcon,
  CalendarIcon,
  BarChartIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

// =============================================================================
// TYPES
// =============================================================================

export type QuickActionType =
  | "add-company"
  | "add-contact"
  | "schedule-meeting"
  | "generate-report"
  | "review-memos";

export interface QuickAction {
  id: QuickActionType;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
  href?: string;
  onClick?: () => void;
  color: "navy" | "silver" | "tactical" | "amber";
}

export interface QuickActionsProps {
  actions?: QuickAction[];
  onActionClick?: (action: QuickAction) => void;
  className?: string;
}

// =============================================================================
// COLOR CONFIG
// =============================================================================

const colorConfig = {
  navy: {
    icon: "text-navy-400",
    bg: "bg-navy-500/10",
    border: "border-navy-500/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(30,58,138,0.3)]",
    hoverBg: "group-hover:bg-navy-500/15",
  },
  silver: {
    icon: "text-silver-400",
    bg: "bg-silver-500/10",
    border: "border-silver-500/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(148,163,184,0.3)]",
    hoverBg: "group-hover:bg-silver-500/15",
  },
  tactical: {
    icon: "text-tactical-500",
    bg: "bg-tactical-500/10",
    border: "border-tactical-500/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]",
    hoverBg: "group-hover:bg-tactical-500/15",
  },
  amber: {
    icon: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    hoverBg: "group-hover:bg-amber-500/15",
  },
};

// =============================================================================
// DEFAULT ACTIONS
// =============================================================================

const defaultActions: QuickAction[] = [
  {
    id: "add-company",
    label: "Add Company",
    icon: <PlusIcon className="size-6" />,
    shortcut: "⌘ N",
    href: "/companies/new",
    color: "navy",
  },
  {
    id: "add-contact",
    label: "Add Contact",
    icon: <PersonIcon className="size-6" />,
    shortcut: "⌘ P",
    href: "/contacts/new",
    color: "silver",
  },
  {
    id: "schedule-meeting",
    label: "Schedule Meeting",
    icon: <CalendarIcon className="size-6" />,
    shortcut: "⌘ M",
    color: "tactical",
  },
  {
    id: "generate-report",
    label: "Generate Report",
    icon: <BarChartIcon className="size-6" />,
    shortcut: "⌘ R",
    color: "silver",
  },
  {
    id: "review-memos",
    label: "Review IC Memos",
    icon: <FileTextIcon className="size-6" />,
    shortcut: "⌘ I",
    href: "/memos",
    color: "amber",
  },
];

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  },
};

// =============================================================================
// QUICK ACTION CARD
// =============================================================================

interface QuickActionCardProps {
  action: QuickAction;
  onClick?: () => void;
}

function QuickActionCard({ action, onClick }: QuickActionCardProps) {
  const router = useRouter();
  const colors = colorConfig[action.color];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      router.push(action.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <motion.div variants={cardVariants}>
      <Card
        variant="raised"
        className={cn(
          "group relative p-6 cursor-pointer",
          "flex flex-col items-center justify-center gap-3",
          "transition-all duration-300 ease-out",
          "hover:scale-[1.02] hover:-translate-y-1",
          colors.glow
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={action.label}
      >
        {/* Icon Container */}
        <div
          className={cn(
            "flex items-center justify-center",
            "size-14 rounded-full border",
            "transition-all duration-300",
            colors.bg,
            colors.border,
            colors.icon,
            colors.hoverBg,
            "group-hover:scale-110"
          )}
        >
          {action.icon}
        </div>

        {/* Label */}
        <span className="text-sm font-medium text-foreground text-center">
          {action.label}
        </span>

        {/* Keyboard Shortcut */}
        <span
          className={cn(
            "px-2 py-0.5 rounded text-xs font-mono",
            "bg-muted/50 text-muted-foreground",
            "transition-all duration-300",
            "group-hover:bg-muted group-hover:text-foreground"
          )}
        >
          {action.shortcut}
        </span>

        {/* Hover glow effect overlay */}
        <div
          className={cn(
            "absolute inset-0 rounded-atlas-md opacity-0",
            "transition-opacity duration-300",
            "group-hover:opacity-100",
            "pointer-events-none",
            action.color === "navy" && "bg-gradient-to-t from-navy-500/5 to-transparent",
            action.color === "silver" && "bg-gradient-to-t from-silver-500/5 to-transparent",
            action.color === "tactical" && "bg-gradient-to-t from-tactical-500/5 to-transparent",
            action.color === "amber" && "bg-gradient-to-t from-amber-500/5 to-transparent"
          )}
        />
      </Card>
    </motion.div>
  );
}

// =============================================================================
// QUICK ACTIONS GRID
// =============================================================================

export function QuickActions({
  actions = defaultActions,
  onActionClick,
  className,
}: QuickActionsProps) {
  // Keyboard shortcut handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if meta/ctrl key is pressed
      if (!e.metaKey && !e.ctrlKey) return;

      const key = e.key.toLowerCase();
      const action = actions.find((a) => {
        // Extract the key from shortcut (e.g., "⌘ N" -> "n")
        const shortcutKey = a.shortcut.split(" ").pop()?.toLowerCase();
        return shortcutKey === key;
      });

      if (action) {
        e.preventDefault();
        if (onActionClick) {
          onActionClick(action);
        } else if (action.onClick) {
          action.onClick();
        } else if (action.href) {
          window.location.href = action.href;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actions, onActionClick]);

  return (
    <motion.div
      className={cn(
        "grid gap-4",
        "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {actions.map((action) => (
        <QuickActionCard
          key={action.id}
          action={action}
          onClick={onActionClick ? () => onActionClick(action) : undefined}
        />
      ))}
    </motion.div>
  );
}

// =============================================================================
// QUICK ACTIONS SKELETON
// =============================================================================

export function QuickActionsSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <Card key={i} variant="raised" className="p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="size-14 bg-muted rounded-full" />
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-5 w-12 bg-muted rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}

// =============================================================================
// COMPACT QUICK ACTIONS (for sidebar)
// =============================================================================

export interface CompactQuickActionsProps {
  actions?: QuickAction[];
  onActionClick?: (action: QuickAction) => void;
  className?: string;
}

export function CompactQuickActions({
  actions = defaultActions.slice(0, 4),
  onActionClick,
  className,
}: CompactQuickActionsProps) {
  const router = useRouter();

  const handleClick = (action: QuickAction) => {
    if (onActionClick) {
      onActionClick(action);
    } else if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      router.push(action.href);
    }
  };

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {actions.map((action) => {
        const colors = colorConfig[action.color];
        return (
          <button
            key={action.id}
            onClick={() => handleClick(action)}
            className={cn(
              "group flex flex-col items-center gap-2 p-3 rounded-atlas-sm",
              "bg-muted/30 border border-border/50",
              "transition-all duration-200",
              "hover:bg-muted/50 hover:border-border",
              "hover:scale-[1.02]",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center",
                "size-8 rounded-full",
                colors.bg,
                colors.icon,
                "transition-transform duration-200",
                "group-hover:scale-110"
              )}
            >
              {React.cloneElement(action.icon as React.ReactElement, {
                className: "size-4",
              })}
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// FLOATING QUICK ACTION BUTTON
// =============================================================================

export interface FloatingActionButtonProps {
  action?: QuickAction;
  onClick?: () => void;
  className?: string;
}

export function FloatingActionButton({
  action = defaultActions[0],
  onClick,
  className,
}: FloatingActionButtonProps) {
  const router = useRouter();
  const colors = colorConfig[action.color];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      router.push(action.href);
    }
  };

  return (
    <motion.button
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center justify-center",
        "size-14 rounded-full",
        "bg-navy-600 text-white",
        "shadow-lg shadow-navy-500/30",
        "transition-all duration-300",
        "hover:bg-navy-500 hover:shadow-xl hover:shadow-navy-500/40",
        "hover:scale-110",
        "focus:outline-none focus:ring-2 focus:ring-navy-400 focus:ring-offset-2",
        className
      )}
      onClick={handleClick}
      whileHover={{ rotate: 90 }}
      whileTap={{ scale: 0.95 }}
      aria-label={action.label}
    >
      <PlusIcon className="size-6" />
    </motion.button>
  );
}

// =============================================================================
// QUICK ACTIONS WITH HEADER
// =============================================================================

export interface QuickActionsSectionProps extends QuickActionsProps {
  title?: string;
  description?: string;
}

export function QuickActionsSection({
  title = "Quick Actions",
  description,
  ...props
}: QuickActionsSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <QuickActions {...props} />
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  QuickActionCard,
  defaultActions,
  colorConfig,
};

export default QuickActions;
