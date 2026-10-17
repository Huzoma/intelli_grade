# 0002. Give every action a visible result

**Date**: 2026-10-15
**Status**: In Progress

## Summary

The app already calls the Sonner toast library on nineteen paths, but no toast host is ever mounted, so saving a grade, adding a comment, toggling a viva question and saving a rubric all return silence. This decision mounts one shared feedback surface in the root layout and adds a small shared layer (a hook and a button component) so every async action reports that it is working and then reports how it ended. It also settles the single rule the rest of the app follows: an action's outcome is a toast, and anything the user has to fix in place is shown inline next to the field.

## Requirements

**User stories**:

- As a lecturer saving a grade, adding a comment or toggling a viva question, I want to see that the write happened, so that I stop re-clicking a button that already worked.
- As a lecturer waiting on a slow write, I want the button to tell me it is working, so that I know the app heard me rather than assuming it froze.
- As a student or lecturer on a failed action, I want the failure stated plainly and the screen left truthful, so that what I see matches what is stored.
- As a developer adding the next action, I want one documented rule and one shared component, so that I do not have to decide feedback behaviour again.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: One toast host is mounted exactly once, in the root layout, from a client component placed inside `ThemeProvider`, so a `toast` call made from any screen in the app becomes visible.
- **AC-2**: The host follows the theme the app has resolved in context, not the operating system setting, so a user who chose dark by hand still sees a dark styled toast. It does not flash the wrong theme for one render before hydration settles.
- **AC-3**: Toasts appear at the bottom right of the viewport, clear of the review workspace's zoom toolbar (bottom centre) and its Save Draft and Submit Final Grade buttons (top right).
- **AC-4**: A success toast dismisses itself after about four seconds. An error toast does not: it stays until the user dismisses it or a later success on the same screen replaces the feedback.
- **AC-5**: Every action that can exceed roughly 300 milliseconds reports in flight, and every one of them ends in either a visible success or a visible failure. The nine paths in scope are the five in the review workspace, the rubric modal save, sign in, the sidebar role switch, and upload.
- **AC-6**: A control that starts an async action is disabled in the same tick as the click, so a second click cannot start a second write, and the spinner and working label are revealed only if the action is still running after about 150 milliseconds. A write that returns faster than that shows no spinner at all.
- **AC-7**: When an action throws instead of returning an error object (a dropped connection, a crashed request, a transport fault), the failure is caught and reported as one plain sentence, and the underlying error is logged to the console for a developer. A thrown action never escapes as an unhandled rejection and never leaves a control stuck in its working state.
- **AC-8**: When an action returns an error, any optimistic change the screen already made is undone, and the failure is reported. The comment delete path, which today removes the card from the screen and cannot restore it because the list was seeded once from props, must either roll back to the previous list or not remove optimistically at all.
- **AC-9**: No user facing message includes raw error detail. The four actions that currently build their message by appending the caught error's own message stop doing so, and the full error is logged server side instead.
- **AC-10**: Save Draft and Submit Final Grade share one lock, because both write the same submission row. While either write is in flight both controls are disabled, and only the one that is actually running shows the spinner and its working label.
- **AC-11**: The toast region announces itself to assistive technology, so a result is perceivable without sight. The wider accessibility audit, including accessible names for icon only controls and the tab strips, remains feature 8.
- **AC-12**: A validation failure the user must correct in the field they are already in is shown inline next to that field, not as a toast. The five existing validation messages (empty comment text, an empty grade on Save Draft, an empty grade on Submit Final Grade, a missing rubric title, and a missing criteria description) all move inline.
- **AC-13**: The sidebar role switch reports only a failure, because its success feedback is the screen changing to the other role. The existing hard navigation is kept, so a success toast is never written and then destroyed by the reload.
- **AC-14**: The one rule that decides toast against inline is written down and handed to `/sync` for `AGENTS.md`, which `/architect` and `/develop` do not own. The rule reads: an action's outcome is a toast, and feedback the user must act on in place is inline.
- **AC-15**: The feature carries test evidence at both layers the harness from spec 0001 provides. At the browser layer, a Playwright journey proves that a formerly silent action now speaks and that the control reported in flight; at the component layer, jsdom tests prove the shared button disables on click, reveals its spinner only after the delay, and returns to normal when the action throws.

