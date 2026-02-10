import { encrypt, decrypt } from "@/lib/security/encryption";
import { prisma } from "@/lib/db/prisma";
import {
  GMAIL_OAUTH_CONFIG,
  GMAIL_SCOPES,
  OAuthTokens,
  GmailThread,
  GmailMessage,
  GmailListThreadsResponse,
  ParsedEmailThread,
  ParsedEmailMessage,
  GmailHeader,
} from "./types";

// =============================================================================
// CONSTANTS
// =============================================================================

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const OAUTH_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

// =============================================================================
// OAUTH FUNCTIONS
// =============================================================================

/**
 * Generate Gmail OAuth authorization URL
 */
export function getGmailAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: GMAIL_OAUTH_CONFIG.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GMAIL_SCOPES.join(" "),
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
      client_id: GMAIL_OAUTH_CONFIG.clientId,
      client_secret: GMAIL_OAUTH_CONFIG.clientSecret,
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
      client_id: GMAIL_OAUTH_CONFIG.clientId,
      client_secret: GMAIL_OAUTH_CONFIG.clientSecret,
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
 * Get user's email from Gmail API
 */
export async function getGmailUserEmail(accessToken: string): Promise<string> {
  const response = await fetch(`${GMAIL_API_BASE}/users/me/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get Gmail user profile");
  }

  const data = await response.json();
  return data.emailAddress;
}

// =============================================================================
// GMAIL CLIENT CLASS
// =============================================================================

export class GmailClient {
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
    const account = await prisma.emailAccount.findUnique({
      where: { id: this.accountId },
    });

    if (!account) {
      throw new Error("Email account not found");
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
    await prisma.emailAccount.update({
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
   * Make authenticated request to Gmail API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.ensureValidToken();

    const response = await fetch(`${GMAIL_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gmail API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * List email threads (with pagination)
   */
  async listThreads(
    maxResults: number = 100,
    pageToken?: string,
    query?: string
  ): Promise<GmailListThreadsResponse> {
    const params = new URLSearchParams({
      maxResults: maxResults.toString(),
    });

    if (pageToken) {
      params.append("pageToken", pageToken);
    }

    if (query) {
      params.append("q", query);
    }

    return this.request<GmailListThreadsResponse>(
      `/users/me/threads?${params.toString()}`
    );
  }

  /**
   * Get a single thread with all messages
   */
  async getThread(threadId: string): Promise<GmailThread> {
    return this.request<GmailThread>(
      `/users/me/threads/${threadId}?format=full`
    );
  }

  /**
   * Get a single message
   */
  async getMessage(messageId: string): Promise<GmailMessage> {
    return this.request<GmailMessage>(
      `/users/me/messages/${messageId}?format=full`
    );
  }

  /**
   * Parse a Gmail thread into our internal format
   */
  parseThread(gmailThread: GmailThread, userEmail: string): ParsedEmailThread {
    const messages = gmailThread.messages
      .map((msg) => this.parseMessage(msg, userEmail))
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

    // Collect all unique participant emails
    const participantEmails = new Set<string>();
    messages.forEach((msg) => {
      participantEmails.add(msg.fromEmail.toLowerCase());
      msg.toEmails.forEach((email) =>
        participantEmails.add(email.toLowerCase())
      );
      msg.ccEmails.forEach((email) =>
        participantEmails.add(email.toLowerCase())
      );
    });

    // Get subject from first message
    const subject = messages[0]?.subject || "(No Subject)";

    // Get snippet from latest message
    const latestMessage = messages[messages.length - 1];
    const snippet = latestMessage?.bodyPreview || "";

    return {
      externalId: gmailThread.id,
      subject,
      snippet,
      participantEmails: Array.from(participantEmails),
      lastMessageAt: latestMessage?.sentAt || new Date(),
      messageCount: messages.length,
      messages,
    };
  }

  /**
   * Parse a Gmail message into our internal format
   */
  parseMessage(msg: GmailMessage, userEmail: string): ParsedEmailMessage {
    const headers = msg.payload.headers;

    const fromHeader = this.getHeader(headers, "From") || "";
    const { email: fromEmail, name: fromName } = this.parseEmailAddress(fromHeader);

    const toHeader = this.getHeader(headers, "To") || "";
    const toEmails = this.parseEmailAddresses(toHeader);

    const ccHeader = this.getHeader(headers, "Cc") || "";
    const ccEmails = this.parseEmailAddresses(ccHeader);

    const subject = this.getHeader(headers, "Subject") || "(No Subject)";
    const dateHeader = this.getHeader(headers, "Date");
    const sentAt = dateHeader ? new Date(dateHeader) : new Date(parseInt(msg.internalDate));

    // Determine if inbound (someone sent to user)
    const isInbound = fromEmail.toLowerCase() !== userEmail.toLowerCase();

    // Check for attachments
    const hasAttachments = this.checkForAttachments(msg.payload);

    // Get body preview (first 500 chars)
    const bodyPreview = this.extractBodyPreview(msg);

    return {
      externalId: msg.id,
      fromEmail,
      fromName,
      toEmails,
      ccEmails,
      subject,
      bodyPreview,
      sentAt,
      isInbound,
      hasAttachments,
    };
  }

  /**
   * Helper: Get header value by name
   */
  private getHeader(headers: GmailHeader[], name: string): string | null {
    const header = headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    );
    return header?.value || null;
  }

  /**
   * Helper: Parse single email address from header
   */
  private parseEmailAddress(header: string): { email: string; name: string | null } {
    // Format: "Name <email@example.com>" or just "email@example.com"
    const match = header.match(/(?:"?([^"<]*)"?\s*)?<?([^<>\s]+@[^<>\s]+)>?/);
    if (match) {
      return {
        name: match[1]?.trim() || null,
        email: match[2].toLowerCase(),
      };
    }
    return { email: header.toLowerCase().trim(), name: null };
  }

  /**
   * Helper: Parse multiple email addresses from header
   */
  private parseEmailAddresses(header: string): string[] {
    if (!header) return [];

    return header
      .split(",")
      .map((addr) => this.parseEmailAddress(addr.trim()).email)
      .filter(Boolean);
  }

  /**
   * Helper: Check if message has attachments
   */
  private checkForAttachments(payload: GmailMessage["payload"]): boolean {
    if (payload.parts) {
      return payload.parts.some(
        (part) =>
          part.filename && part.filename.length > 0
      );
    }
    return false;
  }

  /**
   * Helper: Extract body preview from message
   */
  private extractBodyPreview(msg: GmailMessage): string | null {
    // Use snippet if available
    if (msg.snippet) {
      return msg.snippet.substring(0, 500);
    }

    // Try to extract from payload
    const body = this.extractTextBody(msg.payload);
    if (body) {
      return body.substring(0, 500);
    }

    return null;
  }

  /**
   * Helper: Extract text body from message payload
   */
  private extractTextBody(payload: GmailMessage["payload"]): string | null {
    // Check direct body
    if (payload.body?.data) {
      return Buffer.from(payload.body.data, "base64").toString("utf-8");
    }

    // Check parts for text/plain
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body?.data) {
          return Buffer.from(part.body.data, "base64").toString("utf-8");
        }
        // Recurse into nested parts
        if (part.parts) {
          const nested = this.extractTextBody({
            ...payload,
            parts: part.parts,
          });
          if (nested) return nested;
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
 * Create a Gmail client for an account
 */
export function createGmailClient(accountId: string): GmailClient {
  return new GmailClient(accountId);
}

/**
 * Validate Gmail credentials are configured
 */
export function isGmailConfigured(): boolean {
  return Boolean(
    GMAIL_OAUTH_CONFIG.clientId && GMAIL_OAUTH_CONFIG.clientSecret
  );
}
