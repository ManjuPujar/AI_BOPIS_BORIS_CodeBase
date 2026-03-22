import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRotateCcw } from 'react-icons/fi';
import useReturns from '../hooks/useReturns';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import { formatDateTime } from '../utils/formatDate';

const STATUS_TABS = [
  { key: '', label: 'All Returns' },
  { key: 'RETURN_REQUESTED', label: 'Requested' },
  { key: 'RETURN_ACCEPTED', label: 'Accepted' },
  { key: 'RETURN_VERIFIED_PASS', label: 'Verified' },
  { key: 'RETURN_COMPLETED', label: 'Completed' },
  { key: 'RETURN_REJECTED', label: 'Rejected' },
];

export default function ReturnsPage() {
  const [activeStatus, setActiveStatus] = useState('');
  const { returns, loading, error } = useReturns(activeStatus);
  const navigate = useNavigate();

  if (loading) return <Loader />;

  return (
    <div>
      <div style={s.tabs}>
        {STATUS_TABS.map(({ key, label }) => (
          <button key={key} style={{ ...s.tab, ...(activeStatus === key ? s.tabActive : {}) }} onClick={() => setActiveStatus(key)}>{label}</button>
        ))}
      </div>

      {error ? (
        <div style={s.errorState}>{error}</div>
      ) : returns.length === 0 ? (
        <div style={s.emptyState}>
          <FiRotateCcw size={32} color="#5C5C60" style={{ marginBottom: 12 }} />
          <div>No returns found</div>
        </div>
      ) : (
        <div style={s.list}>
          {returns.map((ret) => {
            const id = ret._id || ret.id;
            const customerName = ret.customerId?.firstName
              ? `${ret.customerId.firstName} ${ret.customerId.lastName || ''}`
              : ret.customerName || 'N/A';
            return (
              <div key={id} style={s.card} onClick={() => navigate(`/returns/${id}`)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(200,16,46,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
              >
                <div style={s.row}>
                  <div style={s.rowLeft}>
                    <div style={s.returnNum}>{ret.returnNumber || `R-${id?.slice(-6)}`}</div>
                    <div style={s.custName}>{customerName}</div>
                  </div>
                  <div style={s.rowMid}>
                    <span style={s.orderRef}>Order: {ret.orderId?.orderNumber || 'N/A'}</span>
                    <span style={s.reason}>{ret.reason ? (ret.reason.length > 40 ? ret.reason.slice(0, 40) + '...' : ret.reason) : 'No reason'}</span>
                  </div>
                  <div style={s.rowMeta}>
                    <span style={s.itemCount}>{ret.items?.length || 0} items</span>
                    {ret.refundAmount > 0 && <span style={s.refund}>${ret.refundAmount.toFixed(2)}</span>}
                  </div>
                  <div style={s.rowRight}>
                    <Badge status={ret.status} />
                    <span style={s.date}>{formatDateTime(ret.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  tabs: { display: 'flex', gap: 4, marginBottom: 20, backgroundColor: '#1b1b1f', padding: 4, borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' },
  tab: { padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all 220ms ease', backgroundColor: 'transparent', color: '#8E8E92' },
  tabActive: { backgroundColor: '#c8102e', color: '#ffffff' },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  card: { backgroundColor: '#1b1b1f', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', cursor: 'pointer', transition: 'border-color 220ms ease' },
  row: { display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' },
  rowLeft: { flex: '1 1 180px', minWidth: 0 },
  returnNum: { fontSize: 13, fontWeight: 700, color: '#E8E8E8', marginBottom: 2 },
  custName: { fontSize: 12, color: '#8E8E92', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowMid: { flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 2 },
  orderRef: { fontSize: 12, color: '#E8E8E8', fontWeight: 600 },
  reason: { fontSize: 11, color: '#5C5C60' },
  rowMeta: { flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 },
  itemCount: { fontSize: 11, color: '#5C5C60' },
  refund: { fontSize: 13, fontWeight: 700, color: '#34d399' },
  rowRight: { flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  date: { fontSize: 11, color: '#5C5C60' },
  emptyState: { textAlign: 'center', padding: 48, color: '#5C5C60', fontSize: 14, backgroundColor: '#1b1b1f', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' },
  errorState: { textAlign: 'center', padding: 48, color: '#f87171', fontSize: 14 },
};
