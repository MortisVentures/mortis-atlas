/**
 * Companies Components
 * ====================
 * Components for company management in Mortis Atlas
 */

export { CompanyForm } from "./company-form";

export {
  ViewToggle,
  ViewToggleWithLabels,
  SegmentedViewToggle,
  ViewToggleButton,
  ViewModeProvider,
  useViewMode,
  useViewModeContext,
  viewOptions,
  STORAGE_KEY,
  type ViewToggleProps,
  type ViewToggleWithLabelsProps,
  type ViewModeProviderProps,
  type ViewMode,
  type ViewOption,
} from "./view-toggle";

export {
  CompanyGrid,
  CompanyGridSkeleton,
  CompanyCard,
  CompactCompanyCard,
  CompanyLogo,
  MiniSparkline,
  stageConfig,
  sectorColors,
  formatCurrency,
  getSectorColor,
  generatePlaceholderInitials,
  generateSampleActivityData,
  type CompanyGridProps,
  type CompanyCardProps,
  type CompactCompanyCardProps,
  type CompanyCardData,
} from "./company-grid";

export {
  AddCompanyModal,
  AddCompanyProvider,
  useAddCompany,
  useAddCompanyShortcut,
  type AddCompanyModalProps,
} from "./add-company-modal";

// Default export
export { default } from "./view-toggle";
