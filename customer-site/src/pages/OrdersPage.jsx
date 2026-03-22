import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight, FiBox, FiRotateCcw } from 'react-icons/fi';
import * as orderService from '../services/orderService';
import { formatCurrency } from '../utils/formatCurrency';

const REFRESH_INTERVAL = 15000;

const statusColors = {
  PLACED: { bg: '#1e3a5f', color: '#93c5fd' },
  AWAITING_STORE_ACCEPTANCE: { bg: '#422006', color: '#fbbf24' },
  ACCEPTED: { bg: '#064e3b', color: '#6ee7b7' },
  REJECTED: { bg: '#450a0a', color: '#fca5a5' },
  READY_FOR_PICKUP: { bg: '#3730a3', color: '#c4b5fd' },
  OTP_VERIFIED: { bg: '#4c1d95', color: '#a78bfa' },
  PICKED_UP: { bg: '#064e3b', color: '#6ee7b7' },
  COMPLETED: { bg: '#064e3b', color: '#6ee7b7' },
  CANCELLED: { bg: '#450a0a', color: '#fca5a5' },
  RETURN_REQUESTED: { bg: '#422006', color: '#fbbf24' },
  RETURN_ACCEPTED: { bg: '#1e3a5f', color: '#93c5fd' },
  RETURN_COMPLETED: { bg: '#1b1b1f', color: '#8E8E92' },
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fetchingRef = useRef(false);

  const fetchOrders = useCallback(async (silent = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (!silent) setLoading(true);
    try {
      const data = await orderService.getMyOrders(page, 10);
      setOrders(data.orders || data || []);
      setTotalPages(data.pagination?.pages || data.totalPages || 1);
    } catch {
      if (!silent) setOrders([]);
    } finally {
      if (!silent) setLoading(false);
      fetchingRef.current = false;
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), REFRESH_INTERVAL);

    const onVisible = () => { if (!document.hidden) fetchOrders(true); };
    const onFocus = () => fetchOrders(true);

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchOrders]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatStatus = (status) =>
    (status || 'pending').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>My Orders</h1>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={styles.skeleton} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>My Orders</h1>
        {orders.length === 0 ? (
          <div style={styles.empty}>
            <FiPackage size={48} color="#5C5C60" />
            <h3>No orders yet</h3>
            <p style={styles.emptyText}>Start shopping to see your orders here.</p>
            <Link to="/products" style={styles.shopBtn}>Shop Now</Link>
          </div>
        ) : (
          <div style={styles.list}>
            {orders.map((order) => {
              const sc = statusColors[order.status] || { bg: '#1b1b1f', color: '#8E8E92' };
              return (
                <Link
                  key={order._id || order.id}
                  to={`/orders/${order._id || order.id}`}
                  style={styles.orderCard}
                >
                  <div style={styles.orderHeader}>
                    <div>
                      <span style={styles.orderId}>
                        Order #{(order.orderNumber || order._id || order.id).toString().slice(-8).toUpperCase()}
                      </span>
                      <span style={styles.orderDate}>{formatDate(order.createdAt)}</span>
                    </div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: sc.bg,
                        color: sc.color,
                      }}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div style={styles.orderItems}>
                    {(order.items || []).slice(0, 3).map((item, i) => (
                      <div key={i} style={styles.orderItem}>
                        <div style={styles.orderItemImg}>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <FiBox size={18} color="#5C5C60" />
                          )}
                        </div>
                        <span style={styles.orderItemName}>{item.productName}</span>
                      </div>
                    ))}
                    {(order.items || []).length > 3 && (
                      <span style={styles.moreItems}>+{order.items.length - 3} more</span>
                    )}
                  </div>
                  <div style={styles.orderFooter}>
                    <span style={styles.orderTotal}>
                      {formatCurrency(order.total)} &middot; {(order.items || []).reduce((s, i) => s + (i.quantity || 1), 0)} items
                    </span>
                    <div style={styles.orderActions}>
                      {order.status === 'COMPLETED' && (
                        <Link
                          to={`/returns/${order._id || order.id}`}
                          style={styles.returnLink}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiRotateCcw size={12} /> Return
                        </Link>
                      )}
                      <FiChevronRight size={18} color="#5C5C60" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              style={styles.pageBtn}
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >Previous</button>
            <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
            <button
              style={styles.pageBtn}
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { padding: '32px 24px 64px', backgroundColor: 'transparent', minHeight: '80vh' },
  container: { maxWidth: 800, margin: '0 auto' },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 32, color: '#E8E8E8' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  orderCard: { display: 'block', backgroundColor: '#1b1b1f', borderRadius: 12, padding: 20, border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', color: 'inherit', transition: 'box-shadow 220ms ease', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  orderId: { display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 2, color: '#E8E8E8' },
  orderDate: { fontSize: 12, color: '#5C5C60' },
  statusBadge: { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5 },
  orderItems: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' },
  orderItem: { display: 'flex', alignItems: 'center', gap: 8 },
  orderItemImg: { width: 40, height: 40, borderRadius: 6, overflow: 'hidden', backgroundColor: '#141417', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  orderItemName: { fontSize: 13, fontWeight: 500, color: '#8E8E92' },
  moreItems: { fontSize: 12, color: '#5C5C60' },
  orderFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 },
  orderTotal: { fontSize: 14, fontWeight: 600, color: '#E8E8E8' },
  orderActions: { display: 'flex', alignItems: 'center', gap: 12 },
  returnLink: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#E8E8E8', padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', textDecoration: 'none', backgroundColor: 'rgba(255,255,255,0.04)', transition: 'background-color 220ms ease' },
  empty: { textAlign: 'center', padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14, color: '#5C5C60' },
  shopBtn: { display: 'inline-block', backgroundColor: '#c8102e', color: '#fff', padding: '12px 32px', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none', marginTop: 8, transition: 'opacity 220ms ease' },
  skeleton: { height: 120, backgroundColor: '#161619', borderRadius: 12, marginBottom: 12 },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32 },
  pageBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1b1b1f', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: '#E8E8E8', transition: 'border-color 220ms ease' },
  pageInfo: { fontSize: 13, color: '#5C5C60' },
};

export default OrdersPage;
