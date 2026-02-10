import { UnknownSender } from "@prisma/client";

// =============================================================================
// SCORING CONSTANTS
// =============================================================================

const SCORE_WEIGHTS = {
  // Engagement - how much interaction
  MESSAGE_COUNT: 5, // Per message, max 25
  THREAD_COUNT: 10, // Per thread, max 30

  // Recency - recent activity scores higher
  RECENT_LAST_SEEN: 15, // Last seen within 7 days
  RECENT_FIRST_SEEN: 10, // First seen within 7 days

  // Quality signals
  MULTIPLE_THREADS: 10, // Has more than 1 thread
  DEAL_KEYWORDS: 20, // Subject contains deal keywords

  // VIP domains
  VIP_DOMAIN: 50,
} as const;

const SCORE_CAPS = {
  MESSAGE_COUNT: 25,
  THREAD_COUNT: 30,
} as const;

// =============================================================================
// DEAL KEYWORDS
// =============================================================================

const DEAL_KEYWORDS = [
  // Investment terms
  "investment",
  "investing",
  "funding",
  "raise",
  "raising",
  "round",
  "series",
  "seed",
  "pre-seed",
  "term sheet",
  "termsheet",

  // Pitch related
  "pitch",
  "deck",
  "presentation",
  "demo",

  // Intro/networking
  "intro",
  "introduction",
  "connect",
  "meeting",
  "call",
  "chat",

  // Roles/titles
  "founder",
  "ceo",
  "cto",
  "co-founder",
  "cofounder",

  // Portfolio
  "portfolio",
  "company",
  "startup",
];

// =============================================================================
// VIP DOMAINS
// =============================================================================

const VIP_DOMAINS = [
  // Major VC firms
  "a16z.com",
  "sequoiacap.com",
  "benchmark.com",
  "greylock.com",
  "accel.com",
  "khoslaventures.com",
  "foundercollective.com",
  "ycombinator.com",
  "combinator.com",
  "nea.com",
  "indexventures.com",
  "gv.com",

  // Major accelerators
  "techstars.com",
  "500.co",

  // Common LP/investor domains
  "stanford.edu",
  "mit.edu",
  "harvard.edu",
  "wharton.upenn.edu",
];

// =============================================================================
// SCORING FUNCTIONS
// =============================================================================

/**
 * Calculate priority score for an unknown sender
 */
export function calculateSenderScore(
  sender: Partial<UnknownSender> & {
    messageCount: number;
    threadCount: number;
    lastSeenAt: Date;
    firstSeenAt: Date;
    domain?: string | null;
    recentSubjects?: string[];
  }
): number {
  let score = 0;

  // Engagement: Message count
  score += Math.min(
    sender.messageCount * SCORE_WEIGHTS.MESSAGE_COUNT,
    SCORE_CAPS.MESSAGE_COUNT
  );

  // Engagement: Thread count
  score += Math.min(
    sender.threadCount * SCORE_WEIGHTS.THREAD_COUNT,
    SCORE_CAPS.THREAD_COUNT
  );

  // Recency: Last seen within 7 days
  if (isWithinDays(sender.lastSeenAt, 7)) {
    score += SCORE_WEIGHTS.RECENT_LAST_SEEN;
  }

  // Recency: First seen within 7 days (new contact)
  if (isWithinDays(sender.firstSeenAt, 7)) {
    score += SCORE_WEIGHTS.RECENT_FIRST_SEEN;
  }

  // Quality: Multiple threads (indicates ongoing conversation)
  if (sender.threadCount > 1) {
    score += SCORE_WEIGHTS.MULTIPLE_THREADS;
  }

  // Quality: Deal-related keywords in subjects
  if (sender.recentSubjects && containsDealKeywords(sender.recentSubjects)) {
    score += SCORE_WEIGHTS.DEAL_KEYWORDS;
  }

  // VIP: Known investor/accelerator domains
  if (sender.domain && isVIPDomain(sender.domain)) {
    score += SCORE_WEIGHTS.VIP_DOMAIN;
  }

  return score;
}

/**
 * Check if a date is within N days of now
 */
function isWithinDays(date: Date, days: number): boolean {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

/**
 * Check if subjects contain deal-related keywords
 */
function containsDealKeywords(subjects: string[]): boolean {
  const combinedText = subjects.join(" ").toLowerCase();
  return DEAL_KEYWORDS.some((keyword) =>
    combinedText.includes(keyword.toLowerCase())
  );
}

/**
 * Check if domain is a VIP domain
 */
function isVIPDomain(domain: string): boolean {
  const lowerDomain = domain.toLowerCase();
  return VIP_DOMAINS.some((vip) => lowerDomain.endsWith(vip));
}

/**
 * Get score tier based on score value
 */
export function getScoreTier(score: number): "high" | "medium" | "low" {
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

/**
 * Get score color for UI
 */
export function getScoreColor(score: number): string {
  const tier = getScoreTier(score);
  switch (tier) {
    case "high":
      return "text-green-600 bg-green-50";
    case "medium":
      return "text-yellow-600 bg-yellow-50";
    case "low":
      return "text-neutral-600 bg-neutral-50";
  }
}
