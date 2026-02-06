# Remediation Plan: Fix Dead Buttons & Activity/Meeting Infrastructure

> **Created:** 2026-02-05
> **Updated:** 2026-02-06
> **Priority:** Critical - blocks core VC funnel tracking

## Executive Summary

The UI for activity logging and meeting scheduling exists, but the underlying functionality is not implemented. The database schema (Activity model with dual company/deal association) is ready, but API endpoints and modal forms don't exist.

## Current State Analysis

### What Exists
- **Activity Model** in Prisma with `ActivityType` enum (EMAIL, CALL, MEETING, NOTE, TASK, DEAL_UPDATE, INTRO, DOCUMENT)
- **Dual-association support**: Activity can link to `companyId`, `contactId`, AND `dealId`
- **Dialog/Modal UI component** at `src/components/ui/dialog.tsx`
- **Modal patterns** in `add-company-modal.tsx`, `task-modal.tsx`, `add-contact-dialog.tsx`
- **Document upload modal** works on `/documents` page

### What's Missing (Original - see Phase 1 for completed items)
- ~~**No `/api/activities` route** - can't create/list activities~~ ✅ DONE
- ~~**No `src/lib/db/activities.ts`** - no CRUD helpers~~ ✅ DONE
- ~~**No ActivityModal component** - buttons have no onClick handlers~~ ✅ DONE
- ~~**No MeetingModal component** - meeting scheduling doesn't exist~~ ✅ DONE (uses ActivityModal with MEETING type)
- ~~**Dead buttons** in deal detail page (lines 520-528 have no onClick)~~ ✅ DONE

### Known Issues (Backlog)
- ~~**Documents page has placeholder data** - needs real document list from database~~ ✅ DONE

---

## Phase 1: Critical Fixes (Restore Core Functionality) ✅ COMPLETE

### 1A. Create Activity Infrastructure

**Files to create:**
| File | Purpose |
|------|---------|
| `src/lib/db/activities.ts` | CRUD operations for Activity model |
| `src/app/api/activities/route.ts` | GET/POST activities |
| `src/app/api/activities/[id]/route.ts` | GET/PUT/DELETE single activity |
| `src/components/activities/activity-modal.tsx` | Modal form for logging activities |
| `src/components/activities/index.ts` | Barrel export |

**Activity Modal Fields:**
- Type (dropdown: Email, Call, Meeting, Note, Task, Intro, Document)
- Subject (text input)
- Description (textarea)
- Date/Time (datetime picker)
- Due Date (optional, for tasks)
- Associated Company (pre-filled if opened from company page)
- Associated Deal (optional dropdown)
- Associated Contact (optional dropdown)

### 1B. Wire Up Deal Page Buttons

**File:** `src/app/deals/[id]/page.tsx`

Convert server component to client component wrapper pattern:
1. Create `src/app/deals/[id]/deal-detail-client.tsx` (client component with modals)
2. Server component fetches data, passes to client
3. Add state: `showActivityModal`, `showMeetingModal`, `showDocumentModal`
4. Wire onClick handlers to buttons (lines 520-528)

### 1C. Wire Up Company Page Button

**File:** `src/components/companies/company-detail-view.tsx`

- Add `useState` for `showActivityModal`
- Import and render `ActivityModal`
- Wire onClick to "Log Activity" button (line 613)

### 1D. Fix Navigation Links

**Issue:** "Edit Deal" button and company link may have routing issues

**Verify/Fix:**
- Edit Deal link at line 137-142 appears correct (`Link href={/deals/${deal.id}/edit}`)
- Company link at lines 159-165 appears correct (`Link href={/companies/${deal.company.id}}`)
- Test if these work - if not, check for middleware/auth redirect issues

---

## Phase 2: Meeting Scheduling (Enhanced Activity Type) ✅ COMPLETE

### 2A. Meeting-Specific Fields ✅

When activity type = MEETING, the ActivityModal now shows:
- Meeting Type (Initial Call, Due Diligence, Partner Meeting, Board Meeting, etc.)
- Location/Link (text input for Zoom link or address)
- Duration (dropdown: 15min, 30min, 45min, 1hr, 1.5hr, 2hr)

