# Mortis Atlas - Project Context

> **Last Updated:** 2026-02-17

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
- **Email Integration:** `EmailAccount`, `EmailThread`, `EmailMessage`, `UnknownSender`, `CalendarEvent`
- `EmailProvider` enum (GMAIL, OFFICE365), `UnknownSenderStatus` enum (PENDING, CREATED_CONTACT, etc.)

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
- Insights: `/insights` (tabbed: Overview, Deal Flow, Outcomes, Trends)
- Inbox: `/inbox` (email proposals, unknown sender detection)
- Companies: `/companies`, `/companies/[id]`, `/companies/[id]/edit`, `/companies/new`
- Contacts: `/contacts`, `/contacts/[id]`, `/contacts/[id]/edit`, `/contacts/new`
- Deals: `/deals`, `/deals/[id]`, `/deals/[id]/edit`, `/deals/new`, `/deals/sources`, `/deals/portfolio`
- Documents: `/documents`, `/documents/upload`
- IC Memos: `/ic-memos`, `/ic-memos/[id]`, `/ic-memos/new`
- Reports: `/reports/lp-quarterly`
- Tasks: `/tasks`
- Portfolio: `/portfolio`
- Settings: `/settings/integrations` (email account management), `/settings/security` (2FA)

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

## Completed: Security Hardening (Phases 0-2) (Feb 9, 2026)

### Overview
Production security hardening implementing defense-in-depth for authentication, authorization, and audit capabilities.

### Security Headers (`next.config.mjs`)
- **HSTS** - Strict-Transport-Security with 1-year max-age
- **CSP** - Content-Security-Policy with strict source policies
- **X-Frame-Options** - DENY to prevent clickjacking
- **X-Content-Type-Options** - nosniff to prevent MIME-type attacks
- **Referrer-Policy** - strict-origin-when-cross-origin
- **Permissions-Policy** - Restrictive camera/microphone/geolocation policies

### Rate Limiting (`src/lib/security/rate-limit.ts`)
In-memory rate limiter with sliding window:
- **Auth endpoints:** 5 requests/minute (login, 2FA)
- **API endpoints:** 100 requests/minute (general)
- Applied via middleware at `/api/auth/*` and `/api/*`

### Two-Factor Authentication (`src/lib/auth/totp.ts`)
TOTP-based 2FA infrastructure:
- **Setup:** `/api/auth/2fa/setup` - Generate secret + QR code
- **Verify:** `/api/auth/2fa/verify` - Validate TOTP code
- **Disable:** `/api/auth/2fa/disable` - Remove 2FA (requires code verification)
- **UI:** `/settings/security` - 2FA management interface

User model extended with:
- `twoFactorEnabled: Boolean`
- `twoFactorSecret: String?` (encrypted)
- `twoFactorBackupCodes: String[]`

### Audit Logging (`src/lib/audit/logger.ts`)
Enhanced audit trail for security-relevant events:
- Login/logout events
- 2FA setup/disable
- Password changes
- Role changes
- Failed auth attempts

### Password Policy (`src/lib/validations/auth.ts`)
Strong password requirements:
- Minimum 12 characters
- Mixed case (uppercase + lowercase)
- At least one number
- At least one special character
- Zod schema for validation

### Role-Based Access Control

**User Roles:** `ADMIN`, `USER`, `LP`

**Role Routing:**
- `LP` users → `/lp/dashboard` (restricted sidebar, LP-specific navigation)
- `ADMIN` users → Full access + `/admin/*` routes
- `USER` → Standard CRM access

### New Routes

#### LP Portal (`/lp/*`)
| Route | Purpose |
|-------|---------|
| `/lp/dashboard` | LP-specific dashboard |
| `/lp/reports` | Quarterly reports viewer |
| `/lp/documents` | Shared documents access |
| `/lp/capital-calls` | Capital call history |

LP users see restricted sidebar with only LP-relevant navigation.

#### Admin Panel (`/admin/*`)
| Route | Purpose |
|-------|---------|
| `/admin/users` | User management (create, edit, deactivate) |
| `/admin/audit` | Audit log viewer |
| `/admin/settings` | System settings |

