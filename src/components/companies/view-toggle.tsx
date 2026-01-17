"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  TableIcon,
  DashboardIcon,
  ViewVerticalIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

export type ViewMode = "table" | "grid" | "kanban";

export interface ViewToggleProps {
  value?: ViewMode;
  defaultValue?: ViewMode;
  onChange?: (view: ViewMode) => void;
  persistKey?: string;
  className?: string;
  disabled?: boolean;
}

export interface ViewOption {
  value: ViewMode;
  label: string;
  icon: React.ReactNode;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY = "mortis-atlas-view-mode";

const viewOptions: ViewOption[] = [
  {
    value: "table",
    label: "Table View",
    icon: <TableIcon className="size-4" />,
  },
  {
    value: "grid",
    label: "Grid View",
    icon: <DashboardIcon className="size-4" />,
  },
  {
    value: "kanban",
    label: "Kanban Board",
    icon: <ViewVerticalIcon className="size-4" />,
  },
];

// =============================================================================
// HOOKS
// =============================================================================

function useViewMode(
  persistKey: string,
  defaultValue: ViewMode = "table"
): [ViewMode, (view: ViewMode) => void] {
  const [viewMode, setViewMode] = React.useState<ViewMode>(defaultValue);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(persistKey);
    if (stored && ["table", "grid", "kanban"].includes(stored)) {
      setViewMode(stored as ViewMode);
    }
    setIsInitialized(true);
  }, [persistKey]);

  // Save to localStorage on change
  const setViewModeWithPersist = React.useCallback(
    (view: ViewMode) => {
      setViewMode(view);
      if (typeof window !== "undefined") {
        localStorage.setItem(persistKey, view);
      }
    },
    [persistKey]
  );

  return [viewMode, setViewModeWithPersist];
}

export { useViewMode };

// =============================================================================
// VIEW TOGGLE BUTTON
// =============================================================================

interface ViewToggleButtonProps {
  option: ViewOption;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function ViewToggleButton({
  option,
  isActive,
  onClick,
  disabled,
}: ViewToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={option.label}
      aria-pressed={isActive}
      className={cn(
        "relative flex items-center justify-center",
        "size-9 rounded-atlas-sm",
        "transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "cursor-pointer",
        // Base styles
        !isActive && [
          "text-muted-foreground",
          "hover:text-foreground hover:bg-muted/50",
        ],
        // Active styles
        isActive && [
          "text-tactical-500",
          "bg-tactical-500/10",
        ]
      )}
    >
      {/* Active indicator glow */}
      {isActive && (
        <motion.div
          layoutId="view-toggle-glow"
          className={cn(
            "absolute inset-0 rounded-atlas-sm",
            "bg-tactical-500/10",
            "shadow-[0_0_12px_rgba(34,197,94,0.3)]",
            "border border-tactical-500/30"
          )}
          initial={false}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />
      )}

      {/* Icon */}
      <span className="relative z-10">{option.icon}</span>
    </button>
  );
}

// =============================================================================
// VIEW TOGGLE COMPONENT
// =============================================================================

