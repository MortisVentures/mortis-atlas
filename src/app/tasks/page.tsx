"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckIcon } from "@radix-ui/react-icons";

import { Card } from "@/components/ui/card";
import { TaskManager } from "@/components/tasks/task-manager";
import { TaskModal } from "@/components/tasks/task-modal";
import { Task } from "@/components/tasks/task-card";

export default function TasksPage() {
  const [showModal, setShowModal] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | undefined>();

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setShowModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    // In real app, this would save to database
    console.log("Saving task:", taskData);
    setShowModal(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = (taskId: string) => {
    // In real app, this would delete from database
    console.log("Deleting task:", taskId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-atlas-md bg-gradient-to-br from-tactical-500 to-navy-500 flex items-center justify-center">
              <CheckIcon className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Tasks</h1>
              <p className="text-sm text-muted-foreground">
                Manage your work and track progress across all deals
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TaskManager
            initialView="my-tasks"
            currentUserId="u1"
            onCreateTask={handleCreateTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </motion.div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTask(undefined);
        }}
        onSave={handleSaveTask}
        task={editingTask}
      />

      {/* Keyboard Shortcut Hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-6 right-6"
      >
        <Card variant="raised" className="px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">T</kbd>
            <span>to quick-add a task</span>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
