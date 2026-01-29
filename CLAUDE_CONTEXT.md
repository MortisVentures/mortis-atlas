# Mortis Atlas - Claude Context

## Current State (as of January 28, 2026)

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 - Foundation | ✅ Complete | Next.js 14, Prisma, Supabase, shadcn/ui |
| Phase 2 - UI Foundation | ✅ Complete | All pages and components built |
| Phase 3 - Authentication | ✅ Complete | NextAuth.js + RBAC schema |
| Phase 4 - CRUD Operations | ✅ Complete | Companies + Contacts + Deals + Docs + Kanban complete |
| **Phase 4.5 - Security** | 🔴 **CRITICAL** | **BLOCKING** - Must complete before Phase 5 |
| Phase 5 - Testing | 🔴 Not Started | Integration and E2E tests |
| Phase 6 - Polish | 🔴 Not Started | UI refinements |

**Operational Readiness: ~90%** - Auth + Companies + Contacts + Deals CRUD + Source Attribution + Documents + Kanban Board + Deal Detail/Edit Pages complete

⚠️ **SECURITY BLOCKER**: Phase 4.5 must be completed before ANY public deployment or Phase 5 testing.

---

## Development Roadmap

### Priority Order (per user directive):
1. **Authentication** - Get it usable with login ✅
2. **CRUD Functional** - Wire up all pages to database ✅
3. **Security Hardening** - 🔴 **BLOCKING** - Complete Phase 4.5 before testing
4. **Testing** - Validate data integration across pages (AFTER Phase 4.5)
5. **Polish UI** - Refine existing components
6. **Technical Capabilities** - Add advanced features

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

### Deals (Priority 3 - Pipeline tracking) ✅ COMPLETE
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
- [x] Deal detail page with financials (Phase 4D - Jan 27, 2026)
- [x] Stage progression with history tracking (timeline UI)
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

## Phase 4.5: Security Hardening 🔴 CRITICAL - BLOCKING

### Objective
Address critical security vulnerabilities before public deployment. Security must be architected in, not bolted on.

**Status**: Security audit completed January 27, 2026. Implementation required before Phase 5.
**Timeline**: 3-4 weeks (Weeks 1-2 BLOCKING for any production consideration)

### Security Audit Summary
A comprehensive APT-level security review identified **15 vulnerabilities** (5 CRITICAL, 5 HIGH, 5 MEDIUM) that must be resolved before hosting publicly for GP/LP access.

---

### Week 1-2: CRITICAL Priority (BLOCKING)
These issues could lead to complete system compromise, data breaches, or unauthorized access to sensitive financial data.

#### [ ] FIX: Middleware authorization bypass (`src/middleware.ts`)
- **Problem**: publicApiRoutes bypass allows any authenticated user to call any API endpoint
- **Impact**: LP can access admin endpoints, ANALYST can access all data
- **Solution**: Remove bypass, enforce RBAC on every API route
- **Files**: `src/middleware.ts`, all API routes

#### [ ] IMPLEMENT: PostgreSQL Row-Level Security (RLS)
- **Problem**: No database-level data isolation between users/roles
- **Impact**: API bugs could expose all data; lateral movement possible
- **Solution**: RLS policies on all tables enforcing role-based access
- **Files**: New migration `prisma/migrations/YYYYMMDD_rls_policies/migration.sql`
- **Example**:
```sql
CREATE POLICY "users_can_access_team_documents"
ON documents FOR SELECT TO authenticated
USING (
  access_level IN ('TEAM', 'LP_ACCESSIBLE')
  OR uploaded_by_id = current_setting('app.user_id')::text
  OR EXISTS (
    SELECT 1 FROM users
    WHERE id = current_setting('app.user_id')::text
    AND role IN ('ADMIN', 'PARTNER')
  )
);
```

#### [ ] ADD: API rate limiting (all endpoints)
- **Problem**: No protection against brute force, data exfiltration, DoS
- **Impact**: Credential stuffing, mass data export, service disruption
- **Solution**: Implement `@upstash/ratelimit` or similar
- **Limits**: Auth (10/15min), Read (100/min), Write (20/min), Upload (5/hour)
- **Files**: `src/middleware.ts`, new `src/lib/rate-limit.ts`