export function ViewToggle({
  value,
  defaultValue = "table",
  onChange,
  persistKey = STORAGE_KEY,
  className,
  disabled = false,
}: ViewToggleProps) {
  // Use internal state with localStorage persistence if no value prop
  const [internalValue, setInternalValue] = useViewMode(persistKey, defaultValue);

  // Determine if controlled or uncontrolled
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (view: ViewMode) => {
    if (disabled) return;

    if (!isControlled) {
      setInternalValue(view);
    }

    onChange?.(view);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1",
        "bg-muted/30 rounded-atlas-md",
        "border border-border/50",
        className
      )}
      role="radiogroup"
      aria-label="View mode"
    >
      {viewOptions.map((option) => (
        <ViewToggleButton
          key={option.value}
          option={option}
          isActive={currentValue === option.value}
          onClick={() => handleChange(option.value)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

// =============================================================================
// VIEW TOGGLE WITH LABELS
// =============================================================================

export interface ViewToggleWithLabelsProps extends ViewToggleProps {
  showLabels?: boolean;
}

export function ViewToggleWithLabels({
  showLabels = true,
  ...props
}: ViewToggleWithLabelsProps) {
  const {
    value,
    defaultValue = "table",
    onChange,
    persistKey = STORAGE_KEY,
    className,
    disabled = false,
  } = props;

  const [internalValue, setInternalValue] = useViewMode(persistKey, defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (view: ViewMode) => {
    if (disabled) return;

    if (!isControlled) {
      setInternalValue(view);
    }

    onChange?.(view);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1",
        "bg-muted/30 rounded-atlas-md",
        "border border-border/50",
        className
      )}
      role="radiogroup"
      aria-label="View mode"
    >
      {viewOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleChange(option.value)}
          disabled={disabled}
          aria-label={option.label}
          aria-pressed={currentValue === option.value}
          className={cn(
            "relative flex items-center gap-2",
            "px-3 py-1.5 rounded-atlas-sm",
            "text-sm font-medium",
            "transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "cursor-pointer",
            currentValue !== option.value && [
              "text-muted-foreground",
              "hover:text-foreground hover:bg-muted/50",
            ],
            currentValue === option.value && [
              "text-tactical-500",
              "bg-tactical-500/10",
              "shadow-[0_0_12px_rgba(34,197,94,0.2)]",
              "border border-tactical-500/30",
            ]
          )}
        >
          {option.icon}
          {showLabels && <span>{option.label.replace(" View", "").replace(" Board", "")}</span>}
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// SEGMENTED VIEW TOGGLE (alternative style)
// =============================================================================

export function SegmentedViewToggle({
  value,
  defaultValue = "table",
  onChange,
  persistKey = STORAGE_KEY,
  className,
  disabled = false,
}: ViewToggleProps) {
  const [internalValue, setInternalValue] = useViewMode(persistKey, defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (view: ViewMode) => {
    if (disabled) return;

    if (!isControlled) {
      setInternalValue(view);
    }

    onChange?.(view);
  };

  const activeIndex = viewOptions.findIndex((o) => o.value === currentValue);

  return (
    <div
      className={cn(
        "relative inline-flex items-center",
        "bg-muted/50 rounded-atlas-md p-1",
        "border border-border/50",
        className
      )}
      role="radiogroup"
      aria-label="View mode"
    >
      {/* Sliding background indicator */}
      <motion.div
        className={cn(
          "absolute top-1 bottom-1 rounded-atlas-sm",
          "bg-background",
          "shadow-sm shadow-tactical-500/20",
          "border border-tactical-500/20"
        )}
        initial={false}
        animate={{
          x: activeIndex * 36 + 4,
          width: 32,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      />

      {viewOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleChange(option.value)}
          disabled={disabled}
          aria-label={option.label}
          aria-pressed={currentValue === option.value}
          className={cn(
            "relative z-10 flex items-center justify-center",
            "size-8 rounded-atlas-sm",
            "transition-colors duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "cursor-pointer",
            currentValue === option.value
              ? "text-tactical-500"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// VIEW MODE CONTEXT (for sharing state across components)
// =============================================================================

interface ViewModeContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = React.createContext<ViewModeContextValue | null>(null);

export interface ViewModeProviderProps {
  children: React.ReactNode;
  defaultValue?: ViewMode;
  persistKey?: string;
}

export function ViewModeProvider({
  children,
  defaultValue = "table",
  persistKey = STORAGE_KEY,
}: ViewModeProviderProps) {
  const [viewMode, setViewMode] = useViewMode(persistKey, defaultValue);

  const value = React.useMemo(
    () => ({ viewMode, setViewMode }),
    [viewMode, setViewMode]
  );

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewModeContext() {
  const context = React.useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewModeContext must be used within ViewModeProvider");
  }
  return context;
}

// =============================================================================
// EXPORTS
// =============================================================================

export { viewOptions, STORAGE_KEY, ViewToggleButton };

export default ViewToggle;
