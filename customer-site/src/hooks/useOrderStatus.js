import { useState, useEffect, useCallback, useRef } from 'react';
import * as orderService from '../services/orderService';

const POLL_INTERVAL = 10000;

const TERMINAL_STATUSES = ['COMPLETED', 'CANCELLED', 'REJECTED'];

const useOrderStatus = (orderId, guestEmail) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);
  const orderRef = useRef(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId || fetchingRef.current) return;
    if (orderRef.current && TERMINAL_STATUSES.includes(orderRef.current.status)) return;

    fetchingRef.current = true;
    try {
      const data = await orderService.getOrderById(orderId, guestEmail || undefined);
      const fetched = data.order || data;
      setOrder(fetched);
      orderRef.current = fetched;
      setError(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch order';
      setError(msg);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [orderId, guestEmail]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, POLL_INTERVAL);

    const onVisible = () => { if (!document.hidden) fetchOrder(); };
    const onFocus = () => fetchOrder();

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchOrder]);

  return { order, loading, error, refetch: fetchOrder };
};

export default useOrderStatus;
