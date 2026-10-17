"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// A fast write must not flash a spinner. The control goes disabled at once, so it
// cannot be double submitted, but the working indicator only appears if the
// action is still running after this long. Anything that returns sooner shows no
// spinner at all.
const WORKING_INDICATOR_DELAY_MS = 150;

// A button that reports an async action. It takes its colours and shape from the
// caller's className, which is how it stays styled from the project tokens rather
// than from any library palette.
//
// `isPending` comes from useAsyncAction. `disabled` is kept separate so a control
// is never disabled by a pending flag it does not own. `pendingLabel` is revealed
// together with the spinner, so the button says what it is doing rather than only
// dimming.
export default function AsyncButton({
  isPending = false,
  disabled = false,
  pendingLabel = "Working",
  className = "",
  children,
  ...rest
}) {
  const [delayElapsed, setDelayElapsed] = useState(false);

  useEffect(() => {
    if (!isPending) return;

    const timer = setTimeout(() => setDelayElapsed(true), WORKING_INDICATOR_DELAY_MS);

    return () => {
      clearTimeout(timer);
      setDelayElapsed(false);
    };
  }, [isPending]);

  const isWorking = isPending && delayElapsed;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...rest}
      disabled={disabled || isPending}
      aria-busy={isWorking}
      className={className}
    >
      {isWorking ? (
        <>
          <Loader2 aria-hidden="true" className="w-4 h-4 mr-2 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