## Decision

**Chosen option**: Option 1: One shared feedback layer, with the Sonner host already installed in the root layout

The app already depends on Sonner and already calls it in two files. This decision mounts the host that was missing, adds a thin shared layer around it (a feedback helper module, one hook, one button component), and converts all nine async action paths to use it. It is delivered as a Tracer Bullet: the host, the shared layer and one converted path land together as a working thread, then the remaining paths are converted against a thread already proven in the browser.

Confirmed choices inside that decision:

| Decision | Pick | Rationale |
|---|---|---|
| Sweep scope | All nine async paths | A convention with surviving exceptions is not a convention, and the sidebar role switch fails silently today |
| The rule | Outcome is a toast, feedback to fix in place is inline | Matches what login and upload already do, so only the six silent paths change behaviour |
| Pending state | One shared button component plus one shared hook | Also becomes the single place a thrown action is caught, which today is handled nowhere |
| Host location | Root layout, reading the app theme | Survives client navigation, so a toast fired just before the redirect after a final grade is still visible on the next screen |
| Failure handling | Roll back the optimistic change, then report | A failure that leaves the screen lying is the same class of defect this feature exists to fix |
| Raw error detail | Stripped now, in the four actions that append it | This feature is what makes those strings visible, so shipping them visible is a disclosure this feature would introduce |
| Rule's home | `AGENTS.md` through `/sync` | Mirrors how spec 0001 handed the testing convention over, and neither `/architect` nor `/develop` owns that file |
| Tests | Playwright for the journey, jsdom for the shared layer | Spec 0001 already recorded that toast behaviour is browser behaviour jsdom only approximates |
| Toast position | Bottom right | Keeps clear of the two control clusters in the review workspace |
| Error persistence | Errors stay until dismissed | A failure that auto dismisses can vanish before it is read |
| Copy convention | Short, plain, past tense, names the thing, no exclamation mark | The nineteen existing strings are inconsistent today, and one convention is the point of this feature |
| Thrown action | One plain sentence, real error logged | A transport message tells the user nothing they can act on |
| Spinner timing | Disable immediately, spinner after about 150 milliseconds | Prevents a double submit without flashing a spinner on a fast write |
| Grade buttons | One shared lock | Both write the same row, so independent states would let the last write silently win |
| Announcement | Announce the toast region, leave the wider audit to feature 8 | A visual only surface repeats the original defect for anyone not looking at the screen |
| Feature boundaries | Features 2, 4, 5 and 10 keep their own work | Each already has an owner and a spec slot; this feature is the feedback layer, not the whole slice |

**Implementation skills**: `develop` (`JavaScript-Mastery-Pro/skills`, `.agents/skills/develop/`) · `check` (`JavaScript-Mastery-Pro/skills`, `.agents/skills/check/`) · `test` (`JavaScript-Mastery-Pro/skills`, `.agents/skills/test/`)

## Feature design

**Data model sketch**:

This feature adds no entity, no field, no relationship and no migration. Its only persisted state is the existing theme choice in `localStorage`, which it reads through `useTheme` rather than owns. Every value it introduces is ephemeral and lives for the life of one screen or one action:

| Value | Kind | Lifetime | Source |
|---|---|---|---|
| Pending flag per action key | In memory, hook state | One action | `useAsyncAction` |
| Spinner visibility | In memory, component state | One action, delayed about 150ms | `AsyncButton` |
| Toast message and variant | In memory, toast host state | About 4s for success, until dismissed for error | `src/lib/feedback.js` |

**State transitions**:

Each converted action moves through a three state cycle, which is the behaviour AC-5 and AC-6 make checkable:

