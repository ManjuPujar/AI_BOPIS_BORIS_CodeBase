import { useState, useEffect, useCallback } from 'react';
import returnService from '../services/returnService';

export default function useReturns(status = '') {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await returnService.getReturns(status);
      setReturns(data.returns || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  return { returns, loading, error, refetch: fetchReturns };
}
