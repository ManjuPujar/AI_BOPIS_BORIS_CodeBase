import { useState, useEffect, useCallback, useRef } from 'react';
import orderService from '../services/orderService';

export default function useOrders(status = '', page = 1, limit = 20) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const mountedRef = useRef(true);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await orderService.getOrders(status, page, limit);
      if (mountedRef.current) {
        setOrders(data.orders || []);
        setTotalPages(data.pagination?.pages || data.totalPages || Math.ceil((data.pagination?.total || data.total || 0) / limit));
      }
    } catch (err) {
      if (mountedRef.current && !silent) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      }
    } finally {
      if (mountedRef.current && !silent) {
        setLoading(false);
      }
    }
  }, [status, page, limit]);

  useEffect(() => {
    mountedRef.current = true;
    fetchOrders();
    return () => { mountedRef.current = false; };
  }, [fetchOrders]);

  useEffect(() => {
    const onNewOrder = () => fetchOrders(true);
    window.addEventListener('new-order-received', onNewOrder);
    window.addEventListener('order-action', onNewOrder);
    return () => {
      window.removeEventListener('new-order-received', onNewOrder);
      window.removeEventListener('order-action', onNewOrder);
    };
  }, [fetchOrders]);

  return { orders, loading, error, totalPages, refetch: fetchOrders };
}
