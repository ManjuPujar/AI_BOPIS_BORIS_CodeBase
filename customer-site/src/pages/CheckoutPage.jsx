import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLock, FiMapPin, FiTruck, FiAlertCircle } from 'react-icons/fi';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import * as orderService from '../services/orderService';
import { formatCurrency } from '../utils/formatCurrency';
import { validateEmail, validateZipcode } from '../utils/validators';

const luhnCheck = (num) => {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
};

const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
};

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
};

const CheckoutPage = () => {
  const { cart, cartTotal, selectedStore, deliveryMethod, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  });

  const shippingCost = deliveryMethod !== 'pickup' && cartTotal < 75 ? 7.95 : 0;
  const tax = parseFloat((cartTotal * 0.08).toFixed(2));
  const total = parseFloat((cartTotal + tax + shippingCost).toFixed(2));

  const isPickup = deliveryMethod === 'pickup';
  const missingStore = isPickup && !selectedStore;

  const allFieldsFilled = (() => {
    if (!shippingInfo.firstName.trim() || !shippingInfo.lastName.trim() ||
        !shippingInfo.email.trim() || !shippingInfo.phone.trim()) return false;
    if (!isPickup && (!shippingInfo.street.trim() || !shippingInfo.city.trim() ||
        !shippingInfo.state.trim() || !shippingInfo.zipcode.trim())) return false;
    if (missingStore) return false;
    if (!paymentInfo.nameOnCard.trim() || !paymentInfo.cardNumber.trim() ||
        !paymentInfo.expiryDate.trim() || !paymentInfo.cvv.trim()) return false;
    if (cart.length === 0) return false;
    return true;
  })();

  const validate = () => {
    const errs = {};

    if (!shippingInfo.firstName.trim()) errs.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) errs.lastName = 'Last name is required';
    if (!shippingInfo.email.trim()) errs.email = 'Email is required';
    else if (!validateEmail(shippingInfo.email)) errs.email = 'Enter a valid email address';
    if (!shippingInfo.phone.trim()) errs.phone = 'Phone number is required';

    if (!isPickup) {
      if (!shippingInfo.street.trim()) errs.street = 'Street address is required';
      if (!shippingInfo.city.trim()) errs.city = 'City is required';
      if (!shippingInfo.state.trim()) errs.state = 'State is required';
      if (!shippingInfo.zipcode.trim()) errs.zipcode = 'ZIP code is required';
      else if (!validateZipcode(shippingInfo.zipcode)) errs.zipcode = 'Enter a valid 5-digit ZIP code';
    }

    if (isPickup && !selectedStore) errs.store = 'Please select a pickup store';

    if (!paymentInfo.nameOnCard.trim()) errs.nameOnCard = 'Name on card is required';
    else if (paymentInfo.nameOnCard.trim().length < 2) errs.nameOnCard = 'Enter the full name as it appears on the card';

    const cardDigits = paymentInfo.cardNumber.replace(/\s/g, '');
    if (!cardDigits) errs.cardNumber = 'Card number is required';
    else if (!/^\d+$/.test(cardDigits)) errs.cardNumber = 'Card number must contain only digits';
    else if (cardDigits.length < 13 || cardDigits.length > 19) errs.cardNumber = 'Card number must be 13–19 digits';
    else if (!luhnCheck(cardDigits)) errs.cardNumber = 'Invalid card number';

    if (!paymentInfo.expiryDate.trim()) errs.expiryDate = 'Expiry date is required';
    else if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) errs.expiryDate = 'Use MM/YY format';
    else {
      const [mm, yy] = paymentInfo.expiryDate.split('/').map(Number);
      if (mm < 1 || mm > 12) errs.expiryDate = 'Invalid month (01–12)';
      else {
        const expiry = new Date(2000 + yy, mm);
        if (expiry <= new Date()) errs.expiryDate = 'Card has expired';
      }
    }

    if (!paymentInfo.cvv.trim()) errs.cvv = 'CVV is required';
    else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) errs.cvv = 'CVV must be 3 or 4 digits';

    return errs;
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === 'cardNumber') formatted = formatCardNumber(value);
    else if (name === 'expiryDate') formatted = formatExpiry(value);
    else if (name === 'cvv') formatted = value.replace(/\D/g, '').slice(0, 4);
    setPaymentInfo((prev) => ({ ...prev, [name]: formatted }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate();
    if (errs[name]) setErrors((prev) => ({ ...prev, [name]: errs[name] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched(Object.keys(errs).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
      const firstKey = Object.keys(errs)[0];
      const el = document.querySelector(`[name="${firstKey}"]`);
      if (el) el.focus();
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.productId,
          sku: item.sku,
          productName: item.productName,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        fulfillment: {
          method: deliveryMethod,
          store: isPickup && selectedStore
            ? { storeId: selectedStore._id || selectedStore.id, name: selectedStore.name }
            : undefined,
          shippingAddress: !isPickup ? {
            street: shippingInfo.street,
            city: shippingInfo.city,
            state: shippingInfo.state,
            zipcode: shippingInfo.zipcode,
            country: 'US',
          } : undefined,
        },
        contactInfo: {
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
        },
        subtotal: cartTotal,
        tax,
        shippingCost,
        total,
      };

      const result = await orderService.createOrder(orderData);
      clearCart();
      const oid = result.order?._id || result.orderId || result._id;
      sessionStorage.setItem(`order_email_${oid}`, shippingInfo.email);
      navigate(`/order-confirmation/${oid}`, {
        state: { guestEmail: shippingInfo.email },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cart.length === 0 && !loading) {
      navigate('/cart');
    }
  }, [cart.length, loading, navigate]);

  if (cart.length === 0) return null;

  const fieldStyle = (name) => ({
    ...styles.input,
    ...(errors[name] && touched[name] ? { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.12)' } : {}),
  });

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>
          <FiLock size={20} style={{ marginRight: 8 }} />
          Secure Checkout
        </h1>

        <form onSubmit={handleSubmit} noValidate style={styles.layout}>
          <div style={styles.formSection}>
            {/* Fulfillment */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>
                {isPickup ? <><FiMapPin size={18} /> Pickup Details</> : <><FiTruck size={18} /> Shipping Address</>}
              </h2>

              {isPickup && selectedStore && (
                <div style={styles.pickupInfo}>
                  <strong>{selectedStore.name}</strong>
                  <span style={styles.pickupAddr}>
                    {typeof selectedStore.address === 'object'
                      ? `${selectedStore.address.street}, ${selectedStore.address.city}, ${selectedStore.address.state} ${selectedStore.address.zipcode}`
                      : selectedStore.address}
                  </span>
                  <span style={styles.pickupReady}>Ready in approximately 2 hours</span>
                </div>
              )}

              {isPickup && !selectedStore && (
                <div style={styles.errorBanner}>
                  <FiAlertCircle size={18} />
                  <div>
                    <strong>No pickup store selected</strong>
                    <span style={{ display: 'block', fontSize: 12, marginTop: 2 }}>
                      Please go back to your cart and select a pickup store before checking out.
                    </span>
                  </div>
                  <button type="button" onClick={() => navigate('/cart')} style={styles.errorBannerBtn}>Go to Cart</button>
                </div>
              )}

              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>First Name *</label>
                  <input name="firstName" value={shippingInfo.firstName} onChange={handleShippingChange} onBlur={() => handleBlur('firstName')} style={fieldStyle('firstName')} />
                  {errors.firstName && touched.firstName && <span style={styles.fieldError}>{errors.firstName}</span>}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Last Name *</label>
                  <input name="lastName" value={shippingInfo.lastName} onChange={handleShippingChange} onBlur={() => handleBlur('lastName')} style={fieldStyle('lastName')} />
                  {errors.lastName && touched.lastName && <span style={styles.fieldError}>{errors.lastName}</span>}
                </div>
                <div style={{ ...styles.field, gridColumn: 'span 2' }}>
                  <label style={styles.label}>Email *</label>
                  <input name="email" type="email" value={shippingInfo.email} onChange={handleShippingChange} onBlur={() => handleBlur('email')} style={fieldStyle('email')} />
                  {errors.email && touched.email && <span style={styles.fieldError}>{errors.email}</span>}
                </div>
                <div style={{ ...styles.field, gridColumn: 'span 2' }}>
                  <label style={styles.label}>Phone *</label>
                  <input name="phone" type="tel" value={shippingInfo.phone} onChange={handleShippingChange} onBlur={() => handleBlur('phone')} style={fieldStyle('phone')} placeholder="(555) 555-5555" />
                  {errors.phone && touched.phone && <span style={styles.fieldError}>{errors.phone}</span>}
                </div>
                {!isPickup && (
                  <>
                    <div style={{ ...styles.field, gridColumn: 'span 2' }}>
                      <label style={styles.label}>Street Address *</label>
                      <input name="street" value={shippingInfo.street} onChange={handleShippingChange} onBlur={() => handleBlur('street')} style={fieldStyle('street')} />
                      {errors.street && touched.street && <span style={styles.fieldError}>{errors.street}</span>}
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>City *</label>
                      <input name="city" value={shippingInfo.city} onChange={handleShippingChange} onBlur={() => handleBlur('city')} style={fieldStyle('city')} />
                      {errors.city && touched.city && <span style={styles.fieldError}>{errors.city}</span>}
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>State *</label>
                      <input name="state" value={shippingInfo.state} onChange={handleShippingChange} onBlur={() => handleBlur('state')} style={fieldStyle('state')} />
                      {errors.state && touched.state && <span style={styles.fieldError}>{errors.state}</span>}
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>ZIP Code *</label>
                      <input name="zipcode" value={shippingInfo.zipcode} onChange={handleShippingChange} onBlur={() => handleBlur('zipcode')} style={fieldStyle('zipcode')} maxLength={5} />
                      {errors.zipcode && touched.zipcode && <span style={styles.fieldError}>{errors.zipcode}</span>}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Payment Information</h2>
              <div style={styles.formGrid}>
                <div style={{ ...styles.field, gridColumn: 'span 2' }}>
                  <label style={styles.label}>Name on Card *</label>
                  <input name="nameOnCard" value={paymentInfo.nameOnCard} onChange={handlePaymentChange} onBlur={() => handleBlur('nameOnCard')} style={fieldStyle('nameOnCard')} placeholder="John Doe" />
                  {errors.nameOnCard && touched.nameOnCard && <span style={styles.fieldError}>{errors.nameOnCard}</span>}
                </div>
                <div style={{ ...styles.field, gridColumn: 'span 2' }}>
                  <label style={styles.label}>Card Number *</label>
                  <input name="cardNumber" inputMode="numeric" value={paymentInfo.cardNumber} onChange={handlePaymentChange} onBlur={() => handleBlur('cardNumber')} style={fieldStyle('cardNumber')} placeholder="1234 5678 9012 3456" maxLength={19} />
                  {errors.cardNumber && touched.cardNumber && <span style={styles.fieldError}>{errors.cardNumber}</span>}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Expiry Date *</label>
                  <input name="expiryDate" inputMode="numeric" value={paymentInfo.expiryDate} onChange={handlePaymentChange} onBlur={() => handleBlur('expiryDate')} style={fieldStyle('expiryDate')} placeholder="MM/YY" maxLength={5} />
                  {errors.expiryDate && touched.expiryDate && <span style={styles.fieldError}>{errors.expiryDate}</span>}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>CVV *</label>
                  <input name="cvv" type="password" inputMode="numeric" value={paymentInfo.cvv} onChange={handlePaymentChange} onBlur={() => handleBlur('cvv')} style={fieldStyle('cvv')} placeholder="123" maxLength={4} />
                  {errors.cvv && touched.cvv && <span style={styles.fieldError}>{errors.cvv}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Order Summary</h3>
              <div style={styles.summaryItems}>
                {cart.map((item, i) => (
                  <div key={i} style={styles.summaryItem}>
                    <div style={styles.summaryItemImg}>
                      <img src={item.image || 'https://via.placeholder.com/50'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={styles.summaryItemInfo}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{item.productName}</span>
                      <span style={{ fontSize: 11, color: '#5C5C60' }}>
                        {item.size && `Size: ${item.size}`} {item.color && `/ ${item.color}`}
                      </span>
                      <span style={{ fontSize: 12 }}>Qty: {item.quantity} &times; {formatCurrency(item.unitPrice)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryRow}><span>Subtotal</span><span>{formatCurrency(cartTotal)}</span></div>
              <div style={styles.summaryRow}><span>Shipping</span><span>{shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</span></div>
              <div style={styles.summaryRow}><span>Tax</span><span>{formatCurrency(tax)}</span></div>
              <div style={styles.summaryDivider} />
              <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: 17, color: '#E8E8E8' }}>
                <span>Total</span><span>{formatCurrency(total)}</span>
              </div>
              <button
                type="submit"
                style={{ ...styles.placeOrderBtn, ...(!allFieldsFilled || loading ? styles.placeOrderBtnDisabled : {}) }}
                disabled={!allFieldsFilled || loading}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
              {missingStore && (
                <p style={styles.storeWarning}>
                  <FiAlertCircle size={14} /> A pickup store must be selected to place your order.
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: { padding: '32px 24px 64px', backgroundColor: 'transparent', minHeight: '80vh' },
  container: { maxWidth: 1280, margin: '0 auto' },
  title: { fontSize: 24, fontWeight: 800, marginBottom: 32, display: 'flex', alignItems: 'center', color: '#E8E8E8' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32, alignItems: 'start' },
  formSection: { display: 'flex', flexDirection: 'column', gap: 24 },
  card: { backgroundColor: '#1b1b1f', borderRadius: 12, padding: 28, border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  cardTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#E8E8E8' },
  pickupInfo: { padding: '14px 16px', backgroundColor: 'rgba(52,211,153,0.08)', borderRadius: 8, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, color: '#34d399' },
  pickupAddr: { fontSize: 13, color: '#5C5C60' },
  pickupReady: { fontSize: 12, color: '#34d399', fontWeight: 600 },
  errorBanner: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.12)', borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#f87171' },
  errorBannerBtn: { marginLeft: 'auto', padding: '6px 16px', borderRadius: 8, border: 'none', backgroundColor: '#c8102e', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 220ms ease' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: '#8E8E92' },
  input: { padding: '11px 14px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 14, outline: 'none', transition: 'border-color 220ms ease', backgroundColor: '#19191d', color: '#E8E8E8' },
  fieldError: { fontSize: 11, color: '#f87171', fontWeight: 500 },
  sidebar: {},
  summaryCard: { position: 'sticky', top: 100, backgroundColor: '#1b1b1f', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  summaryTitle: { fontSize: 17, fontWeight: 700, marginBottom: 16, color: '#E8E8E8' },
  summaryItems: { display: 'flex', flexDirection: 'column', gap: 12 },
  summaryItem: { display: 'flex', gap: 10 },
  summaryItemImg: { width: 50, height: 50, borderRadius: 6, overflow: 'hidden', backgroundColor: '#141417', flexShrink: 0 },
  summaryItemInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  summaryDivider: { borderTop: '1px solid rgba(255,255,255,0.05)', margin: '14px 0' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8, color: '#8E8E92' },
  placeOrderBtn: { width: '100%', backgroundColor: '#c8102e', color: '#fff', padding: '14px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, letterSpacing: 0.5, cursor: 'pointer', textTransform: 'uppercase', marginTop: 12, transition: 'opacity 220ms ease' },
  placeOrderBtnDisabled: { backgroundColor: '#2a2a2e', color: '#5C5C60', cursor: 'not-allowed' },
  storeWarning: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#f87171', marginTop: 10, fontWeight: 500 },
};

export default CheckoutPage;
