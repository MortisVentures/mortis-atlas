# Mortis Atlas - Claude Context

## Current State (as of January 27, 2026)

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 - Foundation | ✅ Complete | Next.js 14, Prisma, Supabase, shadcn/ui |
| Phase 2 - UI Foundation | ✅ Complete | All pages and components built |
| Phase 3 - Authentication | ✅ Complete | NextAuth.js + RBAC schema |
| Phase 4 - CRUD Operations | 🟡 In Progress | Companies + Contacts + Deals + Docs + Kanban complete |
| Phase 5 - Testing | 🔴 Not Started | Integration and E2E tests |
| Phase 6 - Polish | 🔴 Not Started | UI refinements |

**Operational Readiness: ~85%** - Auth + Companies + Contacts + Deals CRUD + Source Attribution + Documents + Kanban Board complete

---

## Development Roadmap

### Priority Order (per user directive):
1. **Authentication** - Get it usable with login
2. **CRUD Functional** - Wire up all pages to database
3. **Testing** - Validate data integration across pages
4. **Polish UI** - Refine existing components
5. **Technical Capabilities** - Add advanced features

---

## Phase 3: Authentication ✅ COMPLETE

### Implemented
- [x] NextAuth.js v4 with credentials provider (email/password)
- [x] Google OAuth ready (via env vars)
- [x] Login/register pages at /auth/login, /auth/register
- [x] Middleware route protection
- [x] RBAC schema: UserRole (ADMIN, PARTNER, ANALYST, LP)
- [x] LPProfile model for LP-specific data
- [x] AuditLog model for action tracking
- [x] Permission helpers in src/lib/auth/rbac.ts
- [x] RoleGate component for conditional UI

### Key Files
```
src/lib/auth/config.ts       # NextAuth configuration
src/lib/auth/rbac.ts         # Permission helpers
src/middleware.ts            # Route protection
src/app/auth/login/page.tsx  # Login page
src/app/auth/register/page.tsx # Registration page
```

### First User = ADMIN
The first registered user automatically becomes ADMIN. All subsequent users default to ANALYST.

---

## Phase 4: CRUD Operations

### Objective
Make all pages functional with real database operations.

### Companies (Priority 1 - Core to angel tracking) ✅ COMPLETE
- [x] List: Fetch with filters, search, pagination (auth-protected)
- [x] Create: Form validation, save to DB (with userId)
- [x] Read: Detail page with related data (ownership verification)
- [x] Update: Edit form with auth + ownership checks
- [x] Delete: With confirmation + ownership verification

### Contacts (Priority 2 - Relationship tracking) ✅ COMPLETE
- [x] CRUD operations linked to companies (auth-protected)
- [x] Primary contact designation
- [x] Contact list with search/filter
- [x] Contact detail page with ownership verification
- [x] Contact form with company dropdown
- [x] Inline add contact dialog on company detail page

### Deals (Priority 3 - Pipeline tracking) 🚧 IN PROGRESS
- [x] Schema extensions (priority, source, stage history, team members)
- [x] DealTeamMember model for deal collaboration
- [x] Pipeline utilities with stage configs and thresholds
- [x] Full API endpoints (GET/POST/PUT/DELETE)
- [x] Kanban board UI for visual pipeline management (Phase 4C - Jan 27, 2026):
  - Drag-and-drop with @dnd-kit/core
  - 8 pipeline stages (Initial Review → Portfolio/Passed)
  - Deal cards with company, amount, priority badge, source badge, days in stage
  - Optimistic UI updates for stage changes
  - Filters: search, priority, source, show closed
  - Pipeline metrics: total deals, pipeline value, weighted value, high priority
  - Stage quick filters with counts
  - Key files: `src/lib/deals/pipeline-utils.ts`, `src/hooks/use-deals-kanban.ts`, `src/components/deals/kanban-board.tsx`
- [ ] Deal detail page with financials
- [ ] Stage progression with history tracking
- [x] Source attribution integration
- [x] Source attribution API endpoints (Phase 2D complete):
  - GET /api/contacts/[id]/referrals - Deals/companies referred by contact with metrics
  - GET /api/deals/[id]/source - Source attribution metadata with referrer history
  - GET /api/sources - Aggregated stats for all source types with top referrers
  - GET /api/sources/[type]/deals - Deals by source type with pagination
