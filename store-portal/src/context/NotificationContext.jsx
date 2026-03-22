import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import orderService from '../services/orderService';
import returnService from '../services/returnService';
import useAuth from '../hooks/useAuth';

export const NotificationContext = createContext(null);

const POLL_INTERVAL = 8000;

function requestBrowserNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function showBrowserNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'converse-store-order',
        requireInteraction: false,
      });
      n.onclick = () => {
        window.focus();
        window.location.href = '/orders?status=AWAITING_STORE_ACCEPTANCE';
        n.close();
      };
    } catch {
      // Browser doesn't support Notification constructor (e.g., mobile)
    }
  }
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not available
  }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [awaitingCount, setAwaitingCount] = useState(0);
  const [returnRequestCount, setReturnRequestCount] = useState(0);
  const previousCountRef = useRef(null);
  const previousReturnCountRef = useRef(null);
  const pollingRef = useRef(false);
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

  const fireOrderNotification = useCallback((title, msg) => {
    addNotification({ type: 'NEW_ORDER', title, message: msg });
    toast.info(`🔔 ${msg}`, {
      autoClose: 8000,
      position: 'top-center',
      onClick: () => { window.location.href = '/orders?status=AWAITING_STORE_ACCEPTANCE'; },
      style: { cursor: 'pointer', fontWeight: 600 },
    });
    showBrowserNotification(title, msg);
    playNotificationSound();
    window.dispatchEvent(new Event('new-order-received'));
  }, [addNotification]);

  const pollForNewOrders = useCallback(async () => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    try {
      const data = await orderService.getOrders('AWAITING_STORE_ACCEPTANCE', 1, 1, { allStores: true });
      const currentCount = data.pagination?.total ?? data.total ?? data.orders?.length ?? 0;
      setAwaitingCount(currentCount);

      const isFirstPoll = previousCountRef.current === null;
      const hasNewOrders = !isFirstPoll && currentCount > previousCountRef.current;

      if (isFirstPoll && currentCount > 0) {
        const msg = `${currentCount} order${currentCount > 1 ? 's' : ''} awaiting acceptance`;
        fireOrderNotification('Pending Orders', msg);
      } else if (hasNewOrders) {
        const newOrders = currentCount - previousCountRef.current;
        const msg = `${newOrders} new order${newOrders > 1 ? 's' : ''} awaiting acceptance`;
        fireOrderNotification('New Order Received', msg);
      }
      previousCountRef.current = currentCount;

      const returnData = await returnService.getReturns('RETURN_REQUESTED', { allStores: true }).catch(() => null);
      if (returnData) {
        const returnCount = returnData.returns?.length ?? 0;
        setReturnRequestCount(returnCount);

        const isFirstReturnPoll = previousReturnCountRef.current === null;
        const hasNewReturns = !isFirstReturnPoll && returnCount > previousReturnCountRef.current;

        if (isFirstReturnPoll && returnCount > 0) {
          const msg = `${returnCount} return request${returnCount > 1 ? 's' : ''} pending review`;
          addNotification({ type: 'NEW_RETURN', title: 'Pending Returns', message: msg });
          toast.info(`🔔 ${msg}`, { autoClose: 8000, position: 'top-center' });
        } else if (hasNewReturns) {
          const newReturns = returnCount - previousReturnCountRef.current;
          const msg = `${newReturns} new return request${newReturns > 1 ? 's' : ''}`;
          addNotification({ type: 'NEW_RETURN', title: 'New Return Request', message: msg });
          toast.info(`🔔 ${msg}`, { autoClose: 8000, position: 'top-center' });
        }
        previousReturnCountRef.current = returnCount;
      }
    } catch (err) {
      console.warn('[NotificationContext] Polling error:', err);
    } finally {
      pollingRef.current = false;
    }
  }, [addNotification, fireOrderNotification]);

  useEffect(() => {
    if (!isAuthenticated) return;

    requestBrowserNotificationPermission();

    pollForNewOrders();
    const interval = setInterval(pollForNewOrders, POLL_INTERVAL);

    const onVisibilityChange = () => {
      if (!document.hidden) pollForNewOrders();
    };
    const onFocus = () => pollForNewOrders();
    const onAction = () => {
      previousCountRef.current = null;
      previousReturnCountRef.current = null;
      pollForNewOrders();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    window.addEventListener('order-action', onAction);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('order-action', onAction);
    };
  }, [isAuthenticated, pollForNewOrders]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, awaitingCount, returnRequestCount, addNotification, markAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
