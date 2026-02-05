"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarIcon,
  PersonIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  GridIcon,
  ListBulletIcon,
  BarChartIcon,
} from "@radix-ui/react-icons";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Task,
  TaskList,
  TaskStatus,
  TaskPriority,
  TaskType,
  taskTypeConfig,
  isOverdue,
} from "./task-card";

// =============================================================================
// SAMPLE DATA
// =============================================================================

// In production, tasks will be fetched from the API
export const SAMPLE_TASKS: Task[] = [];

// =============================================================================
// TYPES
// =============================================================================

type ViewType = "my-tasks" | "team" | "by-company" | "calendar" | "overdue";
type DisplayMode = "list" | "cards" | "kanban";

interface TaskManagerProps {
  initialView?: ViewType;
  currentUserId?: string;
  onCreateTask?: () => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

// =============================================================================
// VIEW TABS
// =============================================================================

const viewTabs: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: "my-tasks", label: "My Tasks", icon: <PersonIcon className="size-4" /> },
  { id: "team", label: "Team Tasks", icon: <GridIcon className="size-4" /> },
  { id: "by-company", label: "By Company", icon: <BarChartIcon className="size-4" /> },
  { id: "calendar", label: "Calendar", icon: <CalendarIcon className="size-4" /> },
  { id: "overdue", label: "Overdue", icon: <ExclamationTriangleIcon className="size-4" /> },
];

// =============================================================================
// TASK MANAGER COMPONENT
// =============================================================================