`idle` → (`click`, immediately disabled) → `in flight` (spinner after about 150ms) → `resolved`, either `success` (toast, self dismissing) or `failure` (rollback, persistent toast).

**API surface**:

No HTTP endpoint is added or changed. The interface this feature adds is three small internal surfaces, which is what `/develop` implements and what the acceptance criteria observe.

| Surface | Kind | Key inputs | Key outputs | Notes |
|---|---|---|---|---|
| `src/lib/feedback.js` | Module | message string, optional detail | none | Wraps Sonner with the copy convention and the error persistence rule in one place |
| `src/hooks/useAsyncAction.js` | Hook | action key, the action function, optional success message | pending state per key, a `run` function | Owns the thrown action catch, the rollback callback and the reporting |
| `src/components/AsyncButton.jsx` | Component | `isPending`, `disabled`, pending label, children | a button element | Owns the disable immediately and spinner shortly behaviour |
| `src/components/ToastHost.jsx` | Client component | none | the toast host element | Reads theme from `useTheme`, mounted once in the root layout |

**Value sourcing** (every value each action produces, computes, or displays names where it comes from):

| Action | Value produced or displayed | Source |
|---|---|---|
| Any converted action | Success toast text | A literal at the call site, following the copy convention in AC-5 |
| Any converted action | Failure toast text | The `error` string the server action already returns in `{ error: "..." }` |
| Any converted action | Failure text when the action throws | A constant in `src/lib/feedback.js`, one plain sentence, per AC-7 |
| `useAsyncAction` | Pending state | Hook state, keyed by the action key the caller passes |
| `AsyncButton` | Disabled state | The `isPending` prop, applied in the same tick as the click |
| `AsyncButton` | Spinner visibility after about 150ms | A timer inside the component, cleared on resolution |
| `ToastHost` | Theme passed to the toast library | `useTheme()` from `src/components/ThemeProvider.jsx`, which resolves the stored choice then the system preference |
| Toast library | Auto dismiss delay for success | A literal about 4 seconds, set on the host |
| Toast library | Persistence for errors | An infinite duration set on the host or per call, per AC-4 |
| Review workspace | Shared grade lock | One pending key shared by Save Draft and Submit Final Grade, per AC-10 |
| Review workspace | Rollback value on a failed comment delete | The previous list captured before the optimistic removal, per AC-8 |
| Sidebar role switch | Failure toast only | The `error` field of `toggleDemoUserAction`'s return, per AC-13 |
| Validation messages | Inline error text | The existing literals, moved from the toast call to inline render, per AC-12 |

**Key invariants**:

- The toast host is mounted exactly once, in the root layout. A second host in a role layout would double every message and would be unmounted by the hard navigation the role switch uses.
- A control is never disabled by a pending flag it does not own. Save Draft and Submit Final Grade share a lock deliberately; every other control reads its own key.
- Every pending flag is cleared in a `finally` block, so a thrown action cannot leave a control permanently disabled.
- No user facing string is built by concatenating a caught error. The raw error goes to the server log only.
- The existing optimistic behaviour on the viva question toggle is kept. It already rolls back correctly, and it is the pattern the comment delete is aligned to rather than replaced.
- No optimistic change is left in place after a failure, so what the screen shows matches what is stored once the action has resolved.
- The `toast` import stays `sonner`. This feature adds no new dependency.

**Security model**:

Nothing is added to the application's authorisation model, and this feature touches no regulated data. It is read only with respect to who may do what: every action keeps the authorisation it has today, and this feature only changes how the result is reported.

One rule matters, and it is a narrowing rather than a widening: AC-9 removes raw error detail from user facing strings. Today four actions return text such as a Prisma message appended after a colon, and because nothing displays it, the leak is latent. Mounting the host is what would make it visible, so the detail is stripped in the same feature that reveals it. Feature 2 still owns the rejection shape and the Zod validation layer.

**Configuration required**:

None. No new environment variable, credential or feature flag is needed.

**Critical test scenarios** (each maps to an acceptance criterion in `## Requirements`):

