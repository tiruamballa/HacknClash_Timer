import { useState, useEffect, useRef } from 'react';
import { parseDateToMs } from '../utils/time';

/**
 * Calculates clock drift offset and runs a requestAnimationFrame loop 
 * to provide a drift-corrected seconds-remaining countdown.
 * 
 * @param {string} serverTime ISO string from server
 * @param {string} endsAt ISO string for deadline
 * @returns {number} Seconds remaining
 */
export function useServerTime(serverTime, endsAt) {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const driftRef = useRef(0);
  const rAFRef = useRef(null);
  const endsAtRef = useRef(endsAt);

  // Sync refs to avoid re-triggering requestAnimationFrame loop on every string change
  useEffect(() => {
    endsAtRef.current = endsAt;
  }, [endsAt]);

  // Recalculate drift offset when serverTime is updated by polling
  useEffect(() => {
    if (serverTime) {
      const serverMs = parseDateToMs(serverTime);
      const clientMs = Date.now();
      driftRef.current = serverMs - clientMs;
    }
  }, [serverTime]);

  useEffect(() => {
    if (!endsAt) {
      setSecondsRemaining(0);
      return;
    }

    const tick = () => {
      const deadlineMs = parseDateToMs(endsAtRef.current);
      const currentServerMs = Date.now() + driftRef.current;
      const remainingSecs = Math.max(0, Math.floor((deadlineMs - currentServerMs) / 1000));

      setSecondsRemaining((prev) => {
        if (prev !== remainingSecs) {
          return remainingSecs;
        }
        return prev;
      });

      rAFRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      if (rAFRef.current) {
        cancelAnimationFrame(rAFRef.current);
      }
    };
  }, [endsAt]);

  return secondsRemaining;
}
