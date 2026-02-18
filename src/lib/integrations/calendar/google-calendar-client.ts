import { encrypt, decrypt } from "@/lib/security/encryption";
import { prisma } from "@/lib/db/prisma";
import {
  GOOGLE_CALENDAR_OAUTH_CONFIG,
  GOOGLE_CALENDAR_SCOPES,
  OAuthTokens,
  GoogleCalendarEvent,
  GoogleCalendarListResponse,
  GoogleCalendarAttendee,
  ParsedCalendarEvent,
  ParsedAttendee,
} from "./types";

// =============================================================================
// CONSTANTS
// =============================================================================

const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const OAUTH_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

// =============================================================================
// OAUTH FUNCTIONS
// =============================================================================

/**
 * Generate Google Calendar OAuth authorization URL
 */
export function getCalendarAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CALENDAR_OAUTH_CONFIG.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_CALENDAR_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent", // Force consent to get refresh token
    state,
  });

  return `${OAUTH_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<OAuthTokens> {
  const response = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CALENDAR_OAUTH_CONFIG.clientId,
      client_secret: GOOGLE_CALENDAR_OAUTH_CONFIG.clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
    scope: data.scope,
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const response = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CALENDAR_OAUTH_CONFIG.clientId,
      client_secret: GOOGLE_CALENDAR_OAUTH_CONFIG.clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Get user's email from Google API
 */
export async function getGoogleUserEmail(accessToken: string): Promise<string> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get Google user profile");
  }

  const data = await response.json();
  return data.email;
}

// =============================================================================
// GOOGLE CALENDAR CLIENT CLASS
// =============================================================================

export class GoogleCalendarClient {
  private accountId: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(accountId: string) {
    this.accountId = accountId;
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureValidToken(): Promise<string> {
    // Check if current token is still valid (with 5 min buffer)
    if (this.accessToken && this.tokenExpiry) {
      const bufferTime = 5 * 60 * 1000; // 5 minutes
      if (new Date() < new Date(this.tokenExpiry.getTime() - bufferTime)) {
        return this.accessToken;
      }
    }

    // Fetch account from DB
    const account = await prisma.calendarAccount.findUnique({
      where: { id: this.accountId },
    });

    if (!account) {
      throw new Error("Calendar account not found");
    }

    // Check if stored token is still valid
    const bufferTime = 5 * 60 * 1000;
    if (new Date() < new Date(account.tokenExpiry.getTime() - bufferTime)) {
      this.accessToken = decrypt(account.accessToken);
      this.tokenExpiry = account.tokenExpiry;
      return this.accessToken;
    }

    // Refresh the token
    const refreshToken = decrypt(account.refreshToken);
    const { accessToken, expiresIn } = await refreshAccessToken(refreshToken);

    // Update DB with new token
    const newExpiry = new Date(Date.now() + expiresIn * 1000);
    await prisma.calendarAccount.update({
      where: { id: this.accountId },
      data: {
        accessToken: encrypt(accessToken),
        tokenExpiry: newExpiry,
      },
    });

    this.accessToken = accessToken;
    this.tokenExpiry = newExpiry;

    return accessToken;
  }

  /**
   * Make authenticated request to Google Calendar API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.ensureValidToken();

    const response = await fetch(`${GOOGLE_CALENDAR_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Calendar API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * List calendar events (with pagination)
   */
  async listEvents(
    calendarId: string = "primary",
    options: {
      timeMin?: Date;
      timeMax?: Date;
      maxResults?: number;
      pageToken?: string;
      singleEvents?: boolean;
      orderBy?: "startTime" | "updated";
    } = {}
  ): Promise<GoogleCalendarListResponse> {
    const params = new URLSearchParams({
      maxResults: (options.maxResults || 250).toString(),
      singleEvents: (options.singleEvents ?? true).toString(),
      orderBy: options.orderBy || "startTime",
    });

    if (options.timeMin) {
      params.append("timeMin", options.timeMin.toISOString());
    }
    if (options.timeMax) {
      params.append("timeMax", options.timeMax.toISOString());
    }
    if (options.pageToken) {
      params.append("pageToken", options.pageToken);
    }

    return this.request<GoogleCalendarListResponse>(
      `/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`
    );
  }

  /**
   * Get a single event
   */
  async getEvent(
    calendarId: string = "primary",
    eventId: string
  ): Promise<GoogleCalendarEvent> {
    return this.request<GoogleCalendarEvent>(
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`
    );
  }

  /**
   * Get list of calendars for the user
   */
  async listCalendars(): Promise<{ id: string; summary: string; primary?: boolean }[]> {
    const response = await this.request<{ items: { id: string; summary: string; primary?: boolean }[] }>(
      "/users/me/calendarList"
    );
    return response.items || [];
  }

  /**
   * Parse a Google Calendar event into our internal format
   */
  parseEvent(event: GoogleCalendarEvent, userEmail: string): ParsedCalendarEvent {
    // Parse start/end times
    const startTime = event.start.dateTime
      ? new Date(event.start.dateTime)
      : new Date(event.start.date + "T00:00:00");
    const endTime = event.end.dateTime
      ? new Date(event.end.dateTime)
      : new Date(event.end.date + "T23:59:59");

    // Parse attendees
    const attendees: ParsedAttendee[] = (event.attendees || []).map((att) =>
      this.parseAttendee(att)
    );

    // Extract meeting link
    const meetingLink = this.extractMeetingLink(event);

    return {
      externalId: event.id,
      title: event.summary || "(No Title)",
      description: event.description || null,
      startTime,
      endTime,
      location: event.location || null,
      meetingLink,
      attendees,
      organizerEmail: event.organizer.email,
      isAllDay: Boolean(event.start.date && !event.start.dateTime),
      isRecurring: Boolean(event.recurringEventId),
      recurringEventId: event.recurringEventId || null,
      status: event.status,
    };
  }

  /**
   * Parse a Google Calendar attendee
   */
  private parseAttendee(attendee: GoogleCalendarAttendee): ParsedAttendee {
    return {
      email: attendee.email.toLowerCase(),
      name: attendee.displayName || null,
      responseStatus: attendee.responseStatus,
      isOrganizer: attendee.organizer || false,
    };
  }

  /**
   * Extract meeting link from event (Zoom, Meet, Teams, etc.)
   */
  private extractMeetingLink(event: GoogleCalendarEvent): string | null {
    // Check hangoutLink first (Google Meet)
    if (event.hangoutLink) {
      return event.hangoutLink;
    }

    // Check conferenceData
    if (event.conferenceData?.entryPoints) {
      const videoEntry = event.conferenceData.entryPoints.find(
        (ep) => ep.entryPointType === "video"
      );
      if (videoEntry) {
        return videoEntry.uri;
      }
    }

    // Try to extract from description (Zoom, Teams, etc.)
    if (event.description) {
      const urlPatterns = [
        /https:\/\/[\w-]+\.zoom\.us\/j\/\d+[^\s<"]*/i,
        /https:\/\/meet\.google\.com\/[a-z-]+/i,
        /https:\/\/teams\.microsoft\.com\/l\/meetup-join\/[^\s<"]*/i,
      ];

      for (const pattern of urlPatterns) {
        const match = event.description.match(pattern);
        if (match) {
          return match[0];
        }
      }
    }

    // Check location field
    if (event.location) {
      const urlPatterns = [
        /https:\/\/[\w-]+\.zoom\.us\/j\/\d+[^\s<"]*/i,
        /https:\/\/meet\.google\.com\/[a-z-]+/i,
      ];

      for (const pattern of urlPatterns) {
        const match = event.location.match(pattern);
        if (match) {
          return match[0];
        }
      }
    }

    return null;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create a Google Calendar client for an account
 */
export function createCalendarClient(accountId: string): GoogleCalendarClient {
  return new GoogleCalendarClient(accountId);
}

/**
 * Validate Google Calendar credentials are configured
 */
export function isCalendarConfigured(): boolean {
  return Boolean(
    GOOGLE_CALENDAR_OAUTH_CONFIG.clientId && GOOGLE_CALENDAR_OAUTH_CONFIG.clientSecret
  );
}
