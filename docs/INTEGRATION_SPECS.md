# Mortis Atlas - Integration Specifications

> **Version:** 1.0.0
> **Last Updated:** 2026-01-16
> **Status:** Active Development

---

## Table of Contents

1. [Overview](#1-overview)
2. [Google Workspace Integration](#2-google-workspace-integration)
3. [Document Signing (DocuSign)](#3-document-signing-docusign)
4. [Market Data (PitchBook)](#4-market-data-pitchbook)
5. [Cap Table (Carta)](#5-cap-table-carta)
6. [Communication (Slack)](#6-communication-slack)
7. [Contact Enrichment (LinkedIn)](#7-contact-enrichment-linkedin)
8. [File Storage (Supabase)](#8-file-storage-supabase)
9. [Email (Resend)](#9-email-resend)
10. [Authentication Providers](#10-authentication-providers)

---

## 1. Overview

### 1.1 Integration Priority Matrix

| Integration | Priority | Status | Phase |
|-------------|----------|--------|-------|
| Supabase (DB/Auth/Storage) | P0 - Critical | ✅ Implemented | 1 |
| Google Calendar | P0 - Critical | 🔲 Planned | 2 |
| Gmail | P0 - Critical | 🔲 Planned | 2 |
| DocuSign | P1 - High | 🔲 Planned | 3 |
| PitchBook | P1 - High | 🔲 Planned | 3 |
| Carta | P1 - High | 🔲 Planned | 3 |
| Slack | P2 - Medium | 🔲 Planned | 4 |
| LinkedIn | P2 - Medium | 🔲 Planned | 4 |
| Resend (Email) | P1 - High | 🔲 Planned | 2 |

### 1.2 Authentication Pattern

All third-party integrations follow OAuth 2.0 flow:

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐
│  User   │────▶│ Mortis Atlas│────▶│   Provider   │
│         │     │             │     │  (OAuth 2.0) │
└─────────┘     └──────┬──────┘     └──────────────┘
                       │
                       ▼
              ┌────────────────┐
              │ Token Storage  │
              │ (Encrypted DB) │
              └────────────────┘
```

### 1.3 Environment Variables

```bash
# .env.local template for integrations

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# DocuSign
DOCUSIGN_INTEGRATION_KEY=
DOCUSIGN_SECRET_KEY=
DOCUSIGN_ACCOUNT_ID=
DOCUSIGN_BASE_URL=

# PitchBook
PITCHBOOK_API_KEY=

# Carta
CARTA_CLIENT_ID=
CARTA_CLIENT_SECRET=

# Slack
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=

# LinkedIn
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# Email
RESEND_API_KEY=
```

---

## 2. Google Workspace Integration

### 2.1 Overview

**Purpose:** Calendar synchronization, email tracking, and meeting management.

**Components:**
- Google Calendar API
- Gmail API (optional, Phase 2+)
- Google OAuth 2.0

### 2.2 OAuth Configuration

**Required Scopes:**
```
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/gmail.readonly (optional)
https://www.googleapis.com/auth/gmail.send (optional)
```

**Setup Steps:**
1. Create project in Google Cloud Console
2. Enable Calendar API (and Gmail API if needed)
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

### 2.3 Calendar Sync Implementation

```typescript
// lib/integrations/google-calendar.ts

import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function syncCalendarEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items?.map(transformEvent) ?? [];
}

export async function createCalendarEvent(
  accessToken: string,
  event: CreateEventInput
): Promise<string> {
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: event.title,
      description: event.description,
      start: { dateTime: event.startTime.toISOString() },
      end: { dateTime: event.endTime.toISOString() },
      attendees: event.attendees.map(email => ({ email })),
      conferenceData: event.includeVideoLink ? {
        createRequest: { requestId: crypto.randomUUID() }
      } : undefined,
    },
    conferenceDataVersion: event.includeVideoLink ? 1 : 0,
  });

  return response.data.id!;
}
```

### 2.4 Webhook for Real-time Updates

```typescript
// app/api/webhooks/google-calendar/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyGoogleWebhook } from '@/lib/integrations/google-calendar';

export async function POST(request: NextRequest) {
  const channelId = request.headers.get('x-goog-channel-id');
  const resourceState = request.headers.get('x-goog-resource-state');

  if (!verifyGoogleWebhook(request)) {
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 401 });
  }

  if (resourceState === 'sync') {
    // Initial sync notification, acknowledge
    return NextResponse.json({ ok: true });
  }

  // Process calendar change
  await processCalendarUpdate(channelId, resourceState);

  return NextResponse.json({ ok: true });
}
```

### 2.5 Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    CALENDAR SYNC FLOW                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. USER CONNECTS GOOGLE ACCOUNT                             │
│     └─▶ OAuth flow → Store refresh token (encrypted)         │
│                                                              │
│  2. INITIAL SYNC                                             │
│     └─▶ Fetch events (past 30 days, future 90 days)         │
│     └─▶ Match attendees to contacts                          │
│     └─▶ Link meetings to companies/deals                     │
│                                                              │
│  3. REAL-TIME UPDATES (Webhooks)                             │
│     └─▶ Google notifies of changes                          │
│     └─▶ Fetch updated event                                  │
│     └─▶ Update Mortis Atlas meeting record                   │
│                                                              │
│  4. OUTBOUND SYNC                                            │
│     └─▶ Create meeting in Mortis Atlas                       │
│     └─▶ Push to Google Calendar                              │
│     └─▶ Store Google event ID for future updates             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Document Signing (DocuSign)

### 3.1 Overview

**Purpose:** Electronic signature for term sheets, legal documents, and LP agreements.

**Use Cases:**
- Term sheet execution
- Side letters
- Subscription agreements
- Amendment signatures

### 3.2 Authentication

DocuSign uses JWT Grant for server-to-server authentication:

```typescript
// lib/integrations/docusign.ts

import * as docusign from 'docusign-esign';

const DOCUSIGN_BASE_PATH = process.env.DOCUSIGN_BASE_URL ||
  'https://demo.docusign.net/restapi';

export async function getDocuSignClient(): Promise<docusign.ApiClient> {
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(DOCUSIGN_BASE_PATH);

  const results = await apiClient.requestJWTUserToken(
    process.env.DOCUSIGN_INTEGRATION_KEY!,
    process.env.DOCUSIGN_USER_ID!,
    ['signature', 'impersonation'],
    Buffer.from(process.env.DOCUSIGN_PRIVATE_KEY!, 'base64'),
    3600
  );

  apiClient.addDefaultHeader(
    'Authorization',
    `Bearer ${results.body.access_token}`
  );

  return apiClient;
}
```

### 3.3 Envelope Creation

```typescript
export async function createSignatureEnvelope(
  documentId: string,
  signers: Signer[],
  options: EnvelopeOptions
): Promise<string> {
  const client = await getDocuSignClient();
  const envelopesApi = new docusign.EnvelopesApi(client);

  // Fetch document from Supabase storage
  const document = await getDocument(documentId);
  const documentBase64 = await fetchDocumentBase64(document.storagePath);

  const envelope: docusign.EnvelopeDefinition = {
    emailSubject: options.subject,
    documents: [{
      documentBase64,
      name: document.name,
      fileExtension: document.fileType,
      documentId: '1',
    }],
    recipients: {
      signers: signers.map((signer, index) => ({
        email: signer.email,
        name: signer.name,
        recipientId: String(index + 1),
        routingOrder: String(signer.order || index + 1),
        tabs: {
          signHereTabs: signer.signatureLocations.map(loc => ({
            anchorString: loc.anchor,
            anchorUnits: 'pixels',
            anchorXOffset: String(loc.xOffset || 0),
            anchorYOffset: String(loc.yOffset || 0),
          })),
        },
      })),
    },
    status: 'sent',
  };

  const result = await envelopesApi.createEnvelope(
    process.env.DOCUSIGN_ACCOUNT_ID!,
    { envelopeDefinition: envelope }
  );

  return result.envelopeId!;
}
```

### 3.4 Webhook Handler

```typescript
// app/api/webhooks/docusign/route.ts

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('x-docusign-signature-1');

  if (!verifyDocuSignWebhook(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(payload);

  switch (event.event) {
    case 'envelope-completed':
      await handleEnvelopeCompleted(event.data);
      break;
    case 'envelope-declined':
      await handleEnvelopeDeclined(event.data);
      break;
    case 'envelope-voided':
      await handleEnvelopeVoided(event.data);
      break;
  }

  return NextResponse.json({ ok: true });
}
```

---

## 4. Market Data (PitchBook)

### 4.1 Overview

**Purpose:** Company intelligence, funding data, market benchmarks.

**Use Cases:**
- Company profile enrichment
- Funding history lookup
- Comparable company analysis
- Market benchmarks for LP reports

### 4.2 API Integration

```typescript
// lib/integrations/pitchbook.ts

const PITCHBOOK_BASE_URL = 'https://api.pitchbook.com/v1';

export class PitchBookClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.PITCHBOOK_API_KEY!;
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${PITCHBOOK_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`PitchBook API error: ${response.status}`);
    }

    return response.json();
  }

  async searchCompanies(query: string): Promise<PitchBookCompany[]> {
    return this.request('/companies/search', { q: query });
  }

  async getCompanyProfile(pitchbookId: string): Promise<PitchBookCompanyProfile> {
    return this.request(`/companies/${pitchbookId}`);
  }

  async getCompanyFunding(pitchbookId: string): Promise<PitchBookFundingRound[]> {
    return this.request(`/companies/${pitchbookId}/funding`);
  }

  async getMarketBenchmarks(sector: string, stage: string): Promise<MarketBenchmarks> {
    return this.request('/benchmarks', { sector, stage });
  }
}
```

### 4.3 Data Enrichment Flow

```
┌──────────────────────────────────────────────────────────────┐
│                 COMPANY ENRICHMENT FLOW                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. NEW COMPANY CREATED                                      │
│     └─▶ Trigger enrichment job                               │
│                                                              │
│  2. PITCHBOOK SEARCH                                         │
│     └─▶ Search by company name + domain                      │
│     └─▶ Match confidence scoring                             │
│     └─▶ If match found, fetch full profile                   │
│                                                              │
│  3. DATA MERGE                                               │
│     └─▶ Update company with PitchBook data:                  │
│         - Description                                        │
│         - Employee count                                     │
│         - Founded year                                       │
│         - Total raised                                       │
│         - Last round details                                 │
│         - Key people                                         │
│                                                              │
│  4. PERIODIC REFRESH                                         │
│     └─▶ Re-enrich active pipeline companies weekly          │
│     └─▶ Re-enrich portfolio companies monthly               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Cap Table (Carta)

### 5.1 Overview

**Purpose:** Cap table data for portfolio companies, ownership tracking.

**Use Cases:**
- Portfolio company ownership verification
- Dilution tracking
- Exit scenario modeling
- LP reporting (ownership percentages)

### 5.2 API Integration

```typescript
// lib/integrations/carta.ts

const CARTA_BASE_URL = 'https://api.carta.com/v1';

export class CartaClient {
  private accessToken: string;

  async authenticate(): Promise<void> {
    const response = await fetch(`${CARTA_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.CARTA_CLIENT_ID,
        client_secret: process.env.CARTA_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    });

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  async getPortfolioCompanies(): Promise<CartaCompany[]> {
    const response = await fetch(`${CARTA_BASE_URL}/portfolio/companies`, {
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
    });
    return response.json();
  }

  async getCapTable(companyId: string): Promise<CartaCapTable> {
    const response = await fetch(
      `${CARTA_BASE_URL}/companies/${companyId}/cap-table`,
      { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
    );
    return response.json();
  }

  async getOwnership(companyId: string, fundId: string): Promise<OwnershipData> {
    const response = await fetch(
      `${CARTA_BASE_URL}/companies/${companyId}/ownership/${fundId}`,
      { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
    );
    return response.json();
  }
}
```

---

## 6. Communication (Slack)

### 6.1 Overview

**Purpose:** Team notifications, deal updates, meeting reminders.

**Use Cases:**
- New deal alerts
- Deal stage changes
- Meeting reminders
- IC memo submissions
- Portfolio company updates

### 6.2 Bot Setup

```typescript
// lib/integrations/slack.ts

import { WebClient } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function sendDealNotification(
  channel: string,
  deal: Deal,
  event: DealEvent
): Promise<void> {
  const blocks = buildDealNotificationBlocks(deal, event);

  await slack.chat.postMessage({
    channel,
    blocks,
    text: `Deal Update: ${deal.company.name}`, // Fallback
  });
}

function buildDealNotificationBlocks(deal: Deal, event: DealEvent): Block[] {
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${event.emoji} ${event.title}`,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Company:*\n${deal.company.name}` },
        { type: 'mrkdwn', text: `*Stage:*\n${deal.stage}` },
        { type: 'mrkdwn', text: `*Round:*\n${deal.roundType}` },
        { type: 'mrkdwn', text: `*Lead:*\n${deal.lead.name}` },
      ],
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'View Deal' },
          url: `${process.env.NEXT_PUBLIC_APP_URL}/deals/${deal.id}`,
        },
      ],
    },
  ];
}
```

### 6.3 Notification Configuration

| Event | Channel | Frequency |
|-------|---------|-----------|
| New deal created | #deal-flow | Immediate |
| Deal stage change | #deal-flow | Immediate |
| IC memo submitted | #investment-committee | Immediate |
| Meeting in 1 hour | DM to attendees | 1 hour before |
| Portfolio update | #portfolio | Daily digest |

---

## 7. Contact Enrichment (LinkedIn)

### 7.1 Overview

**Purpose:** Contact profile enrichment, professional history.

**Note:** LinkedIn API access is restricted. Consider using approved data providers or manual enrichment.

**Alternatives:**
- Clearbit
- Apollo.io
- ZoomInfo
- Hunter.io

### 7.2 Enrichment Provider Pattern

```typescript
// lib/integrations/enrichment.ts

