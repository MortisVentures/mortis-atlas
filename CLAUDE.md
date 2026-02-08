# Mortis Atlas - Project Context

> **Last Updated:** 2026-02-08

## Overview

Mortis Atlas is a VC fund CRM and portfolio management platform built with Next.js 14 (App Router), Prisma, PostgreSQL (Supabase), and Tailwind CSS with a neumorphic design system.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL via Supabase, Prisma ORM
- **Auth:** NextAuth (session-based, `src/lib/auth/`)
- **Styling:** Tailwind CSS, custom neumorphic design tokens
- **Charts:** Tremor (`@tremor/react`)
- **Animation:** Framer Motion
- **Icons:** Radix UI icons
- **Package Manager:** pnpm

## Key Architecture Patterns

### API Routes
- Located at `src/app/api/`
- Auth-protected via `auth()` from `@/lib/auth` returning session with `user.id`
- Return `NextResponse.json({ data })` or `{ error }` with appropriate status codes
- Prisma client at `@/lib/db/prisma`

### Database Models (Prisma)
- `Deal` - with `DealStage` (8 stages: INITIAL_REVIEW → CLOSED_WON/CLOSED_LOST) and `DealSource` (9 types: REFERRAL, DIRECT_OUTREACH, INBOUND, CONFERENCE, ACCELERATOR, NETWORK, PORTFOLIO, INVESTOR_NETWORK, OTHER)
- `Company`, `Contact`, `Activity`, `Document`, `ICMemo`, `DealTeamMember`
- `Contact.referredDeals` via `@relation("DealReferrer")` — referral metrics auto-calculated

### Hooks
- Located at `src/hooks/`
- Pattern: `useState` + `useCallback` + `useEffect` for data fetching, `useMemo` for computed data
- Examples: `use-deals-kanban.ts`, `use-source-attribution.ts`

### Source Attribution System
- Types in `src/lib/deals/source-tracking.ts` — `SourceType = DealSource` (Prisma enum)
- `DealSourceInfo` interface for source detail metadata (referrer, event, channel, etc.)
- `DealWithSource` interface used by analytics components
- Calculation utilities: `calculateSourceMetrics()`, `calculateFunnelBySource()`, etc.
- API endpoints: `/api/sources/deals` (deals as DealWithSource[]), `/api/sources/referrers` (contacts with referral metrics)
- Hook: `useSourceAttribution()` fetches both endpoints in parallel

### Component Organization
- UI primitives in `src/components/ui/` (Card, Button, Badge, Input, etc.)
- Feature components in `src/components/{feature}/` (deals, companies, documents, etc.)
- Layout components in `src/components/layout/` (sidebar, command palette)
- Dashboard widgets in `src/components/dashboard/`
- Barrel exports via `index.ts` in each component directory

### Pages
- Dashboard: `/dashboard`
- Companies: `/companies`, `/companies/[id]`, `/companies/[id]/edit`, `/companies/new`
- Contacts: `/contacts`, `/contacts/[id]`, `/contacts/[id]/edit`, `/contacts/new`
- Deals: `/deals`, `/deals/[id]`, `/deals/[id]/edit`, `/deals/new`, `/deals/sources`, `/deals/portfolio`
- Documents: `/documents`, `/documents/upload`
- IC Memos: `/ic-memos`, `/ic-memos/[id]`, `/ic-memos/new`
- Reports: `/reports/lp-quarterly`
- Tasks: `/tasks`
- Portfolio: `/portfolio`

## Database Configuration
- DB helper functions in `src/lib/db/deals.ts` (CRUD, referrer metrics, source stats, stage/source/priority configs)
- `DEAL_SOURCE_CONFIG`, `DEAL_STAGE_CONFIG`, `DEAL_PRIORITY_CONFIG` records with labels and colors

