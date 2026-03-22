import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiClock, FiPackage, FiTruck, FiX, FiAlertCircle, FiCheckCircle, FiShield, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import orderService from '../services/orderService';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import { formatDateTime } from '../utils/formatDate';

const TIMELINE_STEPS = [
  'AWAITING_STORE_ACCEPTANCE',
  'ACCEPTED',
  'READY_FOR_PICKUP',
  'OTP_VERIFIED',
  'PICKED_UP',
  'COMPLETED',
];

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pickupTime, setPickupTime] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionFeedback, setActionFeedback] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await orderService.getOrderById(orderId);
        setOrder(data.order || data);
      } catch {
        toast.error('Failed to load order details');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId, navigate]);

  const showFeedback = (type, message) => {
    setActionFeedback({ type, message });
    window.dispatchEvent(new Event('order-action'));
    setTimeout(() => setActionFeedback(null), 6000);
  };

  const refetchOrder = async () => {
    try {
      const data = await orderService.getOrderById(orderId);
      const fresh = data.order || data;
      if (fresh && fresh._id) {
        setOrder(fresh);
      }
    } catch (err) {
      console.error('refetchOrder failed:', err);
    }
  };

  const applyStatusAndRefetch = (newStatus) => {
    setOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
    window.dispatchEvent(new Event('order-action'));
    setTimeout(() => refetchOrder(), 600);
  };

  const handleAccept = async () => {
    if (!pickupTime) {
      toast.warn('Please set an estimated pickup ready time');
      return;
    }
    setActionLoading(true);
    try {
      await orderService.acceptOrder(orderId, pickupTime);
      await applyStatusAndRefetch('ACCEPTED');
      showFeedback('success', 'Order accepted successfully! The customer will be notified.');
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to accept order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await orderService.rejectOrder(orderId, rejectReason);
      await applyStatusAndRefetch('REJECTED');
      setShowRejectModal(false);
      setRejectReason('');
      showFeedback('rejected', 'Order has been rejected. Inventory released and customer notified.');
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to reject order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    setActionLoading(true);
    try {
      await orderService.updateOrderStatus(orderId, status);
      setOtpDigits(['', '', '', '']);
      setOtpVerified(false);
      setOtpError('');
      await applyStatusAndRefetch(status);
      const labels = { READY_FOR_PICKUP: 'Ready for Pickup', PICKED_UP: 'Picked Up', COMPLETED: 'Completed' };
      if (status === 'READY_FOR_PICKUP') {
        showFeedback('success', 'Order marked as "Ready for Pickup". A 4-digit OTP has been generated and sent to the customer.');
      } else {
        showFeedback('success', `Order marked as "${labels[status] || status}"`);
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setOtpError('');
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      setOtpDigits(pasted.split(''));
      otpRefs[3].current?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 4) {
      setOtpError('Please enter all 4 digits');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      await orderService.verifyOtp(orderId, otp);
      setOtpVerified(true);
      await applyStatusAndRefetch('OTP_VERIFIED');
      showFeedback('success', 'OTP verified successfully! You can now complete the order.');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegenerateOtp = async () => {
    setOtpLoading(true);
    try {
      await orderService.regenerateOtp(orderId);
      showFeedback('success', 'New OTP has been generated and sent to the customer.');
      setOtpDigits(['', '', '', '']);
      setOtpError('');
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to regenerate OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!order) return null;

  const currentStepIndex = TIMELINE_STEPS.indexOf(order.status);
  const customerName = order.customer
    ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
    : order.customerName
      || (order.guestFirstName ? `${order.guestFirstName} ${order.guestLastName || ''}`.trim() : null)
      || 'N/A';

  return (
    <div>
      <button style={st.backButton} onClick={() => navigate('/orders')}>
        <FiArrowLeft size={16} /> Back to Orders
      </button>

      {/* Feedback Banner */}
      {actionFeedback && (
        <div style={{
          ...st.feedbackBanner,
          ...(actionFeedback.type === 'success' ? st.feedbackSuccess : actionFeedback.type === 'rejected' ? st.feedbackRejected : st.feedbackError),
        }}>
          {actionFeedback.type === 'success' ? <FiCheckCircle size={22} /> : actionFeedback.type === 'rejected' ? <FiAlertCircle size={22} /> : <FiX size={22} />}
          <span style={{ flex: 1, fontWeight: 600, fontSize: 15 }}>{actionFeedback.message}</span>
          <button style={st.feedbackClose} onClick={() => setActionFeedback(null)}><FiX size={16} /></button>
        </div>
      )}

      <div style={st.headerRow}>
        <div>
          <h1 style={st.orderNumber}>
            {order.orderNumber || `Order #${orderId.slice(-6)}`}
          </h1>
        </div>
        <Badge status={order.status} />
      </div>

      <div style={st.grid}>
        <div>
          <div style={st.card}>
            <h3 style={st.cardTitle}>Order Items</h3>
            <table style={st.itemsTable}>
              <thead>
                <tr>
                  <th style={st.itemTh}>Product</th>
                  <th style={st.itemTh}>SKU</th>
                  <th style={st.itemTh}>Size</th>
                  <th style={st.itemTh}>Qty</th>
                  <th style={{ ...st.itemTh, textAlign: 'right' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ ...st.itemTd, fontWeight: 500 }}>{item.productName || item.name || 'Product'}</td>
                    <td style={{ ...st.itemTd, fontFamily: 'monospace', fontSize: 13 }}>{item.sku || 'N/A'}</td>
                    <td style={st.itemTd}>{item.size || 'N/A'}</td>
                    <td style={st.itemTd}>{item.quantity || 1}</td>
                    <td style={{ ...st.itemTd, textAlign: 'right', fontWeight: 600 }}>${(item.price || item.unitPrice || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ ...st.infoRow, marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ ...st.infoLabel, fontSize: 16 }}>Total</span>
              <span style={{ ...st.infoValue, fontSize: 18, fontWeight: 700 }}>
                ${(order.totalAmount || order.total || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div style={st.card}>
            <h3 style={st.cardTitle}>Actions</h3>

            {order.status === 'AWAITING_STORE_ACCEPTANCE' && (() => {
              const WINDOW_MS = 8 * 60 * 60 * 1000;
              const elapsed = Date.now() - new Date(order.createdAt).getTime();
              const remaining = WINDOW_MS - elapsed;
              const expired = remaining <= 0;
              const hours = Math.floor(remaining / (60 * 60 * 1000));
              const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
              const urgentColor = remaining < 2 * 60 * 60 * 1000 ? '#ef4444' : '#f59e0b';

              return (
                <div>
                  <div style={{ padding: '12px 16px', borderRadius: 8, backgroundColor: expired ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)', marginBottom: 14, fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, border: expired ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(245,158,11,0.25)' }}>
                    <FiClock size={18} color={expired ? '#ef4444' : urgentColor} />
                    {expired
                      ? <span style={{ color: '#ef4444', fontWeight: 700 }}>Acceptance window expired — please reject this order</span>
                      : <span style={{ color: urgentColor, fontWeight: 700 }}>{hours}h {minutes}m remaining to accept</span>
                    }
                  </div>
                  {!expired && (() => {
                    const now = new Date();
                    const placedAt = new Date(order.createdAt);
                    const maxDate = new Date(placedAt.getTime() + 2 * 24 * 60 * 60 * 1000);
                    const pad = (n) => String(n).padStart(2, '0');
                    const toLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                    return (
                      <>
                        <div style={st.pickupTimeInput}>
                          <label style={{ fontSize: 13, color: '#8E8E92', fontWeight: 500 }}>Pickup Ready By:</label>
                          <input type="datetime-local" style={st.input} value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} min={toLocal(now)} max={toLocal(maxDate)} />
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                          <button style={{ ...st.actionBtn, ...st.acceptBtn, ...(actionLoading ? st.disabledBtn : {}) }} onClick={handleAccept} disabled={actionLoading}>
                            <FiCheck size={18} /> Accept Order
                          </button>
                          <button style={{ ...st.actionBtn, ...st.rejectBtn, ...(actionLoading ? st.disabledBtn : {}) }} onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
                            <FiX size={18} /> Reject Order
                          </button>
                        </div>
                      </>
                    );
                  })()}
                  {expired && (
                    <button style={{ ...st.actionBtn, ...st.rejectBtn, ...(actionLoading ? st.disabledBtn : {}), marginTop: 12 }} onClick={() => setShowRejectModal(true)} disabled={actionLoading}>
                      <FiX size={18} /> Reject Order
                    </button>
                  )}
                </div>
              );
            })()}

            {order.status === 'ACCEPTED' && (
              <button style={{ ...st.actionBtn, ...st.readyBtn, ...(actionLoading ? st.disabledBtn : {}) }} onClick={() => handleStatusUpdate('READY_FOR_PICKUP')} disabled={actionLoading}>
                <FiPackage size={18} /> Mark Ready for Pickup
              </button>
            )}
            {order.status === 'READY_FOR_PICKUP' && (
              <div style={st.otpSection}>
                <div style={st.otpPrompt}>
                  <FiShield size={20} color="#c4b5fd" />
                  <div>
                    <strong style={{ color: '#E8E8E8', fontSize: 14 }}>Verify Pickup OTP</strong>
                    <p style={{ color: '#8E8E92', fontSize: 12, marginTop: 2 }}>Ask the customer for their 4-digit pickup OTP</p>
                  </div>
                </div>
                <div style={st.otpInputRow}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={otpRefs[i]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      style={{
                        ...st.otpInput,
                        borderColor: otpError ? 'rgba(248,113,113,0.4)' : digit ? 'rgba(196,181,253,0.3)' : 'rgba(255,255,255,0.08)',
                      }}
                    />
                  ))}
                </div>
                {otpError && (
                  <div style={st.otpError}>
                    <FiAlertCircle size={14} /> {otpError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button
                    style={{ ...st.actionBtn, ...st.verifyBtn, ...(otpLoading ? st.disabledBtn : {}) }}
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otpDigits.join('').length !== 4}
                  >
                    <FiShield size={16} /> {otpLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button
                    style={{ ...st.actionBtn, ...st.regenerateBtn, ...(otpLoading ? st.disabledBtn : {}) }}
                    onClick={handleRegenerateOtp}
                    disabled={otpLoading}
                  >
                    <FiRefreshCw size={14} /> Regenerate
                  </button>
                </div>
              </div>
            )}
            {order.status === 'OTP_VERIFIED' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 8, backgroundColor: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', marginBottom: 14, color: '#34d399', fontSize: 13, fontWeight: 600 }}>
                  <FiCheckCircle size={16} /> OTP verified — ready to hand over the order
                </div>
                <button style={{ ...st.actionBtn, ...st.completeBtn, ...(actionLoading ? st.disabledBtn : {}) }} onClick={() => handleStatusUpdate('PICKED_UP')} disabled={actionLoading}>
                  <FiTruck size={18} /> Mark Picked Up
                </button>
              </div>
            )}
            {order.status === 'PICKED_UP' && (
              <button style={{ ...st.actionBtn, ...st.completeBtn, ...(actionLoading ? st.disabledBtn : {}) }} onClick={() => handleStatusUpdate('COMPLETED')} disabled={actionLoading}>
                <FiCheck size={18} /> Mark Completed
              </button>
            )}
            {['COMPLETED', 'CANCELLED', 'DECLINED', 'REJECTED'].includes(order.status) && (
              <p style={{ color: '#5C5C60', fontSize: 13 }}>No actions available for this order.</p>
            )}
          </div>
        </div>

        <div>
          <div style={st.card}>
            <h3 style={st.cardTitle}>
              Customer Info
              {order.isGuest && <span style={st.guestBadge}>GUEST</span>}
            </h3>
            <div style={st.infoRow}><span style={st.infoLabel}>Name</span><span style={st.infoValue}>{customerName}</span></div>
            <div style={st.infoRow}><span style={st.infoLabel}>Email</span><span style={st.infoValue}>{order.customer?.email || order.customerEmail || order.guestEmail || 'N/A'}</span></div>
            <div style={st.infoRow}><span style={st.infoLabel}>Phone</span><span style={st.infoValue}>{order.customer?.phone || order.customerPhone || order.guestPhone || 'N/A'}</span></div>
          </div>

          <div style={st.card}>
            <h3 style={st.cardTitle}>Order Timeline</h3>
            <div style={st.timelineContainer}>
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isLast = idx === TIMELINE_STEPS.length - 1;
                return (
                  <div key={step} style={st.timelineItem}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        ...st.timelineDot,
                        backgroundColor: isCurrent ? '#ffffff' : isCompleted ? '#34d399' : 'rgba(255,255,255,0.06)',
                        border: isCurrent ? '3px solid #10b981' : 'none',
                      }} />
                      {!isLast && <div style={{ ...st.timelineLine, backgroundColor: isCompleted && !isCurrent ? '#34d399' : 'rgba(255,255,255,0.06)' }} />}
                    </div>
                    <div style={st.timelineContent}>
                      <div style={{ ...st.timelineStatus, color: isCompleted ? '#E8E8E8' : '#5C5C60' }}>
                        {step.replace(/_/g, ' ')}
                      </div>
                      {isCompleted && order.statusHistory?.[idx] && (
                        <div style={st.timelineDate}>{formatDateTime(order.statusHistory[idx].timestamp || order.statusHistory[idx].createdAt)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={st.card}>
            <h3 style={st.cardTitle}>Order Info</h3>
            <div style={st.infoRow}><span style={st.infoLabel}>Created</span><span style={st.infoValue}>{formatDateTime(order.createdAt)}</span></div>
            <div style={st.infoRow}><span style={st.infoLabel}>Updated</span><span style={st.infoValue}>{formatDateTime(order.updatedAt)}</span></div>
            {order.pickupReadyTime && (
              <div style={st.infoRow}><span style={st.infoLabel}>Pickup Ready</span><span style={st.infoValue}>{formatDateTime(order.pickupReadyTime)}</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={st.modalOverlay}>
          <div style={st.modal}>
            <div style={st.modalIconWrap}><FiAlertCircle size={32} color="#ef4444" /></div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, textAlign: 'center', color: '#E8E8E8' }}>Reject This Order?</h3>
            <p style={{ fontSize: 13, color: '#8E8E92', marginBottom: 16, textAlign: 'center', lineHeight: 1.5 }}>
              This will release reserved inventory and notify the customer. This action cannot be undone.
            </p>
            <label style={{ fontSize: 13, color: '#8E8E92', fontWeight: 600, display: 'block', marginBottom: 6 }}>Reason for rejection</label>
            <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} style={st.modalSelect}>
              <option value="">Select a reason...</option>
              <option value="Out of stock">Out of stock</option>
              <option value="Store temporarily closed">Store temporarily closed</option>
              <option value="Item damaged">Item damaged</option>
              <option value="Cannot fulfill in time">Cannot fulfill in time</option>
              <option value="Other">Other</option>
            </select>
            {rejectReason === 'Other' && (
              <textarea placeholder="Please specify..." rows={2} style={st.modalTextarea} onChange={(e) => setRejectReason(e.target.value)} />
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} style={st.modalCancel}>Cancel</button>
              <button onClick={handleReject} disabled={!rejectReason || actionLoading} style={{ ...st.modalReject, opacity: !rejectReason ? 0.5 : 1 }}>
                {actionLoading ? 'Rejecting...' : 'Reject Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const st = {
  backButton: { display: 'inline-flex', alignItems: 'center', gap: 8, color: '#8E8E92', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'none', padding: 0, marginBottom: 20, transition: 'color 220ms ease' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  orderNumber: { fontSize: 22, fontWeight: 700, color: '#E8E8E8' },
  grid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 },
  card: { backgroundColor: '#1b1b1f', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 24 },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#E8E8E8', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 },
  guestBadge: { fontSize: 10, fontWeight: 700, color: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.08)', padding: '3px 8px', borderRadius: 4, marginLeft: 10 },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13 },
  infoLabel: { color: '#5C5C60', fontWeight: 500 },
  infoValue: { color: '#E8E8E8', fontWeight: 500 },
  itemsTable: { width: '100%', borderCollapse: 'collapse' },
  itemTh: { textAlign: 'left', padding: '10px 0', fontSize: 11, fontWeight: 600, color: '#5C5C60', textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: '1px solid rgba(255,255,255,0.05)' },
  itemTd: { padding: '12px 0', fontSize: 13, color: '#8E8E92', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  feedbackBanner: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 10, marginBottom: 20, fontSize: 14 },
  feedbackSuccess: { backgroundColor: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', color: '#34d399' },
  feedbackRejected: { backgroundColor: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', color: '#fbbf24' },
  feedbackError: { backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', color: '#f87171' },
  feedbackClose: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'inherit', opacity: 0.5 },
  actionBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 220ms ease', letterSpacing: 0.2 },
  acceptBtn: { backgroundColor: '#059669', color: '#fff' },
  rejectBtn: { backgroundColor: '#ef4444', color: '#fff' },
  readyBtn: { backgroundColor: '#10b981', color: '#fff' },
  completeBtn: { backgroundColor: '#3b82f6', color: '#fff' },
  disabledBtn: { opacity: 0.35, cursor: 'not-allowed' },
  pickupTimeInput: { display: 'flex', gap: 10, alignItems: 'center', marginTop: 12, marginBottom: 8 },
  input: { padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: '#E8E8E8', outline: 'none', backgroundColor: '#19191d' },
  timelineContainer: { display: 'flex', flexDirection: 'column', gap: 0 },
  timelineItem: { display: 'flex', gap: 12, position: 'relative', paddingBottom: 20 },
  timelineDot: { width: 10, height: 10, borderRadius: '50%', marginTop: 5, flexShrink: 0 },
  timelineLine: { position: 'absolute', left: 4, top: 18, width: 2, height: 'calc(100% - 12px)' },
  timelineContent: { flex: 1 },
  timelineStatus: { fontSize: 13, fontWeight: 600 },
  timelineDate: { fontSize: 11, color: '#5C5C60', marginTop: 2 },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' },
  modal: { backgroundColor: '#1b1b1f', borderRadius: 14, padding: 32, maxWidth: 420, width: '90%', boxShadow: '0 16px 48px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' },
  modalIconWrap: { display: 'flex', justifyContent: 'center', marginBottom: 16 },
  modalSelect: { width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, marginBottom: 8, backgroundColor: '#19191d', color: '#E8E8E8' },
  modalTextarea: { width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, marginBottom: 8, resize: 'vertical', backgroundColor: '#19191d', color: '#E8E8E8' },
  modalCancel: { flex: 1, padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#8E8E92' },
  modalReject: { flex: 1, padding: '10px 20px', borderRadius: 8, border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 },
  otpSection: { padding: '20px', backgroundColor: 'rgba(196,181,253,0.04)', borderRadius: 10, border: '1px solid rgba(196,181,253,0.1)' },
  otpPrompt: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 },
  otpInputRow: { display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 8 },
  otpInput: { width: 52, height: 58, textAlign: 'center', fontSize: 24, fontWeight: 800, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#141417', color: '#E8E8E8', outline: 'none', caretColor: '#c4b5fd', transition: 'border-color 220ms ease' },
  otpError: { display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontSize: 12, fontWeight: 500, marginTop: 6, justifyContent: 'center' },
  verifyBtn: { backgroundColor: '#7c3aed', color: '#fff' },
  regenerateBtn: { backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#8E8E92' },
};
