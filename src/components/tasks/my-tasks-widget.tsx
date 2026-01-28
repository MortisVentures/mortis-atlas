"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckIcon,
  PlusIcon,
  ArrowRightIcon,
  ClockIcon,
} from "@radix-ui/react-icons";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Task,
  TaskCard,
  priorityConfig,
  formatRelativeDate,
  isOverdue,
  isDueToday,
} from "./task-card";
import { SAMPLE_TASKS } from "./task-manager";
import { TaskModal, QuickTaskInput } from "./task-modal";

// =============================================================================
// TYPES
// =============================================================================

interface MyTasksWidgetProps {
  userId?: string;
  maxTasks?: number;
  variant?: "default" | "compact" | "minimal";
  showStats?: boolean;
  showQuickAdd?: boolean;
  onTaskComplete?: (taskId: string) => void;
  onCreateTask?: () => void;
}

// =============================================================================
// MY TASKS WIDGET COMPONENT
// =============================================================================

export function MyTasksWidget({
  userId = "u1",
  maxTasks = 5,
  variant = "default",
  showStats = true,
  showQuickAdd = true,
  onTaskComplete,
  onCreateTask,
}: MyTasksWidgetProps) {
  const [tasks, setTasks] = React.useState<Task[]>(SAMPLE_TASKS);
  const [showModal, setShowModal] = React.useState(false);

  // Filter to user's incomplete tasks
  const myTasks = React.useMemo(() => {
    return tasks
      .filter((t) => t.assigneeId === userId && t.status !== "COMPLETED" && t.status !== "SNOOZED")
      .sort((a, b) => {
        // Overdue first, then by due date
        const aOverdue = isOverdue(a.dueDate, a.status);
        const bOverdue = isOverdue(b.dueDate, b.status);
        if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, maxTasks);
  }, [tasks, userId, maxTasks]);

  // Stats
  const stats = React.useMemo(() => {
    const userTasks = tasks.filter((t) => t.assigneeId === userId && t.status !== "COMPLETED");
    return {
      total: userTasks.length,
      overdue: userTasks.filter((t) => isOverdue(t.dueDate, t.status)).length,
      dueToday: userTasks.filter((t) => isDueToday(t.dueDate) && t.status !== "SNOOZED").length,
      highPriority: userTasks.filter((t) => t.priority === "HIGH" && t.status !== "SNOOZED").length,
    };
  }, [tasks, userId]);

  // Handlers
  const handleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: "COMPLETED", completedAt: new Date().toISOString() }
          : t
      )
    );
    onTaskComplete?.(taskId);
  };

  const handleQuickAdd = (title: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      status: "PENDING",
      priority: "MEDIUM",
      taskType: "OTHER",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      createdAt: new Date().toISOString(),
      assigneeId: userId,
      assigneeName: "Sarah Chen", // Would come from context in real app
      createdById: userId,
      createdByName: "Sarah Chen",
      subtasks: [],
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      ...(taskData as Task),
      id: taskData.id || `task-${Date.now()}`,
      status: taskData.status || "PENDING",
      createdAt: taskData.createdAt || new Date().toISOString(),
      subtasks: taskData.subtasks || [],
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Minimal variant - just a small indicator
  if (variant === "minimal") {
    return (
      <Link
        href="/tasks"
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-atlas-sm transition-colors",
          stats.overdue > 0 ? "bg-red-500/10 hover:bg-red-500/20" : "hover:bg-muted/50"
        )}
      >
        <CheckIcon className="size-4" />
        <span className="text-sm">{stats.total} tasks</span>
        {stats.overdue > 0 && (
          <Badge className="bg-red-500/20 text-red-400" size="xs">
            {stats.overdue} overdue
          </Badge>
        )}
      </Link>
    );
  }

  // Compact variant - smaller card
  if (variant === "compact") {
    return (
      <Card variant="raised" className="overflow-hidden">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">My Tasks</CardTitle>
            <Link href="/tasks" className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {myTasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              <CheckIcon className="size-5 mx-auto mb-1 opacity-50" />
              All caught up!
            </div>
          ) : (
            <div className="space-y-1">
              {myTasks.slice(0, 3).map((task) => (
                <CompactTaskItem
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant - full widget
  return (
    <>
      <Card variant="raised" className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckIcon className="size-5" />
              My Tasks
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => onCreateTask?.() || setShowModal(true)}>
                <PlusIcon className="size-4" />
              </Button>
              <Link href="/tasks">
                <Button variant="ghost" size="sm">
                  <ArrowRightIcon className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Stats Row */}
          {showStats && (
            <div className="grid grid-cols-4 gap-2">
              <StatPill
                value={stats.total}
                label="Total"
                color="text-muted-foreground"
              />
              <StatPill
                value={stats.overdue}
                label="Overdue"
                color={stats.overdue > 0 ? "text-red-400" : "text-muted-foreground"}
                highlight={stats.overdue > 0}
              />
              <StatPill
                value={stats.dueToday}
                label="Today"
                color={stats.dueToday > 0 ? "text-amber-400" : "text-muted-foreground"}
              />
              <StatPill
                value={stats.highPriority}
                label="High"
                color={stats.highPriority > 0 ? "text-red-400" : "text-muted-foreground"}
              />
            </div>
          )}

          {/* Quick Add */}
          {showQuickAdd && (
            <QuickTaskInput
              onSubmit={handleQuickAdd}
              placeholder="Quick add task..."
            />
          )}

          {/* Task List */}
          {myTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-2"
              >
                <CheckIcon className="size-8 mx-auto opacity-50" />
                <p className="text-sm">You&apos;re all caught up!</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCreateTask?.() || setShowModal(true)}
                  className="text-tactical-400"
                >
                  <PlusIcon className="size-4 mr-1" />
                  Add a task
                </Button>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {myTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    variant="compact"
                    onComplete={handleComplete}
                    showRelations
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* View All Link */}
          {stats.total > maxTasks && (
            <Link
              href="/tasks"
              className="block text-center text-sm text-muted-foreground hover:text-foreground py-2"
            >
              View {stats.total - maxTasks} more tasks
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveTask}
      />
    </>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface StatPillProps {
  value: number;
  label: string;
  color?: string;
  highlight?: boolean;
}

function StatPill({ value, label, color = "text-muted-foreground", highlight }: StatPillProps) {
  return (
    <div
      className={cn(
        "text-center py-2 px-2 rounded-atlas-sm",
        highlight ? "bg-red-500/10" : "bg-muted/30"
      )}
    >
      <div className={cn("text-lg font-bold", color)}>{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}

interface CompactTaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
}

function CompactTaskItem({ task, onComplete }: CompactTaskItemProps) {
  const overdue = isOverdue(task.dueDate, task.status);
  const dueToday = isDueToday(task.dueDate);

  return (
    <div className="flex items-center gap-2 py-2 px-1 hover:bg-muted/30 rounded-atlas-sm transition-colors">
      <button
        onClick={() => onComplete(task.id)}
        className="w-4 h-4 rounded-full border border-border hover:border-tactical-500 flex-shrink-0 transition-colors"
      />
      <span className="flex-1 text-sm truncate">{task.title}</span>
      <span
        className={cn(
          "text-xs flex-shrink-0",
          overdue ? "text-red-400" : dueToday ? "text-amber-400" : "text-muted-foreground"
        )}
      >
        {formatRelativeDate(task.dueDate)}
      </span>
    </div>
  );
}

// =============================================================================
// TASK REMINDER TOAST (for notifications)
// =============================================================================

interface TaskReminderProps {
  task: Task;
  onDismiss: () => void;
  onComplete: () => void;
  onSnooze: () => void;
}

export function TaskReminder({ task, onDismiss, onComplete, onSnooze }: TaskReminderProps) {
  const priority = priorityConfig[task.priority];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="bg-card border border-border rounded-atlas-md shadow-xl p-4 w-80"
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", priority.dotColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <ClockIcon className="size-3.5 text-amber-400" />
            <span className="text-xs text-amber-400">Task Reminder</span>
          </div>
          <h4 className="font-medium text-sm truncate">{task.title}</h4>
          {task.companyName && (
            <p className="text-xs text-muted-foreground mt-0.5">{task.companyName}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Due {formatRelativeDate(task.dueDate)}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" onClick={onComplete} className="flex-1 h-7 text-xs">
              <CheckIcon className="size-3.5 mr-1" />
              Done
            </Button>
            <Button variant="ghost" size="sm" onClick={onSnooze} className="h-7 text-xs">
              Snooze
            </Button>
            <Button variant="ghost" size="sm" onClick={onDismiss} className="h-7 text-xs">
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
