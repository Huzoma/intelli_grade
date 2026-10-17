"use client";

import { toast } from "sonner";

// One rule for every action in the app: the outcome is a toast, and feedback the
// user has to act on in place, such as a field they must correct, is rendered
// inline. Copy convention for everything sent from here: short, plain, past
// tense, names the thing, no exclamation mark.

// A success is transient by nature: the user just did the thing, so about four
// seconds is enough to read it. ToastHost sets this as the host default.
export const SUCCESS_TOAST_DURATION_MS = 4000;

// Reported when an action throws rather than returning an error object, which is
// a dropped connection, a crashed request or a transport fault. It says what the
// user can act on and nothing about the transport, because a transport message
// tells them nothing they can do. The real error is logged instead.
export const UNEXPECTED_FAILURE_MESSAGE = "Something went wrong. Please try again.";

// Failures do not auto dismiss, because one that vanishes can vanish before it is
// read. To stop them piling up they are tracked by action key, so the same action
// failing again, or later succeeding, clears its own earlier failure and never
// clears another control's.
const openFailures = new Map();

export function reportSuccess(message, key) {
  clearFailure(key);

  return toast.success(message);
}

export function reportFailure(message, key) {
  clearFailure(key);

  const id = toast.error(message, {
    // Infinite duration is the error persistence rule: it stays until the user
    // dismisses it. The close button is how they dismiss it.
    duration: Infinity,
    closeButton: true,
  });

  if (key !== undefined) openFailures.set(key, id);

  return id;
}

// Dismisses the failure currently standing against one action key, if there is one.
export function clearFailure(key) {
  if (key === undefined || !openFailures.has(key)) return;

  const id = openFailures.get(key);
  openFailures.delete(key);

  toast.dismiss(id);
}
