# Mortis Atlas - Project Context

> **Last Updated:** 2026-02-06

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

## Build & Dev
```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm lint       # ESLint
```
