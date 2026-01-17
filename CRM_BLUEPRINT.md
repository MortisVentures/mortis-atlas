# Mortis Atlas CRM Blueprint

> **Version:** 1.0.0
> **Last Updated:** 2026-01-16
> **Classification:** INTERNAL USE ONLY
> **Status:** Authoritative Source of Truth

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Requirements](#2-core-requirements)
3. [Technical Architecture](#3-technical-architecture)
4. [Design System](#4-design-system)
5. [Functional Specifications](#5-functional-specifications)
6. [Security Architecture](#6-security-architecture)
7. [Non-Negotiables](#7-non-negotiables)
8. [Appendices](#8-appendices)

---

## 1. Executive Summary

### 1.1 Project Vision

**Mortis Atlas** is an enterprise-grade Customer Relationship Management (CRM) system purpose-built for venture capital fund operations with a focus on defense technology investments. The platform embodies a "Defense Tech Bloomberg" design philosophy—combining the information density and professional polish of Bloomberg Terminal with the security posture required for handling sensitive defense-adjacent deal flow.

### 1.2 Design Philosophy

```
"Institutional precision meets operational security"
```

The system prioritizes:
- **Information Density**: Maximum actionable data per viewport
- **Professional Aesthetics**: Dark, sophisticated interface befitting institutional investors
- **Security-First Architecture**: Defense-grade data protection throughout
- **Operational Efficiency**: Streamlined workflows for investment professionals

### 1.3 Target Users

| Role | Description | Access Level |
|------|-------------|--------------|
| General Partners (GP) | Fund leadership, final investment authority | Full Access |
| Principals | Senior investment team, deal leadership | Extended Access |
| Associates | Junior investment team, deal support | Standard Access |
| Analysts | Research and due diligence support | Limited Access |
| Operations | Back office, fund administration | Operations Access |
| Limited Partners (LP) | Fund investors (external) | Portal Access Only |

---

## 2. Core Requirements

### 2.1 Enterprise Security Architecture

#### 2.1.1 Data Classification Framework

All data within Mortis Atlas is classified according to the following taxonomy:

| Classification | Description | Handling Requirements |
|---------------|-------------|----------------------|
| **CLASSIFIED** | Defense-related proprietary information, ITAR-controlled data | Encrypted at rest (AES-256), in transit (TLS 1.3), access logging, need-to-know basis |
| **FOUO** (For Official Use Only) | Sensitive business information, term sheets, financials | Encrypted storage, role-based access, audit trails |
| **CONFIDENTIAL** | Internal communications, meeting notes, pipeline data | Standard encryption, team-level access |
| **INTERNAL** | General operational data, contact information | Basic access controls |
| **PUBLIC** | Published information, press releases | No restrictions |

#### 2.1.2 Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User → SSO (SAML 2.0/OIDC) → MFA (TOTP/WebAuthn) → Session    │
│                                                                 │
│  Session Management:                                            │
│  - JWT tokens with 15-minute expiry                            │
│  - Refresh tokens with 7-day expiry                            │
│  - Automatic session termination on inactivity (30 min)        │
│  - Concurrent session limits per user role                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Required Authentication Methods:**
- Primary: SSO via Google Workspace / Microsoft Entra ID
- Secondary: TOTP-based MFA (mandatory for all users)
- Emergency: Hardware security keys (WebAuthn/FIDO2) for GP-level access

#### 2.1.3 Access Control Model

Role-Based Access Control (RBAC) with Attribute-Based Access Control (ABAC) overlay:

```typescript
interface AccessPolicy {
  role: UserRole;
  resource: ResourceType;
  actions: Action[];
  conditions?: {
    dataClassification?: Classification[];
    dealStage?: DealStage[];
    teamMembership?: boolean;
    timeRestrictions?: TimeWindow;
  };
}
```

### 2.2 Integration Requirements

#### 2.2.1 Google Calendar Integration

**Purpose:** Automatic meeting capture, scheduling, and after-action report generation

**Scope:**
- Read/write access to user calendars
- Event creation for deal-related meetings
- Attendee management and room booking
- Integration with meeting notes system

**Data Flow:**
```
Google Calendar → Webhook → Mortis Atlas → Meeting Record
                                        → After-Action Report (auto-generated)
                                        → Contact Activity Timeline
```

**Required OAuth Scopes:**
- `calendar.events`
- `calendar.events.readonly`
- `calendar.settings.readonly`

#### 2.2.2 Meeting Tracking System

**Automated Capture:**
- Meeting metadata (attendees, duration, location)
- Pre-meeting context (company profile, deal stage, previous interactions)
- Post-meeting action items (extracted via AI summarization)
- Follow-up scheduling automation

**After-Action Report Structure:**
```markdown
## Meeting After-Action Report

**Date:** [Auto-populated]
**Attendees:** [Auto-populated from calendar]
**Company:** [Linked from CRM]
**Deal Stage:** [Current pipeline stage]

### Discussion Summary
[AI-generated or manual entry]

### Key Takeaways
- [Structured bullet points]

### Action Items
| Owner | Task | Due Date | Status |
|-------|------|----------|--------|

### Next Steps
[Follow-up meeting scheduling, document requests, etc.]

### Risk Flags
[Any concerns or red flags identified]
```

#### 2.2.3 Additional Integrations

| System | Purpose | Priority |
|--------|---------|----------|
| Google Calendar | Meeting management | P0 - Critical |
| Gmail | Email tracking, communication log | P0 - Critical |
| DocuSign | Document signing, term sheets | P1 - High |
| PitchBook | Market data, company intelligence | P1 - High |
| Carta | Cap table management | P1 - High |
| Slack | Notifications, team communication | P2 - Medium |
| LinkedIn | Contact enrichment | P2 - Medium |
| Supabase Storage | Document management | P0 - Critical |

### 2.3 Data Handling Protocols

#### 2.3.1 Data Retention

| Data Type | Retention Period | Disposal Method |
|-----------|------------------|-----------------|
| Active deals | Indefinite | N/A |
| Passed deals | 7 years | Secure deletion |
| Meeting notes | 10 years | Archive then delete |
| Financial documents | 10 years + fund life | Secure archive |
| Email communications | 7 years | Secure deletion |
| Audit logs | 7 years | Immutable archive |

#### 2.3.2 Data Export & Portability

- All data exportable in standard formats (CSV, JSON, PDF)
- Full audit trail of all exports
- Watermarking on sensitive document exports
- LP data room with controlled access and expiring links

---

## 3. Technical Architecture

### 3.1 Technology Stack

#### 3.1.1 Frontend

| Technology | Version | Rationale |
|------------|---------|-----------|
| **Next.js** | 14.x (App Router) | Server-side rendering, optimal performance, React Server Components |
| **React** | 18.x | Component architecture, ecosystem maturity |
| **TypeScript** | 5.x | Type safety, developer experience, maintainability |
| **Tailwind CSS** | 3.x | Utility-first styling, design system consistency |
| **Framer Motion** | 10.x | Professional animations, micro-interactions |
| **Tremor** | 3.x | Enterprise data visualization, charts |
| **Radix UI** | Latest | Accessible, unstyled primitives |

**Rationale:** Next.js App Router provides optimal performance through React Server Components, reducing client-side JavaScript and enabling streaming. TypeScript ensures type safety across the entire application, critical for enterprise software handling sensitive data.

#### 3.1.2 Backend

| Technology | Version | Rationale |
|------------|---------|-----------|
| **Next.js API Routes** | 14.x | Unified deployment, serverless scaling |
| **Prisma** | 5.x | Type-safe ORM, migrations, database introspection |
| **PostgreSQL** | 15.x | ACID compliance, JSON support, enterprise reliability |
| **Redis** | 7.x | Session caching, rate limiting, real-time features |

**Rationale:** Prisma provides type-safe database access with automatic TypeScript types generated from the schema. PostgreSQL offers enterprise-grade reliability with advanced features like JSONB for flexible data storage and row-level security.

#### 3.1.3 Infrastructure

| Service | Provider | Rationale |
|---------|----------|-----------|
| **Hosting** | Vercel | Edge deployment, automatic scaling, preview environments |
| **Database** | Supabase (PostgreSQL) | Managed PostgreSQL, built-in auth, real-time subscriptions |
| **File Storage** | Supabase Storage | S3-compatible, row-level security, CDN |
| **Authentication** | NextAuth.js + Supabase Auth | Flexible providers, session management |
| **Email** | Resend / SendGrid | Transactional email, deliverability |
| **Monitoring** | Vercel Analytics + Sentry | Performance monitoring, error tracking |

#### 3.1.4 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Web App   │  │  Mobile PWA │  │  LP Portal  │  │   Admin     │   │
│  │  (Next.js)  │  │  (Next.js)  │  │  (Next.js)  │  │   Panel     │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
└─────────┼────────────────┼────────────────┼────────────────┼──────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              EDGE LAYER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   Vercel Edge   │  │   Rate Limiter  │  │   WAF / DDoS    │         │
│  │    Functions    │  │     (Redis)     │  │   Protection    │         │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │
└───────────┼────────────────────┼────────────────────┼───────────────────┘
            │                    │                    │
            └────────────────────┴────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Next.js API Routes                           │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │   │
│  │  │  Contacts │ │   Deals   │ │  Reports  │ │ Documents │       │   │
│  │  │    API    │ │    API    │ │    API    │ │    API    │       │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│  ┌─────────────────────────────────┼────────────────────────────────┐  │
│  │                          Prisma ORM                               │  │
│  └─────────────────────────────────┼────────────────────────────────┘  │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │   PostgreSQL    │  │     Redis       │  │    Supabase     │         │
│  │   (Supabase)    │  │   (Upstash)     │  │    Storage      │         │
│  │                 │  │                 │  │                 │         │
│  │  - Core Data    │  │  - Sessions     │  │  - Documents    │         │
│  │  - Audit Logs   │  │  - Cache        │  │  - Media        │         │
│  │  - RLS Policies │  │  - Rate Limits  │  │  - Exports      │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │  Google  │ │ DocuSign │ │PitchBook │ │  Carta   │ │  Slack   │     │
│  │ Calendar │ │          │ │          │ │          │ │          │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Database Schema

#### 3.2.1 Core Entities

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =============================================================================
// USER & AUTHENTICATION
// =============================================================================

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String
  role            UserRole  @default(ANALYST)
  avatar          String?
  lastLoginAt     DateTime?
  mfaEnabled      Boolean   @default(false)
  mfaSecret       String?

  // Relations
  activities      Activity[]
  meetings        MeetingAttendee[]
  tasks           Task[]
  documents       Document[]
  dealTeamMembers DealTeamMember[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([email])
  @@index([role])
}

enum UserRole {
  GP              // General Partner
  PRINCIPAL       // Principal
  ASSOCIATE       // Associate
  ANALYST         // Analyst
  OPERATIONS      // Operations
  LP_VIEWER       // Limited Partner (read-only portal)
}

// =============================================================================
// COMPANY & CONTACTS
// =============================================================================

model Company {
  id                String          @id @default(cuid())
  name              String
  legalName         String?
  description       String?
  website           String?
  linkedinUrl       String?

  // Classification
  sector            String
  subSector         String?
  stage             CompanyStage
  employeeCount     Int?
  foundedYear       Int?

  // Location
  headquarters      String?
  country           String?

  // Financials
  lastRoundType     String?
  lastRoundAmount   Decimal?        @db.Decimal(15, 2)
  lastRoundDate     DateTime?
  totalRaised       Decimal?        @db.Decimal(15, 2)
  valuation         Decimal?        @db.Decimal(15, 2)

  // Fund relationship
  source            String?         // How we found them
  sourceType        SourceType?
  referrerId        String?
  referrer          Contact?        @relation("ReferredCompanies", fields: [referrerId], references: [id])

  // Data classification
  classification    Classification  @default(INTERNAL)

  // Relations
  contacts          Contact[]
  deals             Deal[]
  meetings          Meeting[]
  documents         Document[]
  activities        Activity[]
  tags              CompanyTag[]

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([name])
  @@index([sector])
  @@index([stage])
  @@index([classification])
}

enum CompanyStage {
  PRE_SEED
  SEED
  SERIES_A
  SERIES_B
  SERIES_C
  SERIES_D_PLUS
  GROWTH
  PUBLIC
}

enum SourceType {
  INBOUND
  REFERRAL
  CONFERENCE
  CO_INVESTOR
  PORTFOLIO_REFERRAL
  COLD_OUTREACH
  ACCELERATOR
  UNIVERSITY
}

enum Classification {
  CLASSIFIED
  FOUO
  CONFIDENTIAL
  INTERNAL
  PUBLIC
}

model Contact {
  id                String          @id @default(cuid())
  firstName         String
  lastName          String
  email             String?
  phone             String?
  linkedinUrl       String?

  // Position
  title             String?
  department        String?

  // Company relation
  companyId         String?
  company           Company?        @relation(fields: [companyId], references: [id])

  // Contact type
  type              ContactType     @default(COMPANY_CONTACT)

  // LP-specific fields
  lpCommitment      Decimal?        @db.Decimal(15, 2)
  lpType            LPType?

  // Referrer tracking
  referredCompanies Company[]       @relation("ReferredCompanies")
  referralCount     Int             @default(0)

  // Relations
  meetings          MeetingAttendee[]
  activities        Activity[]

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@unique([email, companyId])
  @@index([lastName, firstName])
  @@index([companyId])
  @@index([type])
}

enum ContactType {
  COMPANY_CONTACT   // Founder, executive at portfolio/prospect company
  LP_CONTACT        // Limited partner
  CO_INVESTOR       // Other VC/investor
  ADVISOR           // Advisor, board member
  SERVICE_PROVIDER  // Lawyer, banker, recruiter
  OTHER
}

enum LPType {
  ANCHOR
  STRATEGIC
  INSTITUTIONAL
  FAMILY_OFFICE
  INDIVIDUAL
}

// =============================================================================
// DEAL PIPELINE
// =============================================================================

model Deal {
  id                String          @id @default(cuid())
  name              String

  // Company relation
  companyId         String
  company           Company         @relation(fields: [companyId], references: [id])

  // Deal details
  stage             DealStage       @default(SOURCED)
  priority          DealPriority    @default(MEDIUM)

  // Investment terms
  roundType         String?         // Seed, Series A, etc.
  targetAmount      Decimal?        @db.Decimal(15, 2)
  proposedOwnership Decimal?        @db.Decimal(5, 2)
  preMoneyValuation Decimal?        @db.Decimal(15, 2)

  // Outcome
  outcome           DealOutcome?
  investedAmount    Decimal?        @db.Decimal(15, 2)
  closedAt          DateTime?
  passedAt          DateTime?
  passReason        String?

  // Source attribution
  sourceType        SourceType?
  sourceDetails     Json?           // Flexible source metadata

  // Data classification
  classification    Classification  @default(CONFIDENTIAL)

  // Relations
  teamMembers       DealTeamMember[]
  meetings          Meeting[]
  documents         Document[]
  activities        Activity[]
  icMemos           ICMemo[]
  tasks             Task[]

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([companyId])
  @@index([stage])
  @@index([outcome])
  @@index([classification])
}

enum DealStage {
  SOURCED
  FIRST_MEETING
  SECOND_MEETING
  DEEP_DIVE
  PARTNER_REVIEW
  IC_PRESENTATION
  TERM_SHEET
  DUE_DILIGENCE
  LEGAL_DOCS
  CLOSED
  PASSED
}

enum DealPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum DealOutcome {
  PENDING
  WON
  LOST
  PASSED
}

model DealTeamMember {
  id        String   @id @default(cuid())
  dealId    String
  deal      Deal     @relation(fields: [dealId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  role      String   // Lead, Support, etc.

  createdAt DateTime @default(now())

  @@unique([dealId, userId])
}

// =============================================================================
// MEETINGS & ACTIVITIES
// =============================================================================

model Meeting {
  id              String            @id @default(cuid())
  title           String
  description     String?

  // Scheduling
  startTime       DateTime
  endTime         DateTime
  timezone        String            @default("America/Los_Angeles")
  location        String?
  virtualLink     String?

  // Relations
  companyId       String?
  company         Company?          @relation(fields: [companyId], references: [id])
  dealId          String?
  deal            Deal?             @relation(fields: [dealId], references: [id])

  // Attendees
  attendees       MeetingAttendee[]

  // Meeting content
  agenda          String?
  notes           String?
  summary         String?           // AI-generated summary
  actionItems     Json?             // Structured action items

  // After-action report
  afterActionReport AfterActionReport?

  // Calendar sync
  googleEventId   String?
  calendarSynced  Boolean           @default(false)

  // Status
  status          MeetingStatus     @default(SCHEDULED)

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@index([companyId])
  @@index([dealId])
  @@index([startTime])
  @@index([googleEventId])
}

enum MeetingStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

model MeetingAttendee {
  id          String    @id @default(cuid())
  meetingId   String
  meeting     Meeting   @relation(fields: [meetingId], references: [id], onDelete: Cascade)

  // Can be internal user or external contact
  userId      String?
  user        User?     @relation(fields: [userId], references: [id])
  contactId   String?
  contact     Contact?  @relation(fields: [contactId], references: [id])

  // External attendee (if not in system)
  externalEmail String?
  externalName  String?

  // Response
  response    AttendeeResponse @default(PENDING)

  @@unique([meetingId, userId])
  @@unique([meetingId, contactId])
}

enum AttendeeResponse {
  PENDING
  ACCEPTED
  DECLINED
  TENTATIVE
}

model AfterActionReport {
  id              String    @id @default(cuid())
  meetingId       String    @unique
  meeting         Meeting   @relation(fields: [meetingId], references: [id], onDelete: Cascade)

  // Content
  summary         String
  keyTakeaways    Json      // Array of strings
  actionItems     Json      // Structured action items with owners and due dates
  nextSteps       String?
  riskFlags       Json?     // Array of risk/concern items

  // Sentiment/Assessment
  sentiment       MeetingSentiment?
  dealProbability Int?      // 0-100

  // Metadata
  authorId        String
  status          ReportStatus @default(DRAFT)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum MeetingSentiment {
  VERY_POSITIVE
  POSITIVE
  NEUTRAL
  NEGATIVE
  VERY_NEGATIVE
}

enum ReportStatus {
  DRAFT
  SUBMITTED
  APPROVED
}

model Activity {
  id          String        @id @default(cuid())
  type        ActivityType
  title       String
  description String?
  metadata    Json?

  // Relations (polymorphic-style)
  companyId   String?
  company     Company?      @relation(fields: [companyId], references: [id])
  dealId      String?
  deal        Deal?         @relation(fields: [dealId], references: [id])
  contactId   String?
  contact     Contact?      @relation(fields: [contactId], references: [id])

  // Actor
  userId      String
  user        User          @relation(fields: [userId], references: [id])

  createdAt   DateTime      @default(now())

  @@index([companyId])
  @@index([dealId])
  @@index([contactId])
  @@index([userId])
  @@index([createdAt])
}

enum ActivityType {
  MEETING_SCHEDULED
  MEETING_COMPLETED
  EMAIL_SENT
  EMAIL_RECEIVED
  NOTE_ADDED
  DOCUMENT_UPLOADED
  DEAL_STAGE_CHANGED
  DEAL_CREATED
  CONTACT_CREATED
  TASK_COMPLETED
  IC_MEMO_SUBMITTED
  TERM_SHEET_SENT
}

// =============================================================================
// DOCUMENTS
// =============================================================================

model Document {
  id              String            @id @default(cuid())
  name            String
  description     String?

  // File info
  fileName        String
  fileType        String
  fileSize        Int
  mimeType        String
  storagePath     String            // Supabase storage path

  // Classification
  type            DocumentType
  classification  Classification    @default(CONFIDENTIAL)
  accessLevel     AccessLevel       @default(TEAM)

  // Relations
  companyId       String?
  company         Company?          @relation(fields: [companyId], references: [id])
  dealId          String?
  deal            Deal?             @relation(fields: [dealId], references: [id])
  uploadedById    String
  uploadedBy      User              @relation(fields: [uploadedById], references: [id])

  // Versioning
  version         Int               @default(1)
  parentId        String?
  parent          Document?         @relation("DocumentVersions", fields: [parentId], references: [id])
  versions        Document[]        @relation("DocumentVersions")

  // Access tracking
  accessLogs      DocumentAccessLog[]

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@index([companyId])
  @@index([dealId])
  @@index([type])
  @@index([classification])
}

enum DocumentType {
  PITCH_DECK
  FINANCIAL_MODEL
  IC_MEMO
  TERM_SHEET
  DUE_DILIGENCE
  BOARD_DECK
  LEGAL
  REFERENCE
  OTHER
}

enum AccessLevel {
  PRIVATE       // Only uploader
  TEAM          // Deal team only
  IC_MEMBERS    // Investment committee
  LP_ACCESSIBLE // Available in LP portal
}

model DocumentAccessLog {
  id          String    @id @default(cuid())
  documentId  String
  document    Document  @relation(fields: [documentId], references: [id], onDelete: Cascade)
  userId      String
  action      String    // VIEW, DOWNLOAD, SHARE
  ipAddress   String?
  userAgent   String?

  createdAt   DateTime  @default(now())

  @@index([documentId])
  @@index([userId])
  @@index([createdAt])
}

// =============================================================================
// IC MEMOS & INVESTMENT COMMITTEE
// =============================================================================

model ICMemo {
  id              String        @id @default(cuid())
  dealId          String
  deal            Deal          @relation(fields: [dealId], references: [id])

  // Content
  title           String
  content         Json          // Structured memo content

  // Status
  status          ICMemoStatus  @default(DRAFT)
  submittedAt     DateTime?
  reviewedAt      DateTime?

  // Voting
  votes           ICMemoVote[]

  // Version control
  version         Int           @default(1)

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([dealId])
  @@index([status])
}

enum ICMemoStatus {
  DRAFT
  SUBMITTED
  IN_REVIEW
  APPROVED
  REJECTED
  NEEDS_REVISION
}

model ICMemoVote {
  id          String      @id @default(cuid())
  memoId      String
  memo        ICMemo      @relation(fields: [memoId], references: [id], onDelete: Cascade)
  userId      String
  vote        VoteType
  comment     String?

  createdAt   DateTime    @default(now())

  @@unique([memoId, userId])
}

enum VoteType {
  APPROVE
  REJECT
  ABSTAIN
  REQUEST_INFO
}

// =============================================================================
// TASKS
// =============================================================================

model Task {
  id          String      @id @default(cuid())
  title       String
  description String?

  // Assignment
  assigneeId  String
  assignee    User        @relation(fields: [assigneeId], references: [id])

  // Relations
  dealId      String?
  deal        Deal?       @relation(fields: [dealId], references: [id])

  // Status
  status      TaskStatus  @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?
  completedAt DateTime?

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([assigneeId])
  @@index([dealId])
  @@index([status])
  @@index([dueDate])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  BLOCKED
  COMPLETED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

// =============================================================================
// PORTFOLIO & FUND
// =============================================================================

model Fund {
  id                  String    @id @default(cuid())
  name                String
  vintage             Int
  size                Decimal   @db.Decimal(15, 2)

  // Status
  closeDate           DateTime?
  investmentPeriodEnd DateTime?
  fundTermEnd         DateTime?

  // Financials
  capitalCalled       Decimal   @db.Decimal(15, 2) @default(0)
  capitalCommitted    Decimal   @db.Decimal(15, 2)
  distributions       Decimal   @db.Decimal(15, 2) @default(0)
  nav                 Decimal   @db.Decimal(15, 2) @default(0)

  // Terms
  managementFee       Decimal   @db.Decimal(5, 4) @default(0.02)
  carriedInterest     Decimal   @db.Decimal(5, 4) @default(0.20)

  // Relations
  investments         PortfolioInvestment[]
  lpCommitments       LPCommitment[]

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}

model PortfolioInvestment {
  id                String    @id @default(cuid())
  fundId            String
  fund              Fund      @relation(fields: [fundId], references: [id])
  companyId         String

  // Investment details
  initialInvestment Decimal   @db.Decimal(15, 2)
  totalInvested     Decimal   @db.Decimal(15, 2)
  currentValue      Decimal   @db.Decimal(15, 2)
  ownership         Decimal   @db.Decimal(5, 4)

  // Status
  status            InvestmentStatus @default(ACTIVE)

  // Exit details
  exitDate          DateTime?
  exitProceeds      Decimal?  @db.Decimal(15, 2)
  exitType          String?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@unique([fundId, companyId])
}

enum InvestmentStatus {
  ACTIVE
  PARTIAL_EXIT
  FULLY_EXITED
  WRITTEN_OFF
}

model LPCommitment {
  id            String    @id @default(cuid())
  fundId        String
  fund          Fund      @relation(fields: [fundId], references: [id])
  contactId     String

  // Commitment
  commitment    Decimal   @db.Decimal(15, 2)
  called        Decimal   @db.Decimal(15, 2) @default(0)
  distributed   Decimal   @db.Decimal(15, 2) @default(0)

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([fundId, contactId])
}

// =============================================================================
// TAGS & METADATA
// =============================================================================

model Tag {
  id          String       @id @default(cuid())
  name        String       @unique
  color       String?
  category    String?

  companies   CompanyTag[]

  createdAt   DateTime     @default(now())
}

model CompanyTag {
  id          String    @id @default(cuid())
  companyId   String
  company     Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  tagId       String
  tag         Tag       @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([companyId, tagId])
}

// =============================================================================
// AUDIT LOG
// =============================================================================

model AuditLog {
  id          String    @id @default(cuid())
  userId      String
  action      String
  entityType  String
  entityId    String
  oldValues   Json?
  newValues   Json?
  ipAddress   String?
  userAgent   String?

  createdAt   DateTime  @default(now())

  @@index([userId])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

### 3.3 API Design

#### 3.3.1 API Patterns

All APIs follow RESTful conventions with the following patterns:

**Base URL:** `/api/v1`

**Response Format:**
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

**Authentication:**
- Bearer token in `Authorization` header
- API keys for service-to-service communication
- Rate limiting per user/IP

#### 3.3.2 Core Endpoints

```
# Companies
GET     /api/v1/companies
POST    /api/v1/companies
GET     /api/v1/companies/:id
PUT     /api/v1/companies/:id
DELETE  /api/v1/companies/:id
GET     /api/v1/companies/:id/contacts
GET     /api/v1/companies/:id/deals
GET     /api/v1/companies/:id/activities

# Contacts
GET     /api/v1/contacts
POST    /api/v1/contacts
GET     /api/v1/contacts/:id
PUT     /api/v1/contacts/:id
DELETE  /api/v1/contacts/:id

# Deals
GET     /api/v1/deals
POST    /api/v1/deals
GET     /api/v1/deals/:id
PUT     /api/v1/deals/:id
PATCH   /api/v1/deals/:id/stage
GET     /api/v1/deals/:id/documents
POST    /api/v1/deals/:id/ic-memo

# Meetings
GET     /api/v1/meetings
POST    /api/v1/meetings
GET     /api/v1/meetings/:id
PUT     /api/v1/meetings/:id
POST    /api/v1/meetings/:id/after-action-report
POST    /api/v1/meetings/sync-calendar

# Documents
GET     /api/v1/documents
POST    /api/v1/documents/upload
GET     /api/v1/documents/:id
GET     /api/v1/documents/:id/download
POST    /api/v1/documents/:id/share

# Reports
GET     /api/v1/reports/lp-quarterly
POST    /api/v1/reports/lp-quarterly/generate
POST    /api/v1/reports/lp-quarterly/distribute
GET     /api/v1/reports/fund-performance
GET     /api/v1/reports/deal-source-attribution

# Analytics
GET     /api/v1/analytics/pipeline
GET     /api/v1/analytics/fund-metrics
GET     /api/v1/analytics/activity-feed
```

### 3.4 Security Patterns

#### 3.4.1 Encryption Standards

| Layer | Standard | Implementation |
|-------|----------|----------------|
| Data at Rest | AES-256-GCM | Supabase encryption |
| Data in Transit | TLS 1.3 | Vercel/Cloudflare |
| Field-Level Encryption | AES-256-GCM | Custom for CLASSIFIED data |
| Password Hashing | Argon2id | Auth provider |
| API Keys | SHA-256 | Hashed storage |

#### 3.4.2 Security Headers

```typescript
// next.config.js security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];
```

---

## 4. Design System

### 4.1 Design Philosophy: "Defense Tech Bloomberg"

The visual identity combines:

1. **Bloomberg Terminal DNA**: High information density, data-first layouts, professional typography
2. **Defense Aesthetic**: Dark themes, precision engineering feel, operational interface
3. **Institutional Trust**: Sophisticated color palette, restrained use of color, professional polish

### 4.2 Color Palette

#### 4.2.1 Core Colors

```css
:root {
  /* Background Hierarchy */
  --bg-primary: #0a0a0b;      /* Main background - near black */
  --bg-secondary: #121214;    /* Card backgrounds */
  --bg-tertiary: #1a1a1d;     /* Elevated surfaces */
  --bg-elevated: #222225;     /* Hover states, modals */

  /* Border Colors */
  --border-subtle: #27272a;   /* Subtle dividers */
  --border-default: #3f3f46;  /* Default borders */
  --border-strong: #52525b;   /* Emphasized borders */

  /* Text Colors */
  --text-primary: #fafafa;    /* Primary text */
  --text-secondary: #a1a1aa;  /* Secondary text */
  --text-tertiary: #71717a;   /* Muted text */
  --text-disabled: #52525b;   /* Disabled text */

  /* Brand Colors */
  --accent-primary: #06b6d4;  /* Cyan - primary actions */
  --accent-secondary: #8b5cf6; /* Violet - secondary accent */

  /* Semantic Colors */
  --success: #10b981;         /* Emerald */
  --warning: #f59e0b;         /* Amber */
  --error: #ef4444;           /* Red */
  --info: #3b82f6;            /* Blue */

  /* Data Visualization */
  --chart-1: #06b6d4;         /* Cyan */
  --chart-2: #8b5cf6;         /* Violet */
  --chart-3: #10b981;         /* Emerald */
  --chart-4: #f59e0b;         /* Amber */
  --chart-5: #ec4899;         /* Pink */
  --chart-6: #6366f1;         /* Indigo */
}
```

#### 4.2.2 Neumorphic Effects

```css
/* Neumorphic Card */
.card-neumorphic {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.3),
    0 2px 4px -2px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
}

/* Elevated State */
.card-neumorphic:hover {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.4),
    0 4px 6px -4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
}

/* Pressed State */
.card-neumorphic:active {
  box-shadow:
    inset 0 2px 4px 0 rgba(0, 0, 0, 0.3);
}
```

### 4.3 Typography

#### 4.3.1 Font Stack

```css
:root {
  /* Primary Font - UI and Body */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Monospace - Data, Code, Numbers */
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
}
```

#### 4.3.2 Type Scale

| Name | Size | Weight | Line Height | Use Case |
|------|------|--------|-------------|----------|
| `display-lg` | 48px | 700 | 1.1 | Hero headings |
| `display-md` | 36px | 700 | 1.2 | Page titles |
| `heading-lg` | 24px | 600 | 1.3 | Section headings |
| `heading-md` | 20px | 600 | 1.4 | Card headings |
| `heading-sm` | 16px | 600 | 1.4 | Subsection headings |
| `body-lg` | 16px | 400 | 1.6 | Primary body text |
| `body-md` | 14px | 400 | 1.5 | Default body text |
| `body-sm` | 12px | 400 | 1.5 | Secondary text |
| `caption` | 11px | 500 | 1.4 | Labels, captions |
| `mono-lg` | 14px | 500 | 1.5 | Large data values |
| `mono-md` | 12px | 500 | 1.4 | Default data values |

### 4.4 Component Library

#### 4.4.1 Core Components

| Component | Description | Variants |
|-----------|-------------|----------|
| `Button` | Primary action element | `default`, `outline`, `ghost`, `destructive` |
| `Card` | Container component | `default`, `neumorphic`, `elevated` |
| `Badge` | Status/label indicator | `default`, `outline`, colors for status |
| `Input` | Form input | `default`, `error`, with icons |
| `Select` | Dropdown selector | Single, multi-select |
| `Table` | Data table | Sortable, selectable, paginated |
| `Modal` | Dialog overlay | `default`, `fullscreen`, `drawer` |
| `Tabs` | Tab navigation | Horizontal, vertical |
| `Avatar` | User/company image | Sizes: `sm`, `md`, `lg`, `xl` |
| `Tooltip` | Contextual info | Positioning options |
| `Toast` | Notifications | `success`, `error`, `warning`, `info` |

#### 4.4.2 Data Visualization Components

| Component | Library | Use Case |
|-----------|---------|----------|
| `BarChart` | Tremor | Comparisons, pipeline |
| `AreaChart` | Tremor | Trends over time |
| `DonutChart` | Tremor | Portfolio distribution |
| `LineChart` | Tremor | Performance tracking |
| `MetricCard` | Custom | KPI display |
| `ProgressBar` | Custom | Completion, capacity |
| `Sparkline` | Tremor | Inline trends |
| `Funnel` | Custom | Pipeline conversion |

### 4.5 Layout Patterns

#### 4.5.1 Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  NAVBAR (sticky)                                      64px      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Logo    Navigation                    Search  User  Cmd+K │  │
│  └──────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────────────────────────────────┐    │
│  │          │  │                                          │    │
│  │ SIDEBAR  │  │               MAIN CONTENT               │    │
│  │          │  │                                          │    │
│  │  240px   │  │                flex-1                    │    │
│  │          │  │                                          │    │
│  │ - Nav    │  │  ┌─────────────────────────────────────┐ │    │
│  │ - Deals  │  │  │ Page Header                         │ │    │
│  │ - Reports│  │  ├─────────────────────────────────────┤ │    │
│  │ - etc    │  │  │                                     │ │    │
│  │          │  │  │ Content Area                        │ │    │
│  │          │  │  │                                     │ │    │
│  │          │  │  │                                     │ │    │
│  │          │  │  └─────────────────────────────────────┘ │    │
│  │          │  │                                          │    │
│  └──────────┘  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.5.2 Information Density Guidelines

- **High Density**: Tables, data grids, analytics dashboards
- **Medium Density**: List views, pipeline boards, timelines
- **Low Density**: Forms, detail views, empty states

**Spacing Scale:**
```css
--spacing-0: 0;
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;
```

### 4.6 Mobile Responsiveness

#### 4.6.1 Breakpoints

```css
--screen-sm: 640px;   /* Mobile landscape */
--screen-md: 768px;   /* Tablet */
--screen-lg: 1024px;  /* Laptop */
--screen-xl: 1280px;  /* Desktop */
--screen-2xl: 1536px; /* Large desktop */
```

#### 4.6.2 Mobile Adaptations

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Sidebar | Fixed, 240px | Collapsible drawer |
| Tables | Full columns | Horizontal scroll or card view |
| Charts | Full size | Simplified, touch-optimized |
| Modals | Centered dialogs | Full-screen sheets |
| Navigation | Horizontal tabs | Bottom navigation |

---

## 5. Functional Specifications

### 5.1 Contact & Company Management

#### 5.1.1 Company Profiles

**Core Information:**
- Company name, legal name, description
- Website, LinkedIn, other social links
- Sector, sub-sector, stage
- Headquarters, employee count, founded year
- Data classification level

**Financial Data:**
- Last funding round (type, amount, date)
- Total raised, current valuation
- Cap table summary (if available)

**Relationship Data:**
- Source attribution (how we found them)
- Referrer tracking
- Deal history
- Meeting history
- Document repository

**Activity Timeline:**
- All interactions logged chronologically
- Filter by activity type
- Export capability

#### 5.1.2 Contact Management

**Contact Types:**
- Company contacts (founders, executives)
- LP contacts
- Co-investors
- Advisors
- Service providers

**Contact Information:**
- Name, email, phone
- LinkedIn profile
- Title, department, company
- Communication preferences

**Relationship Intelligence:**
- Interaction history
- Referral tracking
- Shared connections

### 5.2 Deal Pipeline Tracking

#### 5.2.1 Pipeline Stages

```
SOURCED → FIRST_MEETING → SECOND_MEETING → DEEP_DIVE →
PARTNER_REVIEW → IC_PRESENTATION → TERM_SHEET →
DUE_DILIGENCE → LEGAL_DOCS → CLOSED
                          ↓
                       PASSED
```

#### 5.2.2 Deal Management Features

**Deal Card Information:**
- Company name, round type
- Target check size, ownership
- Current stage, time in stage
- Deal lead, team members
- Priority level
- Next action required

**Pipeline Views:**
- Kanban board (drag-and-drop stage changes)
- List view (sortable, filterable)
- Calendar view (by meeting dates)
- Analytics view (conversion metrics)

**Deal Actions:**
- Schedule meeting
- Upload document
- Create IC memo
- Send term sheet
- Change stage
- Pass with reason

#### 5.2.3 Source Attribution

Track deal source through entire lifecycle:
- Source type (inbound, referral, conference, etc.)
- Referrer details
- Attribution to events
- Conversion rate by source
- ROI by source channel

### 5.3 Meeting Automation

#### 5.3.1 Meeting Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    MEETING LIFECYCLE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. SCHEDULING                                              │
│     ├─ Create meeting in Mortis Atlas                       │
│     ├─ Auto-sync to Google Calendar                         │
│     ├─ Send invites to attendees                            │
│     └─ Generate meeting prep document                       │
│                                                             │
│  2. PRE-MEETING                                             │
│     ├─ Notification 24h before                              │
│     ├─ Company profile summary                              │
│     ├─ Previous meeting notes                               │
│     └─ Suggested talking points                             │
│                                                             │
│  3. DURING MEETING                                          │
│     ├─ Quick note capture                                   │
│     ├─ Action item logging                                  │
│     └─ Decision recording                                   │
│                                                             │
│  4. POST-MEETING                                            │
│     ├─ After-action report generation                       │
│     ├─ Action items assigned                                │
│     ├─ Follow-up scheduling                                 │
│     └─ Activity logged to company/deal                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 5.3.2 After-Action Report Template

```markdown
## Meeting After-Action Report

### Meeting Details
- **Date:** [Auto-populated]
- **Duration:** [Auto-calculated]
- **Attendees:** [From calendar]
- **Company:** [Linked]
- **Deal:** [If applicable]

### Summary
[Meeting summary - manual or AI-assisted]

### Key Takeaways
1. [Key point 1]
2. [Key point 2]
3. [Key point 3]

### Action Items
| # | Task | Owner | Due Date | Status |
|---|------|-------|----------|--------|
| 1 | [Task] | [Person] | [Date] | [ ] |

### Investment Considerations
- **Pros:** [List]
- **Cons/Risks:** [List]
- **Open Questions:** [List]

### Next Steps
- [ ] [Follow-up action]
- [ ] [Document request]
- [ ] [Next meeting]

### Deal Probability Update
Previous: [X]% → Current: [Y]%

### Sentiment
[Very Positive | Positive | Neutral | Negative | Very Negative]
```

### 5.4 Document Management

#### 5.4.1 Document Types

| Type | Description | Default Classification |
|------|-------------|----------------------|
| Pitch Deck | Company presentation | CONFIDENTIAL |
| Financial Model | Excel/sheets financials | CONFIDENTIAL |
| IC Memo | Investment committee memo | FOUO |
| Term Sheet | Investment terms | CLASSIFIED |
| Due Diligence | DD reports and findings | FOUO |
| Board Deck | Board meeting materials | CONFIDENTIAL |
| Legal Documents | Contracts, agreements | CLASSIFIED |
| Reference | Market research, etc. | INTERNAL |

#### 5.4.2 Document Features

**Upload & Storage:**
- Drag-and-drop upload
- Multi-file support
- Version control
- Supabase Storage backend
- Automatic virus scanning

**Organization:**
- Folder structure by company/deal
- Tagging system
- Full-text search
- Classification labels

**Access Control:**
- Per-document permissions
- Expiring share links
- Download tracking
- Watermarking for exports

**LP Data Room:**
- Curated document collections
- Access logging
- Bulk download with watermarks

### 5.5 Reporting & Analytics

#### 5.5.1 LP Quarterly Report

**Sections:**
1. Fund Overview (size, capital deployment, NAV)
2. Performance Summary (IRR, MOIC, TVPI, DPI, RVPI)
3. Portfolio Update (markups, markdowns, exits)
4. Deal Activity (pipeline metrics)
5. Upcoming Events (expected exits, board meetings)
6. Market Commentary (sector trends, outlook)

**Features:**
- Template customization
- PDF export
- Email distribution
- Data room upload
- Historical archive

#### 5.5.2 Fund Analytics Dashboard

**Metrics:**
- IRR (gross, net, since inception)
- MOIC (realized, unrealized, total)
- TVPI, DPI, RVPI
- Capital deployment (called, deployed, reserves)
- Portfolio construction (by stage, sector, geography)

**Visualizations:**
- Performance waterfall
- Vintage year comparison
- Sector allocation donut
- Capital deployment timeline
- Portfolio company table

#### 5.5.3 Deal Source Attribution

**Metrics by Source:**
- Conversion rate
- Average deal size
- Time to close
- Quality score
- ROI (if measurable)

**Referrer Tracking:**
- Leaderboard
- Referral rewards
- Thank-you automation

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐      ┌──────────┐      ┌──────────────┐       │
│  │  User   │──────│   SSO    │──────│  Identity    │       │
│  │ Browser │      │ Provider │      │  Provider    │       │
│  └────┬────┘      └────┬─────┘      │ (Google/MS)  │       │
│       │                │            └──────────────┘       │
│       │ 1. Login       │                                    │
│       │ Request        │                                    │
│       │ ──────────────>│                                    │
│       │                │                                    │
│       │ 2. Redirect to │                                    │
│       │ IdP            │                                    │
│       │ <──────────────│                                    │
│       │                                                     │
│       │ 3. Authenticate with IdP                           │
│       │ ─────────────────────────────────────────────────> │
│       │                                                     │
│       │ 4. Return Auth Code                                │
│       │ <───────────────────────────────────────────────── │
│       │                                                     │
│       │ 5. Exchange Code for Tokens                        │
│       │ ──────────────>│                                    │
│       │                │                                    │
│       │ 6. Verify & Issue Session                          │
│       │ <──────────────│                                    │
│       │                                                     │
│       │ 7. MFA Challenge                                   │
│       │ (if enabled)                                       │
│       │                                                     │
│       │ 8. Session Established                             │
│       │ (JWT + Refresh Token)                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Data Protection

#### 6.2.1 Encryption Implementation

```typescript
// Field-level encryption for classified data
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export function encryptField(plaintext: string, key: Buffer): EncryptedField {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

export function decryptField(encrypted: EncryptedField, key: Buffer): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(encrypted.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));

  let decrypted = decipher.update(encrypted.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

#### 6.2.2 Row-Level Security (Supabase)

```sql
-- Example RLS policies for deals table
CREATE POLICY "Users can view deals they're assigned to" ON deals
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM deal_team_members WHERE deal_id = deals.id
    )
    OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('GP', 'PRINCIPAL')
  );

CREATE POLICY "Only GPs can delete deals" ON deals
  FOR DELETE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'GP'
  );

-- Document access based on classification
CREATE POLICY "Classified docs require GP/Principal" ON documents
  FOR SELECT
  USING (
    classification != 'CLASSIFIED'
    OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('GP', 'PRINCIPAL')
  );
```

### 6.3 Audit Logging

All security-relevant events are logged:

```typescript
interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
}

enum AuditAction {
  // Authentication
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',

  // Data Access
  RECORD_VIEW = 'RECORD_VIEW',
  RECORD_CREATE = 'RECORD_CREATE',
  RECORD_UPDATE = 'RECORD_UPDATE',
  RECORD_DELETE = 'RECORD_DELETE',

  // Documents
  DOCUMENT_UPLOAD = 'DOCUMENT_UPLOAD',
  DOCUMENT_DOWNLOAD = 'DOCUMENT_DOWNLOAD',
  DOCUMENT_SHARE = 'DOCUMENT_SHARE',

  // Exports
  DATA_EXPORT = 'DATA_EXPORT',
  REPORT_GENERATED = 'REPORT_GENERATED',

  // Admin
  USER_CREATED = 'USER_CREATED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
}
```

---

## 7. Non-Negotiables

### 7.1 Absolute Requirements

These requirements **cannot be compromised** under any circumstances:

#### 7.1.1 Security Requirements

| Requirement | Description | Rationale |
|-------------|-------------|-----------|
| **MFA Mandatory** | All users must have MFA enabled | Defense against credential theft |
| **Encryption at Rest** | All data encrypted with AES-256 | Data protection if storage compromised |
| **Encryption in Transit** | TLS 1.3 minimum | Prevent interception |
| **Audit Logging** | All data access logged | Compliance and forensics |
| **Session Timeout** | 30-minute inactivity timeout | Prevent unauthorized access |
| **Role-Based Access** | Strict RBAC enforcement | Principle of least privilege |
| **Data Classification** | All data must be classified | Appropriate handling |

#### 7.1.2 Compliance Requirements

| Requirement | Standard | Notes |
|-------------|----------|-------|
| **Data Retention** | 7+ years for financial data | SEC/regulatory requirements |
| **Export Controls** | ITAR awareness | Defense tech deal flow |
| **Privacy** | CCPA, GDPR consideration | LP data handling |
| **SOC 2 Alignment** | Type II controls | Enterprise customers |

#### 7.1.3 Performance Benchmarks

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Page Load (LCP) | < 1.5s | < 2.5s |
| Time to Interactive | < 2.0s | < 3.5s |
| API Response (p95) | < 200ms | < 500ms |
| Database Queries | < 50ms average | < 200ms |
| Uptime | 99.9% | 99.5% |

### 7.2 Design Non-Negotiables

| Requirement | Description |
|-------------|-------------|
| **Dark Theme Only** | No light mode - professional, defense aesthetic |
| **Information Density** | Bloomberg-level data density on dashboards |
| **Keyboard Navigation** | Full keyboard support, Command Palette (⌘K) |
| **Accessibility** | WCAG 2.1 AA compliance minimum |
| **Responsive** | Full functionality on tablet+ |

### 7.3 Feature Non-Negotiables

| Feature | Reason |
|---------|--------|
| **Full Audit Trail** | Every action traceable |
| **Data Export** | User data portability |
| **Offline Indicators** | Clear connectivity status |
| **Error Recovery** | Graceful degradation |
| **Auto-Save** | No data loss on forms |

---

## 8. Appendices

### 8.1 Glossary

| Term | Definition |
|------|------------|
| **AUM** | Assets Under Management |
| **DPI** | Distributions to Paid-In Capital |
| **GP** | General Partner |
| **IC** | Investment Committee |
| **IRR** | Internal Rate of Return |
| **LP** | Limited Partner |
| **MOIC** | Multiple on Invested Capital |
| **NAV** | Net Asset Value |
| **RVPI** | Residual Value to Paid-In |
| **TVPI** | Total Value to Paid-In |
| **FOUO** | For Official Use Only |
| **ITAR** | International Traffic in Arms Regulations |

### 8.2 Decision Log

| Date | Decision | Rationale | Alternatives Considered |
|------|----------|-----------|------------------------|
| 2026-01-XX | Next.js App Router | RSC support, performance | Pages Router, Remix |
| 2026-01-XX | Supabase for DB/Auth | Managed PostgreSQL, RLS | AWS RDS, PlanetScale |
| 2026-01-XX | Tremor for charts | Enterprise design, React | Recharts, Victory |
| 2026-01-XX | Neumorphic design | Distinctive, professional | Flat, Material |

### 8.3 Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-16 | System | Initial blueprint |

---

## Document Control

**Classification:** INTERNAL USE ONLY
**Distribution:** Development Team, Product Leadership
**Review Cycle:** Quarterly
**Owner:** Engineering Lead

---

*This document is the authoritative source of truth for Mortis Atlas development. All feature implementations must align with the specifications herein. Deviations require documented approval and blueprint amendment.*
