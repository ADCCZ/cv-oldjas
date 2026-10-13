/**
 * Shared by the manual scripts (`npm run cv`, `npm run screenshots`): runs a callback against the
 * production build of this site.
 *
 * - `BASE_URL=http://localhost:3000` reuses a server that is already running (`npm run start`),
 * - otherwise `next start` is started on a free port (through scripts/next.mjs, like the npm scripts)
 *   and stopped again afterwards. Either way the build must exist – `npm run build` first.
 */
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

async function waitUntilUp(url: string, child: ChildProcess, timeoutMs = 90_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`next start exited with code ${child.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`${url} did not respond within ${timeoutMs / 1000} s`);
}

/** The wrapper runs Next.js as its own child – on Windows only taskkill /T takes the whole tree down. */
function stop(child: ChildProcess) {
  if (child.exitCode !== null || !child.pid) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  else child.kill("SIGTERM");
}

export async function withProductionServer<T>(fn: (baseUrl: string) => Promise<T>): Promise<T> {
  const given = process.env.BASE_URL;
  if (given) return fn(given.replace(/\/$/, ""));

  if (!existsSync(".next/BUILD_ID")) throw new Error("No production build – run `npm run build` first.");
  const port = await freePort();
  const baseUrl = `http://localhost:${port}`;
  console.log(`Starting next start on ${baseUrl} …`);
  const child = spawn(process.execPath, ["scripts/next.mjs", "start", "--port", String(port)], {
    stdio: ["ignore", "ignore", "inherit"],
  });
  try {
    await waitUntilUp(`${baseUrl}/`, child);
    return await fn(baseUrl);
  } finally {
    stop(child);
  }
}
