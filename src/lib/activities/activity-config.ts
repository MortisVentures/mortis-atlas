import { ActivityType } from "@prisma/client";

// =============================================================================
// ACTIVITY TYPE CONFIG
// =============================================================================

export const ACTIVITY_TYPE_CONFIG: Record<ActivityType, {
  label: string;
  color: string;
  icon: string;
  description: string;
}> = {
  EMAIL: {
    label: "Email",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: "mail",
    description: "Email correspondence",
  },
  CALL: {
    label: "Call",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: "phone",
    description: "Phone or video call",
  },
  MEETING: {
    label: "Meeting",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: "calendar",
    description: "Scheduled meeting",
  },
  NOTE: {
    label: "Note",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: "file-text",
    description: "Internal note",
  },
  TASK: {
    label: "Task",
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    icon: "check-square",
    description: "Action item or task",
  },
  DEAL_UPDATE: {
    label: "Deal Update",
    color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    icon: "trending-up",
    description: "Deal status change",
  },
  INTRO: {
    label: "Introduction",
    color: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    icon: "users",
    description: "Introduction or referral",
  },
  DOCUMENT: {
    label: "Document",
    color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    icon: "file",
    description: "Document shared or received",
  },
};
