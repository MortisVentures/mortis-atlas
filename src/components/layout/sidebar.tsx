"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  BarChartIcon,
  PersonIcon,
  GearIcon,
  MoonIcon,
  SunIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RocketIcon,
  BackpackIcon,
  MixerHorizontalIcon,
  FileTextIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// =============================================================================
// CONSTANTS
// =============================================================================

const SIDEBAR_WIDTH_COLLAPSED = 64;
const SIDEBAR_WIDTH_EXPANDED = 240;
const MOBILE_BREAKPOINT = 768;
const STORAGE_KEY = "mortis-atlas-sidebar-collapsed";

// =============================================================================
// TYPES
// =============================================================================

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

// =============================================================================
// NAVIGATION CONFIG
// =============================================================================

const navigationSections: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <HomeIcon className="size-5" /> },
    ],
  },
  {
    title: "Deal Flow",
    items: [
      { label: "Active Deals", href: "/deals", icon: <RocketIcon className="size-5" /> },
      { label: "Deal Sources", href: "/deals/sources", icon: <BarChartIcon className="size-5" /> },
      { label: "Portfolio", href: "/deals/portfolio", icon: <StarFilledIcon className="size-5" /> },
    ],
  },
  {
    title: "Database",
    items: [
      { label: "Companies", href: "/companies", icon: <BackpackIcon className="size-5" /> },
      { label: "Contacts", href: "/contacts", icon: <PersonIcon className="size-5" /> },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Reports", href: "/reports", icon: <FileTextIcon className="size-5" /> },
      { label: "Documents", href: "/documents", icon: <FileTextIcon className="size-5" /> },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Team", href: "/team", icon: <PersonIcon className="size-5" /> },
      { label: "Preferences", href: "/settings", icon: <MixerHorizontalIcon className="size-5" /> },
    ],
  },
];

// =============================================================================
// HOOKS
// =============================================================================

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = React.useState<T>(initialValue);

  React.useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  const setValue = React.useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

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

// =============================================================================
// SIDEBAR CONTEXT
// =============================================================================

interface SidebarContextValue {
  isCollapsed: boolean;
  isHovered: boolean;
  isMobile: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const sidebarVariants = {
  expanded: {
    width: SIDEBAR_WIDTH_EXPANDED,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
  collapsed: {
    width: SIDEBAR_WIDTH_COLLAPSED,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
};

const glowVariants = {
  collapsed: {
    boxShadow: "0 0 0px rgba(59, 130, 246, 0)",
    borderColor: "rgba(59, 130, 246, 0)",
  },
  expanded: {
    boxShadow: "0 0 30px rgba(59, 130, 246, 0.15)",
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  }),
};

const labelVariants = {
  hidden: { opacity: 0, width: 0 },
  visible: {
    opacity: 1,
    width: "auto",
    transition: { duration: 0.2, delay: 0.1 },
  },
  exit: {
    opacity: 0,
    width: 0,
    transition: { duration: 0.15 },
  },
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface SidebarHeaderProps {
  isExpanded: boolean;
  onToggle: () => void;
}

function SidebarHeader({ isExpanded, onToggle }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between h-16 px-3 border-b border-border/50">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
        {/* Logo Icon */}
        <div className="relative flex-shrink-0 size-10 rounded-atlas-sm bg-gradient-to-br from-navy-500 to-tactical-500 flex items-center justify-center shadow-neu-dark-glow-navy">
          <span className="text-white font-display font-bold text-lg">M</span>
          {/* Glow ring */}
          <motion.div
            className="absolute inset-0 rounded-atlas-sm"
            animate={{
              boxShadow: isExpanded
                ? "0 0 20px rgba(16, 185, 129, 0.4)"
                : "0 0 10px rgba(59, 130, 246, 0.3)",
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Logo Text */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="font-display font-bold text-lg text-foreground whitespace-nowrap">
                Mortis Atlas
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                VC Platform
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Toggle Button */}
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggle}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Collapse sidebar"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NavItemProps {
  item: NavItem;
  isExpanded: boolean;
  isActive: boolean;
  index: number;
}

function NavItemComponent({ item, isExpanded, isActive, index }: NavItemProps) {
  return (
    <motion.div
      custom={index}
      variants={navItemVariants}
      initial="hidden"
      animate="visible"
    >
      <Link
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3 h-10 px-3 rounded-atlas-sm transition-all duration-fast",
          "hover:bg-muted/50",
          isActive && "bg-tactical-500/10 text-tactical-500",
          !isActive && "text-muted-foreground hover:text-foreground"
        )}
      >
        {/* Active indicator bar */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-tactical-500 rounded-r-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        {/* Icon with hover glow */}
        <span
          className={cn(
            "relative flex-shrink-0 transition-all duration-fast",
            "group-hover:scale-110",
            isActive && "text-tactical-500"
          )}
        >
          {item.icon}
          {/* Hover glow effect */}
          <motion.span
            className="absolute inset-0 rounded-full blur-md"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.5, backgroundColor: "rgba(16, 185, 129, 0.3)" }}
          />
        </span>

        {/* Label */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.span
              variants={labelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Badge */}
        {item.badge && isExpanded && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-tactical-500/20 text-tactical-500 rounded-full"
          >
            {item.badge}
          </motion.span>
        )}
      </Link>
    </motion.div>
  );
}