## Recent Changes (Feb 4, 2026)
- Connected deal source attribution page (`/deals/sources`) to real database
- Aligned `SourceType` with Prisma `DealSource` enum (removed old values: CO_INVESTOR → INVESTOR_NETWORK, PORTFOLIO_REFERRAL → PORTFOLIO, COLD_OUTREACH → DIRECT_OUTREACH, UNIVERSITY → NETWORK, added OTHER)
- Created API endpoints: `/api/sources/deals`, `/api/sources/referrers`
- Created `useSourceAttribution()` hook for parallel data fetching
- Rewired sources page from hardcoded sample data to real DB data with loading/error states
- Updated referrer-management component to default to `[]` instead of sample data
- Updated source-tracking component enum values and renamed `DealSource` interface to `DealSourceInfo`

## Completed Sprint: Activity/Meeting Infrastructure (Feb 5-6, 2026)

**Full plan:** See `PLAN.md`

### Problem (Resolved)
Dead buttons throughout the app - Log Activity, Schedule Meeting, Add Document buttons had no onClick handlers. Activity model existed in Prisma but no API/UI to use it.

### Phase 1: Critical Fixes ✅ COMPLETE
1. ✅ **Activity Infrastructure** - Created `src/lib/db/activities.ts`, `/api/activities` routes
2. ✅ **ActivityModal Component** - Form for logging activities with type, subject, description, associations
3. ✅ **Wire Deal Page Buttons** - Created `DealActions` client component with modal state/handlers
4. ✅ **Wire Company Page Button** - Added modal to company-detail-view.tsx

### Phase 2: Meeting Enhancement ✅ COMPLETE
5. ✅ **Meeting-specific fields** - When type=MEETING, shows meeting type, location, duration
6. ✅ **Meeting list component** - MeetingList and MeetingCard components with useMeetings hook
7. ✅ **Dashboard integration** - Schedule Meeting quick action opens modal, MeetingCard shows upcoming

### Phase 3: Activity Display ✅ COMPLETE
8. ✅ **Activity timeline on deal page** - DealActivityTimeline fetches and displays activities
9. ✅ **Document section on deal page** - DealDocumentList shows associated documents
10. ✅ **Documents page real data** - Connected to database via useDocuments hook

**Files Created (All Phases):**
- `src/lib/db/activities.ts` - CRUD helpers
- `src/lib/validations/activity.ts` - Zod validation schemas
- `src/app/api/activities/route.ts` - GET/POST
- `src/app/api/activities/[id]/route.ts` - GET/PUT/DELETE
- `src/lib/activities/activity-config.ts` - Client-safe activity type config
- `src/lib/activities/index.ts` - Barrel export
- `src/components/activities/activity-modal.tsx` - Modal form with meeting-specific fields
- `src/components/activities/meeting-list.tsx` - MeetingList and MeetingCard components
- `src/components/activities/index.ts` - Components barrel export
- `src/app/deals/[id]/deal-actions.tsx` - Client component for deal actions
- `src/app/deals/[id]/deal-activity-timeline.tsx` - Activity timeline on deal page
- `src/app/deals/[id]/deal-document-list.tsx` - Document list on deal page
- `src/hooks/use-meetings.ts` - Hook for fetching meetings from API
- `src/hooks/use-documents.ts` - Hook for fetching documents from API

## Completed: Portfolio Page + Dashboard Real Data (Feb 6, 2026)

### Sector Updates
- Updated `SECTOR_OPTIONS` in `src/lib/validations/company.ts` to Mortis Ventures thesis-aligned sectors:
  - Triple-Use, Autonomy, Robotics, Power, Compute, Industry 4.0, AI, Other

### Portfolio Page Enhancements (`/deals/portfolio`)
- Added `AreaChart` showing cumulative portfolio growth over time (by deal close date)
- Added `DonutChart` showing sector distribution of portfolio companies
- Charts appear in 2-column grid between metrics cards and search

### Dashboard Real Data Connection
- Created `src/hooks/use-dashboard-stats.ts` hook that fetches from `/api/deals/stats` and `/api/deals?stage=CLOSED_WON` in parallel
- Updated `src/app/dashboard/page.tsx` to use real data for KPIGrid:
  - Total AUM = total invested from CLOSED_WON deals
  - Portfolio Companies = actual count with sector breakdown
  - Active Deals = real count with conversion rate
  - Pipeline Value = actual pipeline value from active deals
