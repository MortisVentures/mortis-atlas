import { CalendarProvider, MeetingType, RelationshipHeat } from "@prisma/client";

// =============================================================================
// CALENDAR INTEGRATION TYPES
// =============================================================================

export interface CalendarAccountCredentials {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
}

export interface CalendarSyncResult {
  eventsProcessed: number;
  eventsCreated: number;
  eventsUpdated: number;
  attendeesMatched: number;
  errors: string[];
}

// =============================================================================
// GOOGLE CALENDAR API TYPES
// =============================================================================

export interface GoogleCalendarEvent {
  id: string;
  status: "confirmed" | "tentative" | "cancelled";
  htmlLink: string;
  created: string;
  updated: string;
  summary: string;
  description?: string;
  location?: string;
  creator: {
    email: string;
    displayName?: string;
    self?: boolean;
  };
  organizer: {
    email: string;
    displayName?: string;
    self?: boolean;
  };
  start: {
    date?: string; // For all-day events
    dateTime?: string; // For timed events
    timeZone?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  recurringEventId?: string;
  originalStartTime?: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  attendees?: GoogleCalendarAttendee[];
  conferenceData?: {
    entryPoints?: {
      entryPointType: "video" | "phone" | "sip" | "more";
      uri: string;
      label?: string;
    }[];
  };
  hangoutLink?: string;
}

export interface GoogleCalendarAttendee {
  email: string;
  displayName?: string;
  organizer?: boolean;
  self?: boolean;
  responseStatus: "needsAction" | "declined" | "tentative" | "accepted";
  optional?: boolean;
}

export interface GoogleCalendarListResponse {
  kind: string;
  etag: string;
  summary: string;
  updated: string;
  timeZone: string;
  accessRole: string;
  nextPageToken?: string;
  nextSyncToken?: string;
  items: GoogleCalendarEvent[];
}

export interface GoogleCalendarList {
  kind: string;
  etag: string;
  nextPageToken?: string;
  nextSyncToken?: string;
  items: {
    kind: string;
    etag: string;
    id: string;
    summary: string;
    description?: string;
    timeZone: string;
    colorId?: string;
    backgroundColor?: string;
    foregroundColor?: string;
    selected?: boolean;
    accessRole: string;
    primary?: boolean;
  }[];
}

// =============================================================================
// PARSED CALENDAR TYPES (what we store in DB)
// =============================================================================

export interface ParsedCalendarEvent {
  externalId: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  location: string | null;
  meetingLink: string | null;
  attendees: ParsedAttendee[];
  organizerEmail: string;
  isAllDay: boolean;
  isRecurring: boolean;
  recurringEventId: string | null;
  status: string;
}

export interface ParsedAttendee {
  email: string;
  name: string | null;
  responseStatus: string;
  isOrganizer: boolean;
}

// =============================================================================
// MEETING TYPE DETECTION
// =============================================================================

export interface MeetingTypeDetection {
  type: MeetingType;
  confidence: number;
  signals: string[];
}

export interface MeetingKeywords {
  title: string[];
  description?: string[];
  attendeeRoles?: string[];
}

export const MEETING_TYPE_KEYWORDS: Record<MeetingType, MeetingKeywords> = {
  INITIAL_PITCH: {
    title: ["pitch", "intro", "introduction", "series", "raise", "fundraise", "fundraising", "first call", "initial"],
    attendeeRoles: ["founder", "ceo", "cto"],
  },
  DUE_DILIGENCE: {
    title: ["due diligence", "dd", "deep dive", "technical review", "tech review", "diligence"],
    description: ["diligence", "review", "verify"],
    attendeeRoles: ["lawyer", "cfo", "counsel", "legal"],
  },
  PARTNER_MEETING: {
    title: ["partner", "ic", "investment committee", "ic meeting", "partners"],
    description: ["partner review", "investment committee"],
  },
  BOARD_MEETING: {
    title: ["board", "board meeting", "bod", "board of directors"],
  },
  FOLLOW_UP: {
    title: ["follow up", "follow-up", "followup", "catch up", "check in", "check-in", "sync"],
  },
  NETWORKING: {
    title: ["coffee", "intro", "connect", "meet", "networking"],
    description: ["introduction to", "meet with"],
  },
  PORTFOLIO_CHECK_IN: {
    title: ["portfolio", "monthly", "quarterly", "update", "check in"],
    description: ["portfolio company", "monthly update"],
  },
  INVESTOR_UPDATE: {
    title: ["investor", "lp", "update", "report"],
    description: ["investor update", "lp update"],
  },
  OTHER: {
    title: [],
  },
};

// =============================================================================
// RELATIONSHIP HEAT
// =============================================================================

export interface RelationshipHeatData {
  heat: RelationshipHeat;
  heatScore: number;
  trendDirection: number;
  meetingsLast30d: number;
  meetingsLast90d: number;
  daysSinceLastMeeting: number | null;
  totalMeetings: number;
}

export const HEAT_THRESHOLDS = {
  HOT_MIN_SCORE: 70,
  WARM_MIN_SCORE: 40,
  COOLING_MIN_SCORE: 15,
  // Trend thresholds
  RISING_TREND: 0.5,
  SLIGHTLY_RISING: 0.2,
} as const;

export const HEAT_SCORE_WEIGHTS = {
  // Recency (max 40 pts)
  RECENCY: {
    LAST_7_DAYS: 40,
    LAST_14_DAYS: 35,
    LAST_30_DAYS: 25,
    LAST_60_DAYS: 15,
    LAST_90_DAYS: 5,
  },
  // Frequency (max 35 pts)
  FREQUENCY: {
    FOUR_PER_MONTH: 35,
    TWO_PER_MONTH: 28,
    ONE_PER_MONTH: 20,
    HALF_PER_MONTH: 12,
  },
  // Trend (max 25 pts)
  TREND: {
    RISING: 25,
    SLIGHTLY_RISING: 20,
    STABLE: 15,
    DECLINING: 0,
  },
} as const;

export const HEAT_CONFIG: Record<RelationshipHeat, { label: string; color: string; bgColor: string }> = {
  HOT: { label: "Hot", color: "text-red-600", bgColor: "bg-red-100" },
  WARM: { label: "Warm", color: "text-orange-600", bgColor: "bg-orange-100" },
  COOLING: { label: "Cooling", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  COLD: { label: "Cold", color: "text-blue-600", bgColor: "bg-blue-100" },
};

// =============================================================================
// OAUTH TYPES
// =============================================================================

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  tokenType: string;
  scope: string;
}

export interface CalendarOAuthConfig {
  provider: CalendarProvider;
  clientId: string;
  clientSecret: string;
  scopes: string[];
}

export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export const GOOGLE_CALENDAR_OAUTH_CONFIG: Omit<CalendarOAuthConfig, "redirectUri"> = {
  provider: "GOOGLE",
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  scopes: GOOGLE_CALENDAR_SCOPES,
};

// =============================================================================
// MEETING PREP BRIEF
// =============================================================================

export interface MeetingPrepBriefData {
  dealContext: DealContext | null;
  companyContext: CompanyContext | null;
  attendeeProfiles: AttendeeProfile[];
  relationshipSignals: RelationshipSignal[];
  suggestedTalkingPoints: string[];
  openQuestions: string[];
  recentInteractions: RecentInteraction[];
}

export interface DealContext {
  id: string;
  name: string;
  stage: string;
  amount: number | null;
  probability: number | null;
  teamMembers: string[];
  lastStageChange: Date | null;
  nextMilestone: string | null;
}

export interface CompanyContext {
  id: string;
  name: string;
  sector: string | null;
  stage: string;
  valuation: number | null;
  fundingRound: string | null;
  previousMeetingsCount: number;
  lastMeetingDate: Date | null;
}

export interface AttendeeProfile {
  email: string;
  name: string | null;
  role: string | null;
  company: string | null;
  linkedinUrl: string | null;
  contactId: string | null;
  interactionCount: number;
  lastInteraction: Date | null;
}

export interface RelationshipSignal {
  type: "frequency" | "trend" | "engagement" | "recency";
  label: string;
  value: string;
  sentiment: "positive" | "neutral" | "negative";
}

export interface RecentInteraction {
  type: string;
  subject: string;
  date: Date;
  description: string | null;
}

// =============================================================================
// MEETING TYPE CONFIG
// =============================================================================

export const MEETING_TYPE_CONFIG: Record<MeetingType, { label: string; color: string; bgColor: string; icon?: string }> = {
  INITIAL_PITCH: { label: "Initial Pitch", color: "text-purple-600", bgColor: "bg-purple-100" },
  DUE_DILIGENCE: { label: "Due Diligence", color: "text-blue-600", bgColor: "bg-blue-100" },
  PARTNER_MEETING: { label: "Partner Meeting", color: "text-indigo-600", bgColor: "bg-indigo-100" },
  BOARD_MEETING: { label: "Board Meeting", color: "text-slate-600", bgColor: "bg-slate-100" },
  FOLLOW_UP: { label: "Follow Up", color: "text-green-600", bgColor: "bg-green-100" },
  NETWORKING: { label: "Networking", color: "text-teal-600", bgColor: "bg-teal-100" },
  PORTFOLIO_CHECK_IN: { label: "Portfolio Check-In", color: "text-amber-600", bgColor: "bg-amber-100" },
  INVESTOR_UPDATE: { label: "Investor Update", color: "text-rose-600", bgColor: "bg-rose-100" },
  OTHER: { label: "Other", color: "text-neutral-600", bgColor: "bg-neutral-100" },
};