- [x] Source attribution UI (Phase 3D complete):
  - SourceAttributionFields reusable form component with contact autocomplete
  - Company form updated with source attribution fields
  - Deal form created with source attribution fields
  - New Deal page at /deals/new
  - Contact detail page with referral activity section
  - Companies table with source/referrer columns
  - Deal cards with source attribution metadata row
- [x] Clickable referrers (Phase 3E complete):
  - Referrer names on /deals/sources page link to contact detail
  - Added contactId field to Referrer interface
  - Contact detail page accepts ?highlight=referrals query param
  - Auto-scrolls to referral activity section with visual highlight

### Documents (Priority 4 - File management) ✅ COMPLETE
- [x] Document database functions (lib/db/documents.ts)
- [x] Full API endpoints (Phase 4A complete):
  - GET/POST /api/documents - List with filters, upload new
  - GET/PUT/DELETE /api/documents/[id] - Single document operations
  - GET /api/documents/stats - Document statistics
  - POST /api/documents/[id]/version - Upload new version
  - GET /api/documents/[id]/download - Get signed download URL
  - POST/DELETE /api/documents/[id]/share - Create/revoke share links
- [x] Document upload form with company/deal linking
- [x] Document upload page at /documents/upload
- [x] Supabase Storage integration (existing)
- [x] Document versioning support
- [x] Access logging and audit trail

### Activities (Priority 5 - Interaction logging)
- [ ] Quick-add from any context
- [ ] Activity feed on dashboard
- [ ] Filter by type, date, entity

### Tasks (Priority 6 - Action items)
- [ ] Task CRUD with due dates
- [ ] Dashboard widget integration
- [ ] Mark complete workflow

---

## Phase 5: Testing & Validation

### Objective
Ensure data integrity and page accessibility.

### Integration Tests
- [ ] API route testing (all endpoints)
- [ ] Database operation validation
- [ ] Auth flow testing

### E2E Tests (Playwright)
- [ ] Navigation to all pages
- [ ] CRUD workflows for each entity
- [ ] Dashboard data accuracy
- [ ] Form validation behavior

### Data Integrity
- [ ] Cross-page data consistency
- [ ] Relationship integrity (company → contacts → deals)
- [ ] Activity logging accuracy

---

## Phase 6: UI Polish

### Objective
Refine user experience for daily use.

### Tasks
- [ ] Loading states for all async operations
- [ ] Error boundaries with user-friendly messages
- [ ] Toast notifications for actions
- [ ] Empty states for lists
- [ ] Mobile responsiveness audit
- [ ] Keyboard navigation (command palette)

---

## Future Phases (Backlog)

### Phase 7: Advanced Features
- [x] Document upload to Supabase Storage (Phase 4A)
- [ ] IC Memo workflow activation
- [ ] LP Report generation
- [ ] Email integration
- [ ] Calendar sync

### Phase 8: Team Features
- [ ] Multi-user support
- [ ] Role-based access control
- [ ] Activity attribution
- [ ] Team dashboard views

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma v7.2.0 |
| UI | shadcn/ui + Radix primitives |
| Auth | NextAuth.js v4 (credentials + OAuth) |
| State | TanStack React Query v5 |
| Validation | Zod |
| Package Manager | pnpm |

---

## Database Schema Summary

### Core Models
- **User** - Auth with NextAuth + RBAC (role, isActive, lastLoginAt)
- **Company** - Investment targets with 7-stage pipeline + source attribution
- **Contact** - People with company relationships + referral metrics
- **Deal** - Investment tracking with 8-stage flow + source attribution + financials
- **DealTeamMember** - Deal collaboration tracking (new)
- **Activity** - Polymorphic interaction logging
- **Tag/CompanyTag** - Flexible categorization

### Source Attribution (New)
- **DealSource enum** - REFERRAL, DIRECT_OUTREACH, INBOUND, CONFERENCE, ACCELERATOR, NETWORK, PORTFOLIO, INVESTOR_NETWORK, OTHER
- **DealPriority enum** - HIGH, MEDIUM, LOW
- **TeamRole enum** - LEAD, SUPPORT, ADVISOR, BOARD_OBSERVER
- Contact referral tracking: totalReferralsMade, successfulReferrals, referralConversionRate
- Bidirectional relations: Contact → referredDeals, referredCompanies

