import { prisma } from "@/lib/db/prisma";
import { createGmailClient, GmailClient } from "./gmail-client";
import { EmailSyncResult, ParsedEmailThread } from "./types";

// =============================================================================
// SYNC CONSTANTS
// =============================================================================

const INITIAL_SYNC_DAYS = 90; // Sync last 90 days on initial sync
const MAX_THREADS_PER_SYNC = 500;
const BATCH_SIZE = 50;

// =============================================================================
// EMAIL SYNC SERVICE
// =============================================================================

export class EmailSyncService {
  private accountId: string;
  private userId: string;
  private userEmail: string;
  private client: GmailClient;

  constructor(accountId: string, userId: string, userEmail: string) {
    this.accountId = accountId;
    this.userId = userId;
    this.userEmail = userEmail;
    this.client = createGmailClient(accountId);
  }

  /**
   * Perform full sync of emails
   */
  async sync(): Promise<EmailSyncResult> {
    const result: EmailSyncResult = {
      threadsProcessed: 0,
      messagesProcessed: 0,
      newUnknownSenders: 0,
      errors: [],
    };

    try {
      // Determine if this is initial sync
      const account = await prisma.emailAccount.findUnique({
        where: { id: this.accountId },
      });

      if (!account) {
        throw new Error("Email account not found");
      }

      const isInitialSync = !account.lastSyncAt;

      // Build query for sync
      let query = "";
      if (isInitialSync) {
        // On initial sync, get last 90 days
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - INITIAL_SYNC_DAYS);
        query = `after:${Math.floor(sinceDate.getTime() / 1000)}`;
      } else if (account.lastSyncAt) {
        // Incremental sync - get messages since last sync
        query = `after:${Math.floor(account.lastSyncAt.getTime() / 1000)}`;
      }

      // Fetch threads
      let pageToken: string | undefined;
      let threadsToProcess: { id: string }[] = [];

      do {
        const response = await this.client.listThreads(
          Math.min(MAX_THREADS_PER_SYNC - threadsToProcess.length, 100),
          pageToken,
          query
        );

        if (response.threads) {
          threadsToProcess = [...threadsToProcess, ...response.threads];
        }

        pageToken = response.nextPageToken;
      } while (
        pageToken &&
        threadsToProcess.length < MAX_THREADS_PER_SYNC
      );

      // Process threads in batches
      for (let i = 0; i < threadsToProcess.length; i += BATCH_SIZE) {
        const batch = threadsToProcess.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (threadRef) => {
            try {
              const gmailThread = await this.client.getThread(threadRef.id);
              const parsed = this.client.parseThread(gmailThread, this.userEmail);

              const threadResult = await this.processThread(parsed);
              result.threadsProcessed++;
              result.messagesProcessed += threadResult.messagesProcessed;
              result.newUnknownSenders += threadResult.newUnknownSenders;
            } catch (error) {
              result.errors.push(
                `Failed to process thread ${threadRef.id}: ${error instanceof Error ? error.message : "Unknown error"}`
              );
            }
          })
        );
      }

      // Update last sync time
      await prisma.emailAccount.update({
        where: { id: this.accountId },
        data: { lastSyncAt: new Date() },
      });

      return result;
    } catch (error) {
      result.errors.push(
        `Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      return result;
    }
  }

  /**
   * Process a single parsed thread
   */
  private async processThread(parsed: ParsedEmailThread): Promise<{
    messagesProcessed: number;
    newUnknownSenders: number;
  }> {
    let messagesProcessed = 0;
    let newUnknownSenders = 0;

    // Upsert thread
    const thread = await prisma.emailThread.upsert({
      where: {
        accountId_externalId: {
          accountId: this.accountId,
          externalId: parsed.externalId,
        },
      },
      create: {
        accountId: this.accountId,
        externalId: parsed.externalId,
        subject: parsed.subject,
        snippet: parsed.snippet,
        participantEmails: parsed.participantEmails,
        lastMessageAt: parsed.lastMessageAt,
        messageCount: parsed.messageCount,
      },
      update: {
        subject: parsed.subject,
        snippet: parsed.snippet,
        participantEmails: parsed.participantEmails,
        lastMessageAt: parsed.lastMessageAt,
        messageCount: parsed.messageCount,
      },
    });

    // Process messages
    for (const msg of parsed.messages) {
      // Upsert message
      await prisma.emailMessage.upsert({
        where: {
          threadId_externalId: {
            threadId: thread.id,
            externalId: msg.externalId,
          },
        },
        create: {
          threadId: thread.id,
          externalId: msg.externalId,
          fromEmail: msg.fromEmail,
          fromName: msg.fromName,
          toEmails: msg.toEmails,
          ccEmails: msg.ccEmails,
          subject: msg.subject,
          bodyPreview: msg.bodyPreview,
          sentAt: msg.sentAt,
          isInbound: msg.isInbound,
          hasAttachments: msg.hasAttachments,
        },
        update: {
          fromName: msg.fromName,
          toEmails: msg.toEmails,
          ccEmails: msg.ccEmails,
          subject: msg.subject,
          bodyPreview: msg.bodyPreview,
          hasAttachments: msg.hasAttachments,
        },
      });

      messagesProcessed++;

      // Process unknown senders for inbound emails
      if (msg.isInbound) {
        const isNew = await this.processUnknownSender(
          msg.fromEmail,
          msg.fromName,
          msg.subject
        );
        if (isNew) {
          newUnknownSenders++;
        }
      }
    }

    return { messagesProcessed, newUnknownSenders };
  }

  /**
   * Process a potential unknown sender
   */
  private async processUnknownSender(
    email: string,
    name: string | null,
    subject: string
  ): Promise<boolean> {
    const lowerEmail = email.toLowerCase();

    // Skip if it's the user's own email
    if (lowerEmail === this.userEmail.toLowerCase()) {
      return false;
    }

    // Check if email already exists as a contact
    const existingContact = await prisma.contact.findFirst({
      where: {
        userId: this.userId,
        email: { equals: lowerEmail, mode: "insensitive" },
      },
    });

    if (existingContact) {
      return false;
    }

    // Extract domain
    const domain = this.extractDomain(lowerEmail);

    // Upsert unknown sender
    const existing = await prisma.unknownSender.findUnique({
      where: {
        userId_email: {
          userId: this.userId,
          email: lowerEmail,
        },
      },
    });

    if (existing) {
      // Update existing
      await prisma.unknownSender.update({
        where: { id: existing.id },
        data: {
          name: name || existing.name,
          lastSeenAt: new Date(),
          messageCount: { increment: 1 },
          recentSubjects: this.updateRecentSubjects(existing.recentSubjects, subject),
        },
      });
      return false;
    }

    // Create new unknown sender
    await prisma.unknownSender.create({
      data: {
        userId: this.userId,
        email: lowerEmail,
        name,
        domain,
        lastSeenAt: new Date(),
        recentSubjects: [subject],
      },
    });

    return true;
  }

  /**
   * Extract domain from email
   */
  private extractDomain(email: string): string | null {
    const match = email.match(/@([^@]+)$/);
    return match ? match[1] : null;
  }

  /**
   * Update recent subjects array (keep last 3)
   */
  private updateRecentSubjects(
    existing: string[],
    newSubject: string
  ): string[] {
    const subjects = [newSubject, ...(existing || [])];
    return subjects.slice(0, 3);
  }
}

// =============================================================================
// SYNC FUNCTIONS
// =============================================================================

/**
 * Sync emails for a specific account
 */
export async function syncEmailAccount(
  accountId: string
): Promise<EmailSyncResult> {
  const account = await prisma.emailAccount.findUnique({
    where: { id: accountId },
    include: { user: true },
  });

  if (!account) {
    throw new Error("Email account not found");
  }

  const service = new EmailSyncService(
    accountId,
    account.userId,
    account.email
  );

  return service.sync();
}

/**
 * Sync all active email accounts for a user
 */
export async function syncUserEmailAccounts(
  userId: string
): Promise<EmailSyncResult[]> {
  const accounts = await prisma.emailAccount.findMany({
    where: { userId, isActive: true },
  });

  const results: EmailSyncResult[] = [];

  for (const account of accounts) {
    const result = await syncEmailAccount(account.id);
    results.push(result);
  }

  return results;
}
