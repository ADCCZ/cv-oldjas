/**
 * Preload for building on Windows (scripts/next.mjs adds it there only).
 *
 * Next.js finds the next/font modules for its font manifest by looking for
 * "/next-font-loader/index.js?" in each webpack request – on Windows the request has backslashes,
 * the manifest stays empty and the pages get no <link rel="preload"> for their fonts (Linux builds,
 * Vercel included, are fine). This rewrites that one check to compare with forward slashes while the
 * plugin loads; if a Next.js update changes the line, nothing is replaced and nothing breaks.
 */
const Module = require("node:module");
const path = require("node:path");

const PLUGIN = path.join("build", "webpack", "plugins", "next-font-manifest-plugin.js");
const CHECK = "_mod_request.includes('/next-font-loader/index.js?')";
const FIXED = "_mod_request.replaceAll(String.fromCharCode(92), '/').includes('/next-font-loader/index.js?')";

const compile = Module.prototype._compile;
Module.prototype._compile = function patchedCompile(content, filename) {
  if (filename.endsWith(PLUGIN) && content.includes(CHECK)) content = content.replace(CHECK, FIXED);
  return compile.call(this, content, filename);
};
