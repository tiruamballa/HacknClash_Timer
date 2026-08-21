import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

const DEFAULT_POLL_INTERVAL = 10000; // 10 seconds default
const BACKOFF_MAX = 30000; // 30 seconds max backoff limit

export function useRoundStatus() {
  const [data, setData] = useState({
    status: 'READY',
    startedAt: null,
    endsAt: null,
    serverTime: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const backoffRef = useRef(1000); // initial backoff 1s
  const timerRef = useRef(null);

  const fetchStatus = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const response = await api.getStatus();
      setData(response);
      setError(null);
      setIsOffline(false);
      backoffRef.current = 1000; // Reset backoff on successful API contact
      
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
  }, []);

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
    setData, // Allow manual local updates during state changes (e.g. start/reset animations)
  };
}
