"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SIDEBAR_WIDTH_COLLAPSED,
  MOBILE_BREAKPOINT,
} from "./sidebar";

// =============================================================================
// CONSTANTS
// =============================================================================

const CONTENT_MAX_WIDTH = 1920;
const CONTENT_PADDING = {
  mobile: 16,
  tablet: 24,
  desktop: 32,
};

// =============================================================================
// HOOKS
// =============================================================================

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

function useMounted(): boolean {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const pageTransitionVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
    },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// =============================================================================
// SIDEBAR CONTEXT PROVIDER WRAPPER
// =============================================================================

interface _SidebarProviderProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

function _SidebarProvider({ children, defaultCollapsed }: _SidebarProviderProps) {
  return (
    <>
      <Sidebar defaultCollapsed={defaultCollapsed} />
      {children}
    </>
  );
}

// =============================================================================
// MAIN CONTENT COMPONENT
// =============================================================================

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

function MainContent({ children, className }: MainContentProps) {
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  const isTablet = useMediaQuery(
    `(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: 1023px)`
  );

  // Calculate left margin based on sidebar state
  const marginLeft = isMobile ? 0 : SIDEBAR_WIDTH_COLLAPSED;

  // Responsive padding
  const padding = isMobile
    ? CONTENT_PADDING.mobile
    : isTablet
      ? CONTENT_PADDING.tablet
      : CONTENT_PADDING.desktop;

  return (
    <motion.main
      className={cn(
        "min-h-screen",
        "transition-[margin-left] duration-300 ease-out",
        className
      )}
      style={{ marginLeft }}
      variants={pageTransitionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: CONTENT_MAX_WIDTH,
          padding,
        }}
      >
        {children}
      </div>
    </motion.main>
  );
}

// =============================================================================
// MOBILE SIDEBAR OVERLAY
// =============================================================================

interface MobileSidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileSidebarOverlay({ isOpen, onClose }: MobileSidebarOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            "fixed inset-0 z-overlay",
            "bg-background/80 backdrop-blur-sm",
            "md:hidden"
          )}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// PAGE HEADER COMPONENT
// =============================================================================

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <motion.header
      className={cn("mb-6 space-y-4", className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <nav className="text-sm text-muted-foreground">{breadcrumbs}</nav>
      )}

      {/* Title row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}
      </div>
    </motion.header>
  );
}

// =============================================================================
// PAGE SECTION COMPONENT
// =============================================================================

export interface PageSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
}: PageSectionProps) {
  return (
    <motion.section
      className={cn("space-y-4", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Section header */}
      {(title || actions) && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {title && (
              <h2 className="font-display text-lg font-semibold text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Section content */}
      {children}
    </motion.section>
  );
}

// =============================================================================
// DASHBOARD LAYOUT COMPONENT
// =============================================================================

export interface DashboardLayoutProps {
  children: React.ReactNode;
  /** Default sidebar collapsed state */
  defaultSidebarCollapsed?: boolean;
  /** Additional className for main content */
  className?: string;
}

export function DashboardLayout({
  children,
  defaultSidebarCollapsed = false,
  className,
}: DashboardLayoutProps) {
  const mounted = useMounted();
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile menu on route change or resize
  React.useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Loading state (SSR hydration)
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        {/* Skeleton sidebar */}
        <div
          className="hidden md:block flex-shrink-0 bg-card border-r border-border"
          style={{ width: SIDEBAR_WIDTH_COLLAPSED }}
        />
        {/* Skeleton content */}
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-4 w-96 bg-muted rounded" />
            <div className="h-64 bg-muted rounded-atlas-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar defaultCollapsed={defaultSidebarCollapsed} />

      {/* Mobile overlay */}
      <MobileSidebarOverlay
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main content */}
      <MainContent className={className}>{children}</MainContent>
    </div>
  );
}

// =============================================================================
// DASHBOARD CONTENT WRAPPER (for page transitions)
// =============================================================================

export interface DashboardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardContent({ children, className }: DashboardContentProps) {
  return (
    <motion.div
      className={cn("space-y-6", className)}
      variants={pageTransitionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

// =============================================================================
// GRID LAYOUTS
// =============================================================================

export interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function DashboardGrid({
  children,
  columns = 4,
  className,
}: DashboardGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 md:gap-6",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  MainContent,
  MobileSidebarOverlay,
  CONTENT_MAX_WIDTH,
  CONTENT_PADDING,
};

export default DashboardLayout;