### Database Triggers (Phase 2B - Jan 25, 2026)
PostgreSQL triggers automatically maintain referral metrics:
- **deal_insert_referral_trigger** - Increments totalReferralsMade when deal created with referrer
- **deal_update_referral_trigger** - Updates successfulReferrals when deal stage → CLOSED_WON
- **deal_delete_referral_trigger** - Decrements counts when deal deleted
- **company_referral_trigger** - Handles company referral tracking
- **Auto-calculated**: referralConversionRate = (successfulReferrals / totalReferralsMade) * 100

Migration file: `prisma/migrations/20260125_referral_triggers/migration.sql`

### RBAC Models
- **UserRole** - ADMIN, PARTNER, ANALYST, LP
- **LPProfile** - LP-specific data (commitment, called capital, distributions)
- **AuditLog** - Action tracking with entity references

### Document System ✅ ACTIVE
- **Document** - Files with versioning, company/deal linking
- **DocumentVersion** - Version history with change notes
- **DocumentAccessLog** - Audit trail (view, download, share, edit, delete)
- **DocumentTag** - Document categorization via Tag model

### IC Workflow (ready, not active)
- **ICMemo** - Investment committee memos
- **ICMemoVote** - Voting system

---

## Key Files Reference

### Authentication
```
src/lib/auth/config.ts              # NextAuth configuration
src/lib/auth/index.ts               # Auth exports (auth(), getCurrentUser())
src/lib/auth/rbac.ts                # RBAC permissions
src/middleware.ts                   # Route protection
src/app/api/auth/[...nextauth]/route.ts # NextAuth handler
src/app/api/auth/register/route.ts  # User registration
```

### API Routes
```
src/app/api/companies/route.ts      # GET (list), POST (create)
src/app/api/companies/[id]/route.ts # GET, PUT, DELETE
src/app/api/companies/stats/route.ts # Dashboard stats
src/app/api/contacts/route.ts       # GET (list), POST (create)
src/app/api/contacts/[id]/route.ts  # GET, PUT, DELETE
src/app/api/contacts/referrers/route.ts # GET referrers with metrics
src/app/api/contacts/[id]/referrals/route.ts # GET deals/companies referred by contact
src/app/api/deals/route.ts          # GET (list), POST (create)
src/app/api/deals/[id]/route.ts     # GET, PUT, DELETE
src/app/api/deals/[id]/source/route.ts # GET source attribution for deal
src/app/api/deals/stats/route.ts    # Pipeline & source stats
src/app/api/sources/route.ts        # GET aggregated stats for all sources
src/app/api/sources/[type]/deals/route.ts # GET deals by source type
src/app/api/documents/route.ts          # GET (list), POST (upload)
src/app/api/documents/[id]/route.ts     # GET, PUT, DELETE
src/app/api/documents/stats/route.ts    # Document statistics
src/app/api/documents/[id]/version/route.ts # POST new version
src/app/api/documents/[id]/download/route.ts # GET signed URL
src/app/api/documents/[id]/share/route.ts   # POST/DELETE share links
```

### Server Actions
```
src/app/actions/company.ts          # Server actions for companies
```

### Database Utilities
```
src/lib/db/prisma.ts               # Prisma client singleton
src/lib/db/companies.ts            # Company query functions
src/lib/db/contacts.ts             # Contact query functions
src/lib/db/deals.ts                # Deal CRUD + source analytics
src/lib/db/documents.ts            # Document CRUD + versioning
```

### Validations
```
src/lib/validations/company.ts     # Zod schemas for companies
src/lib/validations/deal.ts        # Zod schemas for deals
```

### Deal Source Tracking
```
src/lib/deals/source-tracking.ts   # Source types, configs, analytics utilities
```

### Source Attribution UI (Phase 3D)
```
src/components/forms/source-attribution-fields.tsx  # Reusable source attribution form
src/components/forms/index.ts                       # Forms component exports
src/components/deals/deal-form.tsx                  # Deal form with source attribution
src/components/contacts/referral-activity.tsx       # Referral activity on contact detail
src/app/deals/new/page.tsx                          # New deal creation page
```

