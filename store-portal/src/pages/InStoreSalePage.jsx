import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';

export default function InStoreSalePage() {
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [recentSales, setRecentSales] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    fetchRecentSales();
  }, []);

  const fetchRecentSales = async () => {
    try {
      const { data } = await api.get('/in-store-sales');
      setRecentSales(data.sales || []);
    } catch { /* ignore */ }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const { data } = await api.get(`/inventory?search=${encodeURIComponent(searchTerm)}`);
      const inv = data.inventory || data || [];
      const grouped = new Map();
      for (const item of inv) {
        const pid = (item.productId?._id || item.productId || '').toString();
        if (!grouped.has(pid)) {
          grouped.set(pid, {
            productId: pid,
            product: item.productId,
            productName: item.productId?.name || item.productName || 'Unknown',
            sku: item.productId?.sku || item.sku,
            basePrice: item.productId?.salePrice || item.productId?.basePrice || 0,
            colors: item.productId?.colors || [],
            sizes: item.productId?.sizes || [],
            inventoryItems: [],
          });
        }
        grouped.get(pid).inventoryItems.push({
          size: item.size,
          color: item.color,
          quantityOnHand: item.quantityOnHand,
          quantityReserved: item.quantityReserved || 0,
          available: item.quantityOnHand - (item.quantityReserved || 0),
        });
      }
      setSearchResults(Array.from(grouped.values()));
      setExpandedProduct(null);
      setSelectedSize('');
      setSelectedColor('');
    } catch {
      toast.error('Search failed');
    }
  };

  const handleExpand = (product) => {
    setExpandedProduct(expandedProduct?.productId === product.productId ? null : product);
    setSelectedSize('');
    setSelectedColor('');
  };

  const handleAddFromProduct = (product) => {
    if (!selectedSize) {
      toast.warn('Please select a size');
      return;
    }
    const invMatch = product.inventoryItems.find((i) => i.size === selectedSize);
    if (!invMatch || invMatch.available <= 0) {
      toast.error('This size is out of stock');
      return;
    }
    const colorToUse = selectedColor || (product.colors?.[0]?.name || product.colors?.[0] || '');
    const existing = cart.find((c) => c.productId === product.productId && c.size === selectedSize && c.color === colorToUse);
    if (existing) {
      if (existing.quantity >= invMatch.available) {
        toast.warn('Cannot add more than available stock');
        return;
      }
      setCart(cart.map((c) =>
        c.productId === product.productId && c.size === selectedSize && c.color === colorToUse
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, {
        productId: product.productId,
        productName: product.productName,
        sku: product.sku,
        size: selectedSize,
        color: colorToUse,
        unitPrice: product.basePrice,
        quantity: 1,
        maxAvailable: invMatch.available,
      }]);
    }
    toast.success(`${product.productName} (${selectedSize}) added`);
  };

  const updateQty = (idx, qty) => {
    if (qty < 1) return;
    if (qty > cart[idx].maxAvailable) {
      toast.warn('Cannot exceed available stock');
      return;
    }
    const updated = [...cart];
    updated[idx].quantity = qty;
    setCart(updated);
  };

  const removeItem = (idx) => setCart(cart.filter((_, i) => i !== idx));

  const subtotal = cart.reduce((sum, c) => sum + (c.unitPrice || 0) * c.quantity, 0);
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));

  const canSubmit = cart.length > 0 && customerInfo.email.trim();

  const handleSubmit = async () => {
    if (!customerInfo.email.trim()) {
      toast.error('Customer email is required');
      return;
    }
    if (cart.length === 0) {
      toast.warn('Add items to the sale');
      return;
    }
    setLoading(true);
    try {
      await api.post('/in-store-sales', {
        items: cart.map((c) => ({
          productId: c.productId,
          size: c.size,
          color: c.color,
          quantity: c.quantity,
        })),
        customerInfo,
      });
      toast.success('In-store sale recorded successfully!');
      setCart([]);
      setCustomerInfo({ name: '', email: '', phone: '' });
      setSearchResults([]);
      setSearchTerm('');
      fetchRecentSales();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={styles.title}><FiShoppingBag style={{ marginRight: 10 }} /> In-Store Sales</h1>

      <div style={styles.grid}>
        <div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}><FiSearch size={16} style={{ marginRight: 6 }} /> Search Products</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                style={styles.input}
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch} style={styles.searchBtn}><FiSearch size={16} /> Search</button>
            </div>

            {searchResults.length > 0 && (
              <div style={{ maxHeight: 440, overflowY: 'auto' }}>
                {searchResults.map((product) => {
                  const isExpanded = expandedProduct?.productId === product.productId;
                  return (
                    <div key={product.productId} style={{ ...styles.productCard, ...(isExpanded ? { borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' } : {}) }}>
                      <div style={styles.productHeader} onClick={() => handleExpand(product)}>
                        <div style={{ flex: 1 }}>
<div style={{ fontWeight: 700, fontSize: 14, color: '#E8E8E8' }}>{product.productName}</div>
                        <div style={{ fontSize: 12, color: '#8E8E92', marginTop: 2 }}>
                            SKU: {product.sku} &middot; ${product.basePrice.toFixed(2)}
                          </div>
                          <div style={{ fontSize: 11, color: '#5C5C60', marginTop: 2 }}>
                            {product.inventoryItems.length} size(s) in stock
                          </div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#c8102e' }}>
                          {isExpanded ? 'Collapse' : 'Select'}
                        </span>
                      </div>

                      {isExpanded && (
                        <div style={styles.productDetails}>
                          {product.colors?.length > 0 && (
                            <div style={{ marginBottom: 12 }}>
                              <label style={styles.detailLabel}>Color</label>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {product.colors.map((c) => {
                                  const cName = typeof c === 'object' ? c.name : c;
                                  const cHex = typeof c === 'object' ? c.hex : undefined;
                                  return (
                                    <button
                                      key={cName}
                                      onClick={() => setSelectedColor(cName)}
                                      style={{
                                        ...styles.colorChip,
                                        borderColor: selectedColor === cName ? '#c8102e' : 'rgba(255,255,255,0.08)',
                                        fontWeight: selectedColor === cName ? 700 : 400,
                                      }}
                                    >
                                      {cHex && <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: cHex, display: 'inline-block', marginRight: 4, verticalAlign: 'middle' }} />}
                                      {cName}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div style={{ marginBottom: 12 }}>
                            <label style={styles.detailLabel}>Size (available stock)</label>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {product.inventoryItems.map((inv) => (
                                <button
                                  key={inv.size}
                                  onClick={() => setSelectedSize(inv.size)}
                                  disabled={inv.available <= 0}
                                  style={{
                                    ...styles.sizeChip,
                                    borderColor: selectedSize === inv.size ? '#c8102e' : 'rgba(255,255,255,0.08)',
                                    backgroundColor: selectedSize === inv.size ? '#c8102e' : 'transparent',
                                    color: selectedSize === inv.size ? '#fff' : inv.available <= 0 ? '#5C5C60' : '#E8E8E8',
                                    cursor: inv.available <= 0 ? 'not-allowed' : 'pointer',
                                    textDecoration: inv.available <= 0 ? 'line-through' : 'none',
                                  }}
                                >
                                  {inv.size} ({inv.available})
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddFromProduct(product)}
                            style={styles.addToSaleBtn}
                            disabled={!selectedSize}
                          >
                            <FiPlus size={14} /> Add to Sale
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {searchResults.length === 0 && searchTerm && (
              <p style={{ color: '#5C5C60', fontSize: 13 }}>No products found. Try a different search term.</p>
            )}
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Customer Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={styles.fieldLabel}>
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  style={{ ...styles.input, borderColor: !customerInfo.email.trim() && cart.length > 0 ? '#ef4444' : 'rgba(255,255,255,0.08)' }}
                  placeholder="customer@email.com"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                />
                {!customerInfo.email.trim() && cart.length > 0 && (
                  <span style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <FiAlertCircle size={12} /> Required to record the sale
                  </span>
                )}
              </div>
              <div>
                <label style={styles.fieldLabel}>Name</label>
                <input style={styles.input} placeholder="Customer name" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} />
              </div>
              <div>
                <label style={styles.fieldLabel}>Phone</label>
                <input style={styles.input} placeholder="Phone number" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}><FiDollarSign style={{ marginRight: 6 }} /> Sale Items</h3>
            {cart.length === 0 ? (
              <p style={{ color: '#5C5C60', fontSize: 13, textAlign: 'center', padding: 20 }}>No items added yet. Search and select products to begin.</p>
            ) : (
              <>
                {cart.map((item, idx) => (
                  <div key={idx} style={styles.cartRow}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#E8E8E8' }}>{item.productName}</div>
                      <div style={{ fontSize: 12, color: '#8E8E92' }}>
                        Size: {item.size} {item.color && `· ${item.color}`} · ${(item.unitPrice || 0).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => updateQty(idx, item.quantity - 1)} style={styles.qtyBtn}><FiMinus size={12} /></button>
                      <span style={{ fontWeight: 600, fontSize: 13, minWidth: 24, textAlign: 'center', color: '#E8E8E8' }}>{item.quantity}</span>
                      <button onClick={() => updateQty(idx, item.quantity + 1)} style={styles.qtyBtn}><FiPlus size={12} /></button>
                      <button onClick={() => removeItem(idx)} style={{ ...styles.qtyBtn, color: '#ef4444', marginLeft: 6 }}><FiTrash2 size={12} /></button>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13, minWidth: 64, textAlign: 'right', color: '#E8E8E8' }}>${((item.unitPrice || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '2px solid rgba(255,255,255,0.06)', marginTop: 14, paddingTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: '#8E8E92' }}>
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: '#8E8E92' }}>
                    <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#E8E8E8' }}>
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !canSubmit}
                  style={{ ...styles.submitBtn, opacity: canSubmit ? 1 : 0.5 }}
                >
                  {loading ? 'Recording...' : 'Record Sale'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {recentSales.length > 0 && (
        <div style={{ ...styles.card, marginTop: 24 }}>
          <h3 style={styles.cardTitle}>Recent Sales</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: '#8E8E92' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#5C5C60', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Sale #</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#5C5C60', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#5C5C60', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Email</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', color: '#5C5C60', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Total</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: '#5C5C60', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.slice(0, 10).map((sale) => (
                <tr key={sale._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#E8E8E8' }}>{sale.saleNumber}</td>
                  <td style={{ padding: '8px 12px', color: '#8E8E92' }}>{sale.customerName || '—'}</td>
                  <td style={{ padding: '8px 12px', color: '#5C5C60' }}>{sale.customerEmail || '—'}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#E8E8E8' }}>${sale.total?.toFixed(2)}</td>
                  <td style={{ padding: '8px 12px', color: '#5C5C60' }}>{new Date(sale.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  title: { fontSize: 20, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', color: '#E8E8E8' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: { backgroundColor: '#1b1b1f', borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  cardTitle: { fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#E8E8E8', display: 'flex', alignItems: 'center' },
  input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, outline: 'none', boxSizing: 'border-box', backgroundColor: '#19191d', color: '#E8E8E8' },
  searchBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, border: 'none', backgroundColor: '#c8102e', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', transition: 'all 220ms ease' },
  productCard: { border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, marginBottom: 8, overflow: 'hidden', transition: 'border-color 220ms ease' },
  productHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer' },
  productDetails: { padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 },
  detailLabel: { fontSize: 11, fontWeight: 600, color: '#8E8E92', marginBottom: 6, display: 'block' },
  colorChip: { padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', cursor: 'pointer', fontSize: 12, display: 'inline-flex', alignItems: 'center', color: '#E8E8E8', transition: 'all 220ms ease' },
  sizeChip: { padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 220ms ease' },
  addToSaleBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: 'none', backgroundColor: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 4, transition: 'all 220ms ease' },
  fieldLabel: { fontSize: 11, fontWeight: 600, color: '#8E8E92', marginBottom: 4, display: 'block' },
  cartRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  qtyBtn: { width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', cursor: 'pointer', padding: 0, color: '#E8E8E8', transition: 'all 220ms ease' },
  submitBtn: { width: '100%', padding: '14px', borderRadius: 8, border: 'none', backgroundColor: '#16a34a', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 16, transition: 'all 220ms ease' },
};
