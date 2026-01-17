# Mortis Atlas - Claude Context

## Current State (as of January 17, 2026)

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 - Foundation | ✅ Complete | Next.js 14, Prisma, Supabase, shadcn/ui |
| Phase 2 - UI Foundation | ✅ Complete | All pages and components built |
| Phase 3 - Authentication | 🔴 Not Started | NextAuth.js flows |
| Phase 4 - CRUD Operations | 🟡 Partial | API routes exist, need wiring |
| Phase 5 - Testing | 🔴 Not Started | Integration and E2E tests |
| Phase 6 - Polish | 🔴 Not Started | UI refinements |

**Operational Readiness: ~35%** - UI built, needs auth + functional CRUD

---

## Development Roadmap

### Priority Order (per user directive):
1. **Authentication** - Get it usable with login
2. **CRUD Functional** - Wire up all pages to database
3. **Testing** - Validate data integration across pages
4. **Polish UI** - Refine existing components
5. **Technical Capabilities** - Add advanced features

---

## Phase 3: Authentication (NEXT)

### Objective
Enable solo user login to secure the CRM data.

### Tasks
- [ ] Configure NextAuth.js with credentials provider (email/password)
- [ ] Add Google OAuth as secondary option
- [ ] Create login/register pages
- [ ] Implement session middleware
- [ ] Protect all routes except landing page
- [ ] Add user context to all database operations

### Architecture Notes (for future team use)
- Schema already has User model with proper relations
- Design auth to support multiple users from start
- Add `userId` filtering to all queries now
- Prepare for role-based access (OWNER, MEMBER, VIEWER) later

---

## Phase 4: CRUD Operations

### Objective
Make all pages functional with real database operations.

### Companies (Priority 1 - Core to angel tracking)
- [ ] List: Fetch with filters, search, pagination
- [ ] Create: Form validation, save to DB
- [ ] Read: Detail page with related data
- [ ] Update: Edit form with optimistic updates
- [ ] Delete: Soft delete with confirmation

### Contacts (Priority 2 - Relationship tracking)
- [ ] CRUD operations linked to companies
- [ ] Primary contact designation
- [ ] Contact activity history

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
| Auth | NextAuth.js (to implement) |
| State | TanStack React Query v5 |
| Validation | Zod |
| Package Manager | pnpm |

---

## Database Schema Summary

### Core Models
- **User** - Auth with NextAuth (Account, Session, VerificationToken)
- **Company** - Investment targets with 7-stage pipeline
- **Contact** - People with company relationships
- **Deal** - Investment tracking with 8-stage flow
- **Activity** - Polymorphic interaction logging
- **Tag/CompanyTag** - Flexible categorization

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

### API Routes
```
src/app/api/companies/route.ts      # GET (list), POST (create)
src/app/api/companies/[id]/route.ts # GET, PUT, DELETE
src/app/api/companies/stats/route.ts # Dashboard stats
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

Last updated: January 17, 2026
