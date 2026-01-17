"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  HomeIcon,
  PersonIcon,
  RocketIcon,
  BarChartIcon,
  CalendarIcon,
  FileTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  GlobeIcon,
} from "@radix-ui/react-icons";
import { toast } from "sonner";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  CommandLoading,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

export type SearchResultType = "company" | "contact" | "deal" | "activity" | "page" | "action";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  href?: string;
  action?: () => void;
  keywords?: string[];
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// =============================================================================
// SAMPLE DATA - In production, this would come from API/database
// =============================================================================

const sampleCompanies: SearchResult[] = [
  { id: "c1", type: "company", title: "TechFlow AI", subtitle: "AI/ML • Due Diligence", href: "/companies/c1", keywords: ["ai", "machine learning", "series a"] },
  { id: "c2", type: "company", title: "Quantum Labs", subtitle: "DeepTech • Engaged", href: "/companies/c2", keywords: ["quantum", "computing"] },
  { id: "c3", type: "company", title: "HealthBridge", subtitle: "HealthTech • Portfolio", href: "/companies/c3", keywords: ["health", "medical"] },
  { id: "c4", type: "company", title: "FinanceOS", subtitle: "FinTech • Qualified", href: "/companies/c4", keywords: ["finance", "banking"] },
  { id: "c5", type: "company", title: "DataSync Pro", subtitle: "SaaS • Due Diligence", href: "/companies/c5", keywords: ["saas", "data"] },
];

const sampleContacts: SearchResult[] = [
  { id: "ct1", type: "contact", title: "Sarah Chen", subtitle: "CEO at TechFlow AI", href: "/contacts/ct1", keywords: ["ceo", "founder"] },
  { id: "ct2", type: "contact", title: "Mike Johnson", subtitle: "CTO at DataSync Pro", href: "/contacts/ct2", keywords: ["cto", "tech"] },
  { id: "ct3", type: "contact", title: "Emily Davis", subtitle: "CFO at Quantum Labs", href: "/contacts/ct3", keywords: ["cfo", "finance"] },
  { id: "ct4", type: "contact", title: "Alex Wong", subtitle: "Founder at FinanceOS", href: "/contacts/ct4", keywords: ["founder"] },
];

const sampleDeals: SearchResult[] = [
  { id: "d1", type: "deal", title: "TechFlow AI Series A", subtitle: "$5M • Term Sheet", href: "/deals/d1", keywords: ["series a", "term sheet"] },
  { id: "d2", type: "deal", title: "Quantum Labs Series B", subtitle: "$15M • Deep Dive", href: "/deals/d2", keywords: ["series b"] },
  { id: "d3", type: "deal", title: "FinanceOS Seed", subtitle: "$2M • Partner Review", href: "/deals/d3", keywords: ["seed"] },
];

const navigationPages: SearchResult[] = [
  { id: "nav-dashboard", type: "page", title: "Dashboard", subtitle: "Overview and KPIs", href: "/dashboard", icon: <HomeIcon className="size-4" /> },
  { id: "nav-companies", type: "page", title: "Companies", subtitle: "Pipeline companies", href: "/companies", icon: <GlobeIcon className="size-4" /> },
  { id: "nav-contacts", type: "page", title: "Contacts", subtitle: "Network contacts", href: "/contacts", icon: <PersonIcon className="size-4" /> },
  { id: "nav-deals", type: "page", title: "Deals", subtitle: "Active deals", href: "/deals", icon: <RocketIcon className="size-4" /> },
  { id: "nav-portfolio", type: "page", title: "Portfolio", subtitle: "Portfolio companies", href: "/portfolio", icon: <BarChartIcon className="size-4" /> },
  { id: "nav-activities", type: "page", title: "Activities", subtitle: "Recent activities", href: "/activities", icon: <CalendarIcon className="size-4" /> },
  { id: "nav-analytics", type: "page", title: "Analytics", subtitle: "Performance insights", href: "/analytics", icon: <BarChartIcon className="size-4" /> },
];

const quickActions: SearchResult[] = [
  { id: "action-new-company", type: "action", title: "New Company", subtitle: "Add a new company to pipeline", icon: <PlusIcon className="size-4" />, keywords: ["add", "create"] },
  { id: "action-new-contact", type: "action", title: "New Contact", subtitle: "Add a new contact", icon: <PlusIcon className="size-4" />, keywords: ["add", "create"] },
  { id: "action-new-deal", type: "action", title: "New Deal", subtitle: "Create a new deal", icon: <PlusIcon className="size-4" />, keywords: ["add", "create"] },
  { id: "action-schedule", type: "action", title: "Schedule Meeting", subtitle: "Schedule a new meeting", icon: <CalendarIcon className="size-4" />, keywords: ["calendar", "meeting"] },
];