- Added `isLoading` prop to `KPIGrid` component for skeleton state

**Files Modified/Created:**
- `src/lib/validations/company.ts` - Updated SECTOR_OPTIONS
- `src/app/deals/portfolio/page.tsx` - Added charts
- `src/hooks/use-dashboard-stats.ts` - New hook
- `src/app/dashboard/page.tsx` - Uses real stats
- `src/components/dashboard/kpi-grid.tsx` - Added loading state

## Completed: IC Memos Database Integration (Feb 8, 2026)

### Overview
Connected IC Memos to the database using the **Mortis Ventures IC Memo format** with structured queryable fields for investment outcome learning.

### Schema Updates (Prisma)
New enums added:
- `ScoreRating` (STRONG, MODERATE, WEAK, ADEQUATE)
- `ICMemoRecommendation` (INVEST, PASS, REVISIT)
- `ICMemoDecision` (APPROVED, DECLINED, DEFERRED)

ICMemo model extended with 30+ queryable fields:
- **Thesis Alignment:** `focusArea`, `stage`
- **Scores:** `tripleUseScore`, `wlcdiaScore`, `teamScore`, `marketScore`, `capitalEfficiencyScore`
- **Founder Ratings:** `founderTechRating`, `founderBusinessRating`, `founderDesignRating` (1-5)
- **Market Sizing:** `tam`, `sam`, `som`
- **Capital Metrics:** `trlStage`, `monthlyBurn`, `runwayMonths`
- **Financial Terms:** `askAmount`, `askValuation`, `preMoneyValuation`, `postMoneyValuation`, `roundSize`, `mortisInvestment`, `mortisOwnership`, `followOnReserve`
- **Projections:** `projectedExitYears`, `targetExitLow`, `targetExitHigh`, `projectedMoicLow`, `projectedMoicHigh`
- **Decision:** `memoRecommendation`, `decisionRationale`, `finalDecision`
- **Content:** `content` (JSON) - narrative sections for Triple-Use, WLCDIA, Team GWC, Market, Risks, etc.

### IC Memo Workflow
```
/ic-memos/new (Create) → /ic-memos (List) → /ic-memos/[id] (View + Vote)

Statuses: DRAFT → SUBMITTED → UNDER_REVIEW → PENDING_VOTE → APPROVED/REJECTED
```

### Files Created
| File | Purpose |
|------|---------|
| `src/lib/validations/ic-memo.ts` | Zod schemas + UI config (FOCUS_AREA_OPTIONS, SCORE_RATING_CONFIG, etc.) |
| `src/lib/db/ic-memos.ts` | CRUD helpers, voting, stats |
| `src/app/api/ic-memos/route.ts` | GET list, POST create |
| `src/app/api/ic-memos/[id]/route.ts` | GET, PUT, DELETE |
| `src/app/api/ic-memos/[id]/submit/route.ts` | POST submit for IC review |
| `src/app/api/ic-memos/[id]/votes/route.ts` | GET votes, POST cast vote, DELETE |
| `src/hooks/use-ic-memos.ts` | `useICMemos`, `useICMemoDetail`, `useCreateICMemo` hooks |

### Pages Updated
- `/ic-memos` - List page with status filtering, real counts from API
- `/ic-memos/new` - Complete rebuild with Mortis IC Memo format (multi-section form with sidebar nav)
- `/ic-memos/[id]` - Detail page with all sections + live voting functionality
- Both pages have "Back to Top" floating button for navigation

### Dashboard Integration
- Fixed "Review IC Memos" quick action to route to `/ic-memos` (was `/memos`)
- Keyboard shortcut `⌘ I` navigates to IC Memos

### Future: Insights Queries
The structured schema enables outcome learning queries:
```sql
-- Average scores for APPROVED vs DECLINED deals
SELECT finalDecision, AVG(founderTechRating), COUNT(*) FROM ICMemo GROUP BY finalDecision;

-- Triple-Use score correlation with outcomes
SELECT tripleUseScore, finalDecision, COUNT(*) FROM ICMemo GROUP BY tripleUseScore, finalDecision;
```

## Build & Dev
```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm lint       # ESLint
```