#### Settings (`/settings/*`)
| Route | Purpose |
|-------|---------|
| `/settings/security` | 2FA setup/management |
| `/settings/profile` | Profile settings |

### Auth Hardening (`src/lib/auth/config.ts`)
- **OAuth Account Linking:** Disabled to prevent account takeover
- **Session Invalidation:** Sessions invalidated when user deactivated
- **Secure Callbacks:** Enhanced JWT/session callbacks

### Authorization Fixes
- `src/lib/db/companies.ts` - Added `userId` filter to queries
- `src/lib/db/contacts.ts` - Added `userId` filter to queries
- Ensures users can only access their own data

### Files Created
| File | Purpose |
|------|---------|
| `src/lib/security/rate-limit.ts` | In-memory rate limiting |
| `src/lib/auth/totp.ts` | TOTP generation/verification |
| `src/lib/audit/logger.ts` | Enhanced audit logging |
| `src/lib/validations/auth.ts` | Password policy validation |
| `src/app/api/auth/2fa/setup/route.ts` | 2FA setup endpoint |
| `src/app/api/auth/2fa/verify/route.ts` | 2FA verification endpoint |
| `src/app/api/auth/2fa/disable/route.ts` | 2FA disable endpoint |
| `src/app/api/admin/users/route.ts` | User management API |
| `src/app/lp/*` | LP Portal pages |
| `src/app/admin/*` | Admin Panel pages |
| `src/app/settings/*` | Settings pages |
| `scripts/create-lp-user.ts` | Test LP user creation |

### Test Accounts
Create LP test user via:
```bash
pnpm tsx scripts/create-lp-user.ts
```

---

## Completed: Insights Engine (Feb 9, 2026)

### Overview
Solo GP decision intelligence system that tracks KPIs, surfaces patterns from IC Memo data, and correlates deal outcomes with founder ratings, scores, and market sizing.

### Route
Single `/insights` page with 4 tabbed sections:
1. **Overview** - Key KPIs with confidence indicators, top signals, recommendations
2. **Deal Flow** - Source effectiveness, time-in-stage bottlenecks, deal velocity
3. **Outcome Learning** - IC Memo correlations (founder ratings, scores vs decisions)
4. **Trends** - Deal volume over time, sector distribution, source shifts

### Sparse Data Handling
The engine handles early-stage funds with limited data gracefully:
- Confidence badges (low/medium/high) on all metrics
- Thresholds: 5+ for patterns, 10+ for medium confidence, 20+ for high confidence
- `SparseDataNotice` component with actionable prompts to add more data

### Files Created

#### Core Infrastructure
| File | Purpose |
|------|---------|
| `src/lib/insights/types.ts` | TypeScript interfaces for all insights data |
| `src/lib/insights/thresholds.ts` | Confidence levels, data thresholds, formatting utilities |
| `src/lib/insights/index.ts` | Barrel export |
| `src/lib/db/insights.ts` | Prisma queries for analytics aggregations |

#### API
| File | Purpose |
|------|---------|
| `src/app/api/insights/route.ts` | GET with `?section=` param (overview, deal-flow, outcomes, trends, all) |

#### Hook
| File | Purpose |
|------|---------|
| `src/hooks/use-insights.ts` | `useInsights()` hook with section-specific variants |

#### Page & Components
| File | Purpose |
|------|---------|
| `src/app/insights/page.tsx` | Server component with auth |
| `src/app/insights/insights-dashboard.tsx` | Client component with tab navigation |
| `src/components/insights/index.ts` | Barrel export |
| `src/components/insights/insight-kpi-grid.tsx` | KPI cards with confidence indicators |
| `src/components/insights/source-effectiveness-chart.tsx` | Source conversion visualization |
| `src/components/insights/time-in-stage-chart.tsx` | Stage bottleneck detection |
| `src/components/insights/deal-velocity-chart.tsx` | Monthly deal flow tracking |
| `src/components/insights/founder-rating-matrix.tsx` | Founder ratings heatmap |
| `src/components/insights/score-correlation-chart.tsx` | Score vs outcome visualization |
| `src/components/insights/pattern-card.tsx` | Pattern/signal display |
| `src/components/insights/deal-volume-trend.tsx` | Volume trend over time |
| `src/components/insights/sector-distribution-chart.tsx` | Sector distribution donut/bar |
| `src/components/insights/sparse-data-notice.tsx` | Empty/sparse data states |

