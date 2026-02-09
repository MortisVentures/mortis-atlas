/** @type {import('next').NextConfig} */

const securityHeaders = [
  // DNS Prefetch Control - allows browsers to prefetch external resources
  { key: 'X-DNS-Prefetch-Control', value: 'on' },

  // Strict Transport Security - force HTTPS for 2 years with subdomains
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },

  // Frame Options - prevent clickjacking by blocking iframe embedding
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },

  // Content Type Options - prevent MIME type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // XSS Protection - enable browser XSS filter
  { key: 'X-XSS-Protection', value: '1; mode=block' },

  // Referrer Policy - control information sent in Referer header
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // Permissions Policy - disable unnecessary browser features
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },

  // Content Security Policy - restrict resource loading
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
