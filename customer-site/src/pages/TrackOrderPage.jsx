import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiPackage, FiArrowRight } from 'react-icons/fi';
import * as orderService from '../services/orderService';
import { formatCurrency } from '../utils/formatCurrency';

const TrackOrderPage = () => {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await orderService.lookupGuestOrders(email.trim());
      setOrders(result.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to look up orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <FiPackage size={48} color="#6b7280" />
        <h1 style={styles.title}>Track Your Order</h1>
        <p style={styles.subtitle}>Enter the email you used at checkout to find your orders.</p>

        <form onSubmit={handleLookup} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button style={styles.searchBtn} type="submit" disabled={loading}>
            <FiSearch size={18} />
            {loading ? 'Searching...' : 'Find Orders'}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        {orders !== null && orders.length === 0 && (
          <p style={styles.noResults}>No orders found for this email.</p>
        )}

        {orders && orders.length > 0 && (
          <div style={styles.results}>
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}?email=${encodeURIComponent(email)}`}
                style={styles.orderCard}
              >
                <div>
                  <div style={styles.orderNum}>#{order.orderNumber}</div>
                  <div style={styles.orderMeta}>
                    {order.items?.length || 0} item(s) · {formatCurrency(order.total)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={styles.status}>{order.status?.replace(/_/g, ' ')}</span>
                  <div style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <FiArrowRight size={16} color="#9ca3af" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { padding: '60px 24px', minHeight: '70vh', backgroundColor: 'transparent' },
  container: { maxWidth: 560, margin: '0 auto', textAlign: 'center' },
  title: { fontSize: 28, fontWeight: 800, marginTop: 16, color: '#E8E8E8' },
  subtitle: { fontSize: 15, color: '#5C5C60', marginBottom: 28 },
  form: { display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  input: { flex: '1 1 280px', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', fontSize: 15, outline: 'none', backgroundColor: '#19191d', color: '#E8E8E8', transition: 'border-color 220ms ease' },
  searchBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 8, border: 'none', backgroundColor: '#c8102e', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'opacity 220ms ease' },
  error: { color: '#f87171', fontSize: 14 },
  noResults: { color: '#5C5C60', fontSize: 15, marginTop: 20 },
  results: { display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', marginTop: 16 },
  orderCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: '#1b1b1f', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', color: '#E8E8E8', transition: 'box-shadow 220ms ease', gap: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  orderNum: { fontWeight: 700, fontSize: 15 },
  orderMeta: { fontSize: 13, color: '#5C5C60', marginTop: 2 },
  status: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.08)', padding: '3px 8px', borderRadius: 4 },
  orderDate: { fontSize: 12, color: '#5C5C60', marginTop: 4 },
};

export default TrackOrderPage;
