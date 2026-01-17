# Mortis Atlas - Current Development Context

**Last Updated:** 2026-01-17
**Session Status:** Active Development

---

## Project Overview

**Mortis Atlas** is a VC fund management platform with a futuristic neumorphic UI design. Built with Next.js 14 (App Router), Prisma, PostgreSQL, Tailwind CSS, Framer Motion, and Tremor charts.

---

## Completed Features (This Session)

### 1. Deal Source Attribution & Analytics
**Location:** `src/app/(dashboard)/deals/sources/page.tsx`

**Components Created:**
- `src/lib/deals/source-tracking.ts` - Types, utilities, sample data
- `src/components/deals/source-tracking.tsx` - SourceInput, SourceBadge, SourceSummaryCard
- `src/components/deals/source-analytics.tsx` - SourceAnalyticsDashboard, SourceFunnelVisualization
- `src/components/deals/referrer-management.tsx` - ReferrerCard, ReferrerList, ThankYouAutomation, ReferralRewards, ReferrerManagementDashboard
- `src/components/deals/index.ts` - Barrel exports

**Features:**
- 8 source types: INBOUND, REFERRAL, CONFERENCE, CO_INVESTOR, PORTFOLIO_REFERRAL, COLD_OUTREACH, ACCELERATOR, UNIVERSITY
- Referrer tier system (BRONZE, SILVER, GOLD, PLATINUM)
- Conversion rate tracking, time-to-close metrics
- Source funnel visualization
- Referrer leaderboard and management
- Thank-you automation tracking
- Referral rewards tracking

---

### 2. LP Quarterly Report Generator
**Location:** `src/app/(dashboard)/reports/lp-quarterly/page.tsx`

**Components Created:**
- `src/lib/reports/lp-report.ts` - Types, utilities, sample data for all report sections
- `src/components/reports/lp-report-pdf.tsx` - PDF generation using @react-pdf/renderer
- `src/components/reports/report-distribution.tsx` - DistributionModal, DistributionTracking, ReportArchiveList, LPManagement
- `src/components/reports/index.ts` - Barrel exports

**Report Sections:**
1. **Fund Overview** - Fund size, capital called, distributions, NAV
2. **Performance Summary** - IRR, MOIC, TVPI, DPI, RVPI with benchmark comparison
3. **Portfolio Update** - Companies list, markups/markdowns, exits, follow-ons
4. **Deal Activity** - Funnel, sector breakdown, pipeline stats
5. **Upcoming Events** - Exits, refinancing, board meetings, milestones
6. **Market Commentary** - Sector trends, competitive landscape, regulatory updates

**Features:**
- Template-based customization (sections toggle, brand colors)
- PDF export with professional 4-page layout
- LP distribution modal with recipient selection
- Distribution tracking (sent/opened/downloaded)
- Historical reports archive
- Data room upload option

---

## Previously Completed (From Earlier Sessions)

Based on git status and codebase structure:

1. **Design System** - Neumorphic UI components
2. **Dashboard Components** - Main layout
3. **Command Palette (⌘K)** - Quick navigation
4. **Company Detail Page** - Prisma data integration
5. **IC Memo Creation & Approval Workflow**
6. **Task Management System**
7. **Document Management with Supabase Storage**
8. **Fund-Level Analytics Dashboard** (IRR, MOIC, TVPI calculations)

---

## Key Technical Patterns

### Component Structure
- Client/server component split for Next.js App Router
- `"use client"` directive for interactive components
- Sample data approach for rapid UI development

### Styling
- Neumorphic card design: `<Card variant="neumorphic">`
- Tremor for charts (BarChart, DonutChart, AreaChart)
- Framer Motion for animations
- Tailwind CSS for styling

### Data
- Prisma ORM for PostgreSQL
- Sample data constants for development (e.g., `SAMPLE_PORTFOLIO`, `SAMPLE_REFERRERS`)
- Type-safe interfaces throughout

---

## File Structure Reference

```
src/
├── app/
│   └── (dashboard)/
│       ├── deals/
│       │   └── sources/page.tsx       # Deal source attribution
│       ├── reports/
│       │   └── lp-quarterly/page.tsx  # LP report generator
│       └── analytics/
│           └── fund-performance/page.tsx
├── components/
│   ├── deals/
│   │   ├── source-tracking.tsx
│   │   ├── source-analytics.tsx
│   │   ├── referrer-management.tsx
│   │   └── index.ts
│   ├── reports/
│   │   ├── lp-report-pdf.tsx
│   │   ├── report-distribution.tsx
│   │   └── index.ts
│   └── ui/                            # Shared UI components
├── lib/
│   ├── deals/
│   │   └── source-tracking.ts         # Types & utilities
│   ├── reports/
│   │   └── lp-report.ts               # Types & utilities
│   └── analytics/
│       └── fund-metrics.ts            # IRR, MOIC calculations
```

---

## Dependencies Added

```json
{
  "@react-pdf/renderer": "^4.3.2",
  "@supabase/supabase-js": "installed earlier",
  "@tremor/react": "already present"
}
```

---

## Current Phase Status

### Phase 0: Context Management Setup ✅ COMPLETE
- Created `.claude/` directory structure
- Established CRM_BLUEPRINT.md as authoritative source
- Documented architecture decisions in DECISIONS.md
- Set up PHASE_TRACKER.md for milestone management

### Phase 1A: Contact Detail Page ✅ COMPLETE
- Created dynamic route `/contacts/[id]/page.tsx`
- Implemented API endpoint `/api/contacts/[id]/route.ts`
- Added error handling for invalid contact IDs (404)
- Included placeholder for Phase 2 referral tracking
- Navigation: list → detail → back works

### Phase 1B: Company Intake ✅ COMPLETE
- Fixed company intake build error
- Reorganized routes with (view) group
- Add Company form now functional
- Keyboard shortcut ⌘N works

### Phase 1C: Unified Sidebar Navigation ✅ COMPLETE
- Updated sidebar navigation to include Deal Sources and Contacts links
- Applied DashboardLayout to Companies page (was using minimal Navbar)
- Applied DashboardLayout to Documents page
- Applied DashboardLayout to Deals page
- Applied DashboardLayout to (dashboard) route group
- Sidebar features: collapsible, localStorage persistence, active page highlighting

### Phase 1D: Documents Sidebar 🔄 NEXT
- Verify Documents page sidebar works correctly

### Remaining Gaps
1. **Source Attribution Isolation**: 15 deals tracked ($20.8M invested) but not linked to main pipeline

---

## Recent Features Completed
- Deal Source Attribution & Analytics
- LP Quarterly Report Generator

---

## Context Health Check

- **Early context:** Intact - understand project structure and patterns
- **Recent work:** Fresh - just completed LP Report Generator
- **Technical patterns:** Clear - neumorphic UI, sample data, Tremor charts
- **No degradation detected** - all features working, HTTP 200 on all pages

---

## Quick Start for New Session

1. Dev server likely running on `http://localhost:3000`
2. Key pages to test:
   - `/deals/sources` - Deal source attribution
   - `/reports/lp-quarterly` - LP report generator
   - `/analytics/fund-performance` - Fund analytics
3. Pattern: Create types/utilities in `lib/`, components in `components/`, pages in `app/(dashboard)/`
