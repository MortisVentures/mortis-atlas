# Mortis Atlas - Project Context

> **Last Updated:** 2026-02-04

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

## Current Sprint: Activity/Meeting Infrastructure (Feb 5, 2026)

**Full plan:** See `PLAN.md`

### Problem
Dead buttons throughout the app - Log Activity, Schedule Meeting, Add Document buttons have no onClick handlers. Activity model exists in Prisma but no API/UI to use it.

### Phase 1: Critical Fixes
1. **Activity Infrastructure** - Create `src/lib/db/activities.ts`, `/api/activities` routes
2. **ActivityModal Component** - Form for logging activities with type, subject, description, associations
3. **Wire Deal Page Buttons** - Refactor to client component, add modal state/handlers
4. **Wire Company Page Button** - Add modal to company-detail-view.tsx

### Phase 2: Meeting Enhancement
5. **Meeting-specific fields** - When type=MEETING, show meeting type, location, duration
6. **Meeting list component** - Filter activities by type=MEETING

### Phase 3: Activity Display
7. **Activity feed on deal page** - Make counts clickable, show timeline
8. **Document section clickable** - Quick access to deal documents

### Files to Create
- `src/lib/db/activities.ts` - CRUD helpers
- `src/app/api/activities/route.ts` - GET/POST
- `src/app/api/activities/[id]/route.ts` - GET/PUT/DELETE
- `src/components/activities/activity-modal.tsx` - Modal form
- `src/components/activities/index.ts` - Barrel export

### Files to Modify
- `src/app/deals/[id]/page.tsx` - Client component refactor
- `src/components/companies/company-detail-view.tsx` - Add modal state

## Build & Dev
```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm lint       # ESLint
```
