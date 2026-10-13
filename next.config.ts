import type { NextConfig } from "next";

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
