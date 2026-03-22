import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiMapPin, FiTruck, FiPackage, FiCheck, FiX, FiClock, FiShield, FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo, FiRotateCcw } from 'react-icons/fi';
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
    message: 'Your order is currently pending and will only be confirmed once the store manager reviews and accepts it based on current stock availability. The pickup date and time will be provided after acceptance.',
  },
  ACCEPTED: {
    icon: FiCheck,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.12)',
    title: 'Order Accepted by Store',
    message: 'The store has accepted your order and is now preparing it for pickup. You will be notified once your items are ready to collect.',
  },
  READY_FOR_PICKUP: {
    icon: FiMapPin,
    color: '#c4b5fd',
    bg: 'rgba(196,181,253,0.06)',
    border: 'rgba(196,181,253,0.12)',
    title: 'Ready for Pickup',
    message: 'Your order is ready! Head to the store with your order number and the pickup verification code. A store associate will verify your code and hand over your items.',
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
    message: 'You have successfully collected your order. If you need to return any items, you can initiate a return from this page.',
  },
  COMPLETED: {
    icon: FiCheckCircle,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.12)',
    title: 'Order Complete',
    message: 'Your order is complete. Thank you for shopping with Converse! Returns can be initiated within 30 days.',
  },
  REJECTED: {
    icon: FiXCircle,
    color: '#f87171',
    bg: 'rgba(248,113,113,0.06)',
    border: 'rgba(248,113,113,0.12)',
    title: 'Order Could Not Be Fulfilled',
    message: 'The store was unable to fulfill your order due to stock unavailability. You will not be charged. Please try placing a new order or selecting a different store.',
  },
  CANCELLED: {
    icon: FiAlertTriangle,
    color: '#f87171',
    bg: 'rgba(248,113,113,0.06)',
    border: 'rgba(248,113,113,0.12)',
    title: 'Order Cancelled',
    message: 'This order has been cancelled. If you were charged, a refund will be processed within 5–7 business days.',
  },
  RETURN_REQUESTED: {
    icon: FiRotateCcw,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.06)',
    border: 'rgba(251,191,36,0.12)',
    title: 'Return Requested',
    message: 'Your return request has been submitted and is awaiting review by the store. You will be notified once the store accepts or responds to your request.',
  },
  RETURN_ACCEPTED: {
    icon: FiCheck,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.12)',
    title: 'Return Accepted',
    message: 'The store has accepted your return request. Please bring the item(s) to the store for inspection and processing.',
  },
  RETURN_COMPLETED: {
    icon: FiCheckCircle,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.12)',
    title: 'Return Complete',
    message: 'Your return has been processed successfully. A refund will be issued to your original payment method within 5–7 business days.',
  },
  RETURN_VERIFICATION_PENDING: {
    icon: FiShield,
    color: '#c4b5fd',
    bg: 'rgba(196,181,253,0.06)',
    border: 'rgba(196,181,253,0.12)',
    title: 'Verification In Progress',
    message: 'The store is inspecting your returned items. You will be notified once verification is complete.',
  },
  RETURN_VERIFIED_PASS: {
    icon: FiCheckCircle,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.12)',
    title: 'Return Verified — Passed',
    message: 'Your returned items have passed inspection. The store is processing your refund. It will be issued within 5–7 business days.',
  },
  RETURN_VERIFIED_FAIL: {
    icon: FiXCircle,
    color: '#f87171',
    bg: 'rgba(248,113,113,0.06)',
    border: 'rgba(248,113,113,0.12)',
    title: 'Return Verification Failed',
    message: 'Your returned items did not pass store inspection. The return cannot be completed. Please contact customer support for assistance.',
  },
  RETURN_REJECTED: {
    icon: FiXCircle,
    color: '#f87171',
    bg: 'rgba(248,113,113,0.06)',
    border: 'rgba(248,113,113,0.12)',
    title: 'Return Rejected',
    message: 'Unfortunately, your return request has been declined by the store. Please contact customer support for more information.',
  },
  RETURN_CANCELLED: {
    icon: FiAlertTriangle,
    color: '#f87171',
    bg: 'rgba(248,113,113,0.06)',
    border: 'rgba(248,113,113,0.12)',
    title: 'Return Cancelled',
    message: 'This return has been cancelled. If you believe this is an error, please contact customer support.',
  },
};

