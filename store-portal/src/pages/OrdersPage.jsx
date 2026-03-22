import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
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

export default function OrdersPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialStatus = searchParams.get('status') || '';
  const [activeStatus, setActiveStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const { orders, loading, error, totalPages } = useOrders(activeStatus, page);

  const handleTabChange = (status) => {
    setActiveStatus(status);
    setPage(1);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div style={s.tabs}>
        {STATUS_TABS.map(({ key, label }) => (
          <button key={key} style={{ ...s.tab, ...(activeStatus === key ? s.tabActive : {}) }} onClick={() => handleTabChange(key)}>{label}</button>
        ))}
      </div>

      {error ? (
        <div style={s.errorState}>{error}</div>
      ) : orders.length === 0 ? (
        <div style={s.emptyState}>No orders found</div>
      ) : (
        <div style={s.list}>
          {orders.map((order) => {
            const id = order._id || order.id;
            return (
              <div key={id} style={s.card} onClick={() => navigate(`/orders/${id}`)}>
                <div style={s.row}>
                  <div style={s.rowLeft}>
                    <div style={s.orderNum}>{order.orderNumber || `#${id?.slice(-6)}`}</div>
                    <div style={s.custInfo}>
                      <span style={s.custName}>
                        {order.customer?.firstName
                          ? `${order.customer.firstName} ${order.customer.lastName || ''}`
                          : order.customerName || (order.guestFirstName ? `${order.guestFirstName} ${order.guestLastName || ''}` : 'N/A')}
                      </span>
                      {order.isGuest && <span style={s.guestBadge}>GUEST</span>}
                    </div>
                  </div>
                  <div style={s.rowMid}>
                    <span style={s.itemCount}>{order.items?.length || 0} items</span>
                    <span style={s.total}>${(order.totalAmount || order.total || 0).toFixed(2)}</span>
                  </div>
                  <div style={s.rowRight}>
                    <Badge status={order.status} />
                    <span style={s.date}>{formatDateTime(order.createdAt)}</span>
                  </div>
                  <div style={s.chevron}>
                    <FiChevronRight size={18} color="#5C5C60" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div style={s.pagination}>
          <button style={{ ...s.pageBtn, ...(page <= 1 ? s.pageBtnDis : {}) }} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Previous</button>
          <span style={{ fontSize: 13, color: '#5C5C60' }}>Page {page} of {totalPages}</span>
          <button style={{ ...s.pageBtn, ...(page >= totalPages ? s.pageBtnDis : {}) }} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
        </div>
      )}
    </div>
  );
}

const s = {
  tabs: { display: 'flex', gap: 4, marginBottom: 20, backgroundColor: '#1b1b1f', padding: 4, borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.05)' },
  tab: { padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all 220ms ease', backgroundColor: 'transparent', color: '#8E8E92' },
  tabActive: { backgroundColor: '#c8102e', color: '#ffffff' },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  card: { backgroundColor: '#1b1b1f', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', overflow: 'hidden', transition: 'border-color 220ms ease, background-color 150ms ease', cursor: 'pointer' },
  row: { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px' },
  rowLeft: { flex: '1 1 200px', minWidth: 0 },
  orderNum: { fontSize: 13, fontWeight: 700, color: '#E8E8E8', marginBottom: 2 },
  custInfo: { display: 'flex', alignItems: 'center', gap: 6 },
  custName: { fontSize: 12, color: '#8E8E92', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  guestBadge: { fontSize: 9, fontWeight: 700, color: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.08)', padding: '2px 5px', borderRadius: 4 },
  rowMid: { flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 },
  itemCount: { fontSize: 11, color: '#5C5C60' },
  total: { fontSize: 13, fontWeight: 700, color: '#E8E8E8' },
  rowRight: { flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  date: { fontSize: 11, color: '#5C5C60' },
  chevron: { flex: '0 0 auto', padding: '0 4px' },
  emptyState: { textAlign: 'center', padding: 48, color: '#5C5C60', fontSize: 14, backgroundColor: '#1b1b1f', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' },
  errorState: { textAlign: 'center', padding: 48, color: '#f87171', fontSize: 14 },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 20 },
  pageBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1b1b1f', color: '#E8E8E8', fontSize: 12, cursor: 'pointer', fontWeight: 500 },
  pageBtnDis: { opacity: 0.35, cursor: 'not-allowed' },
};
