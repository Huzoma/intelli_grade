# 0001. Test harness: context, options and rationale

_The reasoning behind [spec 0001](./index.md), kept apart so the build spec stays short._

## Context

> ⚠️ Premise note: two limits in this design are worth stating before the build, so later features do not mistake a green run for more proof than it is. First, the chosen mock boundary means the fast layer tests application logic but never the database contract: `loginAction` can pass while a real query is wrong, because Prisma is mocked. Second, the official Next.js guidance states that Vitest cannot unit test `async` Server Components, and every data page in this app is `async`. Together these mean the app's primary read paths and every database write are verified only at the browser layer, which runs against a production build and is the slowest thing available. That is an acceptable place to start, and the honest consequence is that features 5, 11 and 13, which all write grades and state, must not treat a passing unit suite as proof their writes work. The right framing is that this spec buys a fast layer for logic and one trustworthy path for data, not general coverage.

The project has no test runner anywhere. `package.json` carries only `dev`, `build`, `start` and `lint`. There is no continuous integration either: no `.github/workflows` directory exists, so nothing runs on a push or a pull request beyond what a developer remembers to type.

The scope records this as a Foundation, and for a concrete reason. The project runs the Beta workflow, which closes every feature with `/test` after `/develop` and `/check verify`. Without a runner, that step cannot run at all. Feature 2 through feature 13 are all waiting on it, so this is the widest blocker in the plan.

Three properties of this codebase shape the decision:

**Server actions reach out to framework internals.** All three files in `src/app/actions/` import `next/headers` and `next/cache` directly, and reach the database through the Prisma singleton in `src/lib/prisma.js`. An action cannot be called in a plain Node process without those modules resolved and a database available.

**The browser APIs are real dependencies, not incidental.** The root layout injects a theme initializer script that reads `localStorage` and `matchMedia`. `react-pdf` needs canvas. `framer-motion` is used on the login screen and throughout the workspaces. A component layer that does not supply these will fail on the first screen it renders.

**The database configuration contradicts itself.** `prisma/schema.prisma` declares `provider = "postgresql"` with a `directUrl`, while `.env` sets `DATABASE_URL="file:./dev.db"`. Two SQLite packages sit in `package.json`, one of them at a mismatched major (`@prisma/adapter-better-sqlite3` at `^7.8.0` against `@prisma/client` at `^6.19.3`), and `src/lib/prisma.js` never uses an adapter. `prisma/migrations/20260601101807_init` is an empty directory holding no SQL at all. The consequence of leaving this alone is that nothing which needs a database, including a production build and the browser layer this decision requires, can be relied on to work from a clean checkout.

## Options considered

### Option 1: Vitest and React Testing Library for units, Playwright for the browser (chosen)

Two runners, each doing the job it is best at. Vitest with a Node project for server actions and a jsdom project for components, plus Playwright driving Chromium against a production build.

**Pros**:
- Fast feedback for logic, since the mocked boundary means no database and no browser.
- The Playwright layer boots a real production build, so it exercises the same compilation path that deploys, including the React Compiler transform that Vitest skips.
- Matches the current official Next.js Vitest guidance and the wider ecosystem convention, so a new contributor recognises it.

**Cons**:
- Two configs and two sets of conventions to keep in step.
- The `next build` inside the Playwright `webServer` makes every end to end run slow.
- The mock boundary means the fast layer cannot catch a wrong query.

### Option 2: Vitest only, defer the browser layer

Stand up the unit and component layers and leave Playwright for a later slice.

**Pros**:
- Fastest to land, no browser downloads, nothing slow in CI.
- One config and one convention.

**Cons**:
- Features 3, 4, 5, 8 and 10 are all browser behaviour: toasts, loading boundaries, confirmations, keyboard access and upload progress. A jsdom test for these is a reconstruction of the browser, not proof against it.
- Fails the scope row's requirement that the suite cover a rendered screen in a way that survives the next ten features.

### Option 3: Playwright for everything

Skip Vitest, use Playwright component testing for components and Playwright for end to end.

**Pros**:
- One runner, one config, real browsers throughout, so no jsdom stubs at all.
- Real CSS, which would genuinely help the dark theme contrast work in feature 7.

