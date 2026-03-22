import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiCheck, FiX, FiPackage, FiTruck, FiClock, FiShield, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiChevronDown, FiChevronUp, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useOrders from '../hooks/useOrders';
import orderService from '../services/orderService';
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

const TIMELINE_STEPS = [
  'AWAITING_STORE_ACCEPTANCE',
  'ACCEPTED',
  'READY_FOR_PICKUP',
  'OTP_VERIFIED',
  'PICKED_UP',
  'COMPLETED',
];

function ExpandedOrderPanel({ orderId, onActionComplete }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pickupTime, setPickupTime] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const fetchOrder = useCallback(async () => {
    try {
      const data = await orderService.getOrderById(orderId);
      setOrder(data.order || data);
    } catch {
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const afterAction = async (msg) => {
    toast.success(msg);
    await fetchOrder();
    onActionComplete();
    window.dispatchEvent(new Event('order-action'));
  };

  const handleAccept = async () => {
    if (!pickupTime) { toast.warn('Set a pickup ready time first'); return; }
    setActionLoading(true);
    try {
      await orderService.acceptOrder(orderId, pickupTime);
      await afterAction('Order accepted! Customer notified.');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to accept'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await orderService.rejectOrder(orderId, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      await afterAction('Order rejected. Inventory released.');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to reject'); }
    finally { setActionLoading(false); }
  };

  const handleStatusUpdate = async (status) => {
    setActionLoading(true);
    try {
      await orderService.updateOrderStatus(orderId, status);
      setOtpDigits(['', '', '', '']);
      setOtpError('');
      const labels = { READY_FOR_PICKUP: 'Ready for Pickup', PICKED_UP: 'Picked Up', COMPLETED: 'Completed' };
      await afterAction(`Order marked as "${labels[status] || status}"`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setActionLoading(false); }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    setOtpError('');
    if (value && index < 3) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) otpRefs[index - 1].current?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) { setOtpDigits(pasted.split('')); otpRefs[3].current?.focus(); }
  };

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('');
    if (otp.length !== 4) { setOtpError('Enter all 4 digits'); return; }
    setOtpLoading(true);
    setOtpError('');
    try {
      await orderService.verifyOtp(orderId, otp);
      await afterAction('OTP verified! You can complete the order.');
    } catch (err) { setOtpError(err.response?.data?.message || 'Verification failed'); }
    finally { setOtpLoading(false); }
  };

  const handleRegenerateOtp = async () => {
    setOtpLoading(true);
    try {
      await orderService.regenerateOtp(orderId);
      toast.success('New OTP sent to customer');
      setOtpDigits(['', '', '', '']);
      setOtpError('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setOtpLoading(false); }
  };

  if (loading) return <div style={ex.loading}><div style={ex.spinner} /></div>;
  if (!order) return <div style={ex.loading}><span style={{ color: '#5C5C60' }}>Failed to load order</span></div>;

  const customerName = order.customer
    ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
    : order.customerName || (order.guestFirstName ? `${order.guestFirstName} ${order.guestLastName || ''}`.trim() : 'N/A');
  const currentStepIdx = TIMELINE_STEPS.indexOf(order.status);

  return (
    <div style={ex.panel}>
      <div style={ex.panelGrid}>
        {/* Left: Items + Actions */}
        <div>
          {/* Items */}
          <div style={ex.section}>
            <h4 style={ex.sectionTitle}><FiPackage size={14} /> Order Items</h4>
            {(order.items || []).map((item, i) => (
              <div key={i} style={ex.itemRow}>
                <div style={ex.itemThumb}>
                  {item.image
                    ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    : <FiPackage size={16} color="#5C5C60" />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#E8E8E8' }}>{item.productName || 'Product'}</div>
                  <div style={{ fontSize: 11, color: '#5C5C60' }}>
                    {item.sku && <span style={{ fontFamily: 'monospace' }}>{item.sku}</span>}
                    {item.size && ` · Size ${item.size}`}{item.color && ` · ${item.color}`} · Qty {item.quantity || 1}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#E8E8E8' }}>${(item.price || item.unitPrice || 0).toFixed(2)}</div>
              </div>
            ))}
            <div style={ex.totalRow}>
              <span style={{ color: '#8E8E92' }}>Total</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#E8E8E8' }}>${(order.total || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={ex.section}>
            <h4 style={ex.sectionTitle}><FiCheck size={14} /> Actions</h4>

            {order.status === 'AWAITING_STORE_ACCEPTANCE' && (() => {
              const WINDOW_MS = 8 * 60 * 60 * 1000;
              const remaining = WINDOW_MS - (Date.now() - new Date(order.createdAt).getTime());
              const expired = remaining <= 0;
              const hours = Math.floor(remaining / 3600000);
              const minutes = Math.floor((remaining % 3600000) / 60000);
              const urgentColor = remaining < 2 * 3600000 ? '#ef4444' : '#f59e0b';
              const now = new Date();
              const maxDate = new Date(new Date(order.createdAt).getTime() + 2 * 86400000);
              const pad = (n) => String(n).padStart(2, '0');
              const toLocal = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
              return (
                <div>
                  <div style={{ ...ex.alertBox, borderColor: expired ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)', backgroundColor: expired ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)' }}>
                    <FiClock size={15} color={expired ? '#ef4444' : urgentColor} />
                    {expired
                      ? <span style={{ color: '#ef4444', fontWeight: 700 }}>Window expired — reject this order</span>
                      : <span style={{ color: urgentColor, fontWeight: 600 }}>{hours}h {minutes}m to accept</span>
                    }
                  </div>
                  {!expired && (
                    <>
                      <div style={ex.pickupRow}>
                        <label style={{ fontSize: 12, color: '#8E8E92' }}>Pickup Ready By:</label>
                        <input type="datetime-local" style={ex.input} value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} min={toLocal(now)} max={toLocal(maxDate)} />
                      </div>
                      <div style={ex.btnRow}>
                        <button style={{ ...ex.btn, ...ex.acceptBtn, ...(actionLoading ? ex.dis : {}) }} onClick={handleAccept} disabled={actionLoading}><FiCheck size={15} /> Accept</button>
                        <button style={{ ...ex.btn, ...ex.rejectBtnStyle, ...(actionLoading ? ex.dis : {}) }} onClick={() => setShowRejectModal(true)} disabled={actionLoading}><FiX size={15} /> Reject</button>
                      </div>
                    </>
                  )}
                  {expired && (
                    <button style={{ ...ex.btn, ...ex.rejectBtnStyle, ...(actionLoading ? ex.dis : {}), marginTop: 10 }} onClick={() => setShowRejectModal(true)} disabled={actionLoading}><FiX size={15} /> Reject</button>
                  )}
                </div>
              );
            })()}

            {order.status === 'ACCEPTED' && (
              <button style={{ ...ex.btn, ...ex.readyBtn, ...(actionLoading ? ex.dis : {}) }} onClick={() => handleStatusUpdate('READY_FOR_PICKUP')} disabled={actionLoading}><FiPackage size={15} /> Mark Ready for Pickup</button>
            )}

            {order.status === 'READY_FOR_PICKUP' && (
              <div style={ex.otpSection}>
                <div style={ex.otpPrompt}><FiShield size={18} color="#c4b5fd" /><div><strong style={{ color: '#E8E8E8', fontSize: 13 }}>Verify Pickup OTP</strong><p style={{ color: '#8E8E92', fontSize: 11, marginTop: 2 }}>Ask the customer for their 4-digit code</p></div></div>
                <div style={ex.otpInputRow}>
                  {otpDigits.map((d, i) => (
                    <input key={i} ref={otpRefs[i]} type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      style={{ ...ex.otpInput, borderColor: otpError ? 'rgba(248,113,113,0.4)' : d ? 'rgba(196,181,253,0.3)' : 'rgba(255,255,255,0.08)' }}
                    />
                  ))}
                </div>
                {otpError && <div style={ex.otpErr}><FiAlertCircle size={12} /> {otpError}</div>}
                <div style={ex.btnRow}>
                  <button style={{ ...ex.btn, ...ex.verifyBtn, ...(otpLoading ? ex.dis : {}) }} onClick={handleVerifyOtp} disabled={otpLoading || otpDigits.join('').length !== 4}><FiShield size={14} /> {otpLoading ? 'Verifying...' : 'Verify OTP'}</button>
                  <button style={{ ...ex.btn, ...ex.regenBtn, ...(otpLoading ? ex.dis : {}) }} onClick={handleRegenerateOtp} disabled={otpLoading}><FiRefreshCw size={13} /> Regenerate</button>
                </div>
              </div>
            )}

            {order.status === 'OTP_VERIFIED' && (
              <div>
                <div style={{ ...ex.alertBox, borderColor: 'rgba(52,211,153,0.15)', backgroundColor: 'rgba(52,211,153,0.06)', color: '#34d399' }}><FiCheckCircle size={15} /> OTP verified — hand over the order</div>
                <button style={{ ...ex.btn, ...ex.blueBtn, ...(actionLoading ? ex.dis : {}), marginTop: 10 }} onClick={() => handleStatusUpdate('PICKED_UP')} disabled={actionLoading}><FiTruck size={15} /> Mark Picked Up</button>
              </div>
            )}

            {order.status === 'PICKED_UP' && (
              <button style={{ ...ex.btn, ...ex.blueBtn, ...(actionLoading ? ex.dis : {}) }} onClick={() => handleStatusUpdate('COMPLETED')} disabled={actionLoading}><FiCheck size={15} /> Mark Completed</button>
            )}

            {['COMPLETED', 'CANCELLED', 'REJECTED'].includes(order.status) && (
              <p style={{ color: '#5C5C60', fontSize: 12, margin: 0 }}>No actions available.</p>
            )}
          </div>
        </div>

        {/* Right: Customer + Timeline + Info */}
        <div>
          <div style={ex.section}>
            <h4 style={ex.sectionTitle}><FiUser size={14} /> Customer {order.isGuest && <span style={ex.guestTag}>GUEST</span>}</h4>
            <div style={ex.infoLine}><FiUser size={12} color="#5C5C60" /> <span>{customerName}</span></div>
            <div style={ex.infoLine}><FiMail size={12} color="#5C5C60" /> <span>{order.customer?.email || order.customerEmail || order.guestEmail || 'N/A'}</span></div>
            <div style={ex.infoLine}><FiPhone size={12} color="#5C5C60" /> <span>{order.customer?.phone || order.customerPhone || order.guestPhone || 'N/A'}</span></div>
          </div>

          <div style={ex.section}>
            <h4 style={ex.sectionTitle}><FiClock size={14} /> Timeline</h4>
            <div style={ex.timeline}>
              {TIMELINE_STEPS.map((step, idx) => {
                const done = idx <= currentStepIdx;
                const current = idx === currentStepIdx;
                const isLast = idx === TIMELINE_STEPS.length - 1;
                return (
                  <div key={step} style={ex.tlItem}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ ...ex.tlDot, backgroundColor: current ? '#fff' : done ? '#34d399' : 'rgba(255,255,255,0.06)', border: current ? '2px solid #10b981' : 'none' }} />
                      {!isLast && <div style={{ ...ex.tlLine, backgroundColor: done && !current ? '#34d399' : 'rgba(255,255,255,0.06)' }} />}
                    </div>
                    <span style={{ fontSize: 11, color: done ? '#E8E8E8' : '#5C5C60', fontWeight: current ? 700 : 400 }}>{step.replace(/_/g, ' ')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={ex.section}>
            <h4 style={ex.sectionTitle}>Order Info</h4>
            <div style={ex.infoLine}><span style={{ color: '#5C5C60' }}>Created</span><span style={{ color: '#8E8E92', marginLeft: 'auto' }}>{formatDateTime(order.createdAt)}</span></div>
            {order.pickupReadyTime && <div style={ex.infoLine}><span style={{ color: '#5C5C60' }}>Pickup By</span><span style={{ color: '#8E8E92', marginLeft: 'auto' }}>{formatDateTime(order.pickupReadyTime)}</span></div>}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={ex.modalOverlay} onClick={() => { setShowRejectModal(false); setRejectReason(''); }}>
          <div style={ex.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 14 }}><FiAlertCircle size={28} color="#ef4444" /></div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, textAlign: 'center', color: '#E8E8E8' }}>Reject Order?</h3>
            <p style={{ fontSize: 12, color: '#8E8E92', marginBottom: 14, textAlign: 'center' }}>This releases inventory and notifies the customer.</p>
            <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} style={ex.select}>
              <option value="">Select a reason...</option>
              <option value="Out of stock">Out of stock</option>
              <option value="Store temporarily closed">Store temporarily closed</option>
              <option value="Item damaged">Item damaged</option>
              <option value="Cannot fulfill in time">Cannot fulfill in time</option>
              <option value="Other">Other</option>
            </select>
            {rejectReason === 'Other' && <textarea placeholder="Specify..." rows={2} style={ex.textarea} onChange={(e) => setRejectReason(e.target.value)} />}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} style={ex.modalCancel}>Cancel</button>
              <button onClick={handleReject} disabled={!rejectReason || actionLoading} style={{ ...ex.modalReject, opacity: !rejectReason ? 0.5 : 1 }}>{actionLoading ? 'Rejecting...' : 'Reject'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  const [activeStatus, setActiveStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const { orders, loading, error, totalPages, refetch } = useOrders(activeStatus, page);
  const [expandedId, setExpandedId] = useState(null);

  const handleTabChange = (status) => {
    setActiveStatus(status);
    setPage(1);
    setExpandedId(null);
  };

  const toggleRow = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
        <div style={{ ...s.emptyState }}>No orders found</div>
      ) : (
        <div style={s.list}>
          {orders.map((order) => {
            const id = order._id || order.id;
            const isExpanded = expandedId === id;
            return (
              <div key={id} style={{ ...s.card, ...(isExpanded ? s.cardExpanded : {}) }}>
                <div style={s.row} onClick={() => toggleRow(id)}>
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
                    {isExpanded ? <FiChevronUp size={18} color="#8E8E92" /> : <FiChevronDown size={18} color="#5C5C60" />}
                  </div>
                </div>

                {isExpanded && (
                  <ExpandedOrderPanel orderId={id} onActionComplete={() => refetch(true)} />
                )}
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
  card: { backgroundColor: '#1b1b1f', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', overflow: 'hidden', transition: 'border-color 220ms ease' },
  cardExpanded: { borderColor: 'rgba(200,16,46,0.25)' },
  row: { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', cursor: 'pointer', transition: 'background-color 150ms ease' },
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

const ex = {
  panel: { borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 20px 16px', backgroundColor: 'rgba(0,0,0,0.15)' },
  panelGrid: { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 },
  loading: { display: 'flex', justifyContent: 'center', padding: 32 },
  spinner: { width: 28, height: 28, border: '3px solid rgba(255,255,255,0.06)', borderTopColor: '#c8102e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  section: { backgroundColor: '#141417', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid rgba(255,255,255,0.04)' },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: '#8E8E92', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 },
  itemRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  itemThumb: { width: 40, height: 40, borderRadius: 6, overflow: 'hidden', backgroundColor: '#1b1b1f', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)' },
  alertBox: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, fontSize: 12, border: '1px solid', marginBottom: 10 },
  pickupRow: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 },
  input: { padding: '7px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: '#E8E8E8', backgroundColor: '#19191d', outline: 'none' },
  btnRow: { display: 'flex', gap: 8, marginTop: 12 },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'opacity 220ms ease' },
  acceptBtn: { backgroundColor: '#059669', color: '#fff' },
  rejectBtnStyle: { backgroundColor: '#ef4444', color: '#fff' },
  readyBtn: { backgroundColor: '#10b981', color: '#fff' },
  blueBtn: { backgroundColor: '#3b82f6', color: '#fff' },
  verifyBtn: { backgroundColor: '#7c3aed', color: '#fff' },
  regenBtn: { backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#8E8E92' },
  dis: { opacity: 0.35, cursor: 'not-allowed' },
  otpSection: { padding: 14, backgroundColor: 'rgba(196,181,253,0.04)', borderRadius: 8, border: '1px solid rgba(196,181,253,0.1)' },
  otpPrompt: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  otpInputRow: { display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 6 },
  otpInput: { width: 44, height: 50, textAlign: 'center', fontSize: 20, fontWeight: 800, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#141417', color: '#E8E8E8', outline: 'none', caretColor: '#c4b5fd' },
  otpErr: { display: 'flex', alignItems: 'center', gap: 4, color: '#f87171', fontSize: 11, justifyContent: 'center', marginBottom: 4 },
  guestTag: { fontSize: 9, fontWeight: 700, color: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.08)', padding: '2px 6px', borderRadius: 4, marginLeft: 8 },
  infoLine: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#E8E8E8', padding: '4px 0' },
  timeline: { display: 'flex', flexDirection: 'column', gap: 0 },
  tlItem: { display: 'flex', gap: 10, position: 'relative', paddingBottom: 14 },
  tlDot: { width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0 },
  tlLine: { position: 'absolute', left: 3, top: 14, width: 2, height: 'calc(100% - 8px)' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' },
  modal: { backgroundColor: '#1b1b1f', borderRadius: 14, padding: 28, maxWidth: 400, width: '90%', boxShadow: '0 16px 48px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' },
  select: { width: '100%', padding: 9, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, backgroundColor: '#19191d', color: '#E8E8E8' },
  textarea: { width: '100%', padding: 9, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, resize: 'vertical', backgroundColor: '#19191d', color: '#E8E8E8', marginTop: 6 },
  modalCancel: { flex: 1, padding: '9px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: 12, color: '#8E8E92' },
  modalReject: { flex: 1, padding: '9px 16px', borderRadius: 8, border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 12 },
};
