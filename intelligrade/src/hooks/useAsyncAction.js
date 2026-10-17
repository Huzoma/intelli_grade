"use client";

import { useCallback, useState } from "react";
import { reportFailure, reportSuccess, UNEXPECTED_FAILURE_MESSAGE } from "@/lib/feedback";

// Runs one server action and reports how it ended.
//
// The pending flag is raised before the first await, so a control reading it is
// disabled in the same tick as the click and a second click cannot start a second
// write. This is also the only place a thrown action is caught: without it every
// call site would need its own try block, and a throw would escape as an
// unhandled rejection.
//
// `key` identifies the action. Two controls that write the same row pass the same
// key so they share one lock, and a failure is paired with its own later success
// rather than another control's. `action` is passed its own arguments through
// `run`, so it stays a stable import and never closes over stale state.
//
// `successMessage` is omitted for an action whose success is already visible as a
// change on screen. `rollback` undoes an optimistic change the screen already
// made, and runs on a returned error and on a throw alike, so a failure never
// leaves the screen disagreeing with what is stored.
export function useAsyncAction(key, action, { successMessage, rollback } = {}) {
  const [isPending, setIsPending] = useState(false);

  const run = useCallback(
    async (...args) => {
      setIsPending(true);

      try {
        const result = await action(...args);

        if (result && result.error) {
          if (rollback) rollback();
          reportFailure(result.error, key);
          return { error: result.error };
        }

        if (successMessage) reportSuccess(successMessage, key);
        return result;
      } catch (error) {
        console.error(`Async action "${key}" threw:`, error);

        if (rollback) rollback();
        reportFailure(UNEXPECTED_FAILURE_MESSAGE, key);
        return { error: UNEXPECTED_FAILURE_MESSAGE };
      } finally {
        // Cleared unconditionally, so a thrown action can never leave a control
        // disabled for good.
        setIsPending(false);
      }
    },
    [key, action, successMessage, rollback]
  );

  return { isPending, run };
}
