import { useEffect, useRef } from 'react';

/**
 * Calls onTimeout after `seconds` of no user touch/click/scroll activity.
 * Resets whenever the user interacts.
 */
export default function InactivityTimer({ seconds = 60, onTimeout }) {
  const timer = useRef(null);

  useEffect(() => {
    function reset() {
      clearTimeout(timer.current);
      timer.current = setTimeout(onTimeout, seconds * 1000);
    }

    const events = ['touchstart', 'touchmove', 'click', 'scroll', 'keydown', 'mousemove'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      clearTimeout(timer.current);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [seconds, onTimeout]);

  return null;
}