### Navigation
- Added to sidebar under Dashboard
- Added to command palette with keywords (insights, analytics, patterns, outcomes)

### Key Features

#### Overview Tab
- 6 KPIs: Total Deals, Conversion Rate, Avg Time to Close, Pipeline Value, Portfolio Value, Active Deals
- Auto-generated insights: Best performing source, stage bottlenecks, sector concentration
- Confidence badges on all metrics

#### Deal Flow Tab
- Source effectiveness table with conversion rates, avg time, total invested
- Time-in-stage chart with bottleneck detection (highlights stages exceeding thresholds)
- Deal velocity chart (new vs closed over last 6 months)
- Funnel conversion visualization

#### Outcome Learning Tab
- Founder rating matrix: Tech/Business/Design ratings (1-5) vs approval rate
- Score effectiveness: Strong vs Weak score approval rates for all 5 scores
- Auto-identified patterns (e.g., "Strong founder ratings correlate with approvals")
- Best predictor identification

#### Trends Tab
- Deal volume trend (last 12 months)
- Sector distribution with donut + bar charts
- Source shifts (last 3 months vs previous 3 months)

### Example Queries (in `src/lib/db/insights.ts`)
```typescript
// Founder rating correlations
prisma.iCMemo.groupBy({
  by: ['founderTechRating', 'finalDecision'],
  where: { authorId: userId, finalDecision: { not: null } },
  _count: { id: true },
});

// Source effectiveness
prisma.deal.findMany({
  where: { userId },
  select: { sourceType: true, stage: true, amount: true, createdAt: true, actualClose: true },
});

// Deal velocity by month
prisma.deal.groupBy({
  by: ['createdAt'],
  where: { userId, createdAt: { gte: sixMonthsAgo } },
  _count: { id: true },
});
```

---

## Completed: Email Integration with Smart Contact Proposals (Feb 10, 2026)

### Overview
Gmail OAuth integration with intelligent unknown sender detection. Syncs email threads, detects unknown senders, scores them by priority, and surfaces batched contact proposals for review.

### Core Flow
```
Email Sync → Detect Unknown Sender → Score & Prioritize → Batch Proposals → User Reviews
```

### Gmail OAuth (`src/lib/integrations/email/gmail-client.ts`)
- OAuth 2.0 flow with PKCE
- Token encryption with AES-256-GCM (`src/lib/security/encryption.ts`)
- Scopes: `gmail.readonly`, `gmail.metadata`
- Auto token refresh on expiry

### Email Sync (`src/lib/integrations/email/sync.ts`)
- Initial sync: Last 90 days of email threads
- Incremental sync: Uses Gmail `historyId` cursor
- Stores thread metadata + message headers (not full body)
- Detects unknown senders on each sync

### Detection Engine (`src/lib/integrations/detection/`)

| File | Purpose |
|------|---------|
| `unknown-sender-detector.ts` | Identifies senders not in contacts DB |
| `scoring.ts` | Priority scoring (engagement, recency, VIP domains, deal keywords) |
| `signature-parser.ts` | Extracts name, title, phone, LinkedIn from email signatures |
| `company-matcher.ts` | Matches sender domains to existing companies |

**Scoring Algorithm:**
- Message count: +5/msg (max 25)
- Thread count: +10/thread (max 30)
- Last 7 days: +15
- First seen < 7 days: +10
- Multi-thread engagement: +10
- Deal keywords (investment, term sheet, etc.): +20
- VIP domains (known investors/portfolio): +50

