# 0001. Adopt Vitest and Playwright as the project test harness

**Date**: 2026-10-13
**Status**: In Progress

## Summary

This decision sets up the project's first test harness: Vitest for unit and component tests, and Playwright for tests that drive a real browser. It exists because the Beta workflow closes every feature with `/test`, and with no runner configured, every feature from here on stalls one step short of done. The harness lands a thin working thread through every layer first (a config, one action test, one screen test, one browser journey, and continuous integration), which later features then thicken.

## Requirements

**User stories**:

- As a developer on this project, I want one command that exercises a server action and a rendered screen, so that I can tell whether my change broke something before I commit it.
- As the person running the `/test` step of the Beta workflow, I want both a fast layer and a real browser layer, so that features 3 through 13 have somewhere honest to prove their behaviour.
- As a reviewer, I want the suite to run automatically on every pull request, so that a broken change is caught by the pipeline rather than by a person.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: From a clean checkout, `npm install` followed by `npm test` exits 0 with no external services running, no browser launched, and no file created by hand.
- **AC-2**: `npm run test:e2e` builds the app and exits 0 by driving Chromium against that production build.
- **AC-3**: The `@/*` alias resolves inside Vitest for both plain modules and JSX files, with no TypeScript configuration present.
- **AC-4**: `loginAction` is unit tested for its success path (writes the `intelligrade_session` cookie and returns the role) and its failure path (returns `{ error: "Invalid email or password" }`), with `next/headers`, `next/cache` and Prisma all mocked and no database involved.
- **AC-5**: The route guard in `src/proxy.js` is unit tested for each branch: no session, a session with the wrong role, and a session with the right role, across both the `/student` and `/lecturer` prefixes.
- **AC-6**: The login screen renders under jsdom, shows its error banner when `loginAction` returns an error, and clears that error and navigates when the action succeeds.
- **AC-7**: One shared setup file supplies the browser APIs jsdom lacks (`matchMedia`, `ResizeObserver`, `IntersectionObserver`, a canvas context, and `window.scrollTo`), so any component test can render without writing its own stubs. Note that jsdom already provides `localStorage`, so that needs no stub.
- **AC-8**: One shared factory module builds valid `User`, `Submission`, `Rubric`, `VivaQuestion` and `Comment` objects, each with sensible defaults and per field overrides.
- **AC-9**: One Playwright test completes the sign in to student dashboard journey over real HTTP against the production build.
- **AC-10**: Playwright authenticates once in a setup project and reuses the saved session in later tests, rather than signing in through the form each time.
- **AC-11**: The end to end run resets and seeds a dedicated test database, and the development database is never read or written by a test.
- **AC-12**: `prisma/schema.prisma` declares a provider that the environment actually satisfies, the client and any adapter sit on matching major versions, and `npx prisma db push` followed by `node prisma/seed.js` succeeds from a clean checkout.
- **AC-13**: GitHub Actions runs lint and the Vitest suite on every push, and the Playwright suite on every pull request, and both jobs pass. The Playwright job installs Chromium as an explicit step, since `playwright test` fails without it.
- **AC-14**: Coverage is collected and reported using the v8 provider, and a low number does not fail the build.
- **AC-15**: The testing convention is recorded in `AGENTS.md`, covering where tests live, the command for each layer, how Prisma and the `next/*` modules are mocked, and how the test environment variables are loaded. Satisfied by `/sync` after `/develop`, since `/architect` and `/develop` do not own that file.

## Decision

**Chosen option**: Option 1: Vitest and React Testing Library for units, Playwright for the browser

Two runners, two layers: Vitest with a Node project and a jsdom project for logic and components, and Playwright driving Chromium against a production build for the end to end journey.

Confirmed choices inside that decision:

