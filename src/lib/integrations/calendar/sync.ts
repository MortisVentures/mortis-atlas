import { prisma } from "@/lib/db/prisma";
import { createCalendarClient, GoogleCalendarClient } from "./google-calendar-client";
import { CalendarSyncResult, ParsedCalendarEvent, ParsedAttendee } from "./types";

// =============================================================================
// CONSTANTS
// =============================================================================

const INITIAL_SYNC_DAYS = 90; // Sync last 90 days on initial sync
const FUTURE_SYNC_DAYS = 30; // Sync 30 days into the future

// =============================================================================
// CALENDAR SYNC SERVICE
// =============================================================================

export class CalendarSyncService {
  private client: GoogleCalendarClient;
  private accountId: string;
  private userId: string;
  private userEmail: string;

  constructor(accountId: string, userId: string, userEmail: string) {
    this.accountId = accountId;
    this.userId = userId;
    this.userEmail = userEmail;
    this.client = createCalendarClient(accountId);
  }

  /**
   * Perform a full sync of calendar events
   */
  async sync(): Promise<CalendarSyncResult> {
    const result: CalendarSyncResult = {
      eventsProcessed: 0,
      eventsCreated: 0,
      eventsUpdated: 0,
      attendeesMatched: 0,
      errors: [],
    };

    try {
      // Get account for sync cursor
      const account = await prisma.calendarAccount.findUnique({
        where: { id: this.accountId },
      });

      if (!account) {
        throw new Error("Calendar account not found");
      }

      // Determine time range
      const now = new Date();
      const timeMax = new Date(now.getTime() + FUTURE_SYNC_DAYS * 24 * 60 * 60 * 1000);

      // For initial sync, go back 90 days; for incremental, use lastSyncAt
      let timeMin: Date;
      if (account.lastSyncAt) {
        // Incremental sync - fetch events modified since last sync
        // But also include future events that may have been added
        timeMin = new Date(account.lastSyncAt.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days buffer
      } else {
        // Initial sync
        timeMin = new Date(now.getTime() - INITIAL_SYNC_DAYS * 24 * 60 * 60 * 1000);
      }

      // Fetch all events with pagination
      let pageToken: string | undefined;
      do {
        const response = await this.client.listEvents(account.calendarId, {
          timeMin,
          timeMax,
          maxResults: 250,
          pageToken,
          singleEvents: true,
          orderBy: "startTime",
        });

        // Process each event
        for (const event of response.items || []) {
          try {
            const parsed = this.client.parseEvent(event, this.userEmail);
            await this.upsertEvent(parsed, result);
            result.eventsProcessed++;
          } catch (error) {
            result.errors.push(`Failed to process event ${event.id}: ${error}`);
          }
        }

        pageToken = response.nextPageToken;
      } while (pageToken);

      // Update last sync time
      await prisma.calendarAccount.update({
        where: { id: this.accountId },
        data: {
          lastSyncAt: now,
          syncCursor: pageToken || null,
        },
      });

      return result;
    } catch (error) {
      result.errors.push(`Sync failed: ${error}`);
      return result;
    }
  }

  /**
   * Upsert a calendar event
   */
  private async upsertEvent(
    event: ParsedCalendarEvent,
    result: CalendarSyncResult
  ): Promise<void> {
    // Check if event already exists
    const existing = await prisma.calendarEvent.findUnique({
      where: {
        accountId_externalId: {
          accountId: this.accountId,
          externalId: event.externalId,
        },
      },
    });

    // Build attendee names map
    const attendeeNames: Record<string, string> = {};
    for (const att of event.attendees) {
      if (att.name) {
        attendeeNames[att.email] = att.name;
      }
    }

    const eventData = {
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      meetingLink: event.meetingLink,
      attendeeEmails: event.attendees.map((a) => a.email),
      attendeeNames,
      organizerEmail: event.organizerEmail,
      isAllDay: event.isAllDay,
      isRecurring: event.isRecurring,
      recurringEventId: event.recurringEventId,
      status: event.status,
    };

    if (existing) {
      // Update existing event
      await prisma.calendarEvent.update({
        where: { id: existing.id },
        data: eventData,
      });
      result.eventsUpdated++;
    } else {
      // Create new event
      const created = await prisma.calendarEvent.create({
        data: {
          accountId: this.accountId,
          externalId: event.externalId,
          ...eventData,
        },
      });

      // Create attendee records
      for (const attendee of event.attendees) {
        await this.upsertAttendee(created.id, attendee, result);
      }

      result.eventsCreated++;
    }
  }

  /**
   * Upsert an attendee for an event
   */
  private async upsertAttendee(
    eventId: string,
    attendee: ParsedAttendee,
    result: CalendarSyncResult
  ): Promise<void> {
    // Try to match attendee to a contact
    const contact = await prisma.contact.findFirst({
      where: {
        userId: this.userId,
        email: {
          equals: attendee.email,
          mode: "insensitive",
        },
      },
      include: {
        company: true,
      },
    });

    // Create or update attendee record
    await prisma.calendarAttendee.upsert({
      where: {
        eventId_email: {
          eventId,
          email: attendee.email,
        },
      },
      create: {
        eventId,
        email: attendee.email,
        name: attendee.name,
        responseStatus: attendee.responseStatus,
        isOrganizer: attendee.isOrganizer,
        contactId: contact?.id || null,
        companyId: contact?.companyId || null,
      },
      update: {
        name: attendee.name,
        responseStatus: attendee.responseStatus,
        isOrganizer: attendee.isOrganizer,
        contactId: contact?.id || null,
        companyId: contact?.companyId || null,
      },
    });

    if (contact) {
      result.attendeesMatched++;
    }
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Run sync for a calendar account
 */
export async function syncCalendarAccount(
  accountId: string
): Promise<CalendarSyncResult> {
  const account = await prisma.calendarAccount.findUnique({
    where: { id: accountId },
    include: { user: true },
  });

  if (!account || !account.user) {
    throw new Error("Calendar account not found");
  }

  const service = new CalendarSyncService(
    accountId,
    account.userId,
    account.email
  );

  return service.sync();
}

/**
 * Run sync for all calendar accounts for a user
 */
export async function syncAllUserCalendars(
  userId: string
): Promise<{ accountId: string; result: CalendarSyncResult }[]> {
  const accounts = await prisma.calendarAccount.findMany({
    where: {
      userId,
      isActive: true,
    },
  });

  const results: { accountId: string; result: CalendarSyncResult }[] = [];

  for (const account of accounts) {
    try {
      const result = await syncCalendarAccount(account.id);
      results.push({ accountId: account.id, result });
    } catch (error) {
      results.push({
        accountId: account.id,
        result: {
          eventsProcessed: 0,
          eventsCreated: 0,
          eventsUpdated: 0,
          attendeesMatched: 0,
          errors: [`Sync failed: ${error}`],
        },
      });
    }
  }

  return results;
}
