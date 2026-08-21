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

      if (response.status === 'LIVE') {
        updateData(response);
      } else if (response.status === 'READY') {
        const cached = localStorage.getItem('hnv_cached_live_state');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.status === 'LIVE' && parsed.endsAt && new Date(parsed.endsAt).getTime() > Date.now()) {
              updateData({ ...response, status: 'LIVE', startedAt: parsed.startedAt, endsAt: parsed.endsAt });
            } else {
              localStorage.removeItem('hnv_cached_live_state');
              updateData(response);
            }
          } catch (e) {
            updateData(response);
          }
        } else {
          updateData(response);
        }
      } else {
        localStorage.removeItem('hnv_cached_live_state');
        updateData(response);
      }
      
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