| Decision | Pick | Rationale |
|---|---|---|
| Layer scope | Vitest plus a thin Playwright thread | Matches the Tracer Bullet approach and gives later features both places to stand |
| Action tests reach the code by | Mocking Prisma, `next/headers` and `next/cache` | The only option that runs from a clean checkout with no services, which AC-1 requires |
| Prisma mock implementation | A hand written `vi.mock` on `@/lib/prisma` | `vitest-mock-extended` declares `typescript` as a peer dependency (confirmed at version 5.1.1), and this project has none, so it would arrive without the type inference that justifies it |
| Component environment | jsdom with React Testing Library | Conventional and fast; the cost is one shared stubs file |
| Test file location | Colocated in `src`, Playwright in `e2e/` | A test moves with its subject; Playwright needs its own directory regardless |
| React Compiler under Vitest | Skipped | It is a performance transform, so assertions on rendered output are unaffected, and Playwright exercises the compiled build anyway |
| Database provider | Switch the schema to `sqlite` and align the adapter major | Resolves a contradiction that currently blocks a reliable build |
| Test database | Reset and seed a dedicated database before the end to end run | `prisma/seed.js` already does the work, so this is wiring rather than writing |
| Browser target | A production build via `next build` then `next start` | The recent commits fixed SSR and hydration crashes, and a development server hides exactly that class of failure |
| End to end authentication | Log in once, reuse `storageState` | Keeps the login flow as one explicit test instead of repeated setup |
| Test data shape | A shared factory module with per entity builders | `User` alone needs four fields to be valid, so inline literals would be copied everywhere and drift |
| Browsers | Chromium only | The thread proves the harness, not cross browser behaviour |
| Coverage | Collected with v8, no gate | A threshold on three tests is either meaningless or a false blockade |
| Continuous integration | Lint and Vitest on push, Playwright on pull request | Keeps the fast signal fast while the slow layer still gates merges |
| Convention home | A testing section in `AGENTS.md` | It is already the file every contributor and tool reads first, and it currently states no runner is configured, which this makes false |

## Feature design

**Data model sketch**:

This feature adds no entities and changes no fields. One datasource change is required:

| Location | From | To | Reason |
|---|---|---|---|
| `prisma/schema.prisma` datasource | `provider = "postgresql"`, `url = env("DATABASE_URL")`, `directUrl = env("DIRECT_URL")` | `provider = "sqlite"`, `url = env("DATABASE_URL")` | `.env` supplies `file:./dev.db`, and SQLite has no `directUrl` (a separate direct connection string, which SQLite does not need) |

`enum Role` is unchanged: SQLite supports Prisma enums from 6.2.0 and this project runs 6.19.3.

The fixtures this feature must produce, with the fields that make each object valid:

| Entity | Required fields | Nullable | Factory default for `status` or `role` |
|---|---|---|---|
| `User` | `id`, `email` (unique), `password`, `name`, `role` | `matricNo` (unique), `department`, `level` | `role: "STUDENT"` |
| `Submission` | `id`, `docTitle`, `filePath`, `fileSize`, `type`, `status`, `studentId` | `lecturerId`, `rubricId`, `aiScore`, `humanScore`, `entities`, `summary`, `fullText` | `status: "processing"` |
| `Rubric` | `id`, `title`, `criteriaCount`, `criteriaList` (a JSON string), `lastUpdated` | none | n/a |
| `VivaQuestion` | `id`, `text`, `added`, `submissionId` | `marker` | `added: false` |
| `Comment` | `id`, `text`, `quote`, `submissionId` | none | n/a |

Note that `Submission.status` is a plain `String`, not an enum, so the factory must choose the documented default. The values in use are `processing`, `needs_grading` and `graded`.

**State transitions**: Not applicable. This feature introduces no state machine. The submission status values above are fixture choices, not transitions this spec governs.

**API surface**:

No HTTP endpoints are added. The interface is the command surface, which is what `/develop` implements and what the acceptance criteria observe.

| Command | Runs | Layer | Passes when |
|---|---|---|---|
| `npm test` | `vitest run`, both projects, once, then exit | Node and jsdom | Every assertion holds, exit code 0 |
| `npm run test:watch` | `vitest`, watch mode | Node and jsdom | Developer facing only, never in CI |
| `npm run test:coverage` | Vitest with the v8 provider | Node and jsdom | Report written, build not failed |
| `npm run test:e2e` | Playwright, Chromium | Browser | A production build boots and every journey passes |
| `npm run lint` | ESLint | n/a | Unchanged from today |

**Value sourcing** (every value each action produces, computes, or displays names where it comes from):