- Happy path: a lecturer saves a draft grade, the button disables, the spinner appears if the write outlives the delay, and a success toast appears at the bottom right and dismisses itself, verifies **AC-1**, **AC-3**, **AC-4**, **AC-5**, **AC-6**
- Failure case: an action returns `{ error }`, the optimistic change on screen is undone and a persistent error toast is shown that does not dismiss itself, verifies **AC-4**, **AC-8**
- Failure case: an action throws instead of returning an error, one plain sentence is reported, no raw error text reaches the screen, and the control returns to normal, verifies **AC-7**, **AC-9**
- Failure case: the comment delete fails after the card was removed, and the card is restored, verifies **AC-8**
- Concurrency: a second click while a grade write is in flight starts no second write, and both grade controls are disabled together, verifies **AC-6**, **AC-10**
- Guard: a validation failure with an empty grade field renders inline and fires no toast, verifies **AC-12**
- Theme: with dark chosen by hand, a toast rendered from a screen is styled for dark rather than for the light system preference, verifies **AC-2**
- Announcement: the toast region is present and announced when a result appears, verifies **AC-11**

## Build plan

Ordered by the project's Tracer Bullet approach (recorded in the scope header): a thin thread through every layer first, then the thread thickened. Here the thread is the feedback layer plus one converted path, deliberately the simplest write in the app (Save Draft), so the host, the theme wiring, the hook, the button and the browser behaviour are all proven against a single action before eight more paths are converted on top of them. That ordering matters because the host and the theme coupling are the one part of this feature that cannot be verified by reasoning, and a mistake there would otherwise be discovered across nineteen call sites at once.

### Milestone 1: the thin thread

1. Create `src/components/ToastHost.jsx`: a client component that reads theme from `useTheme` and renders the Sonner host with bottom right placement, success auto dismiss at about four seconds, and errors persisting until dismissed, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**
2. Mount `ToastHost` exactly once in `src/app/layout.jsx`, inside `ThemeProvider` so the theme context is available, satisfies **AC-1**, **AC-2**
3. Create `src/lib/feedback.js` holding the success and failure reporting helpers, the error persistence rule and the plain sentence constant used when an action throws, satisfies **AC-4**, **AC-7**
4. Create `src/hooks/useAsyncAction.js`: runs an action under a caller supplied key, tracks pending state per key, resolves a returned error into a failure report, catches a thrown action into the plain sentence, accepts an optional rollback callback, and clears pending in a `finally`, satisfies **AC-5**, **AC-7**, **AC-8**
5. Create `src/components/AsyncButton.jsx`: disabled in the same tick as the click, spinner and working label revealed after about 150 milliseconds, styling from the existing tokens rather than the library palette, satisfies **AC-6**
6. Convert the Save Draft path in `src/app/lecturer/review/[id]/ReviewWorkspaceClient.jsx` to the shared layer end to end, and replace its two `isSubmitting` usages with the shared pending key, satisfies **AC-5**, **AC-6**, **AC-10**

### Milestone 2: the rules

7. Share one grade lock between Save Draft and Submit Final Grade, so both disable while either writes and only the running one shows its working label, satisfies **AC-10**
8. Fix the comment delete path: either roll back to the previous list on failure or stop removing optimistically, so a failed delete never leaves a comment that is gone from the screen but present in the database, satisfies **AC-8**
9. Convert the viva question toggle and the comment save paths, keeping the existing correct rollback on the toggle, satisfies **AC-5**, **AC-8**
10. Convert the final grade path, reusing the shared lock from task 7, satisfies **AC-5**, **AC-10**
11. Move the five validation messages inline: the empty comment text, both empty grade cases, the missing rubric title and the missing criteria description, rendering each next to the field it concerns instead of as a toast, satisfies **AC-12**
12. Standardise the copy on all nineteen existing call sites to the agreed convention (short, plain, past tense, names the thing, no exclamation mark), and correct the three that name the wrong subject, satisfies **AC-5**
13. Remove the appended raw error detail from `submitGradeAction`, `toggleVivaQuestionAction`, `createCommentAction` and `deleteCommentAction` in `src/app/actions/grading.js`, and from `createRubricAction` and `updateRubricAction` in `src/app/actions/rubrics.js`, logging the full error server side instead, satisfies **AC-9**
14. Convert the sidebar role switch in `src/components/Sidebar.jsx` to report only a failure, keeping the existing hard navigation on success, satisfies **AC-13**
15. Confirm the toast region announces itself to assistive technology through the host, and record that the wider accessibility audit stays with feature 8, satisfies **AC-11**

