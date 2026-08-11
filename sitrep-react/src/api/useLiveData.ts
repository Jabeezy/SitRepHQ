import { useEffect, useRef, useState } from 'react';

export interface LiveDataState<T> {
  data: T | null;
  error: string | null;
  lastUpdated: string | null;
  loading: boolean;
}

/**
 * Polls a fetcher function on an interval and exposes {data, error, loading}.
 * This one hook replaces the repeated "fetchX, setInterval, try/catch, log a
 * warning on failure" pattern that was hand-written for every single data
 * source in the vanilla-JS version (earthquakes, fires, CVEs, threat actors,
 * breaches, world news, sanctions, zones, dynamic countries — nine separate
 * copies of essentially the same fetch/poll/error-handling logic).
 *
 * On failure, it deliberately keeps showing the last successful `data`
 * instead of clearing it — same "don't show an empty panel just because one
 * refresh cycle failed" principle the backend already follows.
 */
export function useLiveData<T>(
  fetcher: () => Promise<{ data: T; error: string | null }>,
  intervalMs: number,
  label: string
): LiveDataState<T> {
  const [state, setState] = useState<LiveDataState<T>>({
    data: null,
    error: null,
    lastUpdated: null,
    loading: true,
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function load() {
      try {
        const res = await fetcher();
        if (!mountedRef.current) return;
        // The backend's error field is often just informational ("one of 15
        // zones failed this cycle") rather than "this response has no usable
        // data" — so data always gets applied when present. Error is only
        // treated as fatal when there's genuinely no data alongside it.
        const hasData = res.data !== undefined && res.data !== null;
        if (hasData) {
          setState({ data: res.data, error: res.error, lastUpdated: new Date().toISOString(), loading: false });
          if (res.error) console.warn(`[${label}] partial issue (data still applied):`, res.error);
        } else {
          setState(prev => ({ ...prev, error: res.error, loading: false }));
          console.warn(`[${label}] backend reported an error with no data:`, res.error);
        }
      } catch (err) {
        if (!mountedRef.current) return;
        const message = err instanceof Error ? err.message : String(err);
        setState(prev => ({ ...prev, error: message, loading: false }));
        console.warn(`[${label}] fetch failed:`, message);
      }
    }

    load();
    const id = setInterval(load, intervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, label]);

  return state;
}