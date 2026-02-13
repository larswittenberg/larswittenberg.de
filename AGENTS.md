# AGENTS.md

## Project Overview

Personal website for Lars Wittenberg (larswittenberg.de), built with Next.js App Router and MDX content.

- Framework: Next.js 16
- Language: TypeScript + React 19
- Styling: Tailwind CSS 4
- Content: MDX blog posts and static pages
- Package manager: Yarn 4 (`packageManager: yarn@4.12.0`)
- Deployment target: Vercel

This is a single-package repository (not a monorepo).

## Setup Commands

Run from repository root:

```bash
# Use Node.js from .nvmrc (24)
nvm use

# Install dependencies (Yarn 4, via Corepack)
corepack enable
yarn install
```

Environment variables used by GitHub Stars data flow:

```bash
GH_TOKEN=<github-personal-access-token>
GH_USERNAME=<github-username>
```

Recommended local file: `.env.local`.

## Development Workflow

```bash
# Start local dev server (hot reload)
yarn dev

# Production build
yarn build

# Start production server after build
yarn start

# Remove Next.js build output
yarn clean

# Full static export flow
yarn export
```

- Local dev URL: `http://localhost:3000`
- Main app code lives in `src/app/`
- Reusable UI components live in `src/components/`
- Global styles are in `src/styles/main.css`

## Testing Instructions

There is currently no dedicated unit/integration/e2e test framework configured (no Jest/Vitest/Playwright config, no `test` script in `package.json`).

Use this validation baseline before submitting changes:

```bash
# Lint (primary quality gate)
yarn lint

# Optional: type-check only (no emit)
yarn tsc --noEmit

# Ensure production build works
yarn build
```

When adding non-trivial logic, prefer adding tests along with the feature. If you introduce a test framework, document its commands here.

## Code Style Guidelines

- ESLint config: `eslint.config.mjs`
- Prettier command: `yarn format` (currently formats `./src`)
- Quotes: single quotes enforced
- TypeScript:
  - `strict` is `false`, but `strictNullChecks` is enabled
  - `@typescript-eslint/no-unused-vars` is enforced
  - `any` is allowed (`@typescript-eslint/no-explicit-any: off`)
- React:
  - React import in JSX scope is not required
  - `react/prop-types` is disabled (TypeScript project)
- Next.js Core Web Vitals rules are enabled

Naming and organization conventions:

- React components: PascalCase filenames (e.g., `Header.tsx`)
- Utility files: kebab-case or existing local convention
- MDX content: kebab-case filenames
- Use `.tsx` for files with JSX and `.ts` otherwise
- Keep small reusable elements under `src/components/atoms/`

## Build and Deployment

Build outputs:

- `.next/` from `yarn build`
- `out/` from `yarn export`

Deployment:

- Production hosting is on Vercel.
- Vercel Analytics and Speed Insights are included in the app.

GitHub Actions automation:

- Workflow: `.github/workflows/update-data.yml`
- Purpose: scheduled/manual refresh of `src/data/starred-repositories.json`
- Trigger: daily cron + manual dispatch
- Required secrets for workflow: `GH_TOKEN`, `GH_USERNAME`

## Security Considerations

- Never commit secrets (`GH_TOKEN`, other credentials).
- Use `.env.local` for local secrets and Vercel/GitHub secret stores for CI/deployments.
- `yarn update-stars` accesses GitHub API; treat all token-related logs as sensitive.

## Pull Request Guidelines

Before opening a PR, run:

```bash
yarn lint
yarn build
```

Also recommended:

```bash
yarn format
```

Keep changes focused and descriptive. If you modify data-fetching for GitHub stars, mention required env/secret changes in the PR description.

## Debugging & Troubleshooting

- Node version issues: run `nvm use` (expects Node 24 from `.nvmrc`).
- Dependency/tooling issues: run `corepack enable` and reinstall with `yarn install`.
- MDX parse/render issues:
  - Validate frontmatter YAML
  - Check special JSX characters (`{'>'}`, `{'}'}` when needed)
- Linting noise from generated files:
  - `next-env.d.ts` and `.next/*` are intentionally ignored in ESLint config.

## Agent Notes

- Prefer minimal, targeted edits that match existing style.
- Do not edit generated artifacts (`.next/`, `out/`, `next-env.d.ts`).
- When changing commands or workflows, keep this file in sync so future agents have accurate instructions.
