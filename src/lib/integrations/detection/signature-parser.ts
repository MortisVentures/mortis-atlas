// =============================================================================
// SIGNATURE PARSER
// Extracts contact information from email body/signature
// =============================================================================

export interface ParsedSignature {
  name?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  company?: string;
  phone?: string;
  linkedIn?: string;
  twitter?: string;
  website?: string;
}

// =============================================================================
// REGEX PATTERNS
// =============================================================================

const PATTERNS = {
  // Phone numbers (various formats)
  phone: /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g,

  // LinkedIn URLs
  linkedIn: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+\/?/gi,

  // Twitter handles
  twitter: /@[\w]+|(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/[\w]+/gi,

  // Website URLs (non-social)
  website: /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[\w-]*)?/gi,

  // Common title patterns
  title: /(?:^|\n)\s*((?:Chief|Head|Director|VP|Vice President|Manager|Lead|Senior|Sr\.|Jr\.|Engineer|Developer|Designer|Analyst|Consultant|Partner|Principal|Associate|Founder|Co-Founder|CEO|CTO|CFO|COO|CMO|CRO|CIO|President|EVP|SVP)[^,\n]*)/gim,

  // Company patterns (after "at" or "@")
  company: /(?:at|@)\s+([A-Z][A-Za-z0-9\s&.'-]+?)(?:\s*[|\n,]|$)/g,
};

// Common titles to recognize
const COMMON_TITLES = [
  "CEO",
  "CTO",
  "CFO",
  "COO",
  "CMO",
  "CRO",
  "CIO",
  "Founder",
  "Co-Founder",
  "Cofounder",
  "Partner",
  "Managing Partner",
  "General Partner",
  "Venture Partner",
  "Principal",
  "Associate",
  "Analyst",
  "Vice President",
  "VP",
  "Director",
  "Head",
  "Manager",
  "Lead",
  "Senior",
  "Engineer",
  "Developer",
  "Designer",
  "Investor",
];

// =============================================================================
// PARSING FUNCTIONS
// =============================================================================

/**
 * Parse email signature from body text
 */
export function parseSignature(bodyText: string | null): ParsedSignature {
  if (!bodyText) {
    return {};
  }

  const result: ParsedSignature = {};

  // Get the likely signature portion (last 20 lines or after common separators)
  const signatureText = extractSignatureSection(bodyText);

  // Extract phone
  const phoneMatch = signatureText.match(PATTERNS.phone);
  if (phoneMatch && phoneMatch.length > 0) {
    result.phone = normalizePhone(phoneMatch[0]);
  }

  // Extract LinkedIn
  const linkedInMatch = signatureText.match(PATTERNS.linkedIn);
  if (linkedInMatch && linkedInMatch.length > 0) {
    result.linkedIn = normalizeLinkedIn(linkedInMatch[0]);
  }

  // Extract Twitter
  const twitterMatch = signatureText.match(PATTERNS.twitter);
  if (twitterMatch && twitterMatch.length > 0) {
    result.twitter = normalizeTwitter(twitterMatch[0]);
  }

  // Extract title
  const titleMatch = extractTitle(signatureText);
  if (titleMatch) {
    result.title = titleMatch;
  }

  // Extract company
  const companyMatch = extractCompany(signatureText);
  if (companyMatch) {
    result.company = companyMatch;
  }

  return result;
}

/**
 * Extract likely signature section from email body
 */
function extractSignatureSection(text: string): string {
  // Common signature separators
  const separators = [
    /^--\s*$/m,
    /^___+$/m,
    /^---+$/m,
    /^Best,?\s*$/im,
    /^Regards,?\s*$/im,
    /^Thanks,?\s*$/im,
    /^Thank you,?\s*$/im,
    /^Cheers,?\s*$/im,
    /^Sent from my/im,
  ];

  let signatureStart = text.length;

  for (const separator of separators) {
    const match = text.search(separator);
    if (match !== -1 && match < signatureStart) {
      signatureStart = match;
    }
  }

  // If no separator found, take last 500 chars
  if (signatureStart === text.length) {
    return text.slice(-500);
  }

  return text.slice(signatureStart);
}

/**
 * Extract title from signature
 */
function extractTitle(text: string): string | undefined {
  // Look for lines that start with or contain common titles
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line contains a common title
    for (const title of COMMON_TITLES) {
      if (trimmed.toLowerCase().includes(title.toLowerCase())) {
        // Return the full title line, cleaned up
        return cleanTitle(trimmed);
      }
    }
  }

  // Try regex pattern
  const match = text.match(PATTERNS.title);
  if (match) {
    return cleanTitle(match[1]);
  }

  return undefined;
}

/**
 * Clean up a title string
 */
function cleanTitle(title: string): string {
  return title
    .replace(/^[|\-–—]\s*/, "") // Remove leading separators
    .replace(/\s*[|\-–—]\s*$/, "") // Remove trailing separators
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
    .slice(0, 100); // Limit length
}

/**
 * Extract company name from signature
 */
function extractCompany(text: string): string | undefined {
  // Look for "at [Company]" or "@ [Company]"
  const atMatch = text.match(/(?:at|@)\s+([A-Z][A-Za-z0-9\s&.'-]{2,30})/);
  if (atMatch) {
    return cleanCompany(atMatch[1]);
  }

  // Look for lines that might be company names (capitalized, reasonable length)
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip lines that look like titles, emails, URLs, or phone numbers
    if (
      COMMON_TITLES.some((t) => trimmed.toLowerCase().includes(t.toLowerCase())) ||
      trimmed.includes("@") && trimmed.includes(".") || // Email
      trimmed.startsWith("http") || // URL
      /^\+?\d/.test(trimmed) // Phone
    ) {
      continue;
    }

    // Company names are often short, capitalized lines
    if (
      trimmed.length >= 3 &&
      trimmed.length <= 50 &&
      /^[A-Z]/.test(trimmed) &&
      !/^(Best|Regards|Thanks|Sincerely|Cheers)/i.test(trimmed)
    ) {
      return cleanCompany(trimmed);
    }
  }

  return undefined;
}

/**
 * Clean up company name
 */
function cleanCompany(company: string): string {
  return company
    .replace(/[,|].*$/, "") // Remove everything after comma or pipe
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalize phone number
 */
function normalizePhone(phone: string): string {
  // Remove all non-digit characters except +
  const digits = phone.replace(/[^\d+]/g, "");

  // Format as +1 (XXX) XXX-XXXX if US number
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return phone.trim();
}

/**
 * Normalize LinkedIn URL
 */
function normalizeLinkedIn(url: string): string {
  // Ensure https://
  if (!url.startsWith("http")) {
    url = "https://" + url;
  }
  // Remove trailing slash
  return url.replace(/\/$/, "");
}

/**
 * Normalize Twitter handle/URL
 */
function normalizeTwitter(handle: string): string {
  // If it's a URL, extract the handle
  const urlMatch = handle.match(/(?:twitter|x)\.com\/(\w+)/i);
  if (urlMatch) {
    return `@${urlMatch[1]}`;
  }

  // If it's already a handle, ensure @ prefix
  if (handle.startsWith("@")) {
    return handle;
  }

  return `@${handle}`;
}

/**
 * Parse name from email "From" header
 */
export function parseNameFromEmail(fromName: string | null, email: string): {
  firstName?: string;
  lastName?: string;
} {
  // Try to parse from display name first
  if (fromName) {
    const parts = fromName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
      };
    }
    if (parts.length === 1) {
      return { firstName: parts[0] };
    }
  }

  // Try to parse from email address
  const localPart = email.split("@")[0];

  // Common patterns: john.smith, john_smith, johnsmith, jsmith
  const dotMatch = localPart.match(/^([a-z]+)\.([a-z]+)$/i);
  if (dotMatch) {
    return {
      firstName: capitalize(dotMatch[1]),
      lastName: capitalize(dotMatch[2]),
    };
  }

  const underscoreMatch = localPart.match(/^([a-z]+)_([a-z]+)$/i);
  if (underscoreMatch) {
    return {
      firstName: capitalize(underscoreMatch[1]),
      lastName: capitalize(underscoreMatch[2]),
    };
  }

  return {};
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