### Milestone 3: the remaining paths

16. Convert the rubric modal save in `src/app/lecturer/(dashboard)/rubrics/RubricManagerClient.jsx`, replacing its local `loading` flag with the shared pending key, satisfies **AC-5**, **AC-6**
17. Confirm sign in in `src/app/(auth)/login/page.jsx` against the new pattern, keeping its inline error banner, which the rule places inline because the user must correct it in place, satisfies **AC-5**, **AC-12**
18. Confirm upload in `src/app/student/(dashboard)/upload/page.jsx` against the new pattern, keeping its inline progress and inline error banner, and leaving the progress bar's honesty and the unenforced size limit to feature 10, satisfies **AC-5**

### Milestone 4: evidence and handoff

19. Write jsdom tests for `AsyncButton` (disabled on click, spinner only after the delay, returns to normal on a thrown action) and for `useAsyncAction` (pending per key, rollback on failure, plain sentence on a throw), satisfies **AC-15**
20. Write the Playwright journey: sign in as the lecturer, open a submission, save a draft, observe the control report in flight and the success toast appear, satisfies **AC-15**, **AC-1**, **AC-3**, **AC-5**
21. Hand the toast against inline rule to `/sync` for `AGENTS.md`, in the same shape as the testing convention spec 0001 handed over, satisfies **AC-14**

## Consequences

**Positive**:

- Thirteen existing outcome messages that are written but never seen start working, so the defect is closed largely by mounting a host the project already paid for.
- One shared layer replaces what would otherwise be nine hand rolled pending implementations, and it is the only place a thrown action is caught, which today is nowhere.
- The rule and the shared component mean the next feature that adds an action has no feedback decision left to make.
- Failures stop leaving the screen in a state that contradicts the database, starting with the comment delete.

**Negative / tradeoffs**:

- The shared button and hook are a small abstraction over call sites that are individually simple, so a reader must follow one indirection to see what a button does.
- A toast is transient by nature. A success that the user misses is gone, which is acceptable for an action they just took and is exactly why the rule keeps correctable feedback inline.
- Standardising nineteen strings is a wider edit than mounting a host, and it touches copy inside two busy components.
- Errors that persist until dismissed can stack up if several writes fail in a row, which is preferable to a failure vanishing but is a real possibility.

**Neutral**:

- The Sonner dependency is already present at `^2.0.7`, so this feature adds no package and no lockfile change.
- Sonner ships its own styles and palette. The host takes colours from the project tokens so a toast does not look like a different application, which means a small amount of class or style mapping on the host.
- The review workspace is a large client component and stays one. This feature changes its handlers and its button markup rather than splitting the file, which keeps the diff readable and leaves any structural change to a later feature.
- The tree already contains a handful of class names referencing colour steps outside the real scale. This feature adds none, and correcting the existing ones stays with feature 7.

## Follow-up

- [ ] Feature 2 owns the rejection shape and the Zod validation layer. When it defines the predictable error shape, `src/lib/feedback.js` should read that shape rather than the current `{ error: string }` convention, which this feature consumes as it stands today.
- [ ] Feature 5 owns the destructive action safeguards: the finalize and delete confirmations, the criteria count warning, and the grade range check. Both grade buttons now share a lock, which is a prerequisite for the confirmation work rather than a substitute for it.
- [ ] Feature 10 owns upload feedback honesty: the progress bar's three fixed values, the unenforced 50MB limit, and the false end to end encryption claim. This feature deliberately leaves the upload screen's own progress alone and only confirms it reports in flight.
- [ ] If a later feature needs feedback inside the small actions where a toast is too heavy today (a per item save inside a list, for example), reconsider whether an inline per item state is the right second pattern, rather than widening the toast rule.
- [ ] The theme choice lives in `localStorage` and is read by the host through context. If a later feature moves theme to a cookie or a database field for a signed in user, the host reads the resolved value and needs no change, but the resolution path in `src/components/ThemeProvider.jsx` is where that would land.

