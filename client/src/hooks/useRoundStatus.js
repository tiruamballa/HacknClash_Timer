import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

const DEFAULT_POLL_INTERVAL = 3000; // 3 seconds default for instant multi-device sync
const BACKOFF_MAX = 30000; // 30 seconds max backoff limit

export function useRoundStatus() {
  const [data, setDataState] = useState(() => {
    try {
      const saved = localStorage.getItem('hnv_cached_live_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.status === 'LIVE' && parsed.endsAt && new Date(parsed.endsAt).getTime() > Date.now()) {
          return parsed;
        }
      }
    } catch (e) {}
    return { status: 'READY', startedAt: null, endsAt: null, serverTime: null };
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const backoffRef = useRef(1000); // initial backoff 1s
  const timerRef = useRef(null);

  const updateData = useCallback((newData) => {
    if (newData && newData.status === 'READY') {
      localStorage.removeItem('hnv_cached_live_state');
    } else if (newData && newData.status === 'LIVE') {
      localStorage.setItem('hnv_cached_live_state', JSON.stringify(newData));
    }
    setDataState(newData);
  }, []);

  const fetchStatus = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const response = await api.getStatus();
      setError(null);
      setIsOffline(false);
      backoffRef.current = 1000; // Reset backoff on successful API contact

      // Server status is authoritative!
      if (response.status === 'READY') {
        localStorage.removeItem('hnv_cached_live_state');
      }
      updateData(response);

      // Schedule next standard poll
      schedulePoll(DEFAULT_POLL_INTERVAL);
    } catch (err) {
      console.warn(`[SYNC] API poll failed: ${err.message}. Retrying...`);
      setError(err.message);
      setIsOffline(true);
      
      // Schedule next poll with exponential backoff
      const nextBackoff = Math.min(backoffRef.current * 2, BACKOFF_MAX);
      backoffRef.current = nextBackoff;
      schedulePoll(nextBackoff);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [updateData]);

  const schedulePoll = (ms) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fetchStatus(true);
    }, ms);
  };

  // Real-time Server-Sent Events (SSE) Subscription
  useEffect(() => {
    let eventSource = null;
    try {
      const sseUrl = api.getEventsUrl();
      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.status) {
            setError(null);
            setIsOffline(false);
            if (parsed.status === 'READY') {
              localStorage.removeItem('hnv_cached_live_state');
            }
            updateData(parsed);
          }
        } catch (e) {
          // Keepalive comments or non-JSON messages
        }
      };

      eventSource.onerror = () => {
        // Fallback polling will handle updates seamlessly if SSE disconnects
      };
    } catch (e) {
      console.warn('[SSE] EventSource unavailable:', e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [updateData]);

  useEffect(() => {
    fetchStatus();

    // Trigger immediate refetch when tab becomes active again
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchStatus(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchStatus]);

  const forceRefetch = async () => {
    return fetchStatus(false);
  };

  return {
    ...data,
    loading,
    error,
    isOffline,
    refetch: forceRefetch,
    setData: updateData, // Allow manual local updates during state changes (e.g. start/reset animations)
  };
}
