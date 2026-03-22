import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiCheck, FiCheckCircle, FiX, FiShield, FiSlash } from 'react-icons/fi';
import useReturns from '../hooks/useReturns';
import returnService from '../services/returnService';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import { formatDateTime } from '../utils/formatDate';

const STATUS_TABS = [
  { key: '', label: 'All Returns' },
  { key: 'RETURN_REQUESTED', label: 'Requested' },
  { key: 'RETURN_ACCEPTED', label: 'Accepted' },
  { key: 'RETURN_COMPLETED', label: 'Completed' },
  { key: 'RETURN_REJECTED', label: 'Rejected' },
];

const styles = {
  tabs: { display: 'flex', gap: 4, marginBottom: 20, backgroundColor: '#1b1b1f', padding: 4, borderRadius: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.05)' },
  tab: { padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all 220ms ease', backgroundColor: 'transparent', color: '#8E8E92' },
  tabActive: { backgroundColor: '#c8102e', color: '#ffffff' },
  table: { width: '100%', backgroundColor: '#1b1b1f', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', borderCollapse: 'collapse', border: '1px solid rgba(255,255,255,0.05)' },
  th: { textAlign: 'left', padding: '14px 20px', fontSize: 11, fontWeight: 600, color: '#5C5C60', textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.12)' },
  td: { padding: '14px 20px', fontSize: 13, color: '#8E8E92', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  actionBtn: { padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 8, transition: 'opacity 220ms ease' },
  acceptBtn: { backgroundColor: '#c8102e', color: '#ffffff' },
  completeBtn: { backgroundColor: '#10b981', color: '#ffffff' },
  rejectBtn: { backgroundColor: '#ef4444', color: '#ffffff' },
  verifyPassBtn: { backgroundColor: '#3b82f6', color: '#ffffff' },
  verifyFailBtn: { backgroundColor: '#f59e0b', color: '#ffffff' },
  cancelBtn: { backgroundColor: '#6b7280', color: '#ffffff' },
  emptyState: { textAlign: 'center', padding: 48, color: '#5C5C60', fontSize: 14 },
};

const modalStyles = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: '#1b1b1f', borderRadius: 14, padding: 28,
    maxWidth: 420, width: '90%', boxShadow: '0 16px 48px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)',
  },
};

export default function ReturnsPage() {
  const [activeStatus, setActiveStatus] = useState('');
  const { returns, loading, error, refetch } = useReturns(activeStatus);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleAccept = async (returnId) => {
    setActionLoading(returnId);
    try {
      await returnService.acceptReturn(returnId);
      toast.success('Return accepted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept return');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (returnId) => {
    setActionLoading(returnId);
    try {
      await returnService.completeReturn(returnId);
      toast.success('Return completed');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete return');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget);
    try {
      await returnService.rejectReturn(rejectTarget, rejectReason);
      toast.success('Return rejected');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject return');
    } finally {
      setActionLoading(null);
      setRejectTarget(null);
      setRejectReason('');
    }
  };

  const handleVerify = async (returnId, passed) => {
    setActionLoading(returnId);
    try {
      await returnService.verifyReturn(returnId, passed);
      toast.success(passed ? 'Product verified — passed' : 'Product verification failed');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (returnId) => {
    if (!window.confirm('Are you sure you want to cancel this return?')) return;
    setActionLoading(returnId);
    try {
      await returnService.cancelReturn(returnId);
      toast.success('Return cancelled');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div style={styles.tabs}>
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            style={{ ...styles.tab, ...(activeStatus === key ? styles.tabActive : {}) }}
            onClick={() => setActiveStatus(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#f87171', fontSize: 14 }}>{error}</div>
      ) : returns.length === 0 ? (
        <div style={{ ...styles.table, ...styles.emptyState }}>No returns found</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Return #</th>
              <th style={styles.th}>Order #</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Reason</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((ret) => {
              const returnId = ret._id || ret.id;
              const isLoading = actionLoading === returnId;
              return (
                <tr key={returnId}>
                  <td style={{ ...styles.td, fontWeight: 600, color: '#E8E8E8' }}>
                    {ret.returnNumber || `R-${returnId?.slice(-6)}`}
                  </td>
                  <td style={styles.td}>
                    {ret.orderNumber || ret.order?.orderNumber || 'N/A'}
                  </td>
                  <td style={styles.td}>
                    {ret.customer?.firstName
                      ? `${ret.customer.firstName} ${ret.customer.lastName || ''}`
                      : ret.customerName || 'N/A'}
                  </td>
                  <td style={{ ...styles.td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ret.reason || 'No reason provided'}
                  </td>
                  <td style={styles.td}>
                    <Badge status={ret.status} />
                  </td>
                  <td style={{ ...styles.td, color: '#5C5C60', fontSize: 13 }}>
                    {formatDateTime(ret.createdAt)}
                  </td>
                  <td style={styles.td}>
                    {ret.status === 'RETURN_REQUESTED' && (
                      <>
                        <button
                          style={{ ...styles.actionBtn, ...styles.acceptBtn, ...(isLoading ? { opacity: 0.5 } : {}) }}
                          onClick={() => handleAccept(returnId)}
                          disabled={isLoading}
                        >
                          <FiCheck size={14} /> Accept
                        </button>
                        <button
                          style={{ ...styles.actionBtn, ...styles.rejectBtn, ...(isLoading ? { opacity: 0.5 } : {}) }}
                          onClick={() => setRejectTarget(returnId)}
                          disabled={isLoading}
                        >
                          <FiX size={14} /> Reject
                        </button>
                      </>
                    )}
                    {ret.status === 'RETURN_ACCEPTED' && (
                      <>
                        <button
                          style={{ ...styles.actionBtn, ...styles.completeBtn, ...(isLoading ? { opacity: 0.5 } : {}) }}
                          onClick={() => handleComplete(returnId)}
                          disabled={isLoading}
                        >
                          <FiCheckCircle size={14} /> Complete
                        </button>
                        <button
                          style={{ ...styles.actionBtn, ...styles.verifyPassBtn, ...(isLoading ? { opacity: 0.5 } : {}) }}
                          onClick={() => handleVerify(returnId, true)}
                          disabled={isLoading}
                        >
                          <FiShield size={14} /> Verify (Pass)
                        </button>
                        <button
                          style={{ ...styles.actionBtn, ...styles.verifyFailBtn, ...(isLoading ? { opacity: 0.5 } : {}) }}
                          onClick={() => handleVerify(returnId, false)}
                          disabled={isLoading}
                        >
                          <FiShield size={14} /> Verify (Fail)
                        </button>
                        <button
                          style={{ ...styles.actionBtn, ...styles.cancelBtn, ...(isLoading ? { opacity: 0.5 } : {}) }}
                          onClick={() => handleCancel(returnId)}
                          disabled={isLoading}
                        >
                          <FiSlash size={14} /> Cancel
                        </button>
                      </>
                    )}
                    {!['RETURN_REQUESTED', 'RETURN_ACCEPTED'].includes(ret.status) && (
                      <span style={{ color: '#5C5C60', fontSize: 13 }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {rejectTarget && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3 style={{ marginBottom: 14, color: '#E8E8E8' }}>Reject Return</h3>
            <label style={{ fontSize: 13, color: '#8E8E92' }}>Reason for rejection:</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, marginTop: 6, marginBottom: 14, backgroundColor: '#19191d', color: '#E8E8E8' }}
              placeholder="Enter reason..."
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setRejectTarget(null); setRejectReason(''); }} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', cursor: 'pointer', color: '#8E8E92', fontWeight: 600, fontSize: 13 }}>Cancel</button>
              <button onClick={handleReject} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
