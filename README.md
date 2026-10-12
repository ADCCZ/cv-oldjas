# cv-oldjas

[![CI](https://github.com/ADCCZ/cv-oldjas/actions/workflows/ci.yml/badge.svg)](https://github.com/ADCCZ/cv-oldjas/actions/workflows/ci.yml)

Personal CV and portfolio of **Oldřich Jan Švehla** – junior full-stack developer, Pilsen.
Live at **https://cv-oldjas-tan.vercel.app/** (English) and **/cs** (Czech).

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, GSAP + Lenis, and – step by step –
React Three Fiber and matter-js. Developed together with [Claude Code](https://claude.com/claude-code).

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | development server (Turbopack) |
| `npm run build` / `npm run start` | production build / serve it |
| `npm run lint` · `npm run typecheck` | ESLint · `tsc --noEmit` |
| `npm run test` | Playwright smoke tests against the production build (run `npm run build` first) |

Optional: copy `.env.example` to `.env.local` and set `GITHUB_TOKEN` to raise the GitHub API rate limit.

## Where things live

- **All text** is in `content/en.ts` (main language) and `content/cs.ts` – every new string needs both.
- **Projects** – `content/projects.config.ts`, **technologies** – `content/stack.config.ts`,
  **links and availability** – `content/links.config.ts`.
- Project rules for contributors (and AI assistants) are in [`CLAUDE.md`](CLAUDE.md), the original brief in [`docs/PROMPT.md`](docs/PROMPT.md).

A detailed guide (adding a project, swapping a cover for a screenshot, regenerating the PDF CV, analytics) follows
with the deploy phase.
