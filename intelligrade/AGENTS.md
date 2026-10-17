<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# IntelliGrade

An AI assisted academic evaluation platform. Students upload PDF coursework, Gemini returns a preliminary evaluation (title, summary, AI authorship score, viva questions), lecturers annotate and grade in a split workspace, and students read feedback and scores.

## Stack

- **Language / Runtime**: JavaScript (JSX, no TypeScript), Node.js on the Next.js runtime
- **Framework**: Next.js 16.2.5 App Router, React 19.2.4 with React Compiler
- **Key dependencies**: Prisma 6.19.3 (PostgreSQL), Supabase Storage, Google Gemini `gemini-3.6-flash`, Tailwind CSS v4, Framer Motion, Sonner
- **Package manager**: npm

## Build approach

<TBD, set by /scope>

## Commands

```bash
npm run dev            # Dev server on http://localhost:3000
npm run build          # Production build
npm run lint           # ESLint with next/core-web-vitals
npx prisma generate    # Regenerate the Prisma client
npx prisma db push     # Sync the schema, no migrations
node prisma/seed.js    # Reset and seed the demo accounts
```

No test runner is configured yet.

## Specs

Stored in `docs/specs/`, format `docs/specs/NNNN-title.md`. Feature scope lives in `docs/scope/` and is owned by `/scope`.

## Rules

- **Simulate before you write.** Mentally run every change against Next.js SSR and hydration, Turbopack build strictness, and Vercel serverless limits (execution timeout, read only filesystem, cold starts).
- **Output complete files only.** Emit whole file contents, never fragments or `... rest unchanged` placeholders.
- **Halt after every successful task** and give one semantic commit message using Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).
- **Validate every input with Zod.** Every server action and route handler parses its input with a Zod schema before it reaches Prisma. (Zod is not installed yet, add it before writing new actions.)
- **Zero raw SQL.** All database access goes through the Prisma singleton in `@/lib/prisma`. Never call `$queryRaw` or `$executeRaw`.
- **Feedback for any action over 300ms.** Anything slower than 300ms shows a pending state, then resolves to a success or error message through Sonner. Mount the shared `ToastHost` once in the root layout, inside `ThemeProvider`, so it follows the theme the app resolved rather than the system setting.
- **Toast or inline.** An action's outcome is a toast. Feedback the user must correct in place, such as a field they are already in, is rendered inline next to that field. Use `@/lib/feedback`, `@/hooks/useAsyncAction` and `@/components/AsyncButton` instead of hand rolling pending state or messages. A control disables in the same tick as the click, and only reveals its spinner if the action outlives about 150ms. No user facing string is built by appending a caught error; log the full error instead.
- Await Next.js 16 request APIs: `const cookieStore = await cookies();` and `const { id } = await params;`.
- Server mutations live in `src/app/actions/` behind `"use server"`. Route handlers live in `src/app/api/`. Interactive components start with `"use client"`.
- Route access is enforced in `src/proxy.js` (Next.js 16 renamed `middleware` to `proxy`).
- Tailwind v4 theme tokens live in `src/app/globals.css` under `@theme`. Never add a `tailwind.config.js`.
- Use the shared tokens and the `glass-panel` class (`--primary`, `--success`, `--warning`, `--danger`, `--review`) instead of ad hoc colors.
- Import through the `@/*` alias, which maps to `./src/*`.

## Agent skills

- [architect](.agents/skills/architect/): `JavaScript-Mastery-Pro/skills`, writes feature specs into `docs/specs/`.
- [audit](.agents/skills/audit/): `JavaScript-Mastery-Pro/skills`, builds and maintains these `AGENTS.md` files.
- [scope](.agents/skills/scope/): `JavaScript-Mastery-Pro/skills`, owns the living feature scope in `docs/scope/`.
- [develop](.agents/skills/develop/): `JavaScript-Mastery-Pro/skills`, builds features and UI.
- [check](.agents/skills/check/): `JavaScript-Mastery-Pro/skills`, reviews and verifies built work.
- [test](.agents/skills/test/): `JavaScript-Mastery-Pro/skills`, plans and runs tests.
- [debug](.agents/skills/debug/): `JavaScript-Mastery-Pro/skills`, diagnoses failures.
- [document](.agents/skills/document/): `JavaScript-Mastery-Pro/skills`, writes changelogs, PRs, and release notes.
- [sync](.agents/skills/sync/): `JavaScript-Mastery-Pro/skills`, keeps docs in step with code.

## Context files

<!-- Nested AGENTS.md files are listed here as they are created -->

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
