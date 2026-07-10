import { useRef, useEffect, useCallback } from 'react';
import useImportStore from '../store/useImportStore';

/**
 * Custom hook to handle API requests with built-in cancellation (AbortController)
 * and Zustand state synchronization (loading, error).
 */
export function useApiRequest() {
  const abortControllerRef = useRef(null);
  const { setLoading, setError } = useImportStore();

  const execute = useCallback(async (apiCall, ...args) => {
    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(...args, controller.signal);
      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
        return null; // Suppress error for aborted requests
      }
      setError(err.message || 'An unexpected error occurred.');
      throw err;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [setLoading, setError]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  }, [setLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return cancel;
  }, [cancel]);

  return { execute, cancel };
}