const BOPIS_STEPS = [
  { key: 'AWAITING_STORE_ACCEPTANCE', label: 'Order Placed', icon: FiPackage },
  { key: 'ACCEPTED', label: 'Store Accepted', icon: FiCheck },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: FiMapPin },
  { key: 'OTP_VERIFIED', label: 'OTP Verified', icon: FiShield },
  { key: 'PICKED_UP', label: 'Picked Up', icon: FiCheck },
  { key: 'COMPLETED', label: 'Completed', icon: FiCheck },
];

const SHIP_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: FiPackage },
  { key: 'PROCESSING', label: 'Processing', icon: FiClock },
  { key: 'SHIPPED', label: 'Shipped', icon: FiTruck },
  { key: 'DELIVERED', label: 'Delivered', icon: FiCheck },
];

const STATUS_DISPLAY = {
  PLACED: { label: 'Order Placed', color: '#93c5fd', bg: '#1e3a5f' },
  AWAITING_STORE_ACCEPTANCE: { label: 'Awaiting Store Acceptance', color: '#fbbf24', bg: '#422006' },
  ACCEPTED: { label: 'Accepted by Store', color: '#6ee7b7', bg: '#064e3b' },
  REJECTED: { label: 'Rejected', color: '#fca5a5', bg: '#450a0a' },
  READY_FOR_PICKUP: { label: 'Ready for Pickup', color: '#c4b5fd', bg: '#3730a3' },
  OTP_VERIFIED: { label: 'OTP Verified', color: '#6ee7b7', bg: '#064e3b' },
  PICKED_UP: { label: 'Picked Up', color: '#6ee7b7', bg: '#064e3b' },
  COMPLETED: { label: 'Completed', color: '#6ee7b7', bg: '#064e3b' },
  CANCELLED: { label: 'Cancelled', color: '#fca5a5', bg: '#450a0a' },
  RETURN_REQUESTED: { label: 'Return Requested', color: '#fbbf24', bg: '#422006' },
  RETURN_ACCEPTED: { label: 'Return Accepted', color: '#93c5fd', bg: '#1e3a5f' },
  RETURN_REJECTED: { label: 'Return Rejected', color: '#fca5a5', bg: '#450a0a' },
  RETURN_VERIFICATION_PENDING: { label: 'Return Verification Pending', color: '#c4b5fd', bg: '#3730a3' },
  RETURN_VERIFIED_PASS: { label: 'Return Verified', color: '#6ee7b7', bg: '#064e3b' },
  RETURN_VERIFIED_FAIL: { label: 'Return Verification Failed', color: '#fca5a5', bg: '#450a0a' },
  RETURN_COMPLETED: { label: 'Return Completed', color: '#6ee7b7', bg: '#064e3b' },
  RETURN_CANCELLED: { label: 'Return Cancelled', color: '#fca5a5', bg: '#450a0a' },
};