| Action | Value produced or displayed | Source |
|---|---|---|
| `loginAction` returns | `{ success, role }` or `{ error }` | Returned by the action in `src/app/actions/auth.js` |
| `loginAction` writes | cookie name `intelligrade_session`, value `{ userId, role }` | Literals in `src/app/actions/auth.js` |
| `loginAction` failure message | `"Invalid email or password"` | Literal in `src/app/actions/auth.js` |
| `loginAction` success role | `"STUDENT"` or `"LECTURER"` | The `role` field of the user record, supplied by the factory |
| Login screen error banner text | The string the action returned | Rendered from `loginAction`'s return value in `src/app/(auth)/login/page.jsx` |
| Login screen redirect target | `/student` or `/lecturer` | `router.push` branches in `src/app/(auth)/login/page.jsx`, where `router` comes from `useRouter` in `next/navigation`, which the test mocks and asserts |
| `proxy.js` decision | A redirect or `NextResponse.next()` | `request.cookies.get("intelligrade_session")` and the `pathname`, both supplied by the test via a constructed request |
| End to end credentials | `uzoma@university.edu` or `eric@university.edu`, password `password` | `prisma/seed.js` |
| End to end starting state | A database with the seeded accounts and their submissions | `node --env-file=.env.test prisma/seed.js` against the test database |
| Test database location | The `DATABASE_URL` value in `.env.test` | A committed file holding dummy values only, loaded three ways: by `prisma.config.ts` for CLI commands, by `--env-file` for the seed script, and through Playwright's `webServer.env` for the server Playwright boots. Next.js never loads `.env.test` on its own |

**Key invariants**:

- The Vitest layers never open a network connection, never touch a real database, and never launch a browser.
- The end to end run never reads or writes the development database at `prisma/dev.db`.
- Every test resets its mocks, so no test depends on the order it runs in.
- No test hardcodes a Windows specific path separator, so the same suite passes on the continuous integration runner.
- `.env.test` contains no real secret. It holds dummy values plus a local file path.
- `globals` stays off in the Vitest config, and every test imports `describe`, `it`, `expect` and `vi` from `"vitest"` explicitly. Turning globals on would make `npm run lint` fail on undefined names, and AC-13 requires lint to pass.
- Each layer loads its own environment, because nothing loads `.env.test` for it: `prisma.config.ts` for Prisma CLI commands, `--env-file` for the seed script, and Playwright's `webServer.env` for the server. A test that assumes Next.js picks up `.env.test` will silently run against the development database.

**Security model**:

Nothing is added to the application's own authorisation model, and this feature touches no regulated data.

Two rules matter for the harness itself:

- `.env.test` is committed, so its values must be harmless if read by anyone. It carries dummy values for `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, so a test that accidentally reaches a real code path fails closed rather than spending real quota or writing to real storage.
- No production or hosted database URL may appear in `.env.test`. The test database is a local, disposable file.

The credentials the end to end suite uses are the demo accounts already documented in `prisma/seed.js` and prefilled in the login form. They are not a new disclosure.

**Configuration required**:

- `DATABASE_URL`: in `.env.test`, points at the disposable test database file. Required by AC-11. Because nothing loads this file by default, it must be supplied three ways: `prisma.config.ts` selects it when `NODE_ENV=test` (using `config({ path: ... })` from dotenv, which that file already imports), the seed runs as `node --env-file=.env.test prisma/seed.js` (built into Node, no new dependency), and `playwright.config.js` passes it to the server through `webServer.env`.
- `NODE_ENV`: set to `test` by the Vitest run. Note that this does **not** stop `src/lib/prisma.js` attaching its client to `global`, since its guard is `!== "production"` rather than `=== "development"`. That is harmless here because the action layer mocks Prisma entirely, but the guard is worth correcting to `=== "development"` if the real client is ever used in a test.
- `GEMINI_API_KEY`: present in `.env.test` with a dummy value, so no test can reach the real Gemini API.
- `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: present in `.env.test` with dummy values, for the same reason.
- `.gitignore`: needs one exception line, since it currently ignores `.env*` and AC-1 depends on `.env.test` being committed.

**Critical test scenarios** (each maps to an acceptance criterion in `## Requirements`):

