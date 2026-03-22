import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiShoppingBag, FiMapPin, FiTruck, FiSearch } from 'react-icons/fi';
import useCart from '../hooks/useCart';
import useStoreSearch from '../hooks/useStoreSearch';
import { formatCurrency } from '../utils/formatCurrency';
import { validateZipcode } from '../utils/validators';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, selectedStore, setSelectedStore, deliveryMethod, setDeliveryMethod } = useCart();
  const navigate = useNavigate();
  const { stores, loading: storesLoading, searchStores } = useStoreSearch();
  const [zipcode, setZipcode] = useState('');

  if (cart.length === 0) {
    return (
      <div style={styles.emptyPage}>
        <FiShoppingBag size={64} color="#5C5C60" />
        <h2 style={styles.emptyTitle}>Your Cart is Empty</h2>
        <p style={styles.emptyText}>Looks like you haven't added anything yet.</p>
        <Link to="/products" style={styles.shopBtn}>Start Shopping</Link>
      </div>
    );
  }

  const needsStore = deliveryMethod === 'pickup' && !selectedStore;
  const canCheckout = cart.length > 0 && !needsStore;

  const handleCheckout = () => {
    if (needsStore) {
      return;
    }
    navigate('/checkout');
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/products" style={styles.backLink}>
          <FiArrowLeft size={16} /> Continue Shopping
        </Link>
        <h1 style={styles.title}>Shopping Cart ({cart.length})</h1>

        <div style={styles.layout}>
          <div style={styles.items}>
            <div style={styles.deliverySection}>
              <h3 style={styles.deliverySectionTitle}>How would you like to get your order?</h3>
              <div style={styles.deliveryCards}>
                {[
                  { key: 'pickup', icon: FiMapPin, title: 'Pick Up In Store', sub: 'Free — Ready in 2 hours' },
                  { key: 'ship', icon: FiTruck, title: 'Ship to Me', sub: cartTotal >= 75 ? 'Free over $75 — 3-5 business days' : '$7.95 — 3-5 business days' },
                ].map((opt) => {
                  const selected = deliveryMethod === opt.key;
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.key}
                      onClick={() => setDeliveryMethod(opt.key)}
                      style={{
                        ...styles.deliveryCard,
                        border: selected ? '2px solid #c8102e' : '1px solid rgba(255,255,255,0.06)',
                        backgroundColor: selected ? 'rgba(200,16,46,0.06)' : '#19191d',
                        padding: selected ? '15px 17px' : '16px 18px',
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        border: selected ? '6px solid #c8102e' : '2px solid rgba(255,255,255,0.12)',
                        backgroundColor: selected ? '#fff' : 'transparent',
                        transition: 'all 180ms ease',
                      }} />
                      <Icon size={20} color={selected ? '#E8E8E8' : '#5C5C60'} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: selected ? '#E8E8E8' : '#5C5C60' }}>
                          {opt.title}
                        </div>
                        <div style={{ fontSize: 12, color: selected ? '#8E8E92' : '#3E3E42', marginTop: 2 }}>
                          {opt.sub}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {deliveryMethod === 'pickup' && (
                <div style={styles.storeSearchPanel}>
                  {selectedStore ? (
                    <div style={styles.selectedStoreCard}>
                      <FiMapPin size={16} color="#059669" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#E8E8E8' }}>{selectedStore.name}</div>
                        <div style={{ fontSize: 12, color: '#5C5C60', marginTop: 2 }}>
                          {typeof selectedStore.address === 'object'
                            ? `${selectedStore.address.street}, ${selectedStore.address.city}, ${selectedStore.address.state} ${selectedStore.address.zipcode}`
                            : selectedStore.address}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedStore(null)}
                        style={{ background: 'none', border: 'none', color: '#5C5C60', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#8E8E92', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiMapPin size={14} /> Find a Pickup Store
                      </label>
                      <div style={styles.zipRow}>
                        <input
                          type="text"
                          value={zipcode}
                          onChange={(e) => setZipcode(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && validateZipcode(zipcode) && searchStores(zipcode)}
                          style={styles.zipInput}
                          placeholder="Enter ZIP code"
                          maxLength={5}
                        />
                        <button
                          onClick={() => validateZipcode(zipcode) && searchStores(zipcode)}
                          style={styles.zipBtn}
                          disabled={storesLoading || !zipcode}
                        >
                          <FiSearch size={14} />
                          {storesLoading ? 'Searching...' : 'Search'}
                        </button>
                      </div>
                      {stores.length > 0 && (
                        <div style={styles.storeList}>
                          {stores.map((store) => (
                            <div
                              key={store._id || store.id}
                              style={styles.storeItem}
                              onClick={() => setSelectedStore(store)}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: '#E8E8E8' }}>{store.name}</div>
                                <div style={{ fontSize: 12, color: '#5C5C60' }}>
                                  {typeof store.address === 'object'
                                    ? `${store.address.street}, ${store.address.city}, ${store.address.state} ${store.address.zipcode}`
                                    : store.address}
                                </div>
                                {store.distance && <div style={{ fontSize: 11, color: '#3E3E42', marginTop: 2 }}>{store.distance} mi away</div>}
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>Select</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {stores.length === 0 && zipcode.length === 5 && !storesLoading && (
                        <p style={{ fontSize: 12, color: '#3E3E42', marginTop: 4 }}>Enter your ZIP code to find nearby stores.</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {cart.map((item, index) => (
              <div key={index} style={styles.item}>
                <div style={styles.itemImage}>
                  <img
                    src={item.image || 'https://via.placeholder.com/120x120?text=Shoe'}
                    alt={item.productName}
                    style={styles.img}
                  />
                </div>
                <div style={styles.itemDetails}>
                  <Link to={`/product/${item.productId}`} style={styles.itemName}>
                    {item.productName}
                  </Link>
                  <div style={styles.itemMeta}>
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                  <span style={styles.itemPrice}>{formatCurrency(item.unitPrice)}</span>
                  <div style={styles.itemActions}>
                    <div style={styles.qtyWrap}>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus size={14} />
                      </button>
                      <span style={styles.qtyVal}>{item.quantity}</span>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                    <button style={styles.removeBtn} onClick={() => removeFromCart(index)}>
                      <FiTrash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
                <div style={styles.itemTotal}>
                  {formatCurrency(item.unitPrice * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.summary}>
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Order Summary</h3>

              {selectedStore && deliveryMethod === 'pickup' && (
                <div style={styles.storeInfo}>
                  <FiMapPin size={14} />
                  <div>
                    <strong style={{ fontSize: 13 }}>Pickup Store</strong>
                    <span style={styles.storeName}>{selectedStore.name}</span>
                  </div>
                </div>
              )}

              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Shipping</span>
                <span>{deliveryMethod === 'pickup' ? 'FREE' : cartTotal >= 75 ? 'FREE' : formatCurrency(7.95)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Tax (estimated)</span>
                <span>{formatCurrency(cartTotal * 0.08)}</span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={{ ...styles.summaryRow, ...styles.totalRow }}>
                <span>Total</span>
                <span>
                  {formatCurrency(
                    cartTotal +
                    cartTotal * 0.08 +
                    (deliveryMethod !== 'pickup' && cartTotal < 75 ? 7.95 : 0)
                  )}
                </span>
              </div>
              <button onClick={handleCheckout} style={{ ...styles.checkoutBtn, opacity: canCheckout ? 1 : 0.5, cursor: canCheckout ? 'pointer' : 'not-allowed' }} disabled={!canCheckout}>
                {needsStore ? 'Select a Store First' : 'Proceed to Checkout'}
              </button>
              {needsStore && (
                <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  Please select a pickup store above to continue.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { padding: '32px 24px 64px', backgroundColor: 'transparent' },
  container: { maxWidth: 1280, margin: '0 auto' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#5C5C60', textDecoration: 'none', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 32, color: '#E8E8E8' },
  deliverySection: { padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#1b1b1f', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  deliverySectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#E8E8E8' },
  deliveryCards: { display: 'flex', gap: 14, flexWrap: 'wrap' },
  deliveryCard: { flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 12, cursor: 'pointer', transition: 'all 220ms ease' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' },
  items: { display: 'flex', flexDirection: 'column', gap: 16 },
  item: { display: 'flex', gap: 20, padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#1b1b1f', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  itemImage: { width: 120, height: 120, borderRadius: 8, overflow: 'hidden', backgroundColor: '#141417', flexShrink: 0 },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  itemDetails: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  itemName: { fontSize: 15, fontWeight: 600, color: '#E8E8E8', textDecoration: 'none' },
  itemMeta: { display: 'flex', gap: 16, fontSize: 12, color: '#5C5C60' },
  itemPrice: { fontSize: 14, fontWeight: 600, color: '#E8E8E8' },
  itemActions: { display: 'flex', alignItems: 'center', gap: 16, marginTop: 'auto' },
  qtyWrap: { display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 },
  qtyBtn: { width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1b1b1f', cursor: 'pointer', transition: 'background-color 220ms ease', color: '#E8E8E8', fontSize: 14, padding: 0 },
  qtyVal: { width: 32, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#E8E8E8' },
  removeBtn: { display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', color: '#f87171', fontSize: 13, cursor: 'pointer' },
  itemTotal: { fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0, color: '#E8E8E8' },
  summary: {},
  summaryCard: { position: 'sticky', top: 100, padding: 28, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#1b1b1f', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  summaryTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#E8E8E8' },
  storeInfo: { display: 'flex', gap: 8, alignItems: 'flex-start', padding: '12px 14px', backgroundColor: 'rgba(52,211,153,0.08)', borderRadius: 8, marginBottom: 16, fontSize: 13 },
  storeName: { display: 'block', fontSize: 12, color: '#34d399' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12, color: '#8E8E92' },
  summaryDivider: { borderTop: '1px solid rgba(255,255,255,0.05)', margin: '8px 0 12px' },
  totalRow: { fontSize: 17, fontWeight: 700, color: '#E8E8E8' },
  checkoutBtn: { width: '100%', backgroundColor: '#c8102e', color: '#fff', padding: '14px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, letterSpacing: 0.5, cursor: 'pointer', textTransform: 'uppercase', marginTop: 16, transition: 'opacity 220ms ease' },
  storeSearchPanel: { marginTop: 14, padding: 16, backgroundColor: '#1b1b1f', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 10 },
  selectedStoreCard: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', backgroundColor: 'rgba(52,211,153,0.08)', borderRadius: 8, border: '1px solid rgba(52,211,153,0.2)' },
  zipRow: { display: 'flex', gap: 8 },
  zipInput: { flex: 1, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#19191d', color: '#E8E8E8' },
  zipBtn: { display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#c8102e', color: '#fff', padding: '10px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 220ms ease' },
  storeList: { display: 'flex', flexDirection: 'column', gap: 6 },
  storeItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#1b1b1f', cursor: 'pointer', transition: 'border-color 220ms ease' },
  emptyPage: { textAlign: 'center', padding: '120px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  emptyTitle: { fontSize: 24, fontWeight: 700, color: '#E8E8E8' },
  emptyText: { fontSize: 15, color: '#5C5C60' },
  shopBtn: { display: 'inline-block', backgroundColor: '#c8102e', color: '#fff', padding: '12px 32px', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none', marginTop: 8, transition: 'opacity 220ms ease' },
};

export default CartPage;
