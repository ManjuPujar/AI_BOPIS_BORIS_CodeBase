import { useState, useEffect, useCallback } from 'react';
import * as orderService from '../services/orderService';

const POLL_INTERVAL = 30000;

const useOrderStatus = (orderId, guestEmail) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const data = await orderService.getOrderById(orderId, guestEmail || undefined);
      setOrder(data.order || data);
      setError(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch order';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [orderId, guestEmail]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  return { order, loading, error };
};

export default useOrderStatus;