#### [ ] FIX: File upload validation (`src/app/api/documents/route.ts`)
- **Problem**: No size limits, no type verification, no malware scanning
- **Impact**: DoS via large files, malware upload, XSS via SVG
- **Solution**:
  - Max 50MB per file, 500MB per user/day
  - Whitelist + content verification (not just MIME)
  - Integrate ClamAV or VirusTotal
  - Sanitize filenames (path traversal prevention)
- **Files**: `src/app/api/documents/route.ts`, `src/lib/storage/documents.ts`

#### [ ] REDUCE: JWT session lifetime
- **Problem**: 30-day JWT = 30-day breach window
- **Impact**: Fired employee retains access, stolen token valid for month
- **Solution**: Reduce to 24 hours, implement refresh token rotation
- **Files**: `src/lib/auth/config.ts`
- **Add**: Session revocation table with revoked flag check

#### [ ] IMPLEMENT: Session revocation mechanism
- **Problem**: No way to forcibly logout users or revoke compromised sessions
- **Impact**: Cannot respond to security incidents effectively
- **Solution**: Database-backed session store with revocation capability
- **Files**: Update Session model, add revocation checks in auth flow

---

### Week 2-3: HIGH Priority
These issues could lead to unauthorized data access, privilege escalation, or regulatory violations.

#### [ ] FIX: Insecure Direct Object References (IDOR) (all API routes)
- **Problem**: API routes accept IDs without verifying user permissions
- **Impact**: User A can access User B's companies/deals/documents
- **Solution**: Add ownership/permission verification in every route
- **Pattern**:
```typescript
const company = await prisma.company.findFirst({
  where: {
    id: params.id,
    OR: [
      { userId: session.user.id },
      { user: { role: { in: ['ADMIN', 'PARTNER', 'ANALYST'] } } }
    ]
  }
});
if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
```
- **Files**: All `/api/*/[id]/route.ts` files

#### [ ] ADD: Comprehensive audit logging
- **Problem**: Only LOGIN/LOGOUT logged, no data access tracking
- **Impact**: Cannot detect breaches or investigate suspicious activity
- **Solution**: Log ALL sensitive operations (view, edit, delete, export)
- **Add**: `auditLog()` helper function, call in all API routes
- **Log**: User, action, entity, IP, user-agent, timestamp
- **Files**: New `src/lib/audit.ts`, update all API routes

#### [ ] ADD: CSRF protection headers
- **Problem**: State-changing operations lack CSRF tokens
- **Impact**: Attacker can trick user into unauthorized actions
- **Solution**: Configure security headers in `next.config.js`
- **Add**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP
- **Files**: `next.config.js`

#### [ ] ENFORCE: Password complexity requirements
- **Problem**: No password strength validation
- **Impact**: Weak passwords = easy compromise
- **Solution**:
  - Min 12 chars, must include upper/lower/number/symbol
  - Check against haveibeenpwned API
  - Consider adding MFA for ADMIN/PARTNER
- **Files**: `src/app/api/auth/register/route.ts`, `src/lib/auth/config.ts`

#### [ ] IMPLEMENT: LP data isolation
- **Problem**: `canLPAccessFund()` exists but never called
- **Impact**: LPs could access other funds' data, other LPs' info
- **Solution**:
  - Enforce fund access checks on every LP request
  - Create LP-specific API endpoints with strict filtering
  - Verify company belongs to LP's accessible funds
- **Files**: All API routes accessed by LPs, new `src/lib/auth/lp-guard.ts`

---

### Week 3-4: MEDIUM Priority
These issues reduce defense-in-depth and should be addressed before production.

#### [ ] ADD: Content Security Policy (CSP)
- Add strict CSP headers to prevent XSS attacks
- **Files**: `next.config.js`

#### [ ] RUN: Dependency security audit
- Execute `npm audit` and fix all HIGH/CRITICAL vulnerabilities
- Set up Snyk or Dependabot for continuous monitoring
- Pin dependency versions in production