### Proposal UI (`/inbox`)
- Batched proposals list with score badges
- Quick create (uses parsed signature data)
- Full modal for editing/company linking
- Dismiss with reason tracking
- Company matching: link to existing or create new

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/integrations/email/connect` | GET | Start Gmail OAuth |
| `/api/integrations/email/callback` | GET | OAuth callback |
| `/api/integrations/email/accounts` | GET/DELETE | List/remove accounts |
| `/api/integrations/email/sync` | POST | Trigger email sync |
| `/api/proposals` | GET | Pending proposals |
| `/api/proposals/[id]/create` | POST | Create contact from proposal |
| `/api/proposals/[id]/dismiss` | POST | Dismiss proposal |
| `/api/inbox/threads` | GET | Email threads list |

### Files Created

#### Core Infrastructure
| File | Purpose |
|------|---------|
| `src/lib/security/encryption.ts` | AES-256-GCM for OAuth tokens |
| `src/lib/integrations/email/types.ts` | TypeScript interfaces |
| `src/lib/integrations/email/gmail-client.ts` | Gmail API client |
| `src/lib/integrations/email/sync.ts` | Email sync service |

#### Detection
| File | Purpose |
|------|---------|
| `src/lib/integrations/detection/unknown-sender-detector.ts` | Sender detection |
| `src/lib/integrations/detection/scoring.ts` | Priority scoring |
| `src/lib/integrations/detection/signature-parser.ts` | Signature extraction |
| `src/lib/integrations/detection/company-matcher.ts` | Domain matching |

#### UI
| File | Purpose |
|------|---------|
| `src/app/inbox/page.tsx` | Inbox page (server) |
| `src/app/inbox/inbox-dashboard.tsx` | Inbox dashboard (client) |
| `src/app/settings/integrations/page.tsx` | Account management |
| `src/components/email/proposals-list.tsx` | Proposals list |
| `src/components/email/contact-proposal-modal.tsx` | Create contact modal |
| `src/components/ui/tabs.tsx` | Radix Tabs component |
| `src/components/ui/radio-group.tsx` | Radix RadioGroup component |

#### Hooks
| File | Purpose |
|------|---------|
| `src/hooks/use-email-accounts.ts` | Email account management |
| `src/hooks/use-proposals.ts` | Proposals CRUD |

### Environment Variables
```bash
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
ENCRYPTION_KEY="..."  # 32-byte base64 for AES-256
```

### Future: Office 365 + Calendar
- Microsoft Graph OAuth (scaffolded but marked "Coming Soon")
- Calendar sync for meeting detection
- Auto-link meetings to deals/companies

---

## Completed: Google Calendar Integration (Feb 10, 2026)

### Overview
"Top 1%" Google Calendar integration with Meeting Prep Intelligence, Relationship Heat Tracking, Auto-Linking, Meeting Stage Detection, and full Insights Engine Integration.

### Core Value Proposition
| Feature | What It Does |
|---------|--------------|
| **Meeting Prep Intelligence** | Auto-generates contextual briefs before meetings |
| **Relationship Heat Tracking** | Scores and trends engagement by company/contact |
| **Auto-Linking** | Matches attendees to contacts/companies/deals |
| **Meeting Stage Detection** | Detects pitch vs diligence vs partner review |
| **Insights Integration** | Meeting cadence correlations with outcomes |

### Schema Updates (Prisma)
New enums:
- `CalendarProvider` (GOOGLE, OFFICE365)
- `MeetingType` (INITIAL_PITCH, DUE_DILIGENCE, PARTNER_MEETING, BOARD_MEETING, FOLLOW_UP, NETWORKING, PORTFOLIO_CHECK_IN, INVESTOR_UPDATE, OTHER)
- `RelationshipHeat` (HOT, WARM, COOLING, COLD)

New models:
- `CalendarAccount` - OAuth tokens (encrypted), sync cursor, calendar settings
- `CalendarEvent` - Extended with detectedType, typeConfidence, auto-linking fields
- `CalendarAttendee` - Per-attendee with contact/company links
- `MeetingPrepBrief` - Generated prep context for meetings
- `RelationshipMetrics` - Heat scores, trend tracking per company/contact

### Key Algorithms

**Relationship Heat Scoring (0-100):**
```
Recency (max 40 pts):    Last 7d=40, 14d=35, 30d=25, 60d=15, 90d=5
Frequency (max 35 pts):  4+/mo=35, 2+/mo=28, 1+/mo=20, 0.5+/mo=12
Trend (max 25 pts):      Rising=25, Slight rise=20, Stable=15, Declining=0