const RETURN_TIMELINE_STEPS = [
  { key: 'RETURN_REQUESTED', label: 'Return Requested', icon: FiRotateCcw },
  { key: 'RETURN_ACCEPTED', label: 'Accepted', icon: FiCheck },
  { key: 'RETURN_VERIFIED_PASS', label: 'Verified', icon: FiShield },
  { key: 'RETURN_COMPLETED', label: 'Refund Processed', icon: FiCheckCircle },
];

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const guestEmail = useMemo(() => {
    return searchParams.get('email')
      || sessionStorage.getItem(`order_email_${orderId}`)
      || user?.email
      || null;
  }, [searchParams, orderId, user]);
  const { order, loading, error } = useOrderStatus(orderId, guestEmail);
  const navigate = useNavigate();
  const isGuestView = !user && !!guestEmail;
  const [otpData, setOtpData] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (!order) return;
    const otpStatuses = ['READY_FOR_PICKUP', 'OTP_VERIFIED', 'PICKED_UP', 'COMPLETED'];
    if (order.deliveryMethod === 'SHIP_TO_STORE' && otpStatuses.includes(order.status)) {
      orderService.getPickupOtp(orderId, guestEmail).then(setOtpData).catch(() => {});
    }
  }, [order?.status, orderId, guestEmail]);

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await orderService.cancelOrder(orderId, 'Customer requested cancellation');
      setShowCancelModal(false);
      toast.success('Order cancelled');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={styles.spinner} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <h2>Order not found</h2>
            <Link to={isGuestView ? '/track-order' : '/orders'} style={styles.backBtn}>
              {isGuestView ? 'Back to Track Order' : 'Back to Orders'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPickup = order.deliveryMethod === 'SHIP_TO_STORE';
  const isReturnStatus = (order.status || '').startsWith('RETURN_');
  const steps = isPickup ? BOPIS_STEPS : SHIP_STEPS;
  const currentStepIndex = isReturnStatus ? steps.length - 1 : steps.findIndex((s) => s.key === order.status);
  const canCancel = ['PLACED', 'AWAITING_STORE_ACCEPTANCE'].includes(order.status);
  const canReturn = order.status === 'COMPLETED';
  const statusInfo = STATUS_DISPLAY[order.status] || { label: order.status, color: '#8E8E92', bg: '#1b1b1f' };
  const orderReturns = order.returns || [];

  const storeInfo = order.storeId || order.store;
  const storeAddress = storeInfo?.address;
  const formattedStoreAddress = storeAddress
    ? typeof storeAddress === 'object'
      ? `${storeAddress.street || ''}, ${storeAddress.city || ''}, ${storeAddress.state || ''} ${storeAddress.zipcode || ''}`.trim()
      : storeAddress
    : null;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to={isGuestView ? '/track-order' : '/orders'} style={styles.backLink}>
          <FiArrowLeft size={16} /> {isGuestView ? 'Back to Track Order' : 'Back to Orders'}
        </Link>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Order #{order.orderNumber || orderId}</h1>
            <span style={styles.date}>Placed on {formatDate(order.createdAt)}</span>
          </div>
          <div style={styles.headerRight}>
            <span style={{ ...styles.statusBadge, backgroundColor: statusInfo.bg, color: statusInfo.color }}>
              {statusInfo.label}
            </span>
            <div style={styles.actions}>
              {!isGuestView && canCancel && (
                <button onClick={() => setShowCancelModal(true)} style={styles.cancelBtn}>
                  <FiX size={14} /> Cancel Order
                </button>
              )}
              {canReturn && user && (
                <Link to={`/returns/${orderId}`} style={styles.returnBtn}>
                  <FiRotateCcw size={13} /> Return
                </Link>
              )}
              {canReturn && !user && (
                <Link to="/login" style={styles.returnBtn}>
                  Log In to Return
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Status Tracker */}
        {!['CANCELLED', 'REJECTED'].includes(order.status) && (
          <div style={styles.tracker}>
            {steps.map((step, i) => {
              const isActive = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const StepIcon = step.icon;
              return (
                <div key={step.key} style={styles.step}>
                  <div
                    style={{
                      ...styles.stepDot,
                      backgroundColor: isActive ? '#E8E8E8' : 'rgba(255,255,255,0.05)',
                      ...(isCurrent ? { boxShadow: '0 0 0 4px rgba(232,232,232,0.15)', transform: 'scale(1.1)' } : {}),
                    }}
                  >
                    {isActive ? <StepIcon size={14} color="#1b1b1f" /> : <span style={styles.stepNum}>{i + 1}</span>}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      style={{
                        ...styles.stepLine,
                        backgroundColor: i < currentStepIndex ? '#E8E8E8' : 'rgba(255,255,255,0.05)',
                      }}
                    />
                  )}
                  <span
                    style={{
                      ...styles.stepLabel,
                      fontWeight: isCurrent ? 700 : 400,
                      color: isActive ? '#E8E8E8' : '#5C5C60',
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic Status Message */}
        {BOPIS_STATUS_MESSAGES[order.status] && (() => {
          const statusMsg = BOPIS_STATUS_MESSAGES[order.status];
          const StatusIcon = statusMsg.icon;
          return (
            <div style={{ ...styles.statusMsgBox, backgroundColor: statusMsg.bg, borderColor: statusMsg.border, color: statusMsg.color }}>
              <StatusIcon size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                <strong>{statusMsg.title}:</strong> {statusMsg.message}
              </p>
            </div>
          );
        })()}

        {/* Pickup OTP Section */}
        {otpData?.hasOtp && otpData.pickupOtp && order.status === 'READY_FOR_PICKUP' && (
          <div style={styles.otpCard}>
            <div style={styles.otpHeader}>
              <FiShield size={22} color="#c4b5fd" />
              <div>
                <h3 style={styles.otpTitle}>Pickup Verification Code</h3>
                <p style={styles.otpSubtext}>Show this code to the store associate when you pick up your order.</p>
              </div>
            </div>
            <div style={styles.otpDisplay}>
              {otpData.pickupOtp.split('').map((digit, i) => (
                <span key={i} style={styles.otpDigit}>{digit}</span>
              ))}
            </div>
            <div style={styles.otpInfo}>
              <span style={{ color: '#5C5C60', fontSize: 12 }}>
                This code expires on {new Date(otpData.otpExpiresAt).toLocaleString()} • One-time use only
              </span>
            </div>
          </div>
        )}

        {otpData?.hasOtp && otpData.otpVerificationStatus === 'VERIFIED' && (
          <div style={{ ...styles.otpCard, borderColor: 'rgba(52,211,153,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiCheck size={20} color="#34d399" />
              <span style={{ color: '#34d399', fontWeight: 600, fontSize: 14 }}>
                Pickup code verified at store
                {otpData.otpVerifiedAt && ` — ${new Date(otpData.otpVerifiedAt).toLocaleString()}`}
              </span>
            </div>
          </div>
        )}

        {otpData?.hasOtp && otpData.otpVerificationStatus === 'EXPIRED' && order.status === 'READY_FOR_PICKUP' && (
          <div style={{ ...styles.otpCard, borderColor: 'rgba(251,191,36,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FiClock size={20} color="#fbbf24" />
              <span style={{ color: '#fbbf24', fontWeight: 600, fontSize: 14 }}>
                Your pickup code has expired. Please contact the store for a new one.
              </span>
            </div>
          </div>
        )}

        {/* Return Action Banner */}
        {canReturn && !isReturnStatus && orderReturns.length === 0 && (
          <div style={styles.returnActionBanner}>
            <div style={styles.returnActionContent}>
              <div style={styles.returnActionIconWrap}>
                <FiRotateCcw size={24} color="#E8E8E8" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={styles.returnActionTitle}>Need to return an item?</h3>
                <p style={styles.returnActionText}>
                  {user
                    ? 'You can initiate a return within 30 days of order completion. Returns are processed at your pickup store.'
                    : 'Log in to your account to initiate a return within 30 days of completion.'}
                </p>
              </div>
              {user ? (
                <Link to={`/returns/${orderId}`} style={styles.returnActionBtn}>
                  <FiRotateCcw size={14} /> Return
                </Link>
              ) : (
                <Link to="/login" style={styles.returnActionBtn}>
                  Log In to Return
                </Link>
              )}
            </div>
          </div>
        )}

        {order.status === 'CANCELLED' && (
          <div style={styles.cancelledBanner}>
            <FiX size={20} /> This order has been cancelled.
            {order.cancelReason && <span style={{ fontWeight: 400, marginLeft: 4 }}>— {order.cancelReason}</span>}
          </div>
        )}

        {order.status === 'REJECTED' && (
          <div style={styles.cancelledBanner}>
            <FiX size={20} /> This order was rejected by the store.
            {order.notes && <span style={{ fontWeight: 400, marginLeft: 4 }}>— {order.notes}</span>}
          </div>
        )}

        {/* Return Timeline */}
        {orderReturns.length > 0 && isReturnStatus && (() => {
          const retStatus = order.status;
          const isFailed = ['RETURN_REJECTED', 'RETURN_CANCELLED', 'RETURN_VERIFIED_FAIL'].includes(retStatus);
          const getReturnTimelineIdx = () => {
            if (retStatus === 'RETURN_COMPLETED') return 3;
            if (retStatus === 'RETURN_VERIFIED_PASS') return 2;
            if (retStatus === 'RETURN_VERIFICATION_PENDING') return 2;
            if (retStatus === 'RETURN_ACCEPTED') return 1;
            if (retStatus === 'RETURN_REQUESTED') return 0;
            return -1;
          };
          const retTimelineIdx = getReturnTimelineIdx();
          if (isFailed) return null;
          return (
            <div style={styles.tracker}>
              {RETURN_TIMELINE_STEPS.map((step, i) => {
                const isActive = i <= retTimelineIdx;
                const isCurrent = i === retTimelineIdx;
                const StepIcon = step.icon;
                return (
                  <div key={step.key} style={styles.step}>
                    <div style={{
                      ...styles.stepDot,
                      backgroundColor: isActive ? '#E8E8E8' : 'rgba(255,255,255,0.05)',
                      ...(isCurrent ? { boxShadow: '0 0 0 4px rgba(232,232,232,0.15)', transform: 'scale(1.1)' } : {}),
                    }}>
                      {isActive ? <StepIcon size={14} color="#1b1b1f" /> : <span style={styles.stepNum}>{i + 1}</span>}
                    </div>
                    {i < RETURN_TIMELINE_STEPS.length - 1 && (
                      <div style={{ ...styles.stepLine, backgroundColor: i < retTimelineIdx ? '#E8E8E8' : 'rgba(255,255,255,0.05)' }} />
                    )}
                    <span style={{ ...styles.stepLabel, fontWeight: isCurrent ? 700 : 400, color: isActive ? '#E8E8E8' : '#5C5C60' }}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Return Information */}
        {orderReturns.length > 0 && (
          <div style={styles.returnCard}>
            <h3 style={styles.cardTitle}><FiRotateCcw size={18} /> Return Details</h3>
            {orderReturns.map((ret) => {
              const retStatusInfo = {
                RETURN_REQUESTED: { label: 'Pending Review', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
                RETURN_ACCEPTED: { label: 'Accepted', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
                RETURN_VERIFICATION_PENDING: { label: 'Verification Pending', color: '#c4b5fd', bg: 'rgba(196,181,253,0.08)' },
                RETURN_VERIFIED_PASS: { label: 'Verified — Pass', color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
                RETURN_VERIFIED_FAIL: { label: 'Verification Failed', color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
                RETURN_COMPLETED: { label: 'Completed', color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
                RETURN_REJECTED: { label: 'Rejected', color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
                RETURN_CANCELLED: { label: 'Cancelled', color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
              }[ret.status] || { label: ret.status?.replace(/_/g, ' '), color: '#8E8E92', bg: 'rgba(142,142,146,0.08)' };

              return (
                <div key={ret._id} style={styles.returnEntry}>
                  <div style={styles.returnHeader}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#E8E8E8' }}>
                        Return #{ret.returnNumber}
                      </span>
                      <span style={{ fontSize: 12, color: '#5C5C60', marginLeft: 10 }}>
                        {new Date(ret.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, backgroundColor: retStatusInfo.bg, color: retStatusInfo.color }}>
                      {retStatusInfo.label}
                    </span>
                  </div>
                  {ret.reason && (
                    <p style={{ fontSize: 13, color: '#8E8E92', margin: '8px 0 0' }}>
                      <strong>Reason:</strong> {ret.reason}
                    </p>
                  )}
                  {ret.items && ret.items.length > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {ret.items.map((ri, i) => (
                        <div key={i} style={styles.returnItem}>
                          <span style={{ fontSize: 13, color: '#E8E8E8' }}>{ri.productName}</span>
                          <span style={{ fontSize: 12, color: '#5C5C60' }}>
                            {ri.size && `Size ${ri.size}`}{ri.color && ` · ${ri.color}`} · Qty {ri.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {ret.refundAmount > 0 && (
                    <p style={{ fontSize: 13, color: '#34d399', marginTop: 8, fontWeight: 600 }}>
                      Refund: {formatCurrency(ret.refundAmount)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Status History Timeline */}
        {order.statusHistory?.length > 0 && (() => {
          const history = [...order.statusHistory].reverse();
          return (
            <div style={styles.timelineCard}>
              <h3 style={styles.cardTitle}><FiClock size={18} /> Order Timeline</h3>
              <div style={styles.timeline}>
                {history.map((entry, idx) => {
                  const info = STATUS_DISPLAY[entry.toStatus] || { label: entry.toStatus, color: '#8E8E92' };
                  const isLatest = idx === 0;
                  return (
                    <div key={idx} style={styles.timelineItem}>
                      <div style={{
                        ...styles.timelineDot,
                        backgroundColor: isLatest ? '#34d399' : info.color,
                        ...(isLatest ? { boxShadow: '0 0 0 3px rgba(52,211,153,0.15)', width: 12, height: 12 } : {}),
                      }} />
                      {idx < history.length - 1 && <div style={styles.timelineLine} />}
                      <div style={styles.timelineContent}>
                        <strong style={{ fontSize: 13, color: isLatest ? '#E8E8E8' : info.color }}>{info.label}</strong>
                        {entry.notes && <span style={styles.timelineNote}>{entry.notes}</span>}
                        <span style={styles.timelineDate}>{formatDate(entry.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <div style={styles.grid}>
          {/* Items */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <FiPackage size={18} /> Items ({(order.items || []).length})
            </h3>
            {(order.items || []).map((item, i) => (
              <div key={i} style={styles.item}>
                <div style={styles.itemImg}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.productName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <FiPackage size={24} color="#5C5C60" style={{ margin: 'auto' }} />
                  )}
                </div>
                <div style={styles.itemInfo}>
                  <strong style={{ fontSize: 14 }}>{item.productName}</strong>
                  <span style={styles.itemMeta}>
                    {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                  </span>
                  <span style={{ fontSize: 13 }}>
                    Qty: {item.quantity} &times; {formatCurrency(item.unitPrice)}
                  </span>
                </div>
                <span style={{ fontWeight: 700, fontSize: 15 }}>
                  {formatCurrency(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Details Sidebar */}
          <div style={styles.detailsSide}>
            {/* Fulfillment */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                {isPickup ? <><FiMapPin size={18} /> Pickup Details</> : <><FiTruck size={18} /> Shipping Details</>}
              </h3>
              {isPickup && storeInfo ? (
                <div style={styles.storeBox}>
                  <strong>{storeInfo.name}</strong>
                  {formattedStoreAddress && (
                    <span style={{ fontSize: 13, color: '#5C5C60' }}>{formattedStoreAddress}</span>
                  )}
                  {storeInfo.phone && (
                    <span style={{ fontSize: 12, color: '#5C5C60', marginTop: 2 }}>{storeInfo.phone}</span>
                  )}
                  {order.pickupReadyTime && (
                    <div style={styles.pickupTime}>
                      <FiClock size={14} />
                      <span>Pickup by: {formatDate(order.pickupReadyTime)}</span>
                    </div>
                  )}
                </div>
              ) : order.shippingAddress ? (
                <div style={{ fontSize: 13, color: '#8E8E92', lineHeight: 1.6 }}>
                  <p>{order.shippingAddress.street || order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipcode}
                  </p>
                </div>
              ) : null}
            </div>

            {/* Summary */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Order Summary</h3>
              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Shipping</span>
                <span>{isPickup ? 'FREE (Pickup)' : order.shippingCost ? formatCurrency(order.shippingCost) : 'FREE'}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div style={styles.divider} />
              <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: 17, color: '#E8E8E8' }}>
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Order Modal */}
        {showCancelModal && (
          <div style={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <FiAlertTriangle size={32} color="#f87171" />
              </div>
              <h3 style={styles.modalTitle}>Cancel This Order?</h3>
              <p style={styles.modalDesc}>
                This action cannot be undone. Your order will be cancelled and any reserved inventory will be released.
              </p>
              <div style={styles.modalBtnRow}>
                <button onClick={() => setShowCancelModal(false)} style={styles.modalKeepBtn}>Keep Order</button>
                <button onClick={handleCancel} disabled={cancelLoading} style={styles.modalCancelConfirmBtn}>
                  {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { padding: '32px 24px 64px', backgroundColor: 'transparent', minHeight: '80vh' },
  container: { maxWidth: 1024, margin: '0 auto' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#5C5C60', textDecoration: 'none', marginBottom: 20 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 },
  headerRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 },
  title: { fontSize: 24, fontWeight: 800, marginBottom: 4, color: '#E8E8E8' },
  date: { fontSize: 13, color: '#5C5C60' },
  statusBadge: { fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.5 },
  actions: { display: 'flex', gap: 8 },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: 4, padding: '8px 16px', border: '1px solid #f87171', borderRadius: 8, backgroundColor: 'transparent', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'opacity 220ms ease' },
  returnBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, backgroundColor: 'transparent', color: '#E8E8E8', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'border-color 220ms ease' },
  tracker: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, padding: '28px 20px', backgroundColor: '#1b1b1f', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', position: 'relative', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  step: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1, position: 'relative' },
  stepDot: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, transition: 'all 220ms ease' },
  stepNum: { fontSize: 12, fontWeight: 600, color: '#5C5C60' },
  stepLine: { position: 'absolute', top: 16, left: '50%', width: '100%', height: 3, zIndex: 0, borderRadius: 2 },
  stepLabel: { fontSize: 11, textAlign: 'center', maxWidth: 90, lineHeight: 1.3, color: '#8E8E92' },
  statusMsgBox: { display: 'flex', gap: 12, padding: '16px 20px', borderRadius: 12, marginBottom: 24, alignItems: 'flex-start', border: '1px solid' },
  cancelledBanner: { display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', backgroundColor: 'rgba(248,113,113,0.08)', color: '#f87171', borderRadius: 8, fontSize: 14, fontWeight: 600, marginBottom: 32 },
  timelineCard: { backgroundColor: '#1b1b1f', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  timeline: { position: 'relative', paddingLeft: 4 },
  timelineItem: { display: 'flex', gap: 14, position: 'relative', paddingBottom: 18 },
  timelineDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 4 },
  timelineLine: { position: 'absolute', left: 4, top: 18, width: 2, height: 'calc(100% - 14px)', backgroundColor: 'rgba(255,255,255,0.05)' },
  timelineContent: { display: 'flex', flexDirection: 'column', gap: 2 },
  timelineNote: { fontSize: 12, color: '#5C5C60' },
  timelineDate: { fontSize: 11, color: '#5C5C60' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' },
  card: { backgroundColor: '#1b1b1f', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#E8E8E8' },
  item: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  itemImg: { width: 64, height: 64, borderRadius: 8, overflow: 'hidden', backgroundColor: '#141417', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3 },
  itemMeta: { fontSize: 12, color: '#5C5C60' },
  detailsSide: { display: 'flex', flexDirection: 'column', gap: 16 },
  storeBox: { display: 'flex', flexDirection: 'column', gap: 4, padding: '14px 16px', backgroundColor: 'rgba(52,211,153,0.08)', borderRadius: 8, fontSize: 14, color: '#34d399' },
  pickupTime: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '8px 12px', backgroundColor: 'rgba(96,165,250,0.08)', borderRadius: 8, fontSize: 13, color: '#60a5fa', fontWeight: 600 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, color: '#8E8E92' },
  divider: { borderTop: '1px solid rgba(255,255,255,0.05)', margin: '8px 0 12px' },
  spinner: { width: 40, height: 40, border: '3px solid rgba(255,255,255,0.06)', borderTopColor: '#c8102e', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' },
  backBtn: { display: 'inline-block', marginTop: 16, padding: '10px 24px', backgroundColor: '#c8102e', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14, transition: 'opacity 220ms ease' },
  otpCard: { backgroundColor: '#1b1b1f', borderRadius: 12, padding: 24, border: '1px solid rgba(196,181,253,0.15)', marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  otpHeader: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 },
  otpTitle: { fontSize: 16, fontWeight: 700, color: '#E8E8E8', marginBottom: 4 },
  otpSubtext: { fontSize: 13, color: '#8E8E92', lineHeight: 1.5 },
  otpDisplay: { display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 },
  otpDigit: { width: 56, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#E8E8E8', backgroundColor: '#141417', borderRadius: 10, border: '1px solid rgba(196,181,253,0.2)', letterSpacing: 2 },
  otpInfo: { textAlign: 'center' },
  returnActionBanner: { marginBottom: 24 },
  returnActionContent: { display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', backgroundColor: '#1b1b1f', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', flexWrap: 'wrap' },
  returnActionIconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(200,16,46,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  returnActionTitle: { fontSize: 15, fontWeight: 700, color: '#E8E8E8', marginBottom: 4 },
  returnActionText: { fontSize: 13, color: '#8E8E92', lineHeight: 1.5, margin: 0 },
  returnActionBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', backgroundColor: '#c8102e', color: '#fff', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'opacity 220ms ease', letterSpacing: 0.3 },
  returnCard: { backgroundColor: '#1b1b1f', borderRadius: 12, padding: 24, border: '1px solid rgba(251,191,36,0.15)', marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  returnEntry: { padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  returnHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  returnItem: { display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' },
  modal: { backgroundColor: '#1b1b1f', borderRadius: 14, padding: 32, maxWidth: 420, width: '90%', boxShadow: '0 16px 48px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' },
  modalTitle: { fontSize: 20, fontWeight: 700, marginBottom: 6, textAlign: 'center', color: '#E8E8E8' },
  modalDesc: { fontSize: 13, color: '#8E8E92', marginBottom: 20, textAlign: 'center', lineHeight: 1.6 },
  modalBtnRow: { display: 'flex', gap: 12 },
  modalKeepBtn: { flex: 1, padding: '12px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#8E8E92' },
  modalCancelConfirmBtn: { flex: 1, padding: '12px 20px', borderRadius: 8, border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
};

export default OrderDetailPage;
