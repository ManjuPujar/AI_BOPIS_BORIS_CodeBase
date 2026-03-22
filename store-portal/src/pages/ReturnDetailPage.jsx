import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiCheckCircle, FiX, FiShield, FiSlash, FiPackage, FiUser, FiMail, FiPhone, FiClock, FiAlertCircle, FiRotateCcw, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';
import returnService from '../services/returnService';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import { formatDateTime } from '../utils/formatDate';

const RETURN_TIMELINE_STEPS = [
  { key: 'RETURN_REQUESTED', label: 'Return Requested', icon: FiRotateCcw },
  { key: 'RETURN_ACCEPTED', label: 'Accepted by Store', icon: FiCheck },
  { key: 'RETURN_VERIFIED_PASS', label: 'Product Verified', icon: FiShield },
  { key: 'RETURN_COMPLETED', label: 'Return Complete', icon: FiCheckCircle },
];

const STATUS_ORDER = [
  'RETURN_REQUESTED',
  'RETURN_ACCEPTED',
  'RETURN_VERIFICATION_PENDING',
  'RETURN_VERIFIED_PASS',
  'RETURN_VERIFIED_FAIL',
  'RETURN_COMPLETED',
  'RETURN_REJECTED',
  'RETURN_CANCELLED',
];

export default function ReturnDetailPage() {
  const { returnId } = useParams();
  const navigate = useNavigate();
  const [ret, setRet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const fetchReturn = useCallback(async () => {
    try {
      const data = await returnService.getReturnById(returnId);
      const fresh = data?.return || data;
      if (fresh && fresh._id) setRet(fresh);
    } catch {
      if (loading) {
        toast.error('Failed to load return details');
        navigate('/returns');
      }
    } finally {
      setLoading(false);
    }
  }, [returnId, navigate, loading]);

  useEffect(() => { fetchReturn(); }, [returnId]);

  const applyStatus = useCallback((newStatus, msg) => {
    setRet((prev) => {
      if (!prev) return prev;
      return { ...prev, status: newStatus };
    });
    setActionLoading(false);
    toast.success(msg);
    window.dispatchEvent(new Event('order-action'));
    setTimeout(async () => {
      try {
        const data = await returnService.getReturnById(returnId);
        const fresh = data?.return || data;
        if (fresh && fresh._id) setRet(fresh);
      } catch { /* silent background refresh */ }
    }, 800);
  }, [returnId]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      const result = await returnService.acceptReturn(returnId);
      applyStatus(result?.status || 'RETURN_ACCEPTED', 'Return accepted. Customer will be notified to bring items to store.');
    } catch (err) {
      setActionLoading(false);
      toast.error(err.response?.data?.message || 'Failed to accept return');
    }
  };

  const handleVerify = async (passed) => {
    setActionLoading(true);
    try {
      const result = await returnService.verifyReturn(returnId, passed);
      const expectedStatus = passed ? 'RETURN_VERIFIED_PASS' : 'RETURN_VERIFIED_FAIL';
      const msg = passed ? 'Product verified — passed inspection. You can now complete the return.' : 'Product verification failed.';
      applyStatus(result?.status || expectedStatus, msg);
    } catch (err) {
      setActionLoading(false);
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      const result = await returnService.completeReturn(returnId);
      applyStatus(result?.status || 'RETURN_COMPLETED', 'Return completed. Refund will be processed.');
    } catch (err) {
      setActionLoading(false);
      toast.error(err.response?.data?.message || 'Failed to complete return');
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const result = await returnService.rejectReturn(returnId, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      applyStatus(result?.status || 'RETURN_REJECTED', 'Return rejected. Customer notified.');
    } catch (err) {
      setActionLoading(false);
      toast.error(err.response?.data?.message || 'Failed to reject return');
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const result = await returnService.cancelReturn(returnId, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      applyStatus(result?.status || 'RETURN_CANCELLED', 'Return cancelled.');
    } catch (err) {
      setActionLoading(false);
      toast.error(err.response?.data?.message || 'Failed to cancel return');
    }
  };

  if (loading) return <Loader />;
  if (!ret) return null;

  const customerName = ret.customerId?.firstName
    ? `${ret.customerId.firstName} ${ret.customerId.lastName || ''}`.trim()
    : 'N/A';

  const currentIdx = STATUS_ORDER.indexOf(ret.status);
  const isTerminal = ['RETURN_COMPLETED', 'RETURN_REJECTED', 'RETURN_CANCELLED'].includes(ret.status);
  const isFailed = ['RETURN_REJECTED', 'RETURN_CANCELLED', 'RETURN_VERIFIED_FAIL'].includes(ret.status);

  const getTimelineStepIndex = () => {
    if (ret.status === 'RETURN_COMPLETED') return 3;
    if (ret.status === 'RETURN_VERIFIED_PASS') return 2;
    if (ret.status === 'RETURN_VERIFICATION_PENDING') return 2;
    if (ret.status === 'RETURN_ACCEPTED') return 1;
    if (ret.status === 'RETURN_REQUESTED') return 0;
    return -1;
  };
  const timelineIdx = getTimelineStepIndex();

  return (
    <div>
      <button style={st.backBtn} onClick={() => navigate('/returns')}>
        <FiArrowLeft size={16} /> Back to Returns
      </button>

      {/* Header */}
      <div style={st.headerRow}>
        <div>
          <h1 style={st.returnNumber}>{ret.returnNumber || `Return #${returnId.slice(-6)}`}</h1>
          <span style={{ fontSize: 13, color: '#5C5C60' }}>
            Order: {ret.orderId?.orderNumber || 'N/A'} · {formatDateTime(ret.createdAt)}
          </span>
        </div>
        <Badge status={ret.status} />
      </div>

      {/* Return Timeline */}
      {!isFailed && (
        <div style={st.timelineBar}>
          {RETURN_TIMELINE_STEPS.map((step, i) => {
            const isActive = i <= timelineIdx;
            const isCurrent = i === timelineIdx;
            const StepIcon = step.icon;
            return (
              <div key={step.key} style={st.timelineStep}>
                <div style={{
                  ...st.timelineDot,
                  backgroundColor: isActive ? '#E8E8E8' : 'rgba(255,255,255,0.05)',
                  ...(isCurrent ? { boxShadow: '0 0 0 4px rgba(232,232,232,0.15)', transform: 'scale(1.1)' } : {}),
                }}>
                  {isActive ? <StepIcon size={14} color="#1b1b1f" /> : <span style={{ fontSize: 11, color: '#5C5C60' }}>{i + 1}</span>}
                </div>
                {i < RETURN_TIMELINE_STEPS.length - 1 && (
                  <div style={{ ...st.timelineStepLine, backgroundColor: i < timelineIdx ? '#E8E8E8' : 'rgba(255,255,255,0.05)' }} />
                )}
                <span style={{ ...st.timelineLabel, color: isActive ? '#E8E8E8' : '#5C5C60', fontWeight: isCurrent ? 700 : 400 }}>{step.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejected / Failed banner */}
      {ret.status === 'RETURN_REJECTED' && (
        <div style={st.alertBanner}><FiX size={18} /> Return was rejected. {ret.notes && <span style={{ fontWeight: 400 }}>— {ret.notes}</span>}</div>
      )}
      {ret.status === 'RETURN_CANCELLED' && (
        <div style={st.alertBanner}><FiSlash size={18} /> Return was cancelled. {ret.notes && <span style={{ fontWeight: 400 }}>— {ret.notes}</span>}</div>
      )}
      {ret.status === 'RETURN_VERIFIED_FAIL' && (
        <div style={{ ...st.alertBanner, backgroundColor: 'rgba(245,158,11,0.08)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.15)' }}>
          <FiAlertCircle size={18} /> Product verification failed. The return cannot be completed.
        </div>
      )}

      <div style={st.grid}>
        {/* Left column */}
        <div>
          {/* Return Items */}
          <div style={st.card}>
            <h3 style={st.cardTitle}><FiPackage size={16} /> Return Items</h3>
            {(ret.items || []).map((item, i) => (
              <div key={i} style={st.itemRow}>
                <div style={st.itemThumb}><FiPackage size={18} color="#5C5C60" /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#E8E8E8' }}>{item.productName || 'Product'}</div>
                  <div style={{ fontSize: 12, color: '#5C5C60' }}>
                    {item.sku && <span style={{ fontFamily: 'monospace' }}>{item.sku}</span>}
                    {item.size && ` · Size ${item.size}`}{item.color && ` · ${item.color}`} · Qty {item.quantity || 1}
                    {item.condition && ` · Condition: ${item.condition.replace('_', ' ')}`}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#E8E8E8' }}>${(item.unitPrice * (item.quantity || 1)).toFixed(2)}</div>
              </div>
            ))}
            {ret.refundAmount != null && ret.refundAmount > 0 && (
              <div style={st.totalRow}>
                <span style={{ color: '#8E8E92', fontWeight: 600 }}>Refund Amount</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#34d399' }}>${ret.refundAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Reason */}
          <div style={st.card}>
            <h3 style={st.cardTitle}><FiAlertCircle size={16} /> Return Reason</h3>
            <p style={{ fontSize: 14, color: '#E8E8E8', margin: 0, lineHeight: 1.6 }}>{ret.reason || 'No reason provided'}</p>
          </div>

          {/* Actions */}
          <div style={st.card}>
            <h3 style={st.cardTitle}><FiCheck size={16} /> Actions</h3>

            {ret.status === 'RETURN_REQUESTED' && (
              <div>
                <div style={st.actionInfo}>
                  <FiClock size={16} color="#f59e0b" />
                  <span>Customer is waiting for your response. Accept to allow them to bring items to store, or reject.</span>
                </div>
                <div style={st.btnRow}>
                  <button style={{ ...st.btn, ...st.acceptBtn, ...(actionLoading ? st.dis : {}) }} onClick={handleAccept} disabled={actionLoading}><FiCheck size={16} /> Accept Return</button>
                  <button style={{ ...st.btn, ...st.rejectBtn, ...(actionLoading ? st.dis : {}) }} onClick={() => setShowRejectModal(true)} disabled={actionLoading}><FiX size={16} /> Reject Return</button>
                </div>
              </div>
            )}

            {ret.status === 'RETURN_ACCEPTED' && (
              <div>
                <div style={st.actionInfo}>
                  <FiShield size={16} color="#c4b5fd" />
                  <span>When the customer brings the items, inspect them and verify. Verification is required before completing the return.</span>
                </div>
                <div style={st.btnRow}>
                  <button style={{ ...st.btn, ...st.verifyPassBtn, ...(actionLoading ? st.dis : {}) }} onClick={() => handleVerify(true)} disabled={actionLoading}><FiShield size={16} /> Verify — Pass</button>
                  <button style={{ ...st.btn, ...st.verifyFailBtn, ...(actionLoading ? st.dis : {}) }} onClick={() => handleVerify(false)} disabled={actionLoading}><FiShield size={16} /> Verify — Fail</button>
                  <button style={{ ...st.btn, ...st.cancelBtnStyle, ...(actionLoading ? st.dis : {}) }} onClick={() => setShowCancelModal(true)} disabled={actionLoading}><FiSlash size={16} /> Cancel Return</button>
                </div>
              </div>
            )}

            {ret.status === 'RETURN_VERIFIED_PASS' && (
              <div>
                <div style={{ ...st.actionInfo, borderColor: 'rgba(52,211,153,0.15)', backgroundColor: 'rgba(52,211,153,0.06)' }}>
                  <FiCheckCircle size={16} color="#34d399" />
                  <span style={{ color: '#34d399' }}>Product passed verification. You can now complete the return and process the refund.</span>
                </div>
                <div style={st.btnRow}>
                  <button style={{ ...st.btn, ...st.completeBtn, ...(actionLoading ? st.dis : {}) }} onClick={handleComplete} disabled={actionLoading}><FiCheckCircle size={16} /> Complete Return & Process Refund</button>
                </div>
              </div>
            )}

            {ret.status === 'RETURN_VERIFIED_FAIL' && (
              <div>
                <div style={{ ...st.actionInfo, borderColor: 'rgba(248,113,113,0.15)', backgroundColor: 'rgba(248,113,113,0.06)' }}>
                  <FiX size={16} color="#f87171" />
                  <span style={{ color: '#f87171' }}>Product failed verification. The return cannot be completed. You may cancel this return.</span>
                </div>
                <div style={st.btnRow}>
                  <button style={{ ...st.btn, ...st.cancelBtnStyle, ...(actionLoading ? st.dis : {}) }} onClick={() => setShowCancelModal(true)} disabled={actionLoading}><FiSlash size={16} /> Cancel Return</button>
                </div>
              </div>
            )}

            {isTerminal && !['RETURN_VERIFIED_FAIL'].includes(ret.status) && (
              <p style={{ color: '#5C5C60', fontSize: 13, margin: 0 }}>No further actions available for this return.</p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Customer Info */}
          <div style={st.card}>
            <h3 style={st.cardTitle}><FiUser size={16} /> Customer Info</h3>
            <div style={st.infoRow}><FiUser size={13} color="#5C5C60" /> <span style={{ color: '#E8E8E8' }}>{customerName}</span></div>
            <div style={st.infoRow}><FiMail size={13} color="#5C5C60" /> <span style={{ color: '#E8E8E8' }}>{ret.customerId?.email || 'N/A'}</span></div>
            <div style={st.infoRow}><FiPhone size={13} color="#5C5C60" /> <span style={{ color: '#E8E8E8' }}>{ret.customerId?.phone || 'N/A'}</span></div>
          </div>

          {/* Store Info */}
          {ret.storeId && (
            <div style={st.card}>
              <h3 style={st.cardTitle}><FiMapPin size={16} /> Store</h3>
              <div style={st.infoRow}><span style={{ color: '#E8E8E8', fontWeight: 600 }}>{ret.storeId.name}</span></div>
              {ret.storeId.storeCode && <div style={st.infoRow}><span style={{ color: '#5C5C60' }}>Code: {ret.storeId.storeCode}</span></div>}
              {ret.storeId.address && (
                <div style={st.infoRow}>
                  <span style={{ color: '#5C5C60', fontSize: 12 }}>
                    {typeof ret.storeId.address === 'object'
                      ? `${ret.storeId.address.street || ''}, ${ret.storeId.address.city || ''}, ${ret.storeId.address.state || ''}`
                      : ret.storeId.address
                    }
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Return Info */}
          <div style={st.card}>
            <h3 style={st.cardTitle}><FiClock size={16} /> Return Info</h3>
            <div style={st.detailRow}><span>Created</span><span>{formatDateTime(ret.createdAt)}</span></div>
            <div style={st.detailRow}><span>Updated</span><span>{formatDateTime(ret.updatedAt)}</span></div>
            {ret.processedAt && <div style={st.detailRow}><span>Processed</span><span>{formatDateTime(ret.processedAt)}</span></div>}
            {ret.processedBy && <div style={st.detailRow}><span>Processed By</span><span>{ret.processedBy.firstName || 'Staff'} {ret.processedBy.lastName || ''}</span></div>}
            {ret.notes && <div style={{ ...st.detailRow, flexDirection: 'column', gap: 4 }}><span>Notes</span><span style={{ color: '#E8E8E8' }}>{ret.notes}</span></div>}
          </div>

          {/* Order Info */}
          {ret.orderId && (
            <div style={st.card}>
              <h3 style={st.cardTitle}><FiPackage size={16} /> Order Info</h3>
              <div style={st.detailRow}><span>Order #</span><span style={{ fontWeight: 600, color: '#E8E8E8' }}>{ret.orderId.orderNumber}</span></div>
              <div style={st.detailRow}><span>Order Total</span><span>${(ret.orderId.total || 0).toFixed(2)}</span></div>
              <div style={st.detailRow}><span>Order Status</span><span><Badge status={ret.orderId.status} /></span></div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={st.modalOverlay} onClick={() => { setShowRejectModal(false); setRejectReason(''); }}>
          <div style={st.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}><FiAlertCircle size={32} color="#ef4444" /></div>
            <h3 style={st.modalTitle}>Reject Return?</h3>
            <p style={st.modalDesc}>The customer will be notified that their return request was declined.</p>
            <label style={st.modalLabel}>Reason for rejection</label>
            <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} style={st.modalSelect}>
              <option value="">Select a reason...</option>
              <option value="Item is outside return window">Outside return window</option>
              <option value="Item shows signs of wear">Signs of wear</option>
              <option value="Item is damaged by customer">Damaged by customer</option>
              <option value="Missing original packaging">Missing packaging</option>
              <option value="Other">Other</option>
            </select>
            {rejectReason === 'Other' && <textarea placeholder="Specify..." rows={2} style={st.modalTextarea} onChange={(e) => setRejectReason(e.target.value)} />}
            <div style={st.modalBtnRow}>
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} style={st.modalCancelBtn}>Cancel</button>
              <button onClick={handleReject} disabled={!rejectReason || actionLoading} style={{ ...st.modalConfirmBtn, ...st.rejectBtn, opacity: !rejectReason ? 0.5 : 1 }}>{actionLoading ? 'Rejecting...' : 'Reject Return'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div style={st.modalOverlay} onClick={() => { setShowCancelModal(false); setCancelReason(''); }}>
          <div style={st.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}><FiSlash size={32} color="#6b7280" /></div>
            <h3 style={st.modalTitle}>Cancel Return?</h3>
            <p style={st.modalDesc}>This will cancel the return process. The customer will be notified.</p>
            <label style={st.modalLabel}>Reason for cancellation (optional)</label>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={2} style={st.modalTextarea} placeholder="Enter reason..." />
            <div style={st.modalBtnRow}>
              <button onClick={() => { setShowCancelModal(false); setCancelReason(''); }} style={st.modalCancelBtn}>Go Back</button>
              <button onClick={handleCancel} disabled={actionLoading} style={{ ...st.modalConfirmBtn, ...st.cancelBtnStyle }}>{actionLoading ? 'Cancelling...' : 'Cancel Return'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const st = {
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, color: '#8E8E92', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'none', padding: 0, marginBottom: 20 },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  returnNumber: { fontSize: 22, fontWeight: 700, color: '#E8E8E8', marginBottom: 4 },
  timelineBar: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, padding: '24px 20px', backgroundColor: '#1b1b1f', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  timelineStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1, position: 'relative' },
  timelineDot: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, transition: 'all 220ms ease' },
  timelineStepLine: { position: 'absolute', top: 16, left: '50%', width: '100%', height: 3, zIndex: 0, borderRadius: 2 },
  timelineLabel: { fontSize: 11, textAlign: 'center', maxWidth: 90, lineHeight: 1.3 },
  alertBanner: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', backgroundColor: 'rgba(248,113,113,0.08)', color: '#f87171', borderRadius: 10, fontSize: 14, fontWeight: 600, marginBottom: 24, border: '1px solid rgba(248,113,113,0.15)' },
  grid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, alignItems: 'start' },
  card: { backgroundColor: '#1b1b1f', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#E8E8E8', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 },
  itemRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  itemThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#141417', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' },
  actionInfo: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', borderRadius: 8, backgroundColor: 'rgba(196,181,253,0.06)', border: '1px solid rgba(196,181,253,0.1)', marginBottom: 16, fontSize: 13, color: '#c4b5fd', lineHeight: 1.5 },
  btnRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'opacity 220ms ease', letterSpacing: 0.2 },
  acceptBtn: { backgroundColor: '#c8102e', color: '#fff' },
  rejectBtn: { backgroundColor: '#ef4444', color: '#fff' },
  verifyPassBtn: { backgroundColor: '#10b981', color: '#fff' },
  verifyFailBtn: { backgroundColor: '#f59e0b', color: '#fff' },
  completeBtn: { backgroundColor: '#3b82f6', color: '#fff' },
  cancelBtnStyle: { backgroundColor: '#6b7280', color: '#fff' },
  dis: { opacity: 0.35, cursor: 'not-allowed' },
  infoRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '5px 0' },
  detailRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#8E8E92', padding: '5px 0' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' },
  modal: { backgroundColor: '#1b1b1f', borderRadius: 14, padding: 32, maxWidth: 440, width: '90%', boxShadow: '0 16px 48px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' },
  modalTitle: { fontSize: 20, fontWeight: 700, marginBottom: 6, textAlign: 'center', color: '#E8E8E8' },
  modalDesc: { fontSize: 13, color: '#8E8E92', marginBottom: 16, textAlign: 'center', lineHeight: 1.5 },
  modalLabel: { fontSize: 13, color: '#8E8E92', fontWeight: 600, display: 'block', marginBottom: 6 },
  modalSelect: { width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, marginBottom: 8, backgroundColor: '#19191d', color: '#E8E8E8' },
  modalTextarea: { width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, marginBottom: 8, resize: 'vertical', backgroundColor: '#19191d', color: '#E8E8E8' },
  modalBtnRow: { display: 'flex', gap: 12, marginTop: 20 },
  modalCancelBtn: { flex: 1, padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#8E8E92' },
  modalConfirmBtn: { flex: 1, padding: '10px 20px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13, color: '#fff' },
};