- Happy path: `loginAction` receives a seeded email and the correct password, writes the session cookie and returns the role, verifies **AC-4**
- Happy path: Playwright boots the production build, signs in as the student, and lands on the dashboard, verifies **AC-9**
- Failure case: `loginAction` receives a wrong password and returns the error shape without writing a cookie, verifies **AC-4**
- Failure case: the login screen renders the returned error in its banner, verifies **AC-6**
- Auth/permission: `proxy.js` redirects a sessionless request and a wrong role session to `/login`, and passes both correct role cases, verifies **AC-5**
- Isolation: the end to end run reads and writes only the test database, verifies **AC-11**

## Build plan

Ordered by the project's Tracer Bullet approach: a thin thread through every layer first, then each layer thickened in turn. Milestone 1 is deliberately the thinnest thing that touches every layer with a trivial assertion, so config, alias resolution, the build, and continuous integration are all proven before any real test is written. That ordering matters here because three of the four layers have never run in this repository, and a failure in wiring is much cheaper to find against a smoke test than against a real one.

### Milestone 1: the thin thread

1. Resolve the datasource: set `provider = "sqlite"` in `prisma/schema.prisma`, remove the `directUrl` line, and pin `@prisma/adapter-better-sqlite3` to `^6.19.3` to match `@prisma/client`, satisfies **AC-12**
2. Confirm `npx prisma generate`, `npx prisma db push` and `node prisma/seed.js` all succeed from a clean checkout, satisfies **AC-12**
3. Add the test dev dependencies at the confirmed current versions: `vitest` 5.0.4, `@vitejs/plugin-react` 6.1.2, `jsdom` 30.1.2, `@testing-library/react` 16.3.3, `@testing-library/dom` 10.4.2, `@testing-library/user-event` 14.6.7, `@testing-library/jest-dom` 7.0.1, `@vitest/coverage-v8` 5.0.4, `@playwright/test` 1.64.0, satisfies **AC-1**
4. Create `vitest.config.mjs` with the `@/*` alias mapped explicitly to `./src/*` in `resolve.alias` (the official JavaScript install path omits `vite-tsconfig-paths`, which is offered only for TypeScript), and two projects, one `node` and one `jsdom`. Leave `globals` off and register the jest-dom matchers in the setup file, so `npm run lint` keeps passing on undefined test names, satisfies **AC-1**, **AC-3**
5. Add the `test` (as `vitest run`, never bare `vitest`, which would watch instead of exit), `test:watch`, `test:coverage` and `test:e2e` scripts to `package.json`, satisfies **AC-1**, **AC-2**
6. Create `playwright.config.mjs` with `webServer` running `next build` then `next start`, `reuseExistingServer` off in CI, Chromium as the only project, and the test database values passed through `webServer.env` (Next.js does not load `.env.test` itself), satisfies **AC-2**, **AC-11**
7. Write one trivial Vitest test and one Playwright test that loads `/`, satisfies **AC-1**, **AC-2**
8. Create `.env.test` with dummy values and the test database path, add the `.gitignore` exception so it is committed, and have `prisma.config.ts` select that file when `NODE_ENV=test`, satisfies **AC-1**, **AC-12**
9. Create `.github/workflows/ci.yml`: lint and Vitest on push and pull request, Playwright on pull request including an explicit `npx playwright install --with-deps chromium` step, satisfies **AC-13**

### Milestone 2: the unit layer

10. Add the mock helpers for `next/headers`, `next/cache`, `next/navigation` and `@/lib/prisma`, satisfies **AC-4**, **AC-6**
11. Write the shared factory module for the five entities with per field overrides, satisfies **AC-8**
12. Test `loginAction` for its success and failure paths, satisfies **AC-4**
13. Test the `src/proxy.js` guard across its branches for both role prefixes, satisfies **AC-5**

### Milestone 3: the component layer

