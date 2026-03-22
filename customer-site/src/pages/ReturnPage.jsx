import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiPackage } from 'react-icons/fi';
import * as orderService from '../services/orderService';
import * as returnService from '../services/returnService';
import { formatCurrency } from '../utils/formatCurrency';

const RETURN_REASONS = [
  'Too small',
  'Too large',
  'Defective/Damaged',
  'Wrong item received',
  'Changed my mind',
  'Other',
];

const ReturnPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [reasons, setReasons] = useState({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(orderId);
        setOrder(data.order || data);
      } catch {
        toast.error('Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const toggleItem = (index) => {
    setSelectedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleReasonChange = (index, reason) => {
    setReasons((prev) => ({ ...prev, [index]: reason }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }
    for (const idx of selectedItems) {
      if (!reasons[idx]) {
        toast.error('Please select a reason for each item');
        return;
      }
    }

    setSubmitting(true);
    try {
      const returnData = {
        orderId,
        items: selectedItems.map((idx) => ({
          productId: order.items[idx].productId,
          productName: order.items[idx].productName,
          sku: order.items[idx].sku,
          size: order.items[idx].size,
          color: order.items[idx].color,
          quantity: order.items[idx].quantity,
          reason: reasons[idx],
        })),
        notes,
      };
      await returnService.createReturn(returnData);
      toast.success('Return request submitted successfully!');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.spinner} />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h2>Order not found</h2>
          <Link to="/orders" style={styles.backBtn}>Back to Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to={`/orders/${orderId}`} style={styles.backLink}>
          <FiArrowLeft size={16} /> Back to Order
        </Link>

        <h1 style={styles.title}>
          <FiPackage size={22} /> Return Items
        </h1>
        <p style={styles.subtitle}>
          Select the items you'd like to return from Order #
          {(order.orderNumber || orderId).toString().slice(-8).toUpperCase()}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.itemsList}>
            {(order.items || []).map((item, index) => (
              <div
                key={index}
                style={{
                  ...styles.itemCard,
                  ...(selectedItems.includes(index) ? styles.itemCardSelected : {}),
                }}
              >
                <div style={styles.itemHeader}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(index)}
                      onChange={() => toggleItem(index)}
                      style={styles.checkbox}
                    />
                    <div style={styles.itemImg}>
                      <img
                        src={item.image || 'https://via.placeholder.com/56'}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={styles.itemInfo}>
                      <strong style={{ fontSize: 14 }}>{item.productName}</strong>
                      <span style={styles.itemMeta}>
                        {item.size && `Size: ${item.size}`} {item.color && `| ${item.color}`} | Qty: {item.quantity}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </label>
                </div>

                {selectedItems.includes(index) && (
                  <div style={styles.reasonSection}>
                    <label style={styles.label}>Reason for return</label>
                    <select
                      value={reasons[index] || ''}
                      onChange={(e) => handleReasonChange(index, e.target.value)}
                      style={styles.select}
                      required
                    >
                      <option value="">Select a reason</option>
                      {RETURN_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={styles.notesSection}>
            <label style={styles.label}>Additional Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={styles.textarea}
              rows={3}
              placeholder="Any additional details about your return..."
            />
          </div>

          <div style={styles.submitRow}>
            <Link to={`/orders/${orderId}`} style={styles.cancelLink}>
              Cancel
            </Link>
            <button
              type="submit"
              style={styles.submitBtn}
              disabled={submitting || selectedItems.length === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: { padding: '32px 24px 64px', backgroundColor: 'transparent', minHeight: '80vh' },
  container: { maxWidth: 720, margin: '0 auto' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#5C5C60', textDecoration: 'none', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, color: '#E8E8E8' },
  subtitle: { fontSize: 14, color: '#5C5C60', marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 24 },
  itemsList: { display: 'flex', flexDirection: 'column', gap: 10 },
  itemCard: { backgroundColor: '#1b1b1f', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.05)', transition: 'border-color 220ms ease', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  itemCardSelected: { borderColor: 'rgba(255,255,255,0.14)', backgroundColor: '#1e1e22' },
  itemHeader: {},
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' },
  checkbox: { width: 18, height: 18, accentColor: '#c8102e', flexShrink: 0 },
  itemImg: { width: 56, height: 56, borderRadius: 8, overflow: 'hidden', backgroundColor: '#141417', flexShrink: 0 },
  itemInfo: { display: 'flex', flexDirection: 'column', gap: 3 },
  itemMeta: { fontSize: 12, color: '#5C5C60' },
  reasonSection: { marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', paddingLeft: 30 },
  label: { fontSize: 12, fontWeight: 600, color: '#8E8E92', marginBottom: 6, display: 'block' },
  select: { width: '100%', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#19191d', color: '#E8E8E8', transition: 'border-color 220ms ease' },
  notesSection: {},
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', backgroundColor: '#19191d', color: '#E8E8E8', transition: 'border-color 220ms ease' },
  submitRow: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 },
  cancelLink: { padding: '12px 24px', fontSize: 14, fontWeight: 600, color: '#5C5C60', textDecoration: 'none' },
  submitBtn: { backgroundColor: '#c8102e', color: '#fff', padding: '12px 28px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'opacity 220ms ease' },
  spinner: { width: 40, height: 40, border: '3px solid rgba(255,255,255,0.06)', borderTopColor: '#c8102e', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '80px auto' },
  backBtn: { display: 'inline-block', marginTop: 16, padding: '10px 24px', backgroundColor: '#c8102e', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, transition: 'opacity 220ms ease' },
};

export default ReturnPage;