interface EnrichmentProvider {
  enrichContact(email: string): Promise<EnrichedContact | null>;
  enrichCompany(domain: string): Promise<EnrichedCompany | null>;
}

export class ClearbitEnrichment implements EnrichmentProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.CLEARBIT_API_KEY!;
  }

  async enrichContact(email: string): Promise<EnrichedContact | null> {
    const response = await fetch(
      `https://person.clearbit.com/v2/people/find?email=${email}`,
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return {
      name: data.name?.fullName,
      title: data.employment?.title,
      company: data.employment?.name,
      linkedinUrl: data.linkedin?.handle
        ? `https://linkedin.com/in/${data.linkedin.handle}`
        : undefined,
      avatar: data.avatar,
    };
  }

  async enrichCompany(domain: string): Promise<EnrichedCompany | null> {
    const response = await fetch(
      `https://company.clearbit.com/v2/companies/find?domain=${domain}`,
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return {
      name: data.name,
      description: data.description,
      employeeCount: data.metrics?.employees,
      foundedYear: data.foundedYear,
      sector: data.category?.sector,
      location: data.geo?.city,
    };
  }
}
```

---

## 8. File Storage (Supabase)

### 8.1 Overview

**Status:** ✅ Implemented

**Purpose:** Document storage, version control, secure access.

### 8.2 Storage Configuration

```typescript
// lib/storage/documents.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadDocument(
  file: File,
  path: string,
  metadata: DocumentMetadata
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) throw error;
  return data.path;
}

