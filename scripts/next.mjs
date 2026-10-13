/**
 * Thin wrapper around the Next.js CLI used by the npm scripts.
 *
 * On Windows it preloads scripts/windows-preload.cjs (exfat-readlink.cjs + win-font-manifest.cjs)
 * into every Node process – Next.js spawns worker processes, so NODE_OPTIONS is the only reliable
 * way to reach them. On Linux/macOS (CI, Vercel) it simply runs `next` with the given arguments.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const env = { ...process.env };

if (process.platform === "win32") {
  // Forward slashes: NODE_OPTIONS treats backslashes inside quotes as escape characters.
  const preload = fileURLToPath(new URL("./windows-preload.cjs", import.meta.url)).replaceAll("\\", "/");
  env.NODE_OPTIONS = [env.NODE_OPTIONS, `--require "${preload}"`].filter(Boolean).join(" ");
}

const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), ...process.argv.slice(2)], {
  stdio: "inherit",
  env,
});

for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 1)));
