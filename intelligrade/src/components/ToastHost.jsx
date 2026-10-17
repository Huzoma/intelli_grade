"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/components/ThemeProvider";
import { SUCCESS_TOAST_DURATION_MS } from "@/lib/feedback";

// The one toast host for the whole app, mounted in the root layout.
//
// It lives there rather than in a role layout because it has to survive client
// navigation: a toast fired just before the redirect after a final grade is still
// visible on the next screen. A second host anywhere would double every message.
//
// Sonner renders the region with aria-live, so a result is announced as well as
// shown. This component adds no live region of its own.
export default function ToastHost() {
  const { theme, mounted } = useTheme();

  // Sonner styles itself from the theme prop, and the app theme is resolved from
  // localStorage on the client. Nothing theme dependent renders before hydration
  // ends, so the host never paints the operating system theme for a frame before
  // settling on the one the user actually chose. ThemeToggle does the same.
  if (!mounted) return null;

  return (
    <Toaster
      theme={theme}
      // Bottom right keeps clear of the review workspace's two control clusters:
      // the zoom toolbar at the bottom centre and the grade buttons at the top right.
      position="bottom-right"
      duration={SUCCESS_TOAST_DURATION_MS}
      // A failure is read and then dismissed rather than waited out, and the user
      // decides when. feedback.js sets an infinite duration per call so a failure
      // never auto dismisses.
      closeButton
      containerAriaLabel="Action results"
    />
  );
}
