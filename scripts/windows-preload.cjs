/**
 * Everything scripts/next.mjs preloads into the Next.js processes on Windows. One file, because
 * Next.js re-serialises NODE_OPTIONS for its workers and merges repeated `--require` flags into a
 * single broken path.
 */
require("./exfat-readlink.cjs");
require("./win-font-manifest.cjs");
