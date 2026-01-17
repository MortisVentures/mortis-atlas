# Mortis Atlas - Architecture Decision Records

> **Purpose:** Document significant technical and design decisions for future reference.

---

## ADR-001: Next.js App Router

**Date:** 2026-01-16
**Status:** Accepted

### Context
Need a React framework for building the VC CRM application.

### Decision
Use Next.js 14 with App Router.

### Rationale
- React Server Components reduce client-side JavaScript
- Streaming and Suspense for better perceived performance
- Built-in API routes eliminate separate backend
- Vercel deployment integration
- Strong TypeScript support

### Alternatives Considered
- Pages Router: Older pattern, less performant
- Remix: Good DX but smaller ecosystem
- Plain React + Vite: Requires more infrastructure setup

---

## ADR-002: Supabase as Backend Platform

**Date:** 2026-01-16
**Status:** Accepted

### Context
Need managed database, authentication, and file storage.

### Decision
Use Supabase (PostgreSQL + Auth + Storage).

### Rationale
- PostgreSQL for enterprise reliability
- Row-Level Security for data protection
- Built-in auth with multiple providers
- S3-compatible storage
- Real-time subscriptions if needed
- Cost-effective scaling

### Alternatives Considered
- AWS (RDS + Cognito + S3): More complex, higher ops burden
- PlanetScale: MySQL only, no integrated auth
- Firebase: NoSQL, less suitable for relational data

---

## ADR-003: Neumorphic Design System

**Date:** 2026-01-16
**Status:** Accepted

### Context
Need distinctive, professional UI aesthetic for VC platform.

### Decision
Implement neumorphic design with dark theme.

### Rationale
- Distinctive visual identity ("Defense Tech Bloomberg")
- Subtle depth creates premium feel
- Dark theme reduces eye strain for data-heavy work
- Professional, institutional aesthetic

### Alternatives Considered
- Flat design: Generic, less distinctive
- Material Design: Too consumer-oriented
- Light theme: Not aligned with defense aesthetic

---

## ADR-004: Tremor for Data Visualization

**Date:** 2026-01-16
**Status:** Accepted

### Context
Need enterprise-grade charts for analytics dashboards.

### Decision
Use Tremor chart library.

### Rationale
- Designed for dashboards and analytics
- Clean, professional default styling
- Built on Recharts (proven foundation)
- Good TypeScript support
- Dark theme compatible

### Alternatives Considered
- Recharts directly: More setup required
- Victory: Similar capability, less dashboard-focused
- Chart.js: Canvas-based, less React-native

---

## ADR-005: Prisma ORM

**Date:** 2026-01-16
**Status:** Accepted

### Context
Need type-safe database access layer.

### Decision
Use Prisma as ORM.

### Rationale
- Automatic TypeScript types from schema
- Intuitive query API
- Built-in migrations
- Works well with PostgreSQL
- Good Next.js integration

### Alternatives Considered
- Drizzle: Newer, less mature ecosystem
- TypeORM: More verbose, weaker types
- Raw SQL: No type safety

---

## ADR-006: @react-pdf/renderer for PDF Generation

**Date:** 2026-01-16
**Status:** Accepted

### Context
Need to generate LP quarterly reports as PDFs.

### Decision
Use @react-pdf/renderer for client-side PDF generation.

### Rationale
- React component-based API
- Good styling capabilities
- Works in browser (no server dependency)
- Supports complex layouts

### Alternatives Considered
- Puppeteer: Server-side, more resource intensive
- jsPDF: Lower-level API, more manual work
- External service: Additional dependency and cost

---

## Template for New Decisions

```markdown
## ADR-XXX: [Title]

**Date:** YYYY-MM-DD
**Status:** [Proposed | Accepted | Deprecated | Superseded]

### Context
[What is the issue that we're seeing that is motivating this decision?]

### Decision
[What is the change that we're proposing and/or doing?]

### Rationale
[Why is this decision being made?]

### Alternatives Considered
[What other options were considered?]

### Consequences
[What becomes easier or harder as a result?]
```
