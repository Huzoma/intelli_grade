# Scope: IntelliGrade

An AI assisted academic evaluation platform. Students upload PDF coursework, an AI pass returns a preliminary evaluation, lecturers annotate and grade in a split workspace, and students read their feedback, scores, and viva questions.

**Build approach:** Tracer Bullet (vertical slices, each feature built end to end through every layer, working).
**Workflow:** Beta (after `/develop`, run `/check verify` then `/test`). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· GA`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| A | Landing page | Shipped | existing |
| B | Session auth & role routing | Shipped | in-progress |
| C | Data model | Shipped | existing |
| D | Design system & theme foundation | Shipped | in-progress |
| E | Document upload & storage | Shipped | existing |
| F | AI evaluation pipeline | Shipped | in-progress |
| G | Lecturer submission queue | Shipped | existing |
| H | Lecturer review & grading workspace | Shipped | existing |
| I | Rubric manager | Shipped | in-progress |
| J | Student dashboard | Shipped | existing |
| K | Student feedback workspace | Shipped | existing |
| L | Class roster | Shipped | existing |
| M | Settings screens | Shipped | in-progress |
| 1 | Test infrastructure | Foundation | in-progress |
| 2 | Input validation foundation | Foundation | planned |
| 3 | Global feedback surface | Slice 1 | planned |
| 4 | Route loading & error boundaries | Slice 1 | planned |
| 5 | Destructive action safeguards | Slice 1 | planned |
| 6 | Honest controls cleanup | Slice 1 | planned |
| 7 | Design token integrity | Slice 1 | planned |
| 8 | Accessibility baseline | Slice 1 | planned |
| 9 | Document viewer performance | Slice 1 | planned |
| 10 | Upload feedback honesty | Slice 1 | planned |
| 11 | Evaluation failure recovery | Slice 2 | planned |
| 12 | Password & session hardening | Slice 3 | planned |
| 13 | Persisted settings & AI threshold | Slice 4 | planned |

## Shipped

These predate the workflow and are enrolled for context only. `existing` means complete and working. `in-progress` means partly built, so a later slice finishes it. Neither is `done`, and `/develop` and `/sync` leave `existing` rows alone.

### A. Landing page · existing
Public marketing page with the hero, the three capability cards, and the route into the portal. code in `src/app/page.jsx`

### B. Session auth & role routing · in-progress
Cookie session sign in, the role aware route guard, and the demo role toggle used to swap between the student and lecturer accounts. Sign in and route protection work. Still missing: registration, password reset, and strong password storage, all finished in Slice 3. code in `src/app/(auth)/login/`, `src/app/actions/auth.js`, `src/proxy.js`

### C. Data model · existing
The five entities every feature reads: users, submissions, rubrics, viva questions, comments. code in `prisma/schema.prisma`

### D. Design system & theme foundation · in-progress
Theme tokens, light and dark palettes, the glass panel surface, and the font pairing. The token layer is shipped, but about 44 class names reference color steps that do not exist, so some dark surfaces never get their intended contrast. There is also no shared component layer yet, so each screen hand rolls its own buttons and inputs. Features 7 and 8 finish it. code in `src/app/globals.css`, `src/components/ThemeProvider.jsx`

### E. Document upload & storage · existing
Drag and drop PDF submission, upload to cloud storage, rubric matching by document type, and the submission record. code in `src/app/student/(dashboard)/upload/`, `src/app/api/upload/route.js`

### F. AI evaluation pipeline · in-progress
Sends the stored PDF for analysis and writes back the title, summary, AI authorship score, entity tags, and three viva questions with source quotes. The success path works. The failure path does not: a failed run leaves the submission stuck in `processing` with no recovery, so feature 11 finishes it. code in `src/app/api/evaluate/route.js`

### G. Lecturer submission queue · existing
The triage dashboard: live counts, status tabs, search across student and document, and the route into each review. code in `src/app/lecturer/(dashboard)/`

### H. Lecturer review & grading workspace · existing
The split workspace: PDF reader on the left, and on the right the AI insights, the rubric checklist that suggests a score, the viva question picker, and the grade entry. Selecting text in the document opens a comment. code in `src/app/lecturer/review/[id]/`

### I. Rubric manager · in-progress
Create and edit weighted grading rubrics in a modal. Create and update work. Delete does not exist and the card overflow menu has no handler, so feature 6 removes the dead control and delete stays out of scope for now. code in `src/app/lecturer/(dashboard)/rubrics/`

### J. Student dashboard · existing
Submission counts, the submission list with status and type badges, and the route into each piece of feedback. code in `src/app/student/(dashboard)/`

### K. Student feedback workspace · existing
The student side of review: the interactive reader with the lecturer's comment highlights, the original PDF, the rubric breakdown, the comment list, and the final score. code in `src/app/student/review/[id]/`

### L. Class roster · existing
The department student list with search and per student submission counts. code in `src/app/lecturer/(dashboard)/roster/`

### M. Settings screens · in-progress
Profile panels for both roles, plus notification switches, the AI flagging threshold slider, and the auto generate switch. The panels render but nothing persists and nothing is wired to real behavior, so Slice 4 finishes them. code in `src/app/student/(dashboard)/settings/`, `src/app/lecturer/(dashboard)/settings/`

## Foundations

The app's own foundations are already shipped above. These two are the ones that are genuinely missing, and both sit underneath everything that follows.

### 1. Test infrastructure · in-progress
No test runner is configured anywhere in the project. Your chosen Beta workflow closes every feature with `/test`, so without this every later feature stalls one box short of done.
**Done when:** a test command runs from a clean checkout, covers at least one server action and one rendered screen, and passes in CI.
spec [0001](../specs/0001-test-infrastructure/index.md) · code in `vitest.config.mjs`, `playwright.config.mjs`, `vitest.setup.js`, `.github/workflows/ci.yml`, `src/test/`, `e2e/`
- [x] Design it (spec): `/architect test infrastructure`
- [x] Build it: `/develop test infrastructure`
  - [x] Milestone 1, the thin thread through every layer: configs, alias, a smoke test per runner, and CI · AC-1, AC-2, AC-3, AC-12, AC-13
  - [x] Milestone 2, the unit layer: mocked boundaries, entity factories, `loginAction`, `proxy.js` · AC-4, AC-5, AC-8
  - [x] Milestone 3, the component layer: jsdom stubs and the login screen · AC-6, AC-7
  - [x] Milestone 4, the browser layer: production build, reused session, seeded test database · AC-9, AC-10, AC-11
  - [ ] Milestone 5, coverage reporting and the `AGENTS.md` convention handoff · AC-14, AC-15
- [ ] Verify it: `/check verify test infrastructure`
- [ ] Test it: `/test test infrastructure`

### 2. Input validation foundation · needs a decision
`AGENTS.md` requires every server action and route handler to parse its input before it reaches the database, and today none of them do. This sets the one pattern the whole app follows: where schemas live, how a rejection is shaped, and how it reaches the user.
**Done when:** every action and route in `src/app/actions/` and `src/app/api/` validates its input, a rejection returns a predictable shape, and the pattern is written down for later features to copy.
- [ ] Design it (spec): `/architect input validation foundation`

## Slice 1: Core HCI & Stability Polish

The heuristic evaluation found 17 issues. Fifteen of them live here, grouped into cohesive features so each one ships end to end. This slice closes the widest gaps between what the app is doing and what it tells you it is doing.

### 3. Global feedback surface · needs a decision
Toast calls exist on about a dozen paths but no toast host is mounted, so saving a grade, adding a comment, toggling a viva question, and saving a rubric all return silence. This makes action results visible everywhere and settles one convention for the whole app. Covers audit items 1, 6, and 14.
**Done when:** every action over roughly 300ms shows a pending state and resolves into a visible success or failure, async buttons report in flight rather than only dimming, and one documented rule says when feedback is a toast and when it is inline.
- [ ] Design it (spec): `/architect global feedback surface`

### 4. Route loading & error boundaries · needs a decision
Every data page is dynamic and blocks on a remote query, with no loading file, no error file, and no not found file anywhere. A slow query looks frozen and a failure throws the user out of the app shell entirely. Covers audit items 2, 3, and 15.
**Done when:** every data route renders a skeleton while loading, a failed or missing record keeps the app shell and offers a way back or a retry, and filtered views report their result count with a way to clear the filter.
- [ ] Design it (spec): `/architect route loading & error boundaries`

### 5. Destructive action safeguards · needs a decision
Several irreversible actions fire on a single click with no confirmation and no guard: finalizing a grade, deleting a comment, and lowering a rubric's criteria count, which silently discards the text already typed. The grade field also accepts values outside 0 to 100. Covers audit items 5, 10, and 11.
**Done when:** finalizing a grade and deleting a comment each require a deliberate confirmation, lowering a criteria count never discards typed text without asking, and an out of range score is blocked at entry with a visible reason.
- [ ] Design it (spec): `/architect destructive action safeguards`

### 6. Honest controls cleanup
Several controls promise something they do not do. Sign Out is a plain link to the public home page that never clears the session, so the route guard sends the user straight back in. Remember me and Forgot password do nothing, and the rubric card overflow menu has no handler. Covers audit items 4 and 16.
**Done when:** Sign Out ends the session and lands on a page the user cannot be bounced out of, and every remaining control either works or is gone.
- [ ] Build it: `/develop honest controls cleanup`

### 7. Design token integrity
About 44 class names across the workspaces reference color steps that do not exist, so they compile to nothing and the intended dark mode contrast never applies. This is the mechanical half of the audit's rendering findings. Covers audit item 12.
**Done when:** no class name references a color step outside the real scale, and both themes are checked on every screen for readable contrast.
- [ ] Build it: `/develop design token integrity`

### 8. Accessibility baseline · needs a decision
The whole codebase carries three accessibility attributes. Icon only controls have no accessible name, the tab strips announce nothing, the rubric modal has no dialog role or focus handling or escape key, and the document highlights are click only so a keyboard cannot reach them. Covers audit item 13.
**Done when:** every interactive control has an accessible name, both tab strips and the modal follow their expected keyboard and focus behavior, document highlights are reachable and operable by keyboard, and the agreed conformance target is recorded.
- [ ] Design it (spec): `/architect accessibility baseline`

### 9. Document viewer performance · needs a decision
The PDF viewer mounts every page of a document at once, so a long thesis renders hundreds of canvases in one pass behind a single thin placeholder. The failure state is a dead end message with no way to retry. Covers audit item 8.
**Done when:** a long document stays responsive while scrolling, pages report their own loading state, and a load failure offers a retry.
- [ ] Design it (spec): `/architect document viewer performance`

### 10. Upload feedback honesty · needs a decision
The upload progress bar is hardcoded to jump between three fixed values, so it sits frozen through the long AI step that users actually wait on. The footer also claims the upload is end to end encrypted, which nothing in the code supports, and the stated 50MB limit is never enforced on either side. Covers audit item 7.
**Done when:** progress reflects the real stage the submission is in, the long step reads as working rather than stalled, the size limit is enforced before the file is stored, and no claim appears that the system does not deliver.
- [ ] Design it (spec): `/architect upload feedback honesty`

## Slice 2: AI pipeline reliability

### 11. Evaluation failure recovery · needs a decision
A failed evaluation leaves the submission in `processing` forever. There is no retry, no timeout path, and no way for either role to clear it, so the document is invisible to the lecturer and frozen for the student. `HANDOVER.md` describes a rollback that is not in the code. Nothing above fixes this, and it is the most visible defect left after Slice 1.
**Done when:** a failed or timed out evaluation leaves the submission in a state both roles can see and act on, a retry is possible without reuploading, and no submission can sit in `processing` indefinitely.
- [ ] Design it (spec): `/architect evaluation failure recovery`

## Slice 3: Authentication hardening

### 12. Password & session hardening · needs a decision · GA
Passwords are stored as a plain unsalted hash, any sign in attempt for either known demo address creates that account on the fly, there is no registration or reset, and the demo role switcher sits in the production sidebar where it will swap a real user's identity. This slice holds student records and grades, so it carries a higher bar than the rest of the project.
**Done when:** passwords are stored with a current password hashing standard and old values are migrated or invalidated, accounts are created only through a real registration path, a user can recover an account without help, and no build facing role switch is reachable in production.
- [ ] Design it (spec): `/architect password & session hardening`

## Slice 4: Settings & configuration

### 13. Persisted settings & AI threshold · needs a decision
The settings screens render switches and a slider that keep their state only in the browser and vanish on reload. The AI flagging threshold is the clearest case: the slider implies it controls the red flag on the queue, while that boundary is hardcoded in the dashboard and ignores it. Covers audit items 9 and 17.
**Done when:** a changed setting survives a reload and reports that it saved, the flagging threshold has one source of truth that the queue actually reads, and any switch not yet wired to real behavior says so plainly.
- [ ] Design it (spec): `/architect persisted settings & AI threshold`

## Deferred

Out of scope for the current build pass, kept so the plan stays honest.

- **Email notifications**: the settings screens already promise submission and grade emails, and no email capability exists · needs a decision
- **Lecturer assignment & routing**: every upload is assigned to whichever lecturer the database returns first, which breaks with more than one marker · needs a decision
- **Rubric deletion & archiving**: rubrics can be created and edited but never removed · needs a decision
- **Submission history & resubmission**: students see one record per upload with no revision trail · needs a decision
- **Student registration & onboarding**: self service account creation, pending the Slice 3 decisions · needs a decision
- **Analytics & error monitoring**: no product analytics or error reporting exists · needs a decision
- **Public page SEO**: the landing page carries only default metadata · needs a decision
- **Production database engine**: the test harness switches the local engine to SQLite so a clean checkout runs with no services, which leaves local and test differing from whatever production uses. One `schema.prisma` cannot declare two providers, so this needs a deliberate rule · needs a decision · from spec 0001

## Legend

**The decision box.** Every feature carries exactly one, the sub-task whose label ends with `(spec)`. Its wording varies, so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow-up enrolled |
| `in-progress` (building) | `/develop` | milestone sub-boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre-workflow) and `dropped` (de-scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· GA`, `· Prototype`) sets that one feature's rigor above or below the project default; no tag inherits the default. It decides the feature's check boxes and each skill's next suggestion.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop's own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