## Rationale

The forces in Context settle this quickly. The project already pays for Sonner and already calls it, so the gap is wiring rather than a tool choice, and replacing the library would discard nineteen working calls to solve a problem they are not causing. That makes the feedback layer the whole of the decision, and the load bearing question becomes what the shared layer must guarantee rather than which library to adopt.

Two constraints shaped the shape of that layer. The first is that a thrown action is currently handled nowhere, so nine call sites would each need their own catch. Folding it into one hook is what makes AC-7 true everywhere by construction rather than by transcription. The second is that the app has a manual theme toggle that ignores the operating system preference once the user chooses, so a host reading the system only would render a light toast on a dark screen for exactly the users who cared enough to pick. Reading the resolved theme from the existing context is both the smaller change and the correct one.

The feature boundaries were drawn deliberately narrow. Four neighbouring features each already own a part of the same audit (validation shape, route boundaries, destructive confirmations, upload honesty), and folding any of them in would produce a spec that cannot be verified as one decision. The one exception is the raw error detail. It belongs to feature 2 conceptually, but mounting the host is what makes the string visible, so leaving it would mean this feature's first act is to publish a database message to users. Removing six concatenations now is the smaller risk, and feature 2 still owns what the rejection shape becomes.

## Context

The app has a working toast dependency and nineteen calls to it, but no host that renders them. `sonner` sits in `dependencies` at `^2.0.7`, `toast.success` and `toast.error` are imported and called in `src/app/lecturer/review/[id]/ReviewWorkspaceClient.jsx` (thirteen calls) and `src/app/lecturer/(dashboard)/rubrics/RubricManagerClient.jsx` (six calls), and `Toaster` is imported nowhere. `src/app/layout.jsx` mounts `ThemeProvider` and nothing else. The consequence is that saving a draft grade, finalising a grade, adding a comment, deleting a comment, toggling a viva question, creating a rubric and updating a rubric all return silence. The message text for every one of them is already written and correct in intent, so the visible symptom of a missing line of mounting code is indistinguishable from a broken write.

Nine asynchronous action paths exist in the app, and the pending state treatment across them is inconsistent. Sign in, the rubric modal save, and upload each report in flight, by disabling their controls and swapping a label. Upload goes further with a progress bar whose three fixed values are a separate defect owned by feature 10. Inside the review workspace the coverage is partial in a revealing way: a single `isSubmitting` flag is raised by the two grade handlers and disables the two grade buttons, while the comment save, comment delete and viva question toggle raise nothing at all and never disable. Two grade buttons also share that one flag while writing the same row, so the current behaviour is that both disable together, which is correct, and that both report nothing, which is not.

Three defects sit underneath the feedback gap and are made worse by it. Four actions build their user facing message by appending the caught error's own message, so mounting the host would publish a raw database string to a student or lecturer. The comment delete path removes the card from the screen optimistically and, on failure, calls `router.refresh()`, which cannot restore the card because the list was seeded once from props into state; the result is a comment that looks deleted and is not. And a thrown action escapes as an unhandled rejection at every call site, because none of them is wrapped in a try block.

`AGENTS.md` already sets the rule this feature has to satisfy, and sets it more broadly than the current code meets: anything slower than 300 milliseconds shows a pending state and then resolves to a success or error message. The scope adds one requirement the code cannot answer on its own, which is that a single documented rule must say when feedback is a toast and when it is inline, because without it the next action added makes that choice arbitrarily.
