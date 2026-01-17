/**
 * Dashboard Components
 * ====================
 * Components for the Mortis Atlas dashboard
 */

export {
  KPIGrid,
  KPIGridSkeleton,
  KPICard,
  TotalAUMCard,
  PortfolioCompaniesCard,
  ActiveDealsCard,
  PipelineValueCard,
  type KPIGridProps,
  default,
} from "./kpi-grid";

export {
  PipelineFunnel,
  PipelineFunnelSkeleton,
  CompactFunnel,
  FunnelSummary,
  stageConfig,
  defaultStagesData,
  type PipelineFunnelProps,
  type CompactFunnelProps,
  type PipelineStage,
  type PipelineStageKey,
} from "./pipeline-funnel";

export {
  DealFlowChart,
  DealFlowChartSkeleton,
  MiniDealFlow,
  TimeRangeSelector,
  ChartLegend,
  SummaryStats,
  generateSampleData,
  calculateTrendData,
  type DealFlowChartProps,
  type MiniDealFlowProps,
  type DealFlowDataPoint,
  type TrendDataPoint,
  type TimeRange,
  type ChartViewMode,
  type DealOutcome,
} from "./deal-flow-chart";

export {
  ActivityFeed,
  ActivityFeedSkeleton,
  CompactActivityFeed,
  ActivityItem,
  DateGroupHeader,
  ActivityList,
  generateSampleActivities,
  formatRelativeTime,
  getDateGroup,
  groupActivitiesByDate,
  ACTIVITY_ICONS,
  ACTIVITY_COLORS,
  ACTIVITY_LABELS,
  type ActivityFeedProps,
  type CompactActivityFeedProps,
  type Activity,
  type ActivityType,
  type DateGroup,
  type GroupedActivities,
} from "./activity-feed";

export {
  QuickActions,
  QuickActionsSkeleton,
  QuickActionsSection,
  QuickActionCard,
  CompactQuickActions,
  FloatingActionButton,
  defaultActions,
  colorConfig,
  type QuickActionsProps,
  type QuickActionsSectionProps,
  type CompactQuickActionsProps,
  type FloatingActionButtonProps,
  type QuickAction,
  type QuickActionType,
} from "./quick-actions";
