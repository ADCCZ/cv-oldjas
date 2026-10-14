import type { NextConfig } from "next";

/**
 * Content Security Policy of the pages. Everything is served from this origin: the fonts are self-hosted,
 * three.js textures are rasterized from the DOM, Vercel Analytics and Speed Insights load from /_vercel.
 * Inline scripts and styles stay allowed – Next.js streams the page data in inline scripts, next-themes sets
 * the theme before the first paint, and GSAP animates style attributes. Nonces would force every page to
 * render per request instead of statically.
 * Production only: the dev server needs eval() for Fast Refresh and loads the analytics debug scripts.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

/**
 * Routing of the two languages:
 * - English is the main language and lives on `/` (app/(en)),
 * - Czech lives on `/cs` (app/cs).
 * Two static routes instead of a [locale] segment: an unknown URL is a plain 404 (a dynamic segment
 * with dynamicParams = false made `next start` log a NoFallbackError for each one).
 * There is no redirect based on the browser language. The only redirect honours the visitor's own
 * choice: the language toggle stores it in the `lang` cookie, so `/` sends a returning Czech
 * visitor to `/cs`.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  async headers() {
    const headers = [{ source: "/:path*", headers: securityHeaders }];
    if (process.env.NODE_ENV === "production") {
      // Not on the PDF CVs: a page policy on the PDF itself can stop the browser's built-in viewer.
      headers.push({ source: "/((?!.*\\.pdf$).*)", headers: [{ key: "Content-Security-Policy", value: contentSecurityPolicy }] });
    }
    return headers;
  },

  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "cookie", key: "lang", value: "cs" }],
        destination: "/cs",
        permanent: false,
      },
      // `/en` would duplicate `/` – keep a single canonical URL.
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