#### [ ] ENFORCE: Email verification
- **Problem**: `emailVerified` field exists but not enforced
- **Solution**: Block login if email not verified
- **Files**: `src/lib/auth/config.ts` signIn callback

#### [ ] MIGRATE: Secrets to vault
- Move all secrets from `.env` to AWS Secrets Manager or similar
- Rotate: NEXTAUTH_SECRET (90 days), DB passwords (30 days)
- Ensure 32+ byte cryptographic randomness for all secrets

#### [ ] DOCUMENT: Security procedures
- Create incident response playbook
- Document data breach notification procedures
- Write security training materials for team
- Create security contact: security@mortisventures.com

---

### Pre-Production Checklist
Before moving to Phase 5 (Testing), ALL items must be complete:

- [ ] All CRITICAL vulnerabilities resolved
- [ ] All HIGH vulnerabilities resolved
- [ ] Penetration testing by external firm completed and passed
- [ ] Security documentation complete
- [ ] Team trained on secure coding practices
- [ ] Secrets migrated to vault
- [ ] Rate limiting active on all endpoints
- [ ] Audit logging capturing all sensitive operations
- [ ] RLS policies enforced at database level

---

### Key Security Files
```
src/lib/auth/rbac.ts              # Permission helpers (UPDATE)
src/lib/auth/config.ts            # Auth config (UPDATE JWT lifetime)
src/middleware.ts                 # Route protection (FIX authorization bypass)
src/lib/rate-limit.ts             # Rate limiting (NEW)
src/lib/audit.ts                  # Audit logging (NEW)
src/lib/auth/lp-guard.ts          # LP access control (NEW)
prisma/migrations/YYYYMMDD_rls/   # Row-Level Security policies (NEW)
next.config.js                    # Security headers (UPDATE)
```

---

### Security Testing Requirements
Must pass before Phase 5:

- **Penetration Testing**: Hire external security firm
- **Vulnerability Scanning**: Automated tools (OWASP ZAP, Burp Suite)
- **Authentication Testing**: Bypass attempts, session hijacking
- **Authorization Testing**: IDOR, privilege escalation, role enforcement
- **Input Validation**: SQL injection, XSS, file upload attacks
- **Rate Limiting**: Verify all endpoints protected
- **Audit Logging**: Verify all sensitive operations logged

---

### Acceptance Criteria
Phase 4.5 is COMPLETE when:

- ✅ External penetration test passes with no CRITICAL/HIGH findings
- ✅ All 15 identified vulnerabilities resolved
- ✅ Security documentation published
- ✅ Audit logging active and tested
- ✅ Rate limiting verified on all endpoints
- ✅ RLS policies active and tested
- ✅ LP data isolation verified
- ✅ Session management secure (revocation working)

**⚠️ Bottom Line**: Do NOT proceed to Phase 5 (Testing) until Phase 4.5 is complete. Testing a vulnerable system wastes time and creates false confidence. Security must be validated before functionality testing.

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

Last updated: January 28, 2026 (Lint fixes + build stabilization)

---

## Session Log: January 28, 2026

### Accomplished
- **Lint Fix Pass**: Resolved 53 files with TypeScript/ESLint errors
- **Build Stabilization**: Fixed all build failures, application now compiles cleanly
- **Deal Detail Page**: Completed Phase 4D (deal detail with financials and timeline)
- **Deal Edit Page**: Completed Phase 4E (deal edit functionality)
- **Portfolio View**: Added portfolio view for closed deals

### Key Fixes
- Added ESLint rule for underscore-prefixed unused vars (`_variable`)
- Fixed invalid Card variants (`"neumorphic"` → `"raised"`)
- Fixed invalid Button variants (`"default"` → `"primary"`)
- Fixed `ZodError.errors` → `ZodError.issues` in API routes
- Added Suspense boundaries for `useSearchParams()` in auth pages (Next.js 14 requirement)
- Fixed TypeScript `includes()` type errors in RBAC module
- Removed empty `(app)` route group causing build conflicts

### Commits
- `a2a5cff` - [FIX] Resolve all lint errors and build issues
- `090ec7d` - [PHASE-4D/4E] Feature: Deal detail page, edit page, portfolio view + security roadmap
