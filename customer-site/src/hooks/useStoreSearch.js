import { useState, useCallback } from 'react';
import * as storeService from '../services/storeService';

const useStoreSearch = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchStores = useCallback(async (zipcode, productId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await storeService.searchStores(zipcode, productId);
      setStores(data.stores || data);
      return data.stores || data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to search stores';
      setError(msg);
      setStores([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { stores, loading, error, searchStores };
};

export default useStoreSearch;
