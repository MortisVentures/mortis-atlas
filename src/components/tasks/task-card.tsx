"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckIcon,
  ClockIcon,
  CalendarIcon,
  PersonIcon,
  DotsHorizontalIcon,
  Pencil1Icon,
  TrashIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  FileTextIcon,
  ExternalLinkIcon,
  ReloadIcon,
  BellIcon,
} from "@radix-ui/react-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SNOOZED";
export type TaskType =
  | "FOLLOW_UP"
  | "DD_ITEM"
  | "REFERENCE_CALL"
  | "MEETING_PREP"
  | "DOCUMENT_REVIEW"
  | "INTRO_REQUEST"
  | "IC_PREP"
  | "OTHER";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  taskType: TaskType;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  snoozedUntil?: string;

  // Assignee
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;

  // Creator
  createdById: string;
  createdByName: string;

  // Relations
  companyId?: string;
  companyName?: string;
  contactId?: string;
  contactName?: string;
  dealId?: string;
  dealName?: string;

  // Subtasks
  subtasks: SubTask[];

  // Notes
  notes?: string;

  // Documents
  documentIds?: string[];
}

// =============================================================================
// CONFIG
// =============================================================================

export const priorityConfig: Record<TaskPriority, { label: string; color: string; dotColor: string }> = {
  HIGH: { label: "High", color: "bg-red-500/20 text-red-400 border-red-500/30", dotColor: "bg-red-500" },
  MEDIUM: { label: "Medium", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", dotColor: "bg-amber-500" },
  LOW: { label: "Low", color: "bg-slate-500/20 text-slate-400 border-slate-500/30", dotColor: "bg-slate-500" },
};

export const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "text-muted-foreground" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400" },
  COMPLETED: { label: "Completed", color: "text-tactical-400" },
  SNOOZED: { label: "Snoozed", color: "text-amber-400" },
};

export const taskTypeConfig: Record<TaskType, { label: string; icon: React.ReactNode }> = {
  FOLLOW_UP: { label: "Follow-up", icon: <ReloadIcon className="size-3.5" /> },
  DD_ITEM: { label: "DD Item", icon: <FileTextIcon className="size-3.5" /> },
  REFERENCE_CALL: { label: "Reference Call", icon: <PersonIcon className="size-3.5" /> },
  MEETING_PREP: { label: "Meeting Prep", icon: <CalendarIcon className="size-3.5" /> },
  DOCUMENT_REVIEW: { label: "Doc Review", icon: <FileTextIcon className="size-3.5" /> },
  INTRO_REQUEST: { label: "Intro Request", icon: <PersonIcon className="size-3.5" /> },
  IC_PREP: { label: "IC Prep", icon: <FileTextIcon className="size-3.5" /> },
  OTHER: { label: "Other", icon: <DotsHorizontalIcon className="size-3.5" /> },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < -1) return `${Math.abs(diffInDays)} days overdue`;
  if (diffInDays === -1) return "Yesterday";
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Tomorrow";
  if (diffInDays < 7) return `In ${diffInDays} days`;
  return formatDate(dateString);
}

export function isOverdue(dueDate: string, status: TaskStatus): boolean {
  if (status === "COMPLETED" || status === "SNOOZED") return false;
  return new Date(dueDate) < new Date();
}

export function isDueToday(dueDate: string): boolean {
  const today = new Date();
  const due = new Date(dueDate);
  return (
    today.getFullYear() === due.getFullYear() &&
    today.getMonth() === due.getMonth() &&
    today.getDate() === due.getDate()
  );
}

export function isDueSoon(dueDate: string): boolean {
  const now = new Date();
  const due = new Date(dueDate);
  const diffInDays = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays >= 0 && diffInDays <= 2;
}

// =============================================================================
// TASK CARD COMPONENT
// =============================================================================

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onSnooze?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onSubtaskComplete?: (taskId: string, subtaskId: string) => void;
  variant?: "default" | "compact" | "expanded";
  showRelations?: boolean;
  draggable?: boolean;
}

