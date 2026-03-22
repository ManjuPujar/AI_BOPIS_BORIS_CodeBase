import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiMapPin, FiTruck, FiArrowRight, FiPackage, FiCheck, FiClock, FiShoppingBag, FiInfo, FiShield, FiAlertTriangle, FiXCircle } from 'react-icons/fi';
import useOrderStatus from '../hooks/useOrderStatus';
import useAuth from '../hooks/useAuth';
import * as orderService from '../services/orderService';
import { formatCurrency } from '../utils/formatCurrency';

const BOPIS_STATUS_MESSAGES = {
  AWAITING_STORE_ACCEPTANCE: {
    icon: FiClock,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.06)',
    border: 'rgba(251,191,36,0.12)',
    title: 'Awaiting Store Confirmation',
    message: 'Your order is currently pending and will only be confirmed once the store manager reviews and accepts it based on current stock availability. The pickup date and time will be provided by the store after acceptance. If the store is unable to fulfill your order, you will be notified promptly.',
  },
  ACCEPTED: {
    icon: FiCheck,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.12)',
    title: 'Order Accepted by Store',
    message: 'Great news! The store has accepted your order and is now preparing it for pickup. You will receive a notification once your items are packed and ready to collect.',
  },
  READY_FOR_PICKUP: {
    icon: FiMapPin,
    color: '#c4b5fd',
    bg: 'rgba(196,181,253,0.06)',
    border: 'rgba(196,181,253,0.12)',
    title: 'Ready for Pickup',
    message: 'Your order is ready! Head to the store with your order number and the pickup verification code shown below. A store associate will verify your code and hand over your items.',
  },
  OTP_VERIFIED: {
    icon: FiShield,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.12)',
    title: 'Pickup Code Verified',
    message: 'Your pickup verification code has been confirmed at the store. Please collect your items from the store associate.',
  },
  PICKED_UP: {
    icon: FiPackage,
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.06)',
    border: 'rgba(96,165,250,0.12)',
    title: 'Order Picked Up',
    message: 'You have successfully collected your order. Enjoy your purchase! If you need to return any items, you can initiate a return from your order history.',
  },
  COMPLETED: {
    icon: FiCheckCircle,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.12)',
    title: 'Order Complete',
    message: 'Your order is complete. Thank you for shopping with Converse! If you need to return any items, you can do so within 30 days from your order history.',
  },
  REJECTED: {
    icon: FiXCircle,
    color: '#f87171',
    bg: 'rgba(248,113,113,0.06)',
    border: 'rgba(248,113,113,0.12)',
    title: 'Order Could Not Be Fulfilled',
    message: 'Unfortunately, the store was unable to fulfill your order due to stock unavailability. You will not be charged. Please try placing a new order or selecting a different store.',
  },
  CANCELLED: {
    icon: FiAlertTriangle,
    color: '#f87171',
    bg: 'rgba(248,113,113,0.06)',
    border: 'rgba(248,113,113,0.12)',
    title: 'Order Cancelled',
    message: 'This order has been cancelled. If you were charged, a refund will be processed within 5–7 business days.',
  },
};

const BOPIS_STEPS = [
  { key: 'AWAITING_STORE_ACCEPTANCE', label: 'Order Placed', icon: FiShoppingBag, desc: 'Sent to store for review' },
  { key: 'ACCEPTED', label: 'Store Accepted', icon: FiCheck, desc: 'Store is preparing your order' },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: FiMapPin, desc: 'Head to the store to collect' },
  { key: 'OTP_VERIFIED', label: 'OTP Verified', icon: FiShield, desc: 'Pickup code verified at store' },
  { key: 'PICKED_UP', label: 'Picked Up', icon: FiPackage, desc: 'You collected your order' },
  { key: 'COMPLETED', label: 'Completed', icon: FiCheckCircle, desc: 'Order complete' },
];