14. Add the jsdom setup file supplying `matchMedia`, `ResizeObserver`, `IntersectionObserver`, a canvas context and `window.scrollTo` (jsdom already has `localStorage`), and register the jest-dom matchers there, satisfies **AC-7**
15. Test the login screen: it renders, it shows the returned error (awaiting Framer Motion's exit animation rather than asserting synchronously), and it calls `router.push` with `/student` on success, satisfies **AC-6**

### Milestone 4: the browser layer

16. Add the Playwright setup project that signs in once and saves `storageState`, satisfies **AC-10**
17. Wire the test database reset and seed into the end to end run, running the seed as `node --env-file=.env.test prisma/seed.js` so it never touches the development database, satisfies **AC-11**
18. Write the sign in to student dashboard journey, satisfies **AC-9**

### Milestone 5: coverage and the convention

19. Turn on v8 coverage reporting with no threshold, satisfies **AC-14**
20. Hand the testing convention to `/sync` for `AGENTS.md`, satisfies **AC-15**

## Consequences

**Positive**:

- Every feature from 2 to 13 gets a fast place to test logic and one honest place to test behaviour, so the Beta workflow's `/test` step stops being a blocker.
- Continuous integration exists for the first time, so a broken change is caught by the pipeline rather than by whoever happens to run the app.
- The datasource contradiction is resolved, which today makes a reliable `next build`, `db push` and seed impossible to depend on.
- The mock boundary keeps the fast layer free of a database, so it runs anywhere, on any machine, with no setup.

**Negative / tradeoffs**:

- Mocking Prisma means the fast layer cannot catch a wrong query, a missing column, or schema drift. Those surface only at the browser layer, which is slow.
- Vitest cannot unit test `async` Server Components, so the app's data pages have no fast test layer at all. This is a coverage gap across the whole app, not just this feature.
- Playwright against a production build means every end to end run pays a full build, which is the slowest feedback in the project.
- Two runners mean two configs and two conventions to keep in step.
- Switching to SQLite means the local engine differs from whatever production uses, unless deployment also moves. That divergence has to be a deliberate choice rather than an accident.

**Neutral**:

- `prisma/migrations/20260601101807_init` is an empty directory with no SQL, so `db push` remains the right workflow and there is nothing to regenerate.
- `@prisma/client` sits in `devDependencies` while `src/lib/prisma.js` imports it at runtime. A production install that omits development dependencies would not have it.
- `better-sqlite3` is installed at `^12.10.0` while the current release is 13.0.3. Only relevant if the adapter is actually used.
- Zod 4.6.7 is already installed, which contradicts `AGENTS.md` stating it is not. Feature 2 depends on this, and it is not corrected here.
- Every one of the eight data pages already carries `export const dynamic = "force-dynamic"`, so `next build` will not prerender them and the production build needs no database. This was verified during the cross check and is the reason the Playwright `webServer` can build without credentials.
- The session cookie is set with `secure: process.env.NODE_ENV === "production"`, and Playwright boots `next start`, so the cookie is marked Secure over plain http. Chromium accepts Secure cookies on localhost, so this works, but if it ever stops working the symptom is that sign in silently does not persist. Worth knowing before debugging it from scratch.
- The Vitest and Playwright config files are named `.mjs` rather than `.js`, because `package.json` has no `"type": "module"` and the extension removes all ambiguity about how each file is parsed.

## Follow-up

- [ ] Decide whether production stays on PostgreSQL while tests and local development run on SQLite. If it does, the schema divergence needs a documented rule, since one `schema.prisma` cannot declare both.
- [ ] Move `@prisma/client` from `devDependencies` to `dependencies`, since runtime code imports it.
- [ ] Change the guard in `src/lib/prisma.js` from `process.env.NODE_ENV !== "production"` to `=== "development"`, so a real Prisma client is not attached to `global` during a test run. Harmless while the action layer mocks Prisma, and a trap the moment a test uses the real client.
- [ ] Correct the Zod line in `AGENTS.md`, which says Zod is not installed while version 4.6.7 is present. Feature 2 owns this.
- [ ] Reconsider a coverage threshold once the suite has real volume behind it, rather than a number chosen against three tests.
- [ ] Add a Playwright test for the evaluation failure and retry path when feature 11 arrives, since that is where the current mock boundary gives the least protection.
- [ ] Revisit MSW (a library that fakes network calls) if feature 11 needs one set of service fakes shared between the unit and browser layers. The chosen approach of stubbing `fetch` covers the current thread without a new dependency.

## Rationale

The forces behind the decision, the options weighed, and the sources live in [rationale.md](./rationale.md). This file is the build spec.