export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}
```

### 8.3 Bucket Structure

```
documents/
├── companies/
│   └── {companyId}/
│       ├── pitch-decks/
│       ├── financials/
│       └── legal/
├── deals/
│   └── {dealId}/
│       ├── ic-memos/
│       ├── term-sheets/
│       └── due-diligence/
├── funds/
│   └── {fundId}/
│       ├── lp-reports/
│       └── agreements/
└── users/
    └── {userId}/
        └── exports/
```

---

## 9. Email (Resend)

### 9.1 Overview

**Purpose:** Transactional email for notifications, LP communications.

### 9.2 Implementation

```typescript
// lib/integrations/email.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(options: EmailOptions): Promise<void> {
  await resend.emails.send({
    from: 'Mortis Atlas <noreply@mortisventures.com>',
    to: options.to,
    subject: options.subject,
    react: options.template,
  });
}

// Email templates
export const EmailTemplates = {
  lpReportDistribution: (props: LPReportProps) => (
    <LPReportEmail {...props} />
  ),
  meetingReminder: (props: MeetingReminderProps) => (
    <MeetingReminderEmail {...props} />
  ),
  dealUpdate: (props: DealUpdateProps) => (
    <DealUpdateEmail {...props} />
  ),
};
```

---

## 10. Authentication Providers

### 10.1 Supported Providers

| Provider | Use Case | Status |
|----------|----------|--------|
| Google | SSO for internal team | 🔲 Planned |
| Microsoft | SSO for enterprise LPs | 🔲 Planned |
| Email/Password | Fallback, LP portal | 🔲 Planned |

### 10.2 NextAuth Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## Appendix A: Webhook Security

All webhooks must be verified before processing:

```typescript
// lib/webhooks/verify.ts

import crypto from 'crypto';

export function verifyWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## Appendix B: Rate Limiting

| API | Rate Limit | Strategy |
|-----|------------|----------|
| Google Calendar | 1M queries/day | Queue with backoff |
| DocuSign | 1000 calls/hour | Batch operations |
| PitchBook | Varies by plan | Cache aggressively |
| Slack | 1 msg/sec/channel | Queue with throttle |
| Resend | 100 emails/sec | Batch LP distribution |

---

*This document should be updated when new integrations are added or existing integrations are modified.*
