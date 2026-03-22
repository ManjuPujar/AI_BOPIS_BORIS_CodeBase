import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useOrders from '../hooks/useOrders';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import { formatDateTime } from '../utils/formatDate';

const STATUS_TABS = [
  { key: '', label: 'All Orders' },
  { key: 'AWAITING_STORE_ACCEPTANCE', label: 'Awaiting' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'READY_FOR_PICKUP', label: 'Ready' },
  { key: 'OTP_VERIFIED', label: 'OTP Verified' },
  { key: 'COMPLETED', label: 'Completed' },
];

const styles = {
  tabs: { display: 'flex', gap: 4, marginBottom: 20, backgroundColor: '#1b1b1f', padding: 4, borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.05)' },
  tab: { padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all 220ms ease', backgroundColor: 'transparent', color: '#8E8E92' },
  tabActive: { backgroundColor: '#c8102e', color: '#ffffff' },
  table: { width: '100%', backgroundColor: '#1b1b1f', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', borderCollapse: 'collapse', border: '1px solid rgba(255,255,255,0.05)' },
  th: { textAlign: 'left', padding: '14px 20px', fontSize: 11, fontWeight: 600, color: '#5C5C60', textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.12)' },
  td: { padding: '14px 20px', fontSize: 13, color: '#8E8E92', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  row: { cursor: 'pointer', transition: 'background-color 150ms ease' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 },
  pageButton: { padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1b1b1f', color: '#E8E8E8', fontSize: 12, cursor: 'pointer', fontWeight: 500, transition: 'all 220ms ease' },
  pageButtonDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  emptyState: { textAlign: 'center', padding: 48, color: '#5C5C60', fontSize: 14 },
  errorState: { textAlign: 'center', padding: 48, color: '#f87171', fontSize: 14 },
};

export default function OrdersPage() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  const [activeStatus, setActiveStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const { orders, loading, error, totalPages } = useOrders(activeStatus, page);
  const navigate = useNavigate();

  const handleTabChange = (status) => {
    setActiveStatus(status);
    setPage(1);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div style={styles.tabs}>
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            style={{ ...styles.tab, ...(activeStatus === key ? styles.tabActive : {}) }}
            onClick={() => handleTabChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <div style={styles.errorState}>{error}</div>
      ) : orders.length === 0 ? (
        <div style={{ ...styles.table, ...styles.emptyState }}>No orders found</div>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Order #</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Items</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id || order.id}
                  style={styles.row}
                  onClick={() => navigate(`/orders/${order._id || order.id}`)}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td style={{ ...styles.td, fontWeight: 600, color: '#E8E8E8' }}>
                    {order.orderNumber || `#${(order._id || order.id)?.slice(-6)}`}
                  </td>
                  <td style={styles.td}>
                    <div>
                      {order.customer?.firstName
                        ? `${order.customer.firstName} ${order.customer.lastName || ''}`
                        : order.customerName
                          || (order.guestFirstName ? `${order.guestFirstName} ${order.guestLastName || ''}` : '')
                          || 'N/A'}
                    </div>
                    {order.isGuest && (
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.08)', padding: '2px 6px', borderRadius: 4, marginTop: 2, display: 'inline-block' }}>
                        GUEST
                      </span>
                    )}
                    {(order.customerEmail || order.guestEmail) && (
                      <div style={{ fontSize: 11, color: '#5C5C60', marginTop: 1 }}>
                        {order.customerEmail || order.guestEmail}
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>{order.items?.length || 0} items</td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>
                    ${(order.totalAmount || order.total || 0).toFixed(2)}
                  </td>
                  <td style={styles.td}>
                    <Badge status={order.status} />
                  </td>
                  <td style={{ ...styles.td, color: '#5C5C60', fontSize: 13 }}>
                    {formatDateTime(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                style={{ ...styles.pageButton, ...(page <= 1 ? styles.pageButtonDisabled : {}) }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </button>
              <span style={{ fontSize: 13, color: '#5C5C60' }}>
                Page {page} of {totalPages}
              </span>
              <button
                style={{ ...styles.pageButton, ...(page >= totalPages ? styles.pageButtonDisabled : {}) }}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
