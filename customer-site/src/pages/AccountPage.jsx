import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiMapPin, FiEdit2, FiTrash2, FiPlus, FiShoppingBag, FiPackage, FiChevronRight, FiBox } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import * as authService from '../services/authService';
import * as orderService from '../services/orderService';
import { formatCurrency } from '../utils/formatCurrency';

const AccountPage = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser size={16} /> },
    { id: 'orders', label: 'Orders', icon: <FiShoppingBag size={16} /> },
    { id: 'password', label: 'Password', icon: <FiLock size={16} /> },
    { id: 'addresses', label: 'Addresses', icon: <FiMapPin size={16} /> },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>My Account</h1>
        <div style={styles.layout}>
          <div style={styles.sidebar}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === tab.id ? styles.tabBtnActive : {}),
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
            <button style={styles.logoutBtn} onClick={logout}>
              Logout
            </button>
          </div>
          <div style={styles.content}>
            {activeTab === 'profile' && <ProfileTab user={user} updateUser={updateUser} />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'password' && <PasswordTab />}
            {activeTab === 'addresses' && <AddressesTab user={user} updateUser={updateUser} />}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileTab = ({ user, updateUser }) => {
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.updateProfile(form);
      updateUser(data.user || data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Profile Information</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formRow}>
          <div style={styles.field}>
            <label style={styles.label}>First Name</label>
            <input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Last Name</label>
            <input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              style={styles.input}
            />
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.saveBtn} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

const PasswordTab = () => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed successfully');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Change Password</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Current Password</label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>New Password</label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            style={styles.input}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            required
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Confirm New Password</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            style={styles.input}
            required
          />
        </div>
        <button type="submit" style={styles.saveBtn} disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