export function TaskManager({
  initialView = "my-tasks",
  currentUserId = "u1",
  onCreateTask,
  onEditTask,
  onDeleteTask,
}: TaskManagerProps) {
  const [tasks, setTasks] = React.useState<Task[]>(SAMPLE_TASKS);
  const [activeView, setActiveView] = React.useState<ViewType>(initialView);
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>("cards");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState<TaskPriority | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = React.useState<TaskType | "ALL">("ALL");

  // Filter tasks based on view and filters
  const filteredTasks = React.useMemo(() => {
    let result = [...tasks];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.companyName?.toLowerCase().includes(query)
      );
    }

    // Apply priority filter
    if (priorityFilter !== "ALL") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Apply type filter
    if (typeFilter !== "ALL") {
      result = result.filter((t) => t.taskType === typeFilter);
    }

    // Apply view-specific filtering
    switch (activeView) {
      case "my-tasks":
        result = result.filter((t) => t.assigneeId === currentUserId && t.status !== "COMPLETED");
        break;
      case "team":
        result = result.filter((t) => t.status !== "COMPLETED");
        break;
      case "overdue":
        result = result.filter((t) => isOverdue(t.dueDate, t.status));
        break;
      case "by-company":
        // No additional filtering, will group by company
        result = result.filter((t) => t.status !== "COMPLETED");
        break;
      case "calendar":
        // No additional filtering, will group by date
        break;
    }

    // Sort by due date (earliest first), then by priority
    const priorityOrder: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    result.sort((a, b) => {
      const dateCompare = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return result;
  }, [tasks, activeView, searchQuery, priorityFilter, typeFilter, currentUserId]);

  // Group tasks by company
  const tasksByCompany = React.useMemo(() => {
    const groups: Record<string, { name: string; tasks: Task[] }> = {};
    filteredTasks.forEach((task) => {
      const key = task.companyId || "unassigned";
      const name = task.companyName || "No Company";
      if (!groups[key]) {
        groups[key] = { name, tasks: [] };
      }
      groups[key].tasks.push(task);
    });
    return Object.entries(groups).sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [filteredTasks]);

  // Group tasks by date for calendar view
  const tasksByDate = React.useMemo(() => {
    const groups: Record<string, Task[]> = {};
    filteredTasks.forEach((task) => {
      const dateKey = new Date(task.dueDate).toISOString().split("T")[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(task);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredTasks]);

  // Task actions
  const handleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: "COMPLETED" as TaskStatus, completedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const handleSnooze = (taskId: string) => {
    const snoozeUntil = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: "SNOOZED" as TaskStatus, snoozedUntil: snoozeUntil } : t
      )
    );
  };

  const handleDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    onDeleteTask?.(taskId);
  };

  const handleSubtaskComplete = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((st) =>
            st.id === subtaskId
              ? { ...st, completed: !st.completed, completedAt: !st.completed ? new Date().toISOString() : undefined }
              : st
          ),
        };
      })
    );
  };

  // Stats for current view
  const stats = React.useMemo(() => {
    const myTasks = tasks.filter((t) => t.assigneeId === currentUserId && t.status !== "COMPLETED");
    const overdueCount = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
    const highPriority = myTasks.filter((t) => t.priority === "HIGH").length;
    const dueToday = myTasks.filter((t) => {
      const today = new Date().toISOString().split("T")[0];
      return t.dueDate.split("T")[0] === today;
    }).length;

    return { myTasks: myTasks.length, overdueCount, highPriority, dueToday };
  }, [tasks, currentUserId]);

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <Card variant="raised" className="p-4">
          <div className="text-2xl font-bold text-foreground">{stats.myTasks}</div>
          <div className="text-xs text-muted-foreground">My Tasks</div>
        </Card>
        <Card variant="raised" className="p-4">
          <div className="text-2xl font-bold text-red-400">{stats.overdueCount}</div>
          <div className="text-xs text-muted-foreground">Overdue</div>
        </Card>
        <Card variant="raised" className="p-4">
          <div className="text-2xl font-bold text-amber-400">{stats.highPriority}</div>
          <div className="text-xs text-muted-foreground">High Priority</div>
        </Card>
        <Card variant="raised" className="p-4">
          <div className="text-2xl font-bold text-tactical-400">{stats.dueToday}</div>
          <div className="text-xs text-muted-foreground">Due Today</div>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-atlas-md">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm rounded-atlas-sm transition-all",
                activeView === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "overdue" && stats.overdueCount > 0 && (
                <Badge className="bg-red-500/20 text-red-400 ml-1" size="xs">
                  {stats.overdueCount}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Display Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-atlas-sm">
            <button
              onClick={() => setDisplayMode("list")}
              className={cn(
                "p-2 rounded-atlas-sm transition-all",
                displayMode === "list" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ListBulletIcon className="size-4" />
            </button>
            <button
              onClick={() => setDisplayMode("cards")}
              className={cn(
                "p-2 rounded-atlas-sm transition-all",
                displayMode === "cards" ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <GridIcon className="size-4" />
            </button>
          </div>

          <Button onClick={onCreateTask} className="gap-2">
            <PlusIcon className="size-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "ALL")}
            className="appearance-none bg-card border border-border rounded-atlas-sm px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TaskType | "ALL")}
            className="appearance-none bg-card border border-border rounded-atlas-sm px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-tactical-500"
          >
            <option value="ALL">All Types</option>
            {Object.entries(taskTypeConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeView === "by-company" ? (
            <ByCompanyView
              tasksByCompany={tasksByCompany}
              displayMode={displayMode}
              onComplete={handleComplete}
              onSnooze={handleSnooze}
              onEdit={onEditTask}
              onDelete={handleDelete}
              onSubtaskComplete={handleSubtaskComplete}
            />
          ) : activeView === "calendar" ? (
            <CalendarView
              tasksByDate={tasksByDate}
              displayMode={displayMode}
              onComplete={handleComplete}
              onSnooze={handleSnooze}
              onEdit={onEditTask}
              onDelete={handleDelete}
              onSubtaskComplete={handleSubtaskComplete}
            />
          ) : (
            <div className={cn(displayMode === "cards" ? "grid grid-cols-2 gap-4" : "space-y-2")}>
              <TaskList
                tasks={filteredTasks}
                variant={displayMode === "list" ? "compact" : "default"}
                onComplete={handleComplete}
                onSnooze={handleSnooze}
                onEdit={onEditTask}
                onDelete={handleDelete}
                onSubtaskComplete={handleSubtaskComplete}
                emptyMessage={
                  activeView === "my-tasks"
                    ? "You're all caught up!"
                    : activeView === "overdue"
                    ? "No overdue tasks"
                    : "No tasks found"
                }
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// BY COMPANY VIEW
// =============================================================================

interface ByCompanyViewProps {
  tasksByCompany: [string, { name: string; tasks: Task[] }][];
  displayMode: DisplayMode;
  onComplete: (taskId: string) => void;
  onSnooze: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onSubtaskComplete: (taskId: string, subtaskId: string) => void;
}

function ByCompanyView({
  tasksByCompany,
  displayMode,
  onComplete,
  onSnooze,
  onEdit,
  onDelete,
  onSubtaskComplete,
}: ByCompanyViewProps) {
  if (tasksByCompany.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <GridIcon className="size-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tasksByCompany.map(([companyId, { name, tasks }]) => (
        <Card key={companyId} variant="raised">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-atlas-sm bg-gradient-to-br from-navy-500 to-tactical-500 flex items-center justify-center text-white text-sm font-bold">
                  {name[0]}
                </span>
                {name}
              </CardTitle>
              <Badge variant="secondary" size="sm">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <TaskList
              tasks={tasks}
              variant={displayMode === "list" ? "compact" : "default"}
              onComplete={onComplete}
              onSnooze={onSnooze}
              onEdit={onEdit}
              onDelete={onDelete}
              onSubtaskComplete={onSubtaskComplete}
              showRelations={false}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// =============================================================================
// CALENDAR VIEW
// =============================================================================

interface CalendarViewProps {
  tasksByDate: [string, Task[]][];
  displayMode: DisplayMode;
  onComplete: (taskId: string) => void;
  onSnooze: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onSubtaskComplete: (taskId: string, subtaskId: string) => void;
}

function CalendarView({
  tasksByDate,
  displayMode,
  onComplete,
  onSnooze,
  onEdit,
  onDelete,
  onSubtaskComplete,
}: CalendarViewProps) {
  const today = new Date().toISOString().split("T")[0];

  if (tasksByDate.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CalendarIcon className="size-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tasksByDate.map(([dateKey, tasks]) => {
        const isPast = dateKey < today;
        const isToday = dateKey === today;
        const date = new Date(dateKey);

        return (
          <div key={dateKey}>
            <div
              className={cn(
                "flex items-center gap-3 mb-3 pb-2 border-b",
                isPast ? "border-red-500/30" : isToday ? "border-tactical-500/50" : "border-border"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-atlas-sm flex flex-col items-center justify-center",
                  isPast
                    ? "bg-red-500/20 text-red-400"
                    : isToday
                    ? "bg-tactical-500/20 text-tactical-400"
                    : "bg-muted"
                )}
              >
                <span className="text-[10px] uppercase font-medium">
                  {date.toLocaleDateString("en-US", { month: "short" })}
                </span>
                <span className="text-lg font-bold leading-none">{date.getDate()}</span>
              </div>
              <div>
                <div className={cn("font-medium", isPast && "text-red-400", isToday && "text-tactical-400")}>
                  {isToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "long" })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                  {isPast && " (overdue)"}
                </div>
              </div>
            </div>

            <TaskList
              tasks={tasks}
              variant={displayMode === "list" ? "compact" : "default"}
              onComplete={onComplete}
              onSnooze={onSnooze}
              onEdit={onEdit}
              onDelete={onDelete}
              onSubtaskComplete={onSubtaskComplete}
            />
          </div>
        );
      })}
    </div>
  );
}