**Cons**:
- Playwright component testing has an experimental status for React, and adopting an experimental surface as the project's foundation is a poor trade for a team this size.
- Every assertion pays a browser startup, which is the wrong cost for `proxy.js` or a pure function.

### Option 4: Vitest, Playwright, and route handler integration tests

Add a third project covering `src/app/api/` with Gemini and Supabase faked.

**Pros**:
- Covers the riskiest code in the app, since the evaluation pipeline is where the real complexity sits.
- Would give feature 11 a prepared place to test failure and timeout handling.

**Cons**:
- A materially larger build, and it front loads mocking machinery for endpoints the chosen thread does not touch.
- The risk it addresses belongs to feature 11, which can extend the harness when it arrives.

## Rationale

The deciding force in Context is that the Beta workflow cannot function without this, so the harness has to be genuinely usable rather than merely present. That rules out the browser only approach, which makes the most common thing a developer does (check a change to one function) pay the slowest available cost, and it rules out deferring the browser layer, because a majority of the features waiting behind this one are browser behaviour that jsdom can only approximate.

The mock boundary at the Prisma edge deserves stating plainly, because it is the sharpest cost in this design. It is chosen because AC-1 requires the suite to run from a clean checkout with no services, and because the database configuration is currently self contradictory, so anchoring the fast layer to it would import that problem into every test. The trade is real and is recorded in the Premise note: the fast layer verifies logic, and only the browser layer verifies data.

Both corrections found during pre flight shaped the design. SQLite supports Prisma enums from 6.2.0 and this project runs 6.19.3, so `enum Role` needs no conversion, and a smaller change than expected is enough. `@prisma/adapter-better-sqlite3` publishes a `6.19.3` release that matches `@prisma/client` exactly, so the version mismatch is a pin rather than a migration. Because `prisma/migrations/20260601101807_init` holds no SQL, the `db push` workflow in `AGENTS.md` costs nothing to change.

The React Compiler is skipped in Vitest deliberately. It is a performance transform, so a test asserting rendered output or a user interaction should be unaffected by it, and adding a second babel pipeline that must track `next.config.mjs` by hand is a maintenance cost with no corresponding assertion.

## References

**Project sources** (verifiable, in this repo):

- `AGENTS.md`, which requires a pending state for anything slower than 300ms, awaited Next.js 16 request APIs, and a Prisma singleton as the only database access path (basis: the mock boundary in this spec follows those conventions)
- `docs/scope/scope.md`, feature 1, which sets the done condition this spec builds to (a test command from a clean checkout covering one server action and one rendered screen, passing in CI)
- `prisma/seed.js`, which already resets and seeds the demo accounts the end to end suite reuses
- `package.json`, whose script list is the command surface this feature extends
- `next.config.mjs`, which enables `reactCompiler`

**Practices & standards**:

- Testing pyramid: many fast tests at the bottom, few slow tests at the top (basis: the choice of a mocked unit layer plus one thin browser layer)
- The test doubles principle that a mock at a boundary verifies the caller's logic only, never the collaborator's contract (basis: the Premise note and the follow-up about feature 11)
- The official Next.js position that `async` Server Components are not unit testable by Vitest and should be covered by end to end tests (basis: the second Premise note, and the decision to cover the dashboard journey in Playwright)
- Tracer Bullet delivery, recorded in the scope header as this project's build approach (basis: the milestone ordering in the build plan)

**Links** (web verified only, `sources+links` level only):

- How to set up Vitest with Next.js: https://nextjs.org/docs/app/guides/testing/vitest (fetched during this conversation; documents version 16.4.0, last updated 2026-08-25; it is the source for the JavaScript install list, the omission of `vite-tsconfig-paths`, and the `async` Server Component limitation)
- Prisma database features reference: https://www.prisma.io/docs/orm/reference/database-features (fetched during this conversation; the source for SQLite supporting enum and JSON types from Prisma 6.2.0)
- Package versions were confirmed against the npm registry during this conversation rather than from a documentation page: `vitest` 5.0.4, `@vitejs/plugin-react` 6.1.2, `jsdom` 30.1.2, `@testing-library/react` 16.3.3, `@playwright/test` 1.64.0, `@prisma/adapter-better-sqlite3` 6.19.3, `vitest-mock-extended` 5.1.1 (which declares a `typescript` peer dependency, the reason it was not chosen)