### Document Upload (Phase 4A)
```
src/lib/db/documents.ts                             # Document CRUD + versioning functions
src/components/documents/document-upload-form.tsx   # Upload form with company/deal linking
src/app/documents/upload/page.tsx                   # Document upload page
```

### Kanban Board (Phase 4C)
```
src/lib/deals/pipeline-utils.ts                     # Stage/priority/source configs, metrics
src/hooks/use-deals-kanban.ts                       # Kanban state management hook
src/components/deals/deal-card.tsx                  # Deal card with priority/source badges
src/components/deals/stage-column.tsx               # Droppable stage column
src/components/deals/kanban-board.tsx               # Main Kanban board with @dnd-kit
src/app/deals/page.tsx                              # Deals page with Kanban UI
```

---

## User Context

**Current User**: Troy Thompson (Solo founder/angel investor)
**Primary Account**: troy@mortis.vc (ADMIN)
**Legacy Account**: troymthompson14@gmail.com (data migrated on Jan 25, 2026)
**Primary Use Case**: Track angel portfolio + referral pipeline
**Near-term Need**: Functional CRM for outreach and engagement
**Future Need**: Full fund management with LP reporting

### Current Data (as of Jan 25, 2026)
- **Companies**: 16
- **Contacts**: 14
- **Deals**: 0 (API ready, UI pending)

---

## Coding Conventions

- TypeScript strict mode
- Server components by default, client when needed
- Prisma queries in server components or API routes
- All DB operations filter by `userId`
- Use shadcn/ui components consistently
- Follow existing file structure patterns

---

## Common Pitfalls & Solutions

### 1. Next.js Route Conflicts (CRITICAL)
**Problem**: Creating pages in `(dashboard)` route group when a page already exists at the same path.
- `src/app/(dashboard)/deals/page.tsx` + `src/app/deals/page.tsx` = BUILD FAILURE
- Both resolve to `/deals` URL

**Solution**: ALWAYS check for existing routes before creating new pages:
```bash
# Before creating a new page, check if the route exists:
ls src/app/deals/          # Check root path
ls src/app/(dashboard)/deals/  # Check route group
```

**Existing Routes (do NOT duplicate)**:
- `/deals` → `src/app/deals/page.tsx`
- `/companies` → `src/app/companies/page.tsx`
- `/documents` → `src/app/documents/page.tsx`

### 2. Map Iteration in TypeScript
**Problem**: `for...of` on Map objects causes TypeScript errors without downlevelIteration.

**Solution**: Always use `Array.from()` before iterating:
```typescript
// ❌ BAD - TypeScript error
for (const [key, value] of myMap) { }

// ✅ GOOD - Works correctly
for (const [key, value] of Array.from(myMap.entries())) { }
```

### 3. Implicit 'any' Types
**Problem**: Callback parameters in Array methods need explicit types.

**Solution**: Always add type annotations:
```typescript
// ❌ BAD - Implicit any
deals.find((d) => d.id === id)

// ✅ GOOD - Explicit type
deals.find((d: DealWithRelations) => d.id === id)
```

### 4. Card Component Variants
**Problem**: Invalid variant names cause TypeScript errors.

**Valid Card Variants**: `"flat"`, `"raised"`, `"pressed"`, `"subtle"`, `"glass"`, `"glow"`, `"glow-tactical"`

```typescript
// ❌ BAD - Invalid variant
<Card variant="neumorphic">

// ✅ GOOD - Valid variant
<Card variant="raised">
```

### 5. Button Component Variants
**Valid Button Variants**: `"primary"`, `"secondary"`, `"outline"`, `"ghost"`, `"link"`, `"success"`, `"danger"`, `"destructive"`, `"neumorphic"`

```typescript
// ❌ BAD - Invalid variant
<Button variant="default">

// ✅ GOOD - Valid variant
<Button variant="primary">
```

---

## Commands

```bash
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm dlx prisma generate    # Regenerate Prisma client
pnpm dlx prisma db push     # Push schema to database
pnpm dlx prisma studio      # Open Prisma Studio
```

---

Last updated: January 27, 2026 (Phase 4C - Kanban board UI complete)