interface SidebarNavProps {
  sections: NavSection[];
  isExpanded: boolean;
}

function SidebarNav({ sections, isExpanded }: SidebarNavProps) {
  const pathname = usePathname();
  let itemIndex = 0;

  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 scrollbar-thin">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className={cn(sectionIndex > 0 && "mt-6")}>
          {/* Section Title */}
          {section.title && (
            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  {section.title}
                </motion.h3>
              )}
            </AnimatePresence>
          )}

          {/* Section Items */}
          <div className="space-y-1">
            {section.items.map((item) => {
              const currentIndex = itemIndex++;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <NavItemComponent
                  key={item.href}
                  item={item}
                  isExpanded={isExpanded}
                  isActive={isActive}
                  index={currentIndex}
                />
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

interface SidebarFooterProps {
  isExpanded: boolean;
  isDark: boolean;
  onThemeToggle: () => void;
}

function SidebarFooter({ isExpanded, isDark, onThemeToggle }: SidebarFooterProps) {
  return (
    <div className="border-t border-border/50 p-3 space-y-2">
      {/* Theme Toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onThemeToggle}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SunIcon className="size-4" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MoonIcon className="size-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.span
              variants={labelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-sm text-muted-foreground"
            >
              {isDark ? "Dark Mode" : "Light Mode"}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 p-2 rounded-atlas-sm hover:bg-muted/50 cursor-pointer transition-colors">
        {/* Avatar */}
        <div className="relative flex-shrink-0 size-8 rounded-full bg-gradient-to-br from-navy-400 to-tactical-400 flex items-center justify-center">
          <span className="text-white text-xs font-semibold">JD</span>
          {/* Online indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 size-3 bg-tactical-500 border-2 border-card rounded-full" />
        </div>

        {/* User Info */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden"
            >
              <p className="text-sm font-medium text-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">Partner</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Icon */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Settings"
              >
                <GearIcon className="size-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN SIDEBAR COMPONENT
// =============================================================================

export interface SidebarProps {
  className?: string;
  defaultCollapsed?: boolean;
}

export function Sidebar({ className, defaultCollapsed = false }: SidebarProps) {
  const [isCollapsed, setCollapsed] = useLocalStorage(STORAGE_KEY, defaultCollapsed);
  const [isHovered, setHovered] = React.useState(false);
  const [isDark, setIsDark] = React.useState(true);
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

  // Auto-collapse on mobile
  React.useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile, setCollapsed]);

  // Determine if sidebar should be expanded
  const isExpanded = !isCollapsed || (isHovered && !isMobile);

  // Theme toggle handler
  const handleThemeToggle = React.useCallback(() => {
    setIsDark((prev) => !prev);
    document.documentElement.classList.toggle("dark");
  }, []);

  // Toggle sidebar
  const handleToggle = React.useCallback(() => {
    setCollapsed(!isCollapsed);
  }, [isCollapsed, setCollapsed]);

  // Context value
  const contextValue: SidebarContextValue = {
    isCollapsed,
    isHovered,
    isMobile,
    setCollapsed,
    toggle: handleToggle,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <motion.aside
        className={cn(
          "fixed left-0 top-0 z-sticky h-screen",
          "flex flex-col",
          "bg-card/95 backdrop-blur-md",
          "border-r border-border/50",
          className
        )}
        variants={sidebarVariants}
        initial={isCollapsed ? "collapsed" : "expanded"}
        animate={isExpanded ? "expanded" : "collapsed"}
        onMouseEnter={() => !isMobile && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Futuristic glow border */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-r-lg"
          variants={glowVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={{ duration: 0.3 }}
          style={{ borderRight: "1px solid" }}
        />

        {/* Header */}
        <SidebarHeader isExpanded={isExpanded} onToggle={handleToggle} />

        {/* Navigation */}
        <SidebarNav sections={navigationSections} isExpanded={isExpanded} />

        {/* Footer */}
        <SidebarFooter
          isExpanded={isExpanded}
          isDark={isDark}
          onThemeToggle={handleThemeToggle}
        />

        {/* Expand button (when collapsed and not hovered) */}
        <AnimatePresence>
          {isCollapsed && !isHovered && !isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 -right-3 transform -translate-y-1/2"
            >
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={handleToggle}
                className="rounded-full shadow-lg border border-border"
                aria-label="Expand sidebar"
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </SidebarContext.Provider>
  );
}

// =============================================================================
// SIDEBAR LAYOUT WRAPPER
// =============================================================================

export interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebarProps?: SidebarProps;
}

export function SidebarLayout({ children, sidebarProps }: SidebarLayoutProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen">
        <div className="w-16 flex-shrink-0" />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar {...sidebarProps} />
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: SIDEBAR_WIDTH_COLLAPSED }}
      >
        {children}
      </main>
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  MOBILE_BREAKPOINT,
  type NavItem,
  type NavSection,
};
