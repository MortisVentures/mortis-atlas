import { EmailProvider } from "@prisma/client";

// =============================================================================
// EMAIL INTEGRATION TYPES
// =============================================================================

export interface EmailAccountCredentials {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
}

export interface EmailSyncResult {
  threadsProcessed: number;
  messagesProcessed: number;
  newUnknownSenders: number;
  errors: string[];
}

export interface GmailThread {
  id: string;
  historyId: string;
  messages: GmailMessage[];
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: GmailMessagePayload;
}

export interface GmailMessagePayload {
  mimeType: string;
  headers: GmailHeader[];
  body?: GmailMessageBody;
  parts?: GmailMessagePart[];
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessageBody {
  size: number;
  data?: string;
}

export interface GmailMessagePart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: GmailHeader[];
  body: GmailMessageBody;
  parts?: GmailMessagePart[];
}

export interface GmailListThreadsResponse {
  threads?: { id: string; historyId: string }[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface GmailHistoryResponse {
  history?: GmailHistoryRecord[];
  historyId: string;
  nextPageToken?: string;
}

export interface GmailHistoryRecord {
  id: string;
  messages?: { id: string; threadId: string }[];
  messagesAdded?: { message: { id: string; threadId: string } }[];
  messagesDeleted?: { message: { id: string; threadId: string } }[];
  labelsAdded?: { message: { id: string; threadId: string } }[];
  labelsRemoved?: { message: { id: string; threadId: string } }[];
}

// =============================================================================
// PARSED EMAIL TYPES (what we store in DB)
// =============================================================================

export interface ParsedEmailThread {
  externalId: string;
  subject: string;
  snippet: string;
  participantEmails: string[];
  lastMessageAt: Date;
  messageCount: number;
  messages: ParsedEmailMessage[];
}

export interface ParsedEmailMessage {
  externalId: string;
  fromEmail: string;
  fromName: string | null;
  toEmails: string[];
  ccEmails: string[];
  subject: string;
  bodyPreview: string | null;
  sentAt: Date;
  isInbound: boolean;
  hasAttachments: boolean;
}

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

export interface OAuthConfig {
  provider: EmailProvider;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export const GMAIL_OAUTH_CONFIG: Omit<OAuthConfig, "redirectUri"> = {
  provider: "GMAIL",
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  scopes: GMAIL_SCOPES,
};
