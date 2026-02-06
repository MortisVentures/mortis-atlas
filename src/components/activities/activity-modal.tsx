"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cross2Icon,
  CalendarIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { ActivityType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ACTIVITY_TYPE_CONFIG } from "@/lib/activities";

// =============================================================================
// TYPES
// =============================================================================

interface ActivityFormData {
  type: ActivityType;
  subject: string;
  description: string;
  activityDate: string;
  dueDate: string;
  companyId: string;
  dealId: string;
  contactId: string;
}

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ActivityFormData) => Promise<void>;
  defaultCompanyId?: string;
  defaultCompanyName?: string;
  defaultDealId?: string;
  defaultDealName?: string;
  defaultContactId?: string;
  defaultContactName?: string;
  defaultType?: ActivityType;
}

// =============================================================================
// ACTIVITY MODAL COMPONENT
// =============================================================================

export function ActivityModal({
  isOpen,
  onClose,
  onSave,
  defaultCompanyId = "",
  defaultCompanyName = "",
  defaultDealId = "",
  defaultDealName = "",
  defaultContactId = "",
  defaultContactName = "",
  defaultType = "NOTE",
}: ActivityModalProps) {
  const [formData, setFormData] = React.useState<ActivityFormData>({
    type: defaultType,
    subject: "",
    description: "",
    activityDate: new Date().toISOString().slice(0, 16),
    dueDate: "",
    companyId: defaultCompanyId,
    dealId: defaultDealId,
    contactId: defaultContactId,
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        type: defaultType,
        subject: "",
        description: "",
        activityDate: new Date().toISOString().slice(0, 16),
        dueDate: "",
        companyId: defaultCompanyId,
        dealId: defaultDealId,
        contactId: defaultContactId,
      });
      setError(null);
    }
  }, [isOpen, defaultType, defaultCompanyId, defaultDealId, defaultContactId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save activity");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMeetingType = formData.type === "MEETING";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[550px] md:max-h-[85vh] bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                {isMeetingType ? "Schedule Meeting" : "Log Activity"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <Cross2Icon className="size-4" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">
                {/* Activity Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Activity Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(ACTIVITY_TYPE_CONFIG) as ActivityType[]).map((type) => {
                      const config = ACTIVITY_TYPE_CONFIG[type];
                      // Skip DEAL_UPDATE as it's typically system-generated
                      if (type === "DEAL_UPDATE") return null;

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, type }))
                          }
                          className={cn(
                            "py-2 px-3 text-xs font-medium rounded-md border transition-all text-center",
                            formData.type === type
                              ? config.color
                              : "border-border text-muted-foreground hover:border-muted-foreground"
                          )}
                        >
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    placeholder={
                      isMeetingType
                        ? "e.g., Initial partner call with CEO"
                        : "e.g., Sent pitch deck follow-up"
                    }
                    required
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Add notes or details..."
                    rows={3}
                    className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                {/* Date/Time Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Activity Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {isMeetingType ? "Meeting Date/Time" : "Date/Time"}
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="datetime-local"
                        value={formData.activityDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            activityDate: e.target.value,
                          }))
                        }
                        className="w-full bg-background border border-input rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  {/* Due Date (for tasks/follow-ups) */}
                  {(formData.type === "TASK" || formData.type === "EMAIL") && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Due Date
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          type="datetime-local"
                          value={formData.dueDate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              dueDate: e.target.value,
                            }))
                          }
                          className="w-full bg-background border border-input rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                  )}

                  {/* Meeting Duration (for meetings) */}
                  {isMeetingType && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Duration
                      </label>
                      <div className="relative">
                        <select
                          className="w-full appearance-none bg-background border border-input rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="30">30 minutes</option>
                          <option value="60" selected>1 hour</option>
                          <option value="90">1.5 hours</option>
                          <option value="120">2 hours</option>
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Context info (read-only) */}
                {(defaultCompanyName || defaultDealName || defaultContactName) && (
                  <div className="p-3 bg-muted/30 rounded-md space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Associated with
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {defaultCompanyName && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs">
                          Company: {defaultCompanyName}
                        </span>
                      )}
                      {defaultDealName && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs">
                          Deal: {defaultDealName}
                        </span>
                      )}
                      {defaultContactName && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs">
                          Contact: {defaultContactName}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.subject.trim() || isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : isMeetingType
                      ? "Schedule Meeting"
                      : "Log Activity"}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export type { ActivityFormData, ActivityModalProps };
