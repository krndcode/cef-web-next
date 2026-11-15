"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Counts down a resend cooldown in seconds. `start` restarts the timer so a
 * verification/reset email can only be resent once per window. `start` is
 * stable, which lets callers use it inside effects and callbacks.
 */
export function useResendCooldown(seconds = 60) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [remaining]);

  const start = useCallback(() => setRemaining(seconds), [seconds]);

  return {
    remaining,
    start,
  };
}