const AddressesTab = ({ user, updateUser }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    label: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
  });

  const addresses = user?.addresses || [];

  const resetForm = () => {
    setForm({ label: '', address: '', city: '', state: '', zipcode: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let data;
      if (editingId) {
        data = await authService.updateAddress(editingId, form);
      } else {
        data = await authService.addAddress(form);
      }
      updateUser(data.user || data);
      toast.success(editingId ? 'Address updated' : 'Address added');
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleEdit = (addr) => {
    setForm({
      label: addr.label || '',
      address: addr.address || '',
      city: addr.city || '',
      state: addr.state || '',
      zipcode: addr.zipcode || '',
    });
    setEditingId(addr._id || addr.id);
    setShowForm(true);
  };

  const handleDelete = async (addrId) => {
    try {
      const data = await authService.deleteAddress(addrId);
      updateUser(data.user || data);
      toast.success('Address deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    }
  };

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ ...styles.cardTitle, marginBottom: 0 }}>Saved Addresses</h2>
        {!showForm && (
          <button style={styles.addBtn} onClick={() => setShowForm(true)}>
            <FiPlus size={14} /> Add Address
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSave} style={{ ...styles.form, marginBottom: 24, padding: 16, backgroundColor: '#19191d', borderRadius: 12 }}>
          <div style={styles.field}>
            <label style={styles.label}>Label (e.g., Home, Work)</label>
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formRow}>
            <div style={styles.field}>
              <label style={styles.label}>City</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>State</label>
              <input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>ZIP</label>
              <input
                value={form.zipcode}
                onChange={(e) => setForm({ ...form, zipcode: e.target.value })}
                style={styles.input}
                maxLength={5}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={styles.saveBtn}>Save</button>
            <button type="button" style={styles.cancelBtn} onClick={resetForm}>Cancel</button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <p style={{ color: '#5C5C60', fontSize: 14 }}>No saved addresses.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {addresses.map((addr) => (
            <div key={addr._id || addr.id} style={styles.addressCard}>
              <div>
                {addr.label && <strong style={{ fontSize: 13 }}>{addr.label}</strong>}
                <p style={{ fontSize: 13, color: '#8E8E92', margin: '4px 0' }}>
                  {addr.address}, {addr.city}, {addr.state} {addr.zipcode}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={styles.iconAction} onClick={() => handleEdit(addr)}>
                  <FiEdit2 size={14} />
                </button>
                <button style={{ ...styles.iconAction, color: '#dc2626' }} onClick={() => handleDelete(addr._id || addr.id)}>
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const STATUS_COLORS = {
  PLACED: { bg: '#1e3a5f', color: '#93c5fd' },
  AWAITING_STORE_ACCEPTANCE: { bg: '#422006', color: '#fbbf24' },
  ACCEPTED: { bg: '#064e3b', color: '#6ee7b7' },
  REJECTED: { bg: '#450a0a', color: '#fca5a5' },
  READY_FOR_PICKUP: { bg: '#3730a3', color: '#c4b5fd' },
  OTP_VERIFIED: { bg: '#4c1d95', color: '#a78bfa' },
  PICKED_UP: { bg: '#064e3b', color: '#6ee7b7' },
  COMPLETED: { bg: '#064e3b', color: '#6ee7b7' },
  CANCELLED: { bg: '#450a0a', color: '#fca5a5' },
  RETURN_REQUESTED: { bg: '#422006', color: '#fbbf24' },
  RETURN_ACCEPTED: { bg: '#1e3a5f', color: '#93c5fd' },
  RETURN_COMPLETED: { bg: '#1b1b1f', color: '#8E8E92' },
};

const formatStatus = (status) =>
  (status || 'pending').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderService.getMyOrders(page, 10);
      setOrders(data.orders || data || []);
      setTotalPages(data.pagination?.pages || data.totalPages || 1);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>My Orders</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 80, backgroundColor: '#19191d', borderRadius: 10 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ ...styles.cardTitle, marginBottom: 0 }}>My Orders</h2>
        <Link to="/orders" style={{ fontSize: 13, color: '#c8102e', textDecoration: 'none', fontWeight: 600 }}>
          View All
        </Link>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <FiPackage size={40} color="#3E3E42" />
          <p style={{ color: '#5C5C60', fontSize: 14, marginTop: 12 }}>No orders yet</p>
          <Link to="/products" style={{ display: 'inline-block', marginTop: 12, backgroundColor: '#c8102e', color: '#fff', padding: '10px 28px', borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
            Shop Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.map((order) => {
            const sc = STATUS_COLORS[order.status] || { bg: '#1b1b1f', color: '#8E8E92' };
            return (
              <Link
                key={order._id || order.id}
                to={`/orders/${order._id || order.id}`}
                style={styles.orderRow}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#E8E8E8' }}>
                      #{(order.orderNumber || order._id || order.id).toString().slice(-8).toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                      textTransform: 'uppercase', letterSpacing: 0.5,
                      backgroundColor: sc.bg, color: sc.color,
                    }}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(order.items || []).slice(0, 3).map((item, i) => (
                        <div key={i} style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', backgroundColor: '#141417', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {item.image ? (
                            <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <FiBox size={14} color="#5C5C60" />
                          )}
                        </div>
                      ))}
                      {(order.items || []).length > 3 && (
                        <span style={{ fontSize: 11, color: '#5C5C60', alignSelf: 'center' }}>+{order.items.length - 3}</span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: '#5C5C60' }}>{formatDate(order.createdAt)}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#E8E8E8', marginLeft: 'auto' }}>
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
                <FiChevronRight size={16} color="#3E3E42" style={{ flexShrink: 0 }} />
              </Link>
            );
          })}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <button
                style={{ ...styles.pageBtn, opacity: page <= 1 ? 0.35 : 1 }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >Previous</button>
              <span style={{ fontSize: 12, color: '#5C5C60' }}>Page {page} of {totalPages}</span>
              <button
                style={{ ...styles.pageBtn, opacity: page >= totalPages ? 0.35 : 1 }}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '32px 24px 64px', backgroundColor: 'transparent', minHeight: '80vh' },
  container: { maxWidth: 1024, margin: '0 auto' },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 32, color: '#E8E8E8' },
  layout: { display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32 },
  sidebar: { display: 'flex', flexDirection: 'column', gap: 4 },
  tabBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: 'none', backgroundColor: 'transparent', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left', color: '#8E8E92', transition: 'all 220ms ease' },
  tabBtnActive: { backgroundColor: '#c8102e', color: '#fff' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: 'none', backgroundColor: 'transparent', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left', color: '#f87171', marginTop: 16 },
  content: { flex: 1 },
  card: { backgroundColor: '#1b1b1f', borderRadius: 12, padding: 28, border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)' },
  cardTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#E8E8E8' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  formRow: { display: 'flex', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  label: { fontSize: 12, fontWeight: 600, color: '#8E8E92' },
  input: { padding: '11px 14px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#19191d', color: '#E8E8E8', transition: 'border-color 220ms ease' },
  saveBtn: { backgroundColor: '#c8102e', color: '#fff', padding: '12px 24px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', width: 'fit-content', transition: 'opacity 220ms ease' },
  cancelBtn: { backgroundColor: '#1b1b1f', color: '#8E8E92', padding: '12px 24px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  addBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, backgroundColor: 'transparent', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#E8E8E8', transition: 'border-color 220ms ease' },
  addressCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' },
  iconAction: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#5C5C60' },
  orderRow: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', color: 'inherit', transition: 'background-color 150ms ease, box-shadow 150ms ease', backgroundColor: '#19191d', cursor: 'pointer' },
  pageBtn: { padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#1b1b1f', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: '#E8E8E8', transition: 'border-color 220ms ease' },
};

export default AccountPage;