const SHIP_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: FiShoppingBag, desc: 'We received your order' },
  { key: 'PROCESSING', label: 'Processing', icon: FiClock, desc: 'Preparing for shipment' },
  { key: 'SHIPPED', label: 'Shipped', icon: FiTruck, desc: 'On its way to you' },
  { key: 'DELIVERED', label: 'Delivered', icon: FiCheck, desc: 'Package delivered' },
];

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const guestEmail = useMemo(() => {
    return location.state?.guestEmail
      || sessionStorage.getItem(`order_email_${orderId}`)
      || user?.email
      || null;
  }, [location.state, orderId, user]);
  const { order, loading, error } = useOrderStatus(orderId, guestEmail);
  const [otpData, setOtpData] = useState(null);

  useEffect(() => {
    if (!order) return;
    const otpStatuses = ['READY_FOR_PICKUP', 'OTP_VERIFIED', 'PICKED_UP', 'COMPLETED'];
    if (order.deliveryMethod === 'SHIP_TO_STORE' && otpStatuses.includes(order.status)) {
      orderService.getPickupOtp(orderId, guestEmail).then(setOtpData).catch(() => {});
    }
  }, [order?.status, orderId, guestEmail]);

  if (loading) {
    return (
      <div style={s.loadingPage}>
        <div style={s.spinner} />
        <p style={{ color: '#5C5C60', marginTop: 16 }}>Loading your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={s.loadingPage}>
        <p style={{ color: '#ef4444', fontSize: 16 }}>{error || 'Order not found'}</p>
        <Link to="/orders" style={s.linkText}>View All Orders</Link>
      </div>
    );
  }

  const isBOPIS = order.deliveryMethod === 'SHIP_TO_STORE';
  const steps = isBOPIS ? BOPIS_STEPS : SHIP_STEPS;
  const currentIdx = steps.findIndex((st) => st.key === order.status);
  const storeName = order.store?.name || order.storeId?.name || 'your selected store';
  const storeAddr = order.store?.address || order.storeId?.address;
  const formattedAddr = storeAddr && typeof storeAddr === 'object'
    ? `${storeAddr.street}, ${storeAddr.city}, ${storeAddr.state} ${storeAddr.zipcode}`
    : storeAddr || '';

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Success Header */}
        <div style={s.hero}>
          <div style={s.heroIcon}>
            <FiCheckCircle size={48} color="#E8E8E8" />
          </div>
          <h1 style={s.heroTitle}>Thank you for your order!</h1>
          <p style={s.heroOrder}>Order #{order.orderNumber}</p>
          <p style={s.heroSub}>
            {isBOPIS
              ? 'Your in-store pickup order has been placed successfully.'
              : 'Your order has been placed and is being processed.'}
          </p>
        </div>

        {isBOPIS && BOPIS_STATUS_MESSAGES[order.status] && (() => {
          const statusMsg = BOPIS_STATUS_MESSAGES[order.status];
          const StatusIcon = statusMsg.icon;
          return (
            <div style={{ ...s.disclaimerBox, backgroundColor: statusMsg.bg, borderColor: statusMsg.border, color: statusMsg.color }}>
              <StatusIcon size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={s.disclaimerText}>
                <strong>{statusMsg.title}:</strong> {statusMsg.message}
              </p>
            </div>
          );
        })()}

        {/* Live Status Tracker */}
        <div style={s.trackerCard}>
          <h2 style={s.sectionTitle}>
            <FiClock size={18} /> Live Order Status
            <span style={s.liveDot} />
          </h2>
          <div style={s.tracker}>
            {steps.map((step, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              const StepIcon = step.icon;
              return (
                <div key={step.key} style={s.step}>
                  <div style={{
                    ...s.stepDot,
                    backgroundColor: done ? '#E8E8E8' : 'rgba(255,255,255,0.05)',
                    ...(active ? { boxShadow: '0 0 0 4px rgba(232,232,232,0.12)', transform: 'scale(1.15)' } : {}),
                  }}>
                    {done ? <StepIcon size={14} color="#1b1b1f" /> : <span style={s.stepNum}>{i + 1}</span>}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ ...s.stepLine, backgroundColor: i < currentIdx ? '#E8E8E8' : 'rgba(255,255,255,0.05)' }} />
                  )}
                  <span style={{ ...s.stepLabel, fontWeight: active ? 700 : 400, color: done ? '#E8E8E8' : '#5C5C60' }}>
                    {step.label}
                  </span>
                  {active && <span style={s.stepDesc}>{step.desc}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pickup OTP Display */}
        {otpData?.hasOtp && otpData.pickupOtp && order.status === 'READY_FOR_PICKUP' && (
          <div style={s.otpCard}>
            <div style={s.otpHeader}>
              <FiShield size={22} color="#c4b5fd" />
              <div>
                <h3 style={s.otpTitle}>Your Pickup Verification Code</h3>
                <p style={s.otpSubtext}>Show this code to the store associate when collecting your order.</p>
              </div>
            </div>
            <div style={s.otpDisplay}>
              {otpData.pickupOtp.split('').map((d, i) => (
                <span key={i} style={s.otpDigit}>{d}</span>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#5C5C60' }}>
              Expires: {new Date(otpData.otpExpiresAt).toLocaleString()} · One-time use only
            </p>
          </div>
        )}

        {otpData?.hasOtp && otpData.otpVerificationStatus === 'VERIFIED' && (
          <div style={{ ...s.otpCard, borderColor: 'rgba(52,211,153,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiCheck size={20} color="#34d399" />
              <span style={{ color: '#34d399', fontWeight: 600, fontSize: 14 }}>
                Pickup code verified at store
                {otpData.otpVerifiedAt && ` — ${new Date(otpData.otpVerifiedAt).toLocaleString()}`}
              </span>
            </div>
          </div>
        )}

        <div style={s.grid}>
          {/* Left: Items */}
          <div>
            <div style={s.card}>
              <h3 style={s.cardTitle}><FiPackage size={16} /> Order Items</h3>
              {(order.items || []).map((item, idx) => (
                <div key={idx} style={s.itemRow}>
                  <div style={s.itemThumb}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.productName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <FiPackage size={20} color="#5C5C60" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={s.itemName}>{item.productName}</div>
                    <div style={s.itemMeta}>
                      {item.size && `Size ${item.size}`}{item.color && ` · ${item.color}`} · Qty {item.quantity}
                    </div>
                  </div>
                  <div style={s.itemPrice}>{formatCurrency(item.totalPrice || item.unitPrice * item.quantity)}</div>
                </div>
              ))}
              <div style={s.divider} />
              <div style={s.summaryLine}><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div style={s.summaryLine}><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
              <div style={s.summaryLine}><span>Shipping</span><span>{isBOPIS ? 'FREE' : order.shippingCost ? formatCurrency(order.shippingCost) : 'FREE'}</span></div>
              <div style={s.divider} />
              <div style={{ ...s.summaryLine, fontWeight: 800, fontSize: 18, color: '#E8E8E8' }}>
                <span>Total</span><span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Right: Fulfillment + Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Pickup / Shipping Info */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>
                {isBOPIS ? <><FiMapPin size={16} /> Pickup Details</> : <><FiTruck size={16} /> Shipping Details</>}
              </h3>
              {isBOPIS ? (
                <div style={s.storeBox}>
                  <strong style={{ fontSize: 15 }}>{storeName}</strong>
                  {formattedAddr && <span style={{ fontSize: 13, color: '#5C5C60', marginTop: 4 }}>{formattedAddr}</span>}
                  {order.pickupReadyTime && (
                    <div style={s.pickupBadge}>
                      <FiClock size={14} />
                      Pickup by: {new Date(order.pickupReadyTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  <p style={{ fontSize: 12, color: '#5C5C60', marginTop: 10, lineHeight: 1.5 }}>
                    Bring your order number or confirmation email when you arrive.
                  </p>
                </div>
              ) : order.shippingAddress ? (
                <div style={{ fontSize: 14, color: '#8E8E92', lineHeight: 1.7 }}>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipcode}</p>
                </div>
              ) : null}
            </div>

            {/* Order Timeline */}
            {order.statusHistory?.length > 0 && (() => {
              const history = [...order.statusHistory].reverse();
              return (
                <div style={s.card}>
                  <h3 style={s.cardTitle}><FiClock size={16} /> Timeline</h3>
                  {history.map((entry, idx) => {
                    const isLatest = idx === 0;
                    return (
                      <div key={idx} style={s.tlItem}>
                        <div style={{
                          ...s.tlDot,
                          backgroundColor: isLatest ? '#34d399' : '#E8E8E8',
                          ...(isLatest ? { boxShadow: '0 0 0 3px rgba(52,211,153,0.15)' } : {}),
                        }} />
                        {idx < history.length - 1 && (
                          <div style={{ ...s.tlLine, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                        )}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: isLatest ? 700 : 500, color: isLatest ? '#E8E8E8' : '#8E8E92' }}>
                            {(entry.toStatus || '').replace(/_/g, ' ')}
                          </div>
                          {entry.notes && <div style={{ fontSize: 12, color: '#5C5C60', marginTop: 2 }}>{entry.notes}</div>}
                          <div style={{ fontSize: 11, color: '#5C5C60', marginTop: 2 }}>
                            {new Date(entry.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Actions */}
        <div style={s.actions}>
          {guestEmail ? (
            <Link to="/track-order" style={s.primaryBtn}>Track Your Order <FiArrowRight size={14} /></Link>
          ) : (
            <Link to={`/orders/${orderId}`} style={s.primaryBtn}>View Order Details <FiArrowRight size={14} /></Link>
          )}
          <Link to="/" style={s.secondaryBtn}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: { backgroundColor: 'transparent', minHeight: '100vh', padding: '0 24px 64px' },
  container: { maxWidth: 960, margin: '0 auto' },
  loadingPage: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' },
  spinner: { width: 40, height: 40, border: '3px solid rgba(255,255,255,0.06)', borderTopColor: '#c8102e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  linkText: { color: '#60a5fa', fontSize: 14, marginTop: 12, textDecoration: 'underline' },

  hero: { textAlign: 'center', padding: '48px 0 36px' },
  heroIcon: { width: 80, height: 80, borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  heroTitle: { fontSize: 30, fontWeight: 800, color: '#E8E8E8', marginBottom: 6 },
  heroOrder: { fontSize: 16, color: '#5C5C60', fontFamily: 'monospace', letterSpacing: 1 },
  heroSub: { fontSize: 14, color: '#5C5C60', marginTop: 8, maxWidth: 420, margin: '8px auto 0' },
  disclaimerBox: { display: 'flex', gap: 12, padding: '16px 20px', backgroundColor: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)', borderRadius: 12, marginBottom: 28, color: '#fbbf24', alignItems: 'flex-start' },
  disclaimerText: { fontSize: 13, lineHeight: 1.7, margin: 0 },

  trackerCard: { backgroundColor: '#1b1b1f', borderRadius: 12, padding: '28px 32px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#E8E8E8', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: '50%', backgroundColor: '#34d399', display: 'inline-block', marginLeft: 4, animation: 'pulse 2s infinite' },
  tracker: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' },
  step: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, position: 'relative' },
  stepDot: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, transition: 'all 220ms ease' },
  stepNum: { fontSize: 12, fontWeight: 600, color: '#5C5C60' },
  stepLine: { position: 'absolute', top: 18, left: '50%', width: '100%', height: 3, zIndex: 0, borderRadius: 2 },
  stepLabel: { fontSize: 12, textAlign: 'center', maxWidth: 100, lineHeight: 1.3, color: '#8E8E92' },
  stepDesc: { fontSize: 11, color: '#5C5C60', textAlign: 'center', maxWidth: 110 },

  grid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 32 },
  card: { backgroundColor: '#1b1b1f', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#E8E8E8', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' },

  itemRow: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  itemThumb: { width: 56, height: 56, borderRadius: 8, overflow: 'hidden', backgroundColor: '#141417', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontWeight: 600, fontSize: 14, color: '#E8E8E8' },
  itemMeta: { fontSize: 12, color: '#5C5C60', marginTop: 3 },
  itemPrice: { fontWeight: 700, fontSize: 15, color: '#E8E8E8', whiteSpace: 'nowrap' },

  divider: { borderTop: '1px solid rgba(255,255,255,0.05)', margin: '12px 0' },
  summaryLine: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#8E8E92', padding: '4px 0' },

  storeBox: { display: 'flex', flexDirection: 'column', padding: '14px 16px', backgroundColor: 'rgba(52,211,153,0.08)', borderRadius: 12, color: '#34d399' },
  pickupBadge: { display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '6px 12px', backgroundColor: 'rgba(96,165,250,0.08)', borderRadius: 8, fontSize: 13, color: '#60a5fa', fontWeight: 600 },

  tlItem: { display: 'flex', gap: 12, position: 'relative', paddingBottom: 16 },
  tlDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 4 },
  tlLine: { position: 'absolute', left: 4, top: 18, width: 2, height: 'calc(100% - 14px)', backgroundColor: 'rgba(255,255,255,0.05)' },

  actions: { display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', paddingTop: 8 },
  primaryBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#c8102e', color: '#fff', padding: '14px 32px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', letterSpacing: 0.3, textTransform: 'uppercase', transition: 'opacity 220ms ease' },
  secondaryBtn: { display: 'inline-flex', alignItems: 'center', padding: '14px 32px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', color: '#E8E8E8', transition: 'border-color 220ms ease' },

  otpCard: { backgroundColor: '#1b1b1f', borderRadius: 12, padding: 24, border: '1px solid rgba(196,181,253,0.15)', marginBottom: 28, boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  otpHeader: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  otpTitle: { fontSize: 16, fontWeight: 700, color: '#E8E8E8', marginBottom: 4 },
  otpSubtext: { fontSize: 13, color: '#8E8E92', lineHeight: 1.5 },
  otpDisplay: { display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 14 },
  otpDigit: { width: 56, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#E8E8E8', backgroundColor: '#141417', borderRadius: 10, border: '1px solid rgba(196,181,253,0.2)', letterSpacing: 2 },
};

export default OrderConfirmationPage;