Heat Levels: HOT (≥70), WARM (≥40), COOLING (≥15), COLD (<15)
```

**Meeting Type Detection:**
- Keyword scoring on title, description, attendees
- Pattern matching: "pitch", "due diligence", "partner meeting", etc.
- Attendee analysis: internal-only vs external present
- Returns type + confidence score

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/calendar/connect` | GET | Generate Google OAuth URL |
| `/api/calendar/callback` | GET | OAuth callback, store tokens |
| `/api/calendar/accounts` | GET/DELETE | List/remove connected accounts |
| `/api/calendar/sync` | POST | Trigger calendar sync |
| `/api/calendar` | GET | List events with filters |
| `/api/calendar/[id]` | GET/PUT | Single event operations |
| `/api/calendar/prep/[eventId]` | GET | Get meeting prep brief |
| `/api/calendar/insights` | GET | Calendar analytics |

### Files Created

#### Core Infrastructure (`src/lib/integrations/calendar/`)
| File | Purpose |
|------|---------|
| `types.ts` | TypeScript interfaces, constants, heat config |
| `google-calendar-client.ts` | OAuth flow, API client |
| `sync.ts` | CalendarSyncService, event upsert |
| `attendee-matcher.ts` | Email/domain matching to contacts/companies |
| `meeting-type-detector.ts` | Stage detection engine |
| `meeting-prep.ts` | Prep brief generation |
| `relationship-tracker.ts` | Heat score calculation |
| `index.ts` | Barrel export |

#### Database (`src/lib/db/`)
| File | Purpose |
|------|---------|
| `calendar.ts` | Calendar CRUD operations |
| `relationship-metrics.ts` | Metrics queries, heat distribution |

#### Hooks (`src/hooks/`)
| File | Purpose |
|------|---------|
| `use-calendar-accounts.ts` | Account management |
| `use-calendar.ts` | Event fetching, useUpcomingMeetings |
| `use-meeting-prep.ts` | Prep brief fetching |
| `use-relationship-heat.ts` | Relationship metrics |

#### Components (`src/components/calendar/`)
| File | Purpose |
|------|---------|
| `meeting-type-badge.tsx` | MeetingTypeBadge, MeetingTypeSelector |
| `calendar-link-dialog.tsx` | Manual event linking |
| `meeting-prep-panel.tsx` | Full prep brief display |
| `upcoming-meetings.tsx` | UpcomingMeetings, MeetingCard |
| `relationship-heat-badge.tsx` | Heat badges and indicators |
| `index.ts` | Barrel export |

#### Insights Components (`src/components/insights/`)
| File | Purpose |
|------|---------|
| `relationship-heat-grid.tsx` | Heat grid + distribution chart |
| `meeting-velocity-chart.tsx` | Meeting velocity charts |
| `calendar-insights-tab.tsx` | Full calendar insights tab |

### Meeting Prep Brief Contents
- **dealContext**: Stage, amount, team, recent activities, next milestone
- **companyContext**: Sector, valuation, funding round, previous meetings count
- **attendeeProfiles**: Name, role, company, interaction history
- **relationshipSignals**: Engagement trends, heat status
- **suggestedTalkingPoints**: Based on deal stage and meeting type
- **openQuestions**: Extracted from previous activity notes

### Insights Tab (in `/insights`)
New "Calendar" tab with:
- KPI cards: Meetings (30d/90d), Avg per Week, Upcoming
- Relationship heat distribution chart
- Hot relationships grid + Needs Attention grid
- Meeting trend chart (6 months)
- Meetings by deal stage chart
- Meeting patterns & outcomes (avg meetings for won vs lost deals)

### Environment Variables
```bash
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
ENCRYPTION_KEY="..."  # 32-byte base64 for AES-256 (shared with email)
```

