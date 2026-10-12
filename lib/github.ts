import snapshot from "@/content/github-snapshot.json";

/**
 * Live repository metadata from the GitHub REST API.
 *
 * Replaces the old `/api/github` Vercel function: the page fetches on the server and Next.js
 * caches the response for an hour (ISR), so visitors never hit the API and there is no client-side
 * fetching at all. A `GITHUB_TOKEN` env variable (fine-grained, public repos read-only) is optional
 * and only raises the rate limit.
 *
 * When GitHub fails, the data falls back to `content/github-snapshot.json` and the page shows
 * a small note that it comes from the last backup.
 */
export type RepoMeta = {
  language: string | null;
  stars: number;
  /** Last push – closer to "last real update" than `updated_at`, which also changes on stars. */
  pushedAt: string;
  topics: string[];
};

export type GithubData = {
  repos: Record<string, RepoMeta>;
  /** true = at least one request failed and the snapshot was used. */
  offline: boolean;
};

const API = "https://api.github.com";
const REVALIDATE_SECONDS = 3600;
const backup = snapshot.repos as Record<string, RepoMeta>;

type GithubRepoResponse = {
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  topics?: string[];
};

export async function getRepoMeta(repos: string[]): Promise<GithubData> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "cv-oldjas",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  let offline = false;

  const entries = await Promise.all(
    repos.map(async (repo): Promise<[string, RepoMeta | null]> => {
      try {
        const res = await fetch(`${API}/repos/${repo}`, {
          headers,
          next: { revalidate: REVALIDATE_SECONDS },
          signal: AbortSignal.timeout(5000),
        });
        // Not public (yet) – there is simply nothing to show, that is not an outage.
        if (res.status === 404) return [repo, null];
        if (!res.ok) throw new Error(`GitHub ${res.status} for ${repo}`);

        const data = (await res.json()) as GithubRepoResponse;
        return [
          repo,
          { language: data.language, stars: data.stargazers_count, pushedAt: data.pushed_at, topics: data.topics ?? [] },
        ];
      } catch {
        offline = true;
        return [repo, backup[repo] ?? null];
      }
    }),
  );

  const found = entries.filter((entry): entry is [string, RepoMeta] => entry[1] !== null);
  return { repos: Object.fromEntries(found), offline };
}
