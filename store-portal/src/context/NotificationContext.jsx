import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import orderService from '../services/orderService';
import useAuth from '../hooks/useAuth';

export const NotificationContext = createContext(null);

const POLL_INTERVAL = 8000;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [awaitingCount, setAwaitingCount] = useState(0);
  const previousCountRef = useRef(null);
  const { isAuthenticated } = useAuth();

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      read: false,
      timestamp: new Date().toISOString(),
      ...notification,
    };
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const pollForNewOrders = useCallback(async () => {
    try {
      const data = await orderService.getOrders('AWAITING_STORE_ACCEPTANCE', 1, 1);
      const currentCount = data.pagination?.total ?? data.total ?? data.orders?.length ?? 0;
      setAwaitingCount(currentCount);

      if (previousCountRef.current !== null && currentCount > previousCountRef.current) {
        const newOrders = currentCount - previousCountRef.current;
        const msg = `${newOrders} new order${newOrders > 1 ? 's' : ''} awaiting acceptance`;
        addNotification({ type: 'NEW_ORDER', title: 'New Order Received', message: msg });
        toast.info(`🔔 ${msg}`, {
          autoClose: 8000,
          position: 'top-right',
          onClick: () => { window.location.href = '/orders?status=AWAITING_STORE_ACCEPTANCE'; },
          style: { cursor: 'pointer' },
        });
        window.dispatchEvent(new Event('new-order-received'));
      }
      previousCountRef.current = currentCount;
    } catch {
      // Silently fail polling
    }
  }, [addNotification]);

  useEffect(() => {
    if (!isAuthenticated) return;

    pollForNewOrders();
    const interval = setInterval(pollForNewOrders, POLL_INTERVAL);
    const onAction = () => {
      previousCountRef.current = null;
      pollForNewOrders();
    };
    window.addEventListener('order-action', onAction);
    return () => {
      clearInterval(interval);
      window.removeEventListener('order-action', onAction);
    };
  }, [isAuthenticated, pollForNewOrders]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, awaitingCount, addNotification, markAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
