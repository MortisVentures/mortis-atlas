"use client";

import { MeetingType } from "@prisma/client";
import { cn } from "@/lib/utils";
import { MEETING_TYPE_CONFIG } from "@/lib/integrations/calendar/types";

interface MeetingTypeBadgeProps {
  type: MeetingType | null;
  confidence?: number | null;
  showConfidence?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function MeetingTypeBadge({
  type,
  confidence,
  showConfidence = false,
  size = "md",
  className,
}: MeetingTypeBadgeProps) {
  if (!type) return null;

  const config = MEETING_TYPE_CONFIG[type];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        config.bgColor,
        config.color,
        className
      )}
    >
      {config.label}
      {showConfidence && confidence !== null && confidence !== undefined && (
        <span className="opacity-60 text-xs">
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </span>
  );
}

interface MeetingTypeSelectorProps {
  value: MeetingType | null;
  onChange: (type: MeetingType) => void;
  disabled?: boolean;
}

export function MeetingTypeSelector({
  value,
  onChange,
  disabled = false,
}: MeetingTypeSelectorProps) {
  const types = Object.entries(MEETING_TYPE_CONFIG) as [MeetingType, typeof MEETING_TYPE_CONFIG[MeetingType]][];

  return (
    <div className="flex flex-wrap gap-2">
      {types.map(([type, config]) => (
        <button
          key={type}
          type="button"
          disabled={disabled}
          onClick={() => onChange(type)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            "border border-transparent",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            value === type
              ? cn(config.bgColor, config.color, "ring-2 ring-offset-1")
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {config.label}
        </button>
      ))}
    </div>
  );
}