// =============================================================================
// SEARCH UTILITIES
// =============================================================================

const RECENT_SEARCHES_KEY = "mortis-atlas-recent-searches";
const MAX_RECENT_SEARCHES = 5;

function getRecentSearches(): SearchResult[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveRecentSearch(result: SearchResult): void {
  if (typeof window === "undefined") return;
  const recent = getRecentSearches();
  const filtered = recent.filter((r) => r.id !== result.id);
  const updated = [result, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Direct substring match
  if (lowerText.includes(lowerQuery)) return true;

  // Fuzzy character match
  let queryIdx = 0;
  for (let i = 0; i < lowerText.length && queryIdx < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIdx]) {
      queryIdx++;
    }
  }
  return queryIdx === lowerQuery.length;
}

function searchResults(query: string): SearchResult[] {
  if (!query.trim()) return [];

  const allItems = [
    ...sampleCompanies,
    ...sampleContacts,
    ...sampleDeals,
    ...navigationPages,
    ...quickActions,
  ];

  return allItems.filter((item) => {
    const searchText = [
      item.title,
      item.subtitle || "",
      ...(item.keywords || []),
    ].join(" ");
    return fuzzyMatch(searchText, query);
  });
}

// =============================================================================
// RESULT TYPE ICONS
// =============================================================================

const typeIcons: Record<SearchResultType, React.ReactNode> = {
  company: <GlobeIcon className="size-4" />,
  contact: <PersonIcon className="size-4" />,
  deal: <RocketIcon className="size-4" />,
  activity: <CalendarIcon className="size-4" />,
  page: <FileTextIcon className="size-4" />,
  action: <PlusIcon className="size-4" />,
};

const typeLabels: Record<SearchResultType, string> = {
  company: "Companies",
  contact: "Contacts",
  deal: "Deals",
  activity: "Activities",
  page: "Pages",
  action: "Quick Actions",
};

