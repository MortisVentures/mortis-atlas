import { prisma } from "@/lib/db/prisma";

// =============================================================================
// COMPANY MATCHER
// Matches email domains to existing companies
// =============================================================================

export interface CompanyMatch {
  id: string;
  name: string;
  website: string | null;
  confidence: number; // 0-100
  matchReason: "domain" | "name" | "both";
}

export interface DomainInfo {
  domain: string;
  companyName: string | null;
  websiteUrl: string | null;
}

// =============================================================================
// DOMAIN EXTRACTION
// =============================================================================

/**
 * Extract domain from email address
 */
export function extractDomain(email: string): string | null {
  const match = email.match(/@([^@]+)$/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Extract root domain (removes subdomains)
 */
export function extractRootDomain(domain: string): string {
  const parts = domain.split(".");

  // Handle TLDs with multiple parts (co.uk, com.au, etc.)
  const multiPartTlds = ["co.uk", "com.au", "co.nz", "co.jp", "com.br"];
  const lastTwo = parts.slice(-2).join(".");

  if (multiPartTlds.includes(lastTwo) && parts.length > 2) {
    return parts.slice(-3).join(".");
  }

  if (parts.length > 2) {
    return parts.slice(-2).join(".");
  }

  return domain;
}

/**
 * Check if domain is a personal email provider
 */
export function isPersonalEmailDomain(domain: string): boolean {
  const personalDomains = [
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "yahoo.co.uk",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "msn.com",
    "icloud.com",
    "me.com",
    "mac.com",
    "aol.com",
    "protonmail.com",
    "proton.me",
    "fastmail.com",
    "zoho.com",
    "mail.com",
    "yandex.com",
    "gmx.com",
    "gmx.net",
  ];

  return personalDomains.includes(domain.toLowerCase());
}

/**
 * Extract likely company name from domain
 */
export function extractCompanyNameFromDomain(domain: string): string {
  const rootDomain = extractRootDomain(domain);
  const name = rootDomain.split(".")[0];

  // Capitalize and format
  return name
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// =============================================================================
// COMPANY MATCHING
// =============================================================================

/**
 * Find matching companies for an email domain
 */
export async function findCompanyMatches(
  userId: string,
  domain: string
): Promise<CompanyMatch[]> {
  const matches: CompanyMatch[] = [];

  // Skip personal email domains
  if (isPersonalEmailDomain(domain)) {
    return matches;
  }

  const rootDomain = extractRootDomain(domain);

  // Find companies by website domain match
  const domainMatches = await prisma.company.findMany({
    where: {
      userId,
      website: {
        contains: rootDomain,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      website: true,
    },
    take: 5,
  });

  for (const company of domainMatches) {
    // Calculate confidence based on exact vs partial match
    const confidence = company.website?.toLowerCase().includes(rootDomain)
      ? 90
      : 70;

    matches.push({
      id: company.id,
      name: company.name,
      website: company.website,
      confidence,
      matchReason: "domain",
    });
  }

  // If no domain matches, try name matching
  if (matches.length === 0) {
    const likelyName = extractCompanyNameFromDomain(domain);

    const nameMatches = await prisma.company.findMany({
      where: {
        userId,
        name: {
          contains: likelyName,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        website: true,
      },
      take: 5,
    });

    for (const company of nameMatches) {
      // Name matches have lower confidence
      matches.push({
        id: company.id,
        name: company.name,
        website: company.website,
        confidence: 50,
        matchReason: "name",
      });
    }
  }

  // Sort by confidence
  return matches.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get the best company match
 */
export async function getBestCompanyMatch(
  userId: string,
  domain: string
): Promise<CompanyMatch | null> {
  const matches = await findCompanyMatches(userId, domain);
  return matches.length > 0 ? matches[0] : null;
}

/**
 * Get domain info for display
 */
export function getDomainInfo(email: string): DomainInfo {
  const domain = extractDomain(email);

  if (!domain) {
    return {
      domain: "",
      companyName: null,
      websiteUrl: null,
    };
  }

  if (isPersonalEmailDomain(domain)) {
    return {
      domain,
      companyName: null,
      websiteUrl: null,
    };
  }

  const rootDomain = extractRootDomain(domain);

  return {
    domain: rootDomain,
    companyName: extractCompanyNameFromDomain(domain),
    websiteUrl: `https://${rootDomain}`,
  };
}
