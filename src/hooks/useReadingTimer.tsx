import { useEffect, useRef } from 'react';

/**
 * Hook that tracks active reading time.
 * Calls `onMinuteRead` every minute while the user is active.
 * @param isActive Start tracking when true
 * @param onMinuteRead Callback executed for each active minute
 * @param idleTimeout Duration in ms after which the user is considered idle
 */
export function useReadingTimer(
  isActive: boolean,
  onMinuteRead: () => void,
  idleTimeout = 60_000,
) {
  const lastActivityRef = useRef(Date.now());
  const secondsRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events: (keyof DocumentEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
    ];

    events.forEach(e => window.addEventListener(e, handleActivity));

    intervalRef.current = setInterval(() => {
      if (Date.now() - lastActivityRef.current < idleTimeout) {
        secondsRef.current += 1;
        if (secondsRef.current >= 60) {
          onMinuteRead();
          secondsRef.current -= 60;
        }
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      events.forEach(e => window.removeEventListener(e, handleActivity));
    };
  }, [isActive, idleTimeout, onMinuteRead]);
}

export default useReadingTimer;
