import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMapPin, FiCheck, FiTruck, FiShoppingBag, FiX, FiShoppingCart } from 'react-icons/fi';
import * as productService from '../services/productService';
import useCart from '../hooks/useCart';
import useStoreSearch from '../hooks/useStoreSearch';
import { formatCurrency } from '../utils/formatCurrency';
import { validateZipcode } from '../utils/validators';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setSelectedStore, setDeliveryMethod, cart, cartCount, cartTotal } = useCart();
  const { stores, loading: storesLoading, searchStores } = useStoreSearch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [fulfillment, setFulfillment] = useState('pickup');
  const [zipcode, setZipcode] = useState('');
  const [chosenStore, setChosenStore] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showCartModal, setShowCartModal] = useState(false);
  const [addedItem, setAddedItem] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(id);
        const p = data.product || data;
        setProduct(p);
        if (p.sizes?.length > 0) {
          const first = typeof p.sizes[0] === 'object' ? p.sizes[0].size : p.sizes[0];
          setSelectedSize(first);
        }
        if (p.colors?.length > 0) {
          const first = typeof p.colors[0] === 'object' ? p.colors[0].name : p.colors[0];
          setSelectedColor(first);
        }
      } catch {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSearchStores = async () => {
    if (!validateZipcode(zipcode)) {
      toast.error('Please enter a valid 5-digit zipcode');
      return;
    }
    await searchStores(zipcode, id);
  };

  const handleSelectStore = (store) => {
    setChosenStore(store);
    setSelectedStore(store);
    setDeliveryMethod('pickup');
  };

  const getVariantStock = (store) => {
    if (!store.inventory || store.inventory.length === 0) return 0;
    return store.inventory
      .filter((inv) => {
        const sizeMatch = !selectedSize || inv.size === selectedSize;
        const colorMatch = !selectedColor || inv.color === selectedColor;
        return sizeMatch && colorMatch;
      })
      .reduce((sum, inv) => sum + (inv.quantityAvailable || 0), 0);
  };

  const chosenStoreVariantStock = chosenStore ? getVariantStock(chosenStore) : null;
  const variantUnavailable = fulfillment === 'pickup' && chosenStore && chosenStoreVariantStock === 0;

  const handleAddToCart = () => {
    if (!product) return;
    if ((product.sizes?.length > 0) && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (fulfillment === 'pickup' && !chosenStore) {
      toast.error('Please select a pickup store');
      return;
    }
    if (variantUnavailable) {
      toast.error('Selected variant is out of stock at this store');
      return;
    }

    const item = {
      productId: product._id || product.id,
      sku: product.sku || product._id,
      productName: product.name,
      size: selectedSize,
      color: selectedColor || (typeof product.colors?.[0] === 'object' ? product.colors[0].name : product.colors?.[0]) || '',
      quantity,
      unitPrice: product.salePrice || product.basePrice || product.price,
      image: product.images?.[0] || product.image || '',
    };

    addToCart(item);
    setDeliveryMethod(fulfillment);
    setAddedItem(item);
    setShowCartModal(true);
  };

  if (loading) {
    return (
      <div style={styles.loaderWrap}>
        <div style={styles.loader} />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={styles.notFound}>
        <h2>Product not found</h2>
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images
    : [product.image || 'https://via.placeholder.com/600x600?text=Converse'];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.grid}>
          {/* Images */}
          <div style={styles.imageSection}>
            <div style={styles.mainImage}>
              <img
                src={images[selectedImage]}
                alt={product.name}
                style={styles.img}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x600?text=Converse'; }}
              />
            </div>
            {images.length > 1 && (
              <div style={styles.thumbs}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    style={{
                      ...styles.thumb,
                      ...(i === selectedImage ? styles.thumbActive : {}),
                    }}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={img} alt="" style={styles.thumbImg} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div style={styles.details}>
            <span style={styles.category}>{product.category || 'Shoes'}</span>
            <h1 style={styles.name}>{product.name}</h1>
            <div style={styles.priceRow}>
              <span style={styles.price}>
                {formatCurrency(product.salePrice || product.basePrice || product.price)}
              </span>
              {product.salePrice && (
                <span style={styles.origPrice}>{formatCurrency(product.basePrice || product.price)}</span>
              )}
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div style={styles.optionGroup}>
                <label style={styles.optionLabel}>
                  Color: <strong>{selectedColor || (typeof product.colors[0] === 'object' ? product.colors[0].name : product.colors[0])}</strong>
                </label>
                <div style={styles.colorOptions}>
                  {product.colors.map((color) => {
                    const colorName = typeof color === 'object' ? color.name : color;
                    const colorHex = typeof color === 'object' ? color.hex : color;
                    return (
                      <button
                        key={colorName}
                        style={{
                          ...styles.colorBtn,
                          backgroundColor: colorHex || '#3E3E42',
                          ...(selectedColor === colorName ? styles.colorBtnActive : {}),
                        }}
                        onClick={() => setSelectedColor(colorName)}
                        aria-label={colorName}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div style={styles.optionGroup}>
                <label style={styles.optionLabel}>Select Size</label>
                <div style={styles.sizeGrid}>
                  {product.sizes.map((size) => {
                    const sizeVal = typeof size === 'object' ? (size.size || size.value) : size;
                    const sizeLabel = typeof size === 'object' ? (size.sizeLabel || size.label || sizeVal) : size;
                    return (
                      <button
                        key={sizeVal}
                        style={{
                          ...styles.sizeBtn,
                          ...(selectedSize === sizeVal ? styles.sizeBtnActive : {}),
                          ...(size.inStock === false ? styles.sizeBtnOos : {}),
                        }}
                        onClick={() => setSelectedSize(sizeVal)}
                        disabled={size.inStock === false}
                      >
                        {sizeLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={styles.optionGroup}>
              <label style={styles.optionLabel}>Quantity</label>
              <div style={styles.qtyWrap}>
                <button style={styles.qtyBtn} onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span style={styles.qtyVal}>{quantity}</span>
                <button style={styles.qtyBtn} onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            {/* Fulfillment */}
            <div style={styles.fulfillmentSection} role="radiogroup" aria-label="Delivery method">
              {[
                { key: 'pickup', icon: FiShoppingBag, title: 'Pick Up In Store', sub: 'Free - Ready in 2 hours' },
                { key: 'ship', icon: FiTruck, title: 'Ship to Me', sub: 'Free over $75 - 3-5 business days' },
              ].map((opt) => {
                const isSelected = fulfillment === opt.key;
                const OptIcon = opt.icon;
                return (
                  <div
                    key={opt.key}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${opt.title} — ${opt.sub}`}
                    tabIndex={0}
                    onClick={() => setFulfillment(opt.key)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFulfillment(opt.key); } }}
                    style={{
                      ...styles.fulfillmentOption,
                      border: isSelected ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.06)',
                      backgroundColor: isSelected ? 'rgba(16,185,129,0.06)' : '#1b1b1f',
                      padding: isSelected ? '13px 15px' : '14px 16px',
                      boxShadow: isSelected ? '0 0 0 1px rgba(16,185,129,0.15), 0 4px 16px rgba(16,185,129,0.08)' : 'none',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isSelected ? '#10b981' : 'rgba(255,255,255,0.04)',
                      border: isSelected ? 'none' : '2px solid rgba(255,255,255,0.1)',
                      transition: 'all 200ms ease',
                    }}>
                      {isSelected
                        ? <FiCheck size={18} color="#fff" strokeWidth={3} />
                        : <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)' }} />
                      }
                    </div>
                    <OptIcon size={20} color={isSelected ? '#10b981' : '#5C5C60'} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: isSelected ? '#E8E8E8' : '#8E8E92' }}>{opt.title}</strong>
                      <span style={{ ...styles.fulfillmentSub, color: isSelected ? '#8E8E92' : '#3E3E42' }}>{opt.sub}</span>
                    </div>
                    {isSelected && (
                      <span style={styles.fulfillmentBadge}>Selected</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Store Search for Pickup */}
            {fulfillment === 'pickup' && (
              <div style={styles.storeSearch}>
                <label style={styles.optionLabel}>
                  <FiMapPin size={14} style={{ marginRight: 6 }} />
                  Find a Store Near You
                </label>
                <div style={styles.zipRow}>
                  <input
                    type="text"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    style={styles.zipInput}
                    placeholder="Enter ZIP code"
                    maxLength={5}
                  />
                  <button onClick={handleSearchStores} style={styles.zipBtn} disabled={storesLoading}>
                    {storesLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
                {chosenStore && (
                  <div style={styles.selectedBanner}>
                    <FiCheck size={16} color="#22c55e" />
                    <span>
                      <strong>Pickup from:</strong> {chosenStore.name}
                      {chosenStore.address && (
                        <span style={{ color: '#5C5C60', marginLeft: 6, fontSize: 12 }}>
                          — {typeof chosenStore.address === 'object'
                            ? `${chosenStore.address.street}, ${chosenStore.address.city}`
                            : chosenStore.address}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {stores.length > 0 && (
                  <div style={styles.storeList}>
                    {stores.map((store) => {
                      const storeId = store._id || store.id;
                      const chosenId = chosenStore?._id || chosenStore?.id;
                      const isSelected = storeId && chosenId && String(storeId) === String(chosenId);
                      const variantStock = getVariantStock(store);
                      const totalStock = store.inventory
                        ? store.inventory.reduce((sum, inv) => sum + (inv.quantityAvailable || 0), 0)
                        : 0;
                      const hasAny = store.hasProduct !== undefined ? store.hasProduct : totalStock > 0;
                      return (
                        <div
                          key={storeId}
                          style={{ ...styles.storeItem, ...(isSelected ? styles.storeItemActive : {}) }}
                          onClick={() => handleSelectStore(store)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: '50%',
                              border: isSelected ? '2px solid #34d399' : '2px solid rgba(255,255,255,0.08)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              backgroundColor: isSelected ? '#34d399' : '#1b1b1f', flexShrink: 0,
                            }}>
                              {isSelected && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <div style={styles.storeInfo}>
                              <strong>{store.name}</strong>
                              <span style={styles.storeAddr}>
                                {typeof store.address === 'object'
                                  ? `${store.address.street}, ${store.address.city}, ${store.address.state} ${store.address.zipcode}`
                                  : store.address}
                              </span>
                              <span style={styles.storeDist}>
                                {store.distance ? `${store.distance} mi away` : ''}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                            {hasAny && variantStock > 0 ? (
                              <span style={styles.inStock}>{variantStock} in stock</span>
                            ) : hasAny && totalStock > 0 ? (
                              <span style={styles.lowStock}>Other variants available</span>
                            ) : (
                              <span style={styles.oos}>Out of Stock</span>
                            )}
                            {selectedSize && selectedColor && variantStock > 0 && (
                              <span style={styles.variantHint}>
                                {selectedSize} / {selectedColor}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleSelectStore(store); }}
                              style={{ ...styles.selectStoreBtn, ...(isSelected ? styles.selectStoreBtnActive : {}) }}
                            >
                              {isSelected ? '✓ Selected' : 'Select Store'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleAddToCart}
              style={{ ...styles.addBtn, ...(variantUnavailable ? styles.addBtnDisabled : {}) }}
              disabled={variantUnavailable}
            >
              {variantUnavailable
                ? 'Out of Stock at Selected Store'
                : `Add to Cart - ${formatCurrency((product.salePrice || product.basePrice || product.price) * quantity)}`}
            </button>
            {variantUnavailable && (
              <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6, textAlign: 'center' }}>
                The selected size/color is not available at {chosenStore?.name}. Try a different variant or store.
              </p>
            )}

            {/* Description */}
            {product.description && (
              <div style={styles.descSection}>
                <h3 style={styles.descTitle}>Description</h3>
                <p style={styles.descText}>{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add to Cart Modal */}
      {showCartModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCartModal(false)}>
          <div style={styles.modalSlide} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={styles.modalCheckIcon}><FiCheck size={18} color="#fff" /></div>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Added to Cart</span>
              </div>
              <button style={styles.modalClose} onClick={() => setShowCartModal(false)}><FiX size={20} /></button>
            </div>

            {addedItem && (
              <div style={styles.modalItem}>
                <div style={styles.modalItemImg}>
                  <img src={addedItem.image || 'https://via.placeholder.com/64'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{addedItem.productName}</div>
                  <div style={{ fontSize: 12, color: '#5C5C60', marginTop: 3 }}>
                    {addedItem.size && `Size ${addedItem.size}`}{addedItem.color && ` · ${addedItem.color}`} · Qty {addedItem.quantity}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>{formatCurrency(addedItem.unitPrice * addedItem.quantity)}</div>
                </div>
              </div>
            )}

            <div style={styles.modalDivider} />

            <div style={styles.modalSummary}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#5C5C60' }}>
                <span>Cart ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
                <span style={{ fontWeight: 700, color: '#E8E8E8' }}>{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button style={styles.modalViewCart} onClick={() => { setShowCartModal(false); navigate('/cart'); }}>
                <FiShoppingCart size={16} /> View Cart
              </button>
              <button style={styles.modalContinue} onClick={() => setShowCartModal(false)}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '32px 24px 64px', backgroundColor: 'transparent' },
  container: { maxWidth: 1280, margin: '0 auto' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' },
  loaderWrap: { display: 'flex', justifyContent: 'center', padding: '120px 0' },
  loader: { width: 40, height: 40, border: '3px solid rgba(255,255,255,0.06)', borderTopColor: '#c8102e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  notFound: { textAlign: 'center', padding: '120px 24px', fontSize: 20, color: '#8E8E92' },
  imageSection: {},
  mainImage: { backgroundColor: '#141417', borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  img: { width: '100%', height: 'auto', display: 'block' },
  thumbs: { display: 'flex', gap: 8 },
  thumb: { width: 72, height: 72, borderRadius: 8, border: '2px solid transparent', padding: 0, cursor: 'pointer', overflow: 'hidden', backgroundColor: '#141417', transition: 'border-color 220ms ease' },
  thumbActive: { border: '2px solid rgba(255,255,255,0.14)' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  details: { display: 'flex', flexDirection: 'column', gap: 20 },
  category: { fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, color: '#5C5C60' },
  name: { fontSize: 32, fontWeight: 800, lineHeight: 1.2, color: '#E8E8E8' },
  priceRow: { display: 'flex', alignItems: 'center', gap: 12 },
  price: { fontSize: 24, fontWeight: 700, color: '#E8E8E8' },
  origPrice: { fontSize: 18, color: '#5C5C60', textDecoration: 'line-through' },
  optionGroup: { display: 'flex', flexDirection: 'column', gap: 10 },
  optionLabel: { fontSize: 13, fontWeight: 600, color: '#8E8E92', display: 'flex', alignItems: 'center' },
  colorOptions: { display: 'flex', gap: 8 },
  colorBtn: { width: 32, height: 32, borderRadius: '50%', border: '2px solid transparent', cursor: 'pointer', outline: 'none', transition: 'border-color 220ms ease' },
  colorBtnActive: { border: '2px solid rgba(255,255,255,0.14)', boxShadow: '0 0 0 2px #1b1b1f, 0 0 0 4px rgba(255,255,255,0.14)' },
  sizeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 8 },
  sizeBtn: { padding: '10px 4px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, backgroundColor: '#1b1b1f', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'center', transition: 'all 220ms ease', color: '#E8E8E8' },
  sizeBtnActive: { backgroundColor: '#E8E8E8', color: '#111', borderColor: '#E8E8E8' },
  sizeBtnOos: { opacity: 0.4, cursor: 'not-allowed', textDecoration: 'line-through' },
  qtyWrap: { display: 'flex', alignItems: 'center', gap: 0, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, width: 'fit-content' },
  qtyBtn: { width: 40, height: 40, border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8E8E8' },
  qtyVal: { width: 40, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#E8E8E8' },
  fulfillmentSection: { display: 'flex', flexDirection: 'column', gap: 10 },
  fulfillmentOption: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, cursor: 'pointer', transition: 'all 200ms ease', fontSize: 14, color: '#E8E8E8', outline: 'none' },
  fulfillmentSub: { display: 'block', fontSize: 12, marginTop: 2 },
  fulfillmentBadge: { fontSize: 10, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: 0.8, flexShrink: 0, padding: '3px 8px', backgroundColor: 'rgba(16,185,129,0.12)', borderRadius: 5 },
  storeSearch: { display: 'flex', flexDirection: 'column', gap: 12, padding: 16, backgroundColor: '#1b1b1f', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' },
  zipRow: { display: 'flex', gap: 8 },
  zipInput: { flex: 1, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#19191d', color: '#E8E8E8' },
  zipBtn: { backgroundColor: '#c8102e', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 220ms ease' },
  selectedBanner: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', backgroundColor: 'rgba(52,211,153,0.08)', borderRadius: 8, border: '1px solid rgba(52,211,153,0.2)', fontSize: 13, color: '#34d399' },
  storeList: { display: 'flex', flexDirection: 'column', gap: 8 },
  storeItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', backgroundColor: '#1b1b1f', transition: 'all 220ms ease', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  storeItemActive: { borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.05)', boxShadow: '0 0 0 1px #34d399' },
  storeInfo: { display: 'flex', flexDirection: 'column', gap: 2, fontSize: 13, color: '#E8E8E8' },
  storeAddr: { color: '#5C5C60', fontSize: 12 },
  storeDist: { color: '#5C5C60', fontSize: 11 },
  inStock: { color: '#34d399', fontSize: 12, fontWeight: 700, backgroundColor: 'rgba(52,211,153,0.08)', padding: '2px 8px', borderRadius: 4 },
  lowStock: { color: '#fbbf24', fontSize: 11, fontWeight: 600 },
  oos: { color: '#f87171', fontSize: 12, fontWeight: 600 },
  variantHint: { fontSize: 10, color: '#5C5C60', fontStyle: 'italic' },
  selectStoreBtn: { padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', color: '#E8E8E8', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 220ms ease' },
  selectStoreBtnActive: { backgroundColor: '#34d399', borderColor: '#34d399', color: '#fff' },
  addBtn: { backgroundColor: '#c8102e', color: '#fff', padding: '16px 32px', borderRadius: 8, border: 'none', fontSize: 15, fontWeight: 700, letterSpacing: 0.5, cursor: 'pointer', textTransform: 'uppercase', transition: 'opacity 220ms ease', marginTop: 8, width: '100%' },
  addBtnDisabled: { backgroundColor: '#2a2a2e', color: '#5C5C60', cursor: 'not-allowed' },
  descSection: { paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' },
  descTitle: { fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#E8E8E8' },
  descText: { fontSize: 14, color: '#8E8E92', lineHeight: 1.7 },

  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end' },
  modalSlide: { width: 420, maxWidth: '100%', height: '100vh', backgroundColor: '#1b1b1f', boxShadow: '-8px 0 30px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', animation: 'slideIn 0.25s ease-out' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  modalCheckIcon: { width: 32, height: 32, borderRadius: '50%', backgroundColor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalClose: { background: 'none', border: 'none', cursor: 'pointer', color: '#5C5C60', padding: 4 },
  modalItem: { display: 'flex', gap: 14, padding: '20px 24px' },
  modalItemImg: { width: 80, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: '#141417', flexShrink: 0 },
  modalDivider: { borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 24px' },
  modalSummary: { padding: '16px 24px' },
  modalActions: { padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' },
  modalViewCart: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#c8102e', color: '#fff', padding: '14px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5, transition: 'opacity 220ms ease' },
  modalContinue: { display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', color: '#8E8E92', padding: '12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'border-color 220ms ease' },
};

export default ProductPage;