### Settings Integration
- Google Calendar card on `/settings/integrations` with connect/disconnect
- Shows connected accounts with sync status
- Manual sync trigger button

---

## Completed: Layout Standardization (Feb 17, 2026)

### Overview
Comprehensive layout system audit and standardization. Implemented configurable max-width with `fullWidth` option, eliminated redundant nested layouts, and ensured consistent page structure across all routes.

### Layout System (`src/components/layout/dashboard-layout.tsx`)

**Key Changes:**
- Added `CONTENT_MAX_WIDTH = 1400` constant for readable content width
- Added `fullWidth` prop to `DashboardLayout` and `MainContent` components
- Content centers with `mx-auto` when not fullWidth
- Exported `CONTENT_MAX_WIDTH` from layout index

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  defaultSidebarCollapsed?: boolean;
  className?: string;
  fullWidth?: boolean;  // New: bypasses max-width constraint
}
```

### Layout Pattern

**Standard pages** use layout.tsx + page.tsx pattern:
```
layout.tsx → DashboardLayout + DashboardContent wrapper
page.tsx   → Fragment (<>) + PageHeader + content
```

**Full-width pages** (kanban, data-heavy views):
```typescript
// layout.tsx
<DashboardLayout fullWidth>
  <DashboardContent>{children}</DashboardContent>
</DashboardLayout>
```

### Files Modified

| File | Change |
|------|--------|
| `src/components/layout/dashboard-layout.tsx` | Added fullWidth prop, CONTENT_MAX_WIDTH |
| `src/components/layout/index.ts` | Export CONTENT_MAX_WIDTH |
| `src/app/deals/layout.tsx` | Added fullWidth prop |
| `src/app/deals/page.tsx` | Removed redundant DashboardLayout wrapper |
| `src/app/deals/[id]/page.tsx` | Removed redundant wrapper |
| `src/app/deals/[id]/edit/page.tsx` | Removed redundant wrapper |
| `src/app/deals/new/page.tsx` | Removed redundant wrapper |
| `src/app/deals/portfolio/page.tsx` | Removed redundant wrapper |
| `src/app/companies/page.tsx` | Simplified to `space-y-6` |
| `src/app/companies/new/page.tsx` | Changed to `max-w-4xl mx-auto` |
| `src/app/companies/[id]/edit/page.tsx` | Changed to `max-w-4xl mx-auto` |
| `src/app/contacts/page.tsx` | Simplified to `space-y-6` |
| `src/app/contacts/new/page.tsx` | Changed to `max-w-4xl mx-auto` |
| `src/app/contacts/[id]/edit/page.tsx` | Changed to `max-w-4xl mx-auto` |
| `src/app/ic-memos/page.tsx` | Removed redundant wrapper |
| `src/app/ic-memos/new/page.tsx` | Removed redundant wrapper |
| `src/app/ic-memos/[id]/page.tsx` | Removed redundant wrapper |
| `src/app/tasks/page.tsx` | Converted to standard pattern |

### Files Created

| File | Purpose |
|------|--------|
| `src/app/ic-memos/layout.tsx` | IC Memos layout wrapper |
| `src/app/tasks/layout.tsx` | Tasks layout wrapper |

### Layout Hierarchy

```
/deals/*           → fullWidth (kanban board)
/companies/*       → standard (1400px max)
/contacts/*        → standard (1400px max)
/documents/*       → standard (1400px max)
/ic-memos/*        → standard (1400px max)
/tasks             → standard (1400px max)
/insights          → standard (1400px max)
/inbox             → standard (1400px max)
/settings/*        → max-w-4xl (narrower for forms)
/admin/*           → custom sidebar layout
/lp/*              → custom LP portal layout
```

### Modal Components (Verified)
All modals use proper centering patterns:
- `ActivityModal` - 550px fixed positioning
- `AddCompanyModal` - Dialog 500px max
- `TaskModal` - Framer Motion 600px
- `ContactProposalModal` - Dialog 550px max
- `DocumentUploadModal` - Dialog centered

---

## Build & Dev
```bash
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm lint       # ESLint
```
