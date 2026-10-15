# Verify: Test infrastructure · spec 0001 · updated 2026-10-15
_Steps derived from spec 0001 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

**Precondition for the end to end steps only.** The browser layer needs the disposable test database running. The Vitest steps need nothing. Start it with `docker compose -f docker-compose.test.yml up -d --wait` and remove it afterwards with `docker compose -f docker-compose.test.yml down -v`.

## UI / manual

- [ ] Sign in at `/login` as `uzoma@university.edu` with password `password` → lands on `/student` and the seeded submissions "IntelliGrade SaaS Architecture" and "SIWES 6-Month Logbook" are visible → AC-9
- [ ] Repeat with `eric@university.edu` → lands on `/lecturer` instead, because the role comes from the user record → value row 4 and 8
- [ ] Push the branch → the `lint-and-unit` job passes on the push alone → AC-13
- [ ] Open the pull request → the `e2e` job runs only there, its `postgres` service reports healthy before the test step, it installs Chromium as an explicit step, and it passes → AC-13
- [ ] Read the testing section of `AGENTS.md` → it states where tests live, the command per layer, how Prisma and the `next/*` modules are mocked, and how `.env.test` is loaded → AC-15 (expected unmet until `/sync`, which owns that file)

## Commands

- [ ] `npm ci && npm test` from a clean checkout → exits 0 with no service running, no browser launched, and no file created by hand → AC-1
- [ ] `docker compose -f docker-compose.test.yml up -d --wait` → the container reports healthy on `localhost:5433`; then `NODE_ENV=test npx prisma db push --accept-data-loss --skip-generate` followed by `node --env-file=.env.test prisma/seed.js` → both exit 0 against the `intelligrade_test` database → AC-12
- [ ] `NODE_ENV=test npx prisma validate` → reports the schema valid, which fails with `P1012` if `.env.test` is ever missing `DIRECT_URL` that `schema.prisma` declares → AC-12
- [ ] `npm test` → Vitest reports both projects, `node` and `jsdom`, and every test passes, importing `describe`, `it`, `expect` and `vi` from `"vitest"` by hand → AC-1
- [ ] `npm run lint` → exits 0, which is what the continuous integration lint job runs → AC-13
- [ ] `npx vitest run --project node src/lib/alias.test.js src/components/alias.test.jsx` → both files resolve `@/*` with no TypeScript configuration present → AC-3
- [ ] `npx vitest run src/app/actions/auth.test.js` → the success case returns `{ success: true, role: "STUDENT" }` and `cookieStore.set` received `("intelligrade_session", JSON.stringify({ userId, role }), objectContaining({ httpOnly: true, path: "/" }))`; the failure case returns the exact string `"Invalid email or password"` with no cookie written and no `user.create` call → AC-4 and value rows 1, 2, 3, 4
- [ ] `npx vitest run src/proxy.test.js` → for both `/student` and `/lecturer`: no session → 307 to `/login`, wrong role → 307 to `/login`, right role → 200 with no `location` header; an unparseable session → 307 to `/login`; an unmatched path → 200 → AC-5 and value row 7
- [ ] `npx vitest run "src/app/(auth)/login/page.test.jsx"` → the screen renders its heading and prefilled credentials, the banner shows the exact string the action returned, and a success clears the banner and calls `router.push("/student")`, or `push("/lecturer")` after the role toggle → AC-6 and value rows 5, 6
- [ ] `npx vitest run src/app/actions/auth.test.js src/proxy.test.js "src/app/(auth)/login/page.test.jsx"` with `@/lib/prisma`, `next/headers`, `next/cache` and `next/navigation` mocked → every test passes with no database involved, and the factories supply the records → AC-4, AC-8
- [ ] `npx vitest run "src/app/(auth)/login/page.test.jsx"` → the test renders the login screen with no local stub of `matchMedia`, `ResizeObserver`, `IntersectionObserver`, the canvas context or `scrollTo`, because `vitest.setup.js` supplies them → AC-7
- [ ] `npm run test:coverage` → writes `coverage/index.html` and exits 0 even though the statement number is low, so no threshold fails the run → AC-14
- [ ] `npm run test:e2e` → builds the app with `next build` then boots `next start`, and exits 0 driving Chromium against that production build → AC-2
- [ ] `npm run test:e2e` → the `setup` project signs in once through the form and writes `e2e/.auth/student.json`, and every later test starts already signed in → AC-10
- [ ] `npm run test:e2e`, then `docker exec intelligrade-test-db psql -U postgres -d intelligrade_test -c 'select count(*) from "User"'` → the seeded rows are in the throwaway container, and no step of the run ever reads `.env`, so the development database is neither read nor written → AC-11 and value rows 9, 10
- [ ] Stop the container (`docker compose -f docker-compose.test.yml down -v`) and run `npm test` → still exits 0, which proves the fast layer holds no database dependency → AC-1

## Acceptance-criteria coverage

- AC-1 covered by `npm ci && npm test` from a clean checkout, and again with the container stopped · AC-2 by `npm run test:e2e` against the production build · AC-3 by the two alias guards · AC-4 by the action test · AC-5 by the proxy test across both role prefixes · AC-6 by the login screen test plus the browser sign in · AC-7 by rendering the login screen with no local browser stubs · AC-8 by the action test's factories · AC-9 by the sign in to dashboard journey · AC-10 by the setup project and its `storageState` reuse · AC-11 by the seeded rows living in the `intelligrade_test` container with `.env` never read · AC-12 by push and seed against that container, plus `prisma validate` catching a missing `DIRECT_URL` · AC-13 by both continuous integration jobs, including the `postgres` service health gate · AC-14 by `npm run test:coverage` exiting 0 with no gate · AC-15 by the `AGENTS.md` testing section, which `/sync` writes