### 2B. Meeting List View ✅

**Files created:**
- `src/components/activities/meeting-list.tsx` - MeetingList and MeetingCard components
- `src/hooks/use-meetings.ts` - Hook for fetching meetings from API

Features:
- Filter activities where type = MEETING
- Show upcoming vs past meetings with visual status indicators
- Mark meetings complete
- Integrated on dashboard with Quick Action button

### 2C. Calendar View (Optional Enhancement)

- Simple month/week view showing scheduled meetings
- Click to open meeting details
- (Full Google Calendar integration is Phase 3)

---

## Phase 3: Activity Display & Analytics ✅ COMPLETE

### 3A. Activity Timeline on Deal Page ✅

**Changes made:**
- Created `src/app/deals/[id]/deal-activity-timeline.tsx` client component
- Fetches activities for the deal from `/api/activities?dealId=...`
- Displays using the existing `ActivityFeed` component from dashboard
- Shows chronologically grouped activities with expand/collapse

### 3B. Activity Feed Component ✅

**Already exists:** `src/components/dashboard/activity-feed.tsx`

Reusable component showing activity timeline:
- Used on Dashboard
- Now used on Deal detail page via DealActivityTimeline wrapper
- Supports filtering by entity context through API params

### 3C. Document Section Enhancement ✅

**Changes made:**
- Created `src/app/deals/[id]/deal-document-list.tsx` client component
- Fetches documents for the deal from `/api/documents?dealId=...`
- Displays using existing `DocumentList` component with compact variant
- Shows expandable list with quick "Add" button linking to upload page
- Pre-populates dealId in upload URL for seamless document association

---

## Implementation Order

```
Week 1 (Critical Path):
├── Day 1-2: Activity infrastructure (lib/db, API routes)
├── Day 3: ActivityModal component
├── Day 4: Wire deal page buttons (client component refactor)
└── Day 5: Wire company page button, test end-to-end

Week 2 (Meeting Enhancement):
├── Day 1-2: Meeting-specific form fields
├── Day 3: Meeting list component
└── Day 4-5: Activity timeline on deal page

Week 3 (Polish):
├── Day 1-2: Activity feed component (reusable)
├── Day 3: Document section clickable
└── Day 4-5: Testing, bug fixes
```

---

## API Design

### POST /api/activities
```typescript
{
  type: ActivityType,
  subject: string,
  description?: string,
  activityDate?: string, // ISO date
  dueDate?: string,
  companyId?: string,
  dealId?: string,
  contactId?: string,
  // Meeting-specific
  meetingType?: string,
  location?: string,
  duration?: number,
}
```

### GET /api/activities
Query params:
- `companyId` - filter by company
- `dealId` - filter by deal
- `contactId` - filter by contact
- `type` - filter by activity type
- `upcoming` - only future activities
- `limit`, `offset` - pagination

---

## Files Changed Summary

| File | Action | Priority |
|------|--------|----------|
| `src/lib/db/activities.ts` | Create | P1 |
| `src/app/api/activities/route.ts` | Create | P1 |
| `src/app/api/activities/[id]/route.ts` | Create | P1 |
| `src/components/activities/activity-modal.tsx` | Create | P1 |
| `src/components/activities/index.ts` | Create | P1 |
| `src/app/deals/[id]/page.tsx` | Refactor to client wrapper | P1 |
| `src/components/companies/company-detail-view.tsx` | Add modal state/import | P1 |
| `src/components/activities/meeting-list.tsx` | Create | P2 |
| `src/components/activities/activity-feed.tsx` | Create | P2 |

---

## Success Criteria

1. "Log Activity" button opens modal on both deal and company pages
2. "Schedule Meeting" button opens modal with meeting-specific fields
3. Activities saved to database with correct company/deal/contact associations
4. Activity count updates after logging
5. Activity timeline shows logged activities
6. All navigation links work without requiring URL manipulation

---

## Notes

- Keep meeting as an ActivityType (not separate model) for simplicity
- Meeting-specific fields stored in description or as JSON in a new field if needed
- Google Calendar integration is Phase 3 (external integration), not this phase
- Document upload already works - just need to wire "Add Document" button to existing upload flow