export function TaskCard({
  task,
  onComplete,
  onSnooze,
  onEdit,
  onDelete,
  onSubtaskComplete,
  variant = "default",
  showRelations = true,
  draggable = false,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const [isCompleting, setIsCompleting] = React.useState(false);

  const overdue = isOverdue(task.dueDate, task.status);
  const dueToday = isDueToday(task.dueDate);
  const dueSoon = isDueSoon(task.dueDate);
  const priority = priorityConfig[task.priority];
  const taskType = taskTypeConfig[task.taskType];
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  const handleComplete = () => {
    setIsCompleting(true);
    setTimeout(() => {
      onComplete?.(task.id);
      setIsCompleting(false);
    }, 500);
  };

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center gap-3 p-3 rounded-atlas-sm transition-colors",
          task.status === "COMPLETED" ? "opacity-60" : "hover:bg-muted/30"
        )}
      >
        {/* Checkbox */}
        <button
          onClick={handleComplete}
          disabled={task.status === "COMPLETED"}
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
            task.status === "COMPLETED"
              ? "bg-tactical-500 border-tactical-500"
              : "border-border hover:border-tactical-500"
          )}
        >
          <AnimatePresence>
            {(task.status === "COMPLETED" || isCompleting) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <CheckIcon className="size-3 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className={cn("text-sm truncate", task.status === "COMPLETED" && "line-through text-muted-foreground")}>
            {task.title}
          </div>
        </div>

        {/* Due Date */}
        <span
          className={cn(
            "text-xs flex-shrink-0",
            overdue ? "text-red-400" : dueToday ? "text-amber-400" : "text-muted-foreground"
          )}
        >
          {formatRelativeDate(task.dueDate)}
        </span>

        {/* Priority Dot */}
        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", priority.dotColor)} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className={cn(
        "group relative rounded-atlas-md border transition-all",
        task.status === "COMPLETED"
          ? "bg-muted/20 border-border"
          : overdue
          ? "bg-red-500/5 border-red-500/30"
          : "bg-card border-border hover:border-muted-foreground/30 hover:shadow-md"
      )}
      draggable={draggable}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={handleComplete}
            disabled={task.status === "COMPLETED"}
            className={cn(
              "mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
              task.status === "COMPLETED"
                ? "bg-tactical-500 border-tactical-500"
                : "border-border hover:border-tactical-500 hover:bg-tactical-500/10"
            )}
          >
            <AnimatePresence>
              {(task.status === "COMPLETED" || isCompleting) && (
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <CheckIcon className="size-4 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3
                  className={cn(
                    "font-medium text-sm leading-tight",
                    task.status === "COMPLETED" && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </h3>
                {task.description && variant === "expanded" && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                )}
              </div>

              {/* Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded transition-all"
                >
                  <DotsHorizontalIcon className="size-4" />
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      className="absolute right-0 top-full mt-1 z-10 bg-card border border-border rounded-atlas-sm shadow-lg py-1 min-w-[140px]"
                      onMouseLeave={() => setShowMenu(false)}
                    >
                      <button
                        onClick={() => {
                          onEdit?.(task);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <Pencil1Icon className="size-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onSnooze?.(task.id);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <BellIcon className="size-4" />
                        Snooze
                      </button>
                      <button
                        onClick={() => {
                          onDelete?.(task.id);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <TrashIcon className="size-4" />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={priority.color} size="xs">
                {priority.label}
              </Badge>
              <Badge variant="ghost" size="xs" className="gap-1">
                {taskType.icon}
                {taskType.label}
              </Badge>
              {task.status === "SNOOZED" && (
                <Badge className="bg-amber-500/20 text-amber-400" size="xs">
                  Snoozed
                </Badge>
              )}
            </div>

            {/* Relations */}
            {showRelations && (task.companyName || task.contactName || task.dealName) && (
              <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-muted-foreground">
                {task.companyName && (
                  <Link
                    href={`/companies/${task.companyId}`}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <span className="w-4 h-4 rounded bg-navy-500/20 flex items-center justify-center text-[10px] font-bold text-navy-400">
                      {task.companyName[0]}
                    </span>
                    {task.companyName}
                  </Link>
                )}
                {task.contactName && (
                  <span className="flex items-center gap-1">
                    <PersonIcon className="size-3" />
                    {task.contactName}
                  </span>
                )}
                {task.dealName && (
                  <Link
                    href={`/deals/${task.dealId}`}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <FileTextIcon className="size-3" />
                    {task.dealName}
                  </Link>
                )}
              </div>
            )}

            {/* Subtasks */}
            {task.subtasks.length > 0 && (
              <div className="mb-3">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isExpanded ? <ChevronDownIcon className="size-3" /> : <ChevronRightIcon className="size-3" />}
                  <span>
                    {completedSubtasks}/{task.subtasks.length} subtasks
                  </span>
                  {/* Progress bar */}
                  <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-tactical-500 transition-all"
                      style={{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }}
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 pl-4 space-y-1 overflow-hidden"
                    >
                      {task.subtasks.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-center gap-2 py-1"
                        >
                          <button
                            onClick={() => onSubtaskComplete?.(task.id, subtask.id)}
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center transition-all",
                              subtask.completed
                                ? "bg-tactical-500 border-tactical-500"
                                : "border-border hover:border-tactical-500"
                            )}
                          >
                            {subtask.completed && <CheckIcon className="size-2.5 text-white" />}
                          </button>
                          <span
                            className={cn(
                              "text-xs",
                              subtask.completed && "line-through text-muted-foreground"
                            )}
                          >
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {/* Assignee */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-navy-500 to-tactical-500 flex items-center justify-center text-white text-[10px] font-medium">
                  {task.assigneeName.split(" ").map((n) => n[0]).join("")}
                </div>
                <span>{task.assigneeName}</span>
              </div>

              {/* Due Date */}
              <div
                className={cn(
                  "flex items-center gap-1",
                  overdue ? "text-red-400" : dueToday ? "text-amber-400" : dueSoon ? "text-amber-400" : ""
                )}
              >
                <CalendarIcon className="size-3" />
                {formatRelativeDate(task.dueDate)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// TASK LIST COMPONENT
// =============================================================================

interface TaskListProps {
  tasks: Task[];
  onComplete?: (taskId: string) => void;
  onSnooze?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onSubtaskComplete?: (taskId: string, subtaskId: string) => void;
  variant?: "default" | "compact" | "expanded";
  emptyMessage?: string;
  showRelations?: boolean;
}

export function TaskList({
  tasks,
  onComplete,
  onSnooze,
  onEdit,
  onDelete,
  onSubtaskComplete,
  variant = "default",
  emptyMessage = "No tasks",
  showRelations = true,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckIcon className="size-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", variant === "compact" && "space-y-0 divide-y divide-border")}>
      <AnimatePresence>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={onComplete}
            onSnooze={onSnooze}
            onEdit={onEdit}
            onDelete={onDelete}
            onSubtaskComplete={onSubtaskComplete}
            variant={variant}
            showRelations={showRelations}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