// =============================================================================
// COMMAND PALETTE COMPONENT
// =============================================================================

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [recentSearches, setRecentSearches] = React.useState<SearchResult[]>([]);

  // Load recent searches on mount
  React.useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [open]);

  // Reset query when closing
  React.useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Get search results
  const results = React.useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    setIsLoading(true);
    const searchRes = searchResults(debouncedQuery);
    setIsLoading(false);
    return searchRes;
  }, [debouncedQuery]);

  // Group results by type
  const groupedResults = React.useMemo(() => {
    const groups: Record<SearchResultType, SearchResult[]> = {
      company: [],
      contact: [],
      deal: [],
      activity: [],
      page: [],
      action: [],
    };

    results.forEach((result) => {
      groups[result.type].push(result);
    });

    return groups;
  }, [results]);

  // Handle selection
  const handleSelect = (result: SearchResult) => {
    // Save to recent searches
    saveRecentSearch(result);
    setRecentSearches(getRecentSearches());

    // Close palette
    onOpenChange(false);

    // Handle action
    if (result.action) {
      result.action();
    } else if (result.href) {
      router.push(result.href);
    }

    // Handle quick actions
    if (result.id === "action-new-company") {
      // Trigger add company modal - dispatch custom event
      window.dispatchEvent(new CustomEvent("open-add-company-modal"));
    } else if (result.id === "action-new-contact") {
      router.push("/contacts/new");
    } else if (result.id === "action-new-deal") {
      toast.info("New Deal modal coming soon!");
    } else if (result.id === "action-schedule") {
      toast.info("Schedule Meeting coming soon!");
    }
  };

  const hasResults = results.length > 0;
  const showRecentSearches = !query.trim() && recentSearches.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl sm:max-w-[600px] bg-background/95 backdrop-blur-xl border-border">
        <Command
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
          shouldFilter={false}
        >
          {/* Search Input */}
          <div className="flex items-center border-b border-border px-4">
            <MagnifyingGlassIcon className="mr-3 size-5 shrink-0 text-muted-foreground" />
            <input
              placeholder="Search companies, contacts, deals..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                "flex h-14 w-full bg-transparent py-3 text-sm outline-none",
                "placeholder:text-muted-foreground",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            />
            <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground sm:flex">
              ESC
            </kbd>
          </div>

          <CommandList className="max-h-[400px] overflow-y-auto p-2">
            {/* Loading State */}
            {isLoading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}

            {/* Empty State */}
            {!isLoading && query.trim() && !hasResults && (
              <div className="py-12 text-center">
                <MagnifyingGlassIcon className="mx-auto size-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No results found for "{query}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching for companies, contacts, or deals
                </p>
              </div>
            )}

            {/* Recent Searches */}
            {showRecentSearches && (
              <CommandGroup heading="Recent">
                {recentSearches.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.id}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-atlas-sm cursor-pointer"
                  >
                    <div className="flex items-center justify-center size-8 rounded-full bg-muted/50">
                      <ClockIcon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">
                      {result.type}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Quick Actions - Show when no query */}
            {!query.trim() && !showRecentSearches && (
              <>
                <CommandGroup heading="Quick Actions">
                  {quickActions.map((action) => (
                    <CommandItem
                      key={action.id}
                      value={action.id}
                      onSelect={() => handleSelect(action)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-atlas-sm cursor-pointer"
                    >
                      <div className="flex items-center justify-center size-8 rounded-full bg-tactical-500/10 text-tactical-500">
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{action.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {action.subtitle}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator className="my-2" />

                <CommandGroup heading="Navigation">
                  {navigationPages.map((page) => (
                    <CommandItem
                      key={page.id}
                      value={page.id}
                      onSelect={() => handleSelect(page)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-atlas-sm cursor-pointer"
                    >
                      <div className="flex items-center justify-center size-8 rounded-full bg-muted/50 text-muted-foreground">
                        {page.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{page.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {page.subtitle}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* Search Results - Grouped by type */}
            {hasResults && (
              <>
                {(Object.keys(groupedResults) as SearchResultType[]).map((type) => {
                  const items = groupedResults[type];
                  if (items.length === 0) return null;

                  return (
                    <CommandGroup key={type} heading={typeLabels[type]}>
                      {items.map((result) => (
                        <CommandItem
                          key={result.id}
                          value={result.id}
                          onSelect={() => handleSelect(result)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-atlas-sm cursor-pointer"
                        >
                          <div
                            className={cn(
                              "flex items-center justify-center size-8 rounded-full",
                              type === "company" && "bg-blue-500/10 text-blue-500",
                              type === "contact" && "bg-violet-500/10 text-violet-500",
                              type === "deal" && "bg-amber-500/10 text-amber-500",
                              type === "activity" && "bg-emerald-500/10 text-emerald-500",
                              type === "page" && "bg-muted/50 text-muted-foreground",
                              type === "action" && "bg-tactical-500/10 text-tactical-500"
                            )}
                          >
                            {result.icon || typeIcons[type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {result.title}
                            </div>
                            {result.subtitle && (
                              <div className="text-xs text-muted-foreground truncate">
                                {result.subtitle}
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  );
                })}
              </>
            )}
          </CommandList>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-mono">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-mono">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-mono">esc</kbd>
                close
              </span>
            </div>
            <span>Powered by Mortis Atlas</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// KEYBOARD SHORTCUT HOOK
// =============================================================================

export function useCommandPaletteShortcut(
  onOpen: () => void,
  enabled: boolean = true
) {
  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpen, enabled]);
}

// =============================================================================
// COMMAND PALETTE PROVIDER
// =============================================================================

interface CommandPaletteContextValue {
  isOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
}

const CommandPaletteContext = React.createContext<CommandPaletteContextValue | null>(null);

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const openPalette = React.useCallback(() => setIsOpen(true), []);
  const closePalette = React.useCallback(() => setIsOpen(false), []);
  const togglePalette = React.useCallback(() => setIsOpen((prev) => !prev), []);

  // Register keyboard shortcut
  useCommandPaletteShortcut(togglePalette);

  const value = React.useMemo(
    () => ({ isOpen, openPalette, closePalette, togglePalette }),
    [isOpen, openPalette, closePalette, togglePalette]
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette open={isOpen} onOpenChange={setIsOpen} />
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const context = React.useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  }
  return context;
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  searchResults,
  fuzzyMatch,
  getRecentSearches,
  saveRecentSearch,
  typeIcons,
  typeLabels,
  navigationPages,
  quickActions,
};

export default CommandPalette;
