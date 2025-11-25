import { useState, useEffect, useCallback } from 'react';
import { API } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface UseDataOptions {
  autoFetch?: boolean;
  showErrors?: boolean;
}

export function useData<T>(
  fetchFn: () => Promise<T>,
  options: UseDataOptions = {}
) {
  const { autoFetch = true, showErrors = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'حدث خطأ أثناء تحميل البيانات';
      setError(errorMessage);
      if (showErrors) {
        toast.error('❌ ' + errorMessage);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchFn, showErrors]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch, fetch]);

  const refresh = useCallback(() => {
    return fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    refresh,
    setData,
  };
}

// Specific hooks for common data
export function useProducts(autoFetch = true) {
  return useData(() => API.getProducts(), { autoFetch });
}

export function useSales(autoFetch = true) {
  return useData(() => API.getSales(), { autoFetch });
}

export function useDebts(autoFetch = true) {
  return useData(() => API.getDebts(), { autoFetch });
}

export function useUsers(autoFetch = true) {
  return useData(() => API.getUsers(), { autoFetch });
}
