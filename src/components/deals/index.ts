// Deal Form
export { DealForm } from "./deal-form";

// Deal Pipeline / Kanban Components
export { DealCard, SortableDealCard, DealCardSkeleton } from "./deal-card";
export { StageColumn, StageColumnSkeleton } from "./stage-column";
export { KanbanBoard } from "./kanban-board";

// Deal Source Tracking Components
export {
  SourceInput,
  SourceBadge,
  SourceSummaryCard,
} from "./source-tracking";

// Source Analytics Components
export {
  SourceAnalyticsDashboard,
  SourceFunnelVisualization,
} from "./source-analytics";

// Re-export types
export type {
  SourceType,
  DealSourceInfo,
  DealWithSource,
  Referrer,
  ReferrerTier,
} from "@/lib/deals/source-tracking";

// Referrer Management Components
export {
  ReferrerCard,
  ReferrerList,
  ThankYouAutomation,
  ReferralRewards,
  ReferrerManagementDashboard,
} from "./referrer-management";

// Kanban Component Types
export type { DealCardProps, SortableDealCardProps } from "./deal-card";
export type { StageColumnProps } from "./stage-column";
export type { KanbanBoardProps } from "./kanban-board";
