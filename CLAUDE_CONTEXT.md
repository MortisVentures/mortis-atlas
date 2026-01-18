# Mortis Atlas - Claude Context

## Current State (as of January 17, 2026)

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 - Foundation | ✅ Complete | Next.js 14, Prisma, Supabase, shadcn/ui |
| Phase 2 - UI Foundation | ✅ Complete | All pages and components built |
| Phase 3 - Authentication | ✅ Complete | NextAuth.js + RBAC schema |
| Phase 4 - CRUD Operations | 🟡 In Progress | Companies + Contacts complete, Deals/Activities/Tasks pending |
| Phase 5 - Testing | 🔴 Not Started | Integration and E2E tests |
| Phase 6 - Polish | 🔴 Not Started | UI refinements |

**Operational Readiness: ~65%** - Auth + Companies + Contacts CRUD complete

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

### Deals (Priority 3 - Pipeline tracking)
- [ ] Deal creation from company
- [ ] Stage progression workflow
- [ ] Amount and valuation tracking

### Activities (Priority 4 - Interaction logging)
- [ ] Quick-add from any context
- [ ] Activity feed on dashboard
- [ ] Filter by type, date, entity

### Tasks (Priority 5 - Action items)
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
- [ ] Document upload to Supabase Storage
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
- **Company** - Investment targets with 7-stage pipeline
- **Contact** - People with company relationships
- **Deal** - Investment tracking with 8-stage flow
- **Activity** - Polymorphic interaction logging
- **Tag/CompanyTag** - Flexible categorization

### RBAC Models
- **UserRole** - ADMIN, PARTNER, ANALYST, LP
- **LPProfile** - LP-specific data (commitment, called capital, distributions)
- **AuditLog** - Action tracking with entity references

### Document System (ready, not active)
- **Document** - Files with versioning
- **DocumentVersion** - Version history
- **DocumentAccessLog** - Audit trail
- **DocumentTag** - Document categorization

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
```

### Server Actions
```
src/app/actions/company.ts          # Server actions for companies
```

### Database Utilities
```
src/lib/db/prisma.ts               # Prisma client singleton
src/lib/db/companies.ts            # Company query functions
```

### Validations
```
src/lib/validations/company.ts     # Zod schemas
```

---

## User Context

**Current User**: Solo founder/angel investor
**Primary Use Case**: Track angel portfolio + referral pipeline
**Near-term Need**: Functional CRM for outreach and engagement
**Future Need**: Full fund management with LP reporting

---

## Coding Conventions

- TypeScript strict mode
- Server components by default, client when needed
- Prisma queries in server components or API routes
- All DB operations filter by `userId`
- Use shadcn/ui components consistently
- Follow existing file structure patterns

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

Last updated: January 18, 2026 (Phase 4 - Companies + Contacts CRUD complete with inline dialogs)
