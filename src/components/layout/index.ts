/**
 * Layout Components
 * =================
 * Structural components for the Mortis Atlas application
 */

export {
  Sidebar,
  SidebarLayout,
  useSidebar,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  MOBILE_BREAKPOINT,
  type SidebarProps,
  type SidebarLayoutProps,
  type NavItem as SidebarNavItem,
  type NavSection,
} from "./sidebar";

export {
  NavItem,
  NavGroup,
  navIcons,
  navItemVariants,
  defaultNavItems,
  type NavItemProps,
  type NavGroupProps,
  type NavIconKey,
} from "./nav-item";

export {
  DashboardLayout,
  DashboardContent,
  DashboardGrid,
  PageSection,
  MainContent,
  MobileSidebarOverlay,
  CONTENT_MAX_WIDTH,
  CONTENT_PADDING,
  type DashboardLayoutProps,
  type DashboardContentProps,
  type DashboardGridProps,
  type PageSectionProps,
} from "./dashboard-layout";

export {
  PageHeader,
  PageHeaderSkeleton,
  SectionHeader,
  Breadcrumbs,
  pageTitleVariants,
  type PageHeaderProps,
  type SectionHeaderProps,
  type BreadcrumbItem,
  type BreadcrumbInput,
} from "./page-header";

export {
  CommandPalette,
  CommandPaletteProvider,
  useCommandPalette,
  useCommandPaletteShortcut,
  searchResults,
  fuzzyMatch,
  getRecentSearches,
  saveRecentSearch,
  typeIcons,
  typeLabels,
  navigationPages,
  quickActions,
  type SearchResult,
  type SearchResultType,
  type CommandPaletteProps,
} from "./command-palette";

// Default export for convenience
export { default } from "./dashboard-layout";
