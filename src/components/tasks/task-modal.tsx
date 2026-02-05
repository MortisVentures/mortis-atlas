"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cross2Icon,
  PlusIcon,
  TrashIcon,
  CalendarIcon,
  PersonIcon,
  FileTextIcon,
  CheckIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Task,
  TaskPriority,
  TaskType,
  priorityConfig,
  taskTypeConfig,
} from "./task-card";

// =============================================================================
// SAMPLE DATA FOR SELECTORS
// =============================================================================

// In production, users/companies/deals will be fetched from the API
const SAMPLE_USERS: { id: string; name: string }[] = [];
const SAMPLE_COMPANIES: { id: string; name: string }[] = [];
const SAMPLE_DEALS: { id: string; name: string; companyId: string }[] = [];

// =============================================================================
// TYPES
// =============================================================================

interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  taskType: TaskType;
  dueDate: string;
  assigneeId: string;
  companyId: string;
  dealId: string;
  subtasks: { id: string; title: string; completed: boolean }[];
  notes: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task;
  defaultCompanyId?: string;
  defaultDealId?: string;
}

// =============================================================================
// TASK MODAL COMPONENT
// =============================================================================

export function TaskModal({
  isOpen,
  onClose,
  onSave,
  task,
  defaultCompanyId,
  defaultDealId,
}: TaskModalProps) {
  const isEditing = !!task;

  const [formData, setFormData] = React.useState<TaskFormData>({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "MEDIUM",
    taskType: task?.taskType || "FOLLOW_UP",
    dueDate: task?.dueDate?.split("T")[0] || new Date().toISOString().split("T")[0],
    assigneeId: task?.assigneeId || "u1",
    companyId: task?.companyId || defaultCompanyId || "",
    dealId: task?.dealId || defaultDealId || "",
    subtasks: task?.subtasks || [],
    notes: task?.notes || "",
  });

  const [newSubtask, setNewSubtask] = React.useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = React.useState(false);
  const [companySearch, setCompanySearch] = React.useState("");

  // Reset form when modal opens/closes or task changes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        title: task?.title || "",
        description: task?.description || "",
        priority: task?.priority || "MEDIUM",
        taskType: task?.taskType || "FOLLOW_UP",
        dueDate: task?.dueDate?.split("T")[0] || new Date().toISOString().split("T")[0],
        assigneeId: task?.assigneeId || "u1",
        companyId: task?.companyId || defaultCompanyId || "",
        dealId: task?.dealId || defaultDealId || "",
        subtasks: task?.subtasks || [],
        notes: task?.notes || "",
      });
    }
  }, [isOpen, task, defaultCompanyId, defaultDealId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const assignee = SAMPLE_USERS.find((u) => u.id === formData.assigneeId);
    const company = SAMPLE_COMPANIES.find((c) => c.id === formData.companyId);
    const deal = SAMPLE_DEALS.find((d) => d.id === formData.dealId);

    onSave({
      id: task?.id || `task-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      taskType: formData.taskType,
      dueDate: new Date(formData.dueDate).toISOString(),
      status: task?.status || "PENDING",
      assigneeId: formData.assigneeId,
      assigneeName: assignee?.name || "",
      companyId: formData.companyId || undefined,
      companyName: company?.name,
      dealId: formData.dealId || undefined,
      dealName: deal?.name,
      subtasks: formData.subtasks,
      notes: formData.notes || undefined,
      createdAt: task?.createdAt || new Date().toISOString(),
      createdById: task?.createdById || "u1",
      createdByName: task?.createdByName || "Current User",
    });
    onClose();
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setFormData((prev) => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        { id: `subtask-${Date.now()}`, title: newSubtask.trim(), completed: false },
      ],
    }));
    setNewSubtask("");
  };

  const removeSubtask = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((s) => s.id !== id),
    }));
  };

  const filteredCompanies = SAMPLE_COMPANIES.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  const filteredDeals = SAMPLE_DEALS.filter((d) =>
    !formData.companyId || d.companyId === formData.companyId
  );

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
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[85vh] bg-card border border-border rounded-atlas-lg shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold">
                {isEditing ? "Edit Task" : "Create New Task"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-atlas-sm transition-colors"
              >
                <Cross2Icon className="size-4" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="What needs to be done?"
                    required
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Add more details..."
                    rows={3}
                    className="w-full bg-background border border-input rounded-atlas-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500 resize-none"
                  />
                </div>

                {/* Priority & Type Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <div className="flex gap-2">
                      {(["HIGH", "MEDIUM", "LOW"] as TaskPriority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                          className={cn(
                            "flex-1 py-2 text-xs font-medium rounded-atlas-sm border transition-all",
                            formData.priority === p
                              ? priorityConfig[p].color
                              : "border-border text-muted-foreground hover:border-muted-foreground"
                          )}
                        >
                          {priorityConfig[p].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Task Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <div className="relative">
                      <select
                        value={formData.taskType}
                        onChange={(e) => setFormData((prev) => ({ ...prev, taskType: e.target.value as TaskType }))}
                        className="w-full appearance-none bg-background border border-input rounded-atlas-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500"
                      >
                        {Object.entries(taskTypeConfig).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Due Date & Assignee Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Due Date</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full bg-background border border-input rounded-atlas-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500"
                      />
                    </div>
                  </div>

                  {/* Assignee */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Assignee</label>
                    <div className="relative">
                      <PersonIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <select
                        value={formData.assigneeId}
                        onChange={(e) => setFormData((prev) => ({ ...prev, assigneeId: e.target.value }))}
                        className="w-full appearance-none bg-background border border-input rounded-atlas-md pl-10 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500"
                      >
                        {SAMPLE_USERS.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Company & Deal Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Company */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Company</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                        className="w-full flex items-center justify-between bg-background border border-input rounded-atlas-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500"
                      >
                        <span className={formData.companyId ? "text-foreground" : "text-muted-foreground"}>
                          {SAMPLE_COMPANIES.find((c) => c.id === formData.companyId)?.name || "Select company..."}
                        </span>
                        <ChevronDownIcon className="size-4 text-muted-foreground" />
                      </button>

                      <AnimatePresence>
                        {showCompanyDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-atlas-md shadow-lg z-10 overflow-hidden"
                          >
                            <div className="p-2 border-b border-border">
                              <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <input
                                  type="text"
                                  value={companySearch}
                                  onChange={(e) => setCompanySearch(e.target.value)}
                                  placeholder="Search companies..."
                                  className="w-full bg-muted/50 rounded pl-8 pr-3 py-1.5 text-sm focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, companyId: "", dealId: "" }));
                                  setShowCompanyDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
                              >
                                No company
                              </button>
                              {filteredCompanies.map((company) => (
                                <button
                                  key={company.id}
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({ ...prev, companyId: company.id, dealId: "" }));
                                    setShowCompanyDropdown(false);
                                    setCompanySearch("");
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                >
                                  <span className="w-6 h-6 rounded bg-gradient-to-br from-navy-500 to-tactical-500 flex items-center justify-center text-white text-xs font-bold">
                                    {company.name[0]}
                                  </span>
                                  {company.name}
                                  {formData.companyId === company.id && (
                                    <CheckIcon className="ml-auto size-4 text-tactical-400" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Deal */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Deal</label>
                    <div className="relative">
                      <FileTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <select
                        value={formData.dealId}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dealId: e.target.value }))}
                        disabled={!formData.companyId}
                        className="w-full appearance-none bg-background border border-input rounded-atlas-md pl-10 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">No deal</option>
                        {filteredDeals.map((deal) => (
                          <option key={deal.id} value={deal.id}>
                            {deal.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Subtasks */}
                <div>
                  <label className="block text-sm font-medium mb-2">Subtasks</label>
                  <div className="space-y-2">
                    {formData.subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="flex items-center gap-2 bg-muted/30 rounded-atlas-sm px-3 py-2"
                      >
                        <div className="w-4 h-4 rounded border border-border flex-shrink-0" />
                        <span className="flex-1 text-sm">{subtask.title}</span>
                        <button
                          type="button"
                          onClick={() => removeSubtask(subtask.id)}
                          className="p-1 hover:bg-red-500/10 hover:text-red-400 rounded transition-colors"
                        >
                          <TrashIcon className="size-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Add Subtask */}
                    <div className="flex items-center gap-2">
                      <Input
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        placeholder="Add a subtask..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSubtask();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addSubtask}
                        disabled={!newSubtask.trim()}
                      >
                        <PlusIcon className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes or context..."
                    rows={2}
                    className="w-full bg-background border border-input rounded-atlas-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500 resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!formData.title.trim()}>
                  {isEditing ? "Save Changes" : "Create Task"}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// QUICK TASK INPUT COMPONENT (for inline task creation)
// =============================================================================

interface QuickTaskInputProps {
  onSubmit: (title: string, companyId?: string) => void;
  placeholder?: string;
  className?: string;
}

export function QuickTaskInput({ onSubmit, placeholder = "Add a quick task...", className }: QuickTaskInputProps) {
  const [value, setValue] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <motion.div
        animate={{
          borderColor: isFocused ? "var(--tactical-500)" : "var(--border)",
        }}
        className="flex items-center gap-2 border rounded-atlas-md px-3 py-2 bg-card"
      >
        <PlusIcon className={cn("size-4 transition-colors", isFocused ? "text-tactical-500" : "text-muted-foreground")} />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
        />
        <AnimatePresence>
          {value && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button type="submit" size="sm" className="h-6 px-2 text-xs">
                Add
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </form>
  );
}

