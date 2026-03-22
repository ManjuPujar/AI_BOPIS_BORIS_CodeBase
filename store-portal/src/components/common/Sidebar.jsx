import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiShoppingBag, FiRotateCcw, FiPackage, FiLogOut, FiDollarSign } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import orderService from '../../services/orderService';

const POLL_INTERVAL = 5000;

const styles = {
  sidebar: {
    width: 250, height: '100vh',
    backgroundColor: '#0a0810',
    color: '#ffffff',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', left: 0, top: 0, zIndex: 100,
    borderRight: '1px solid rgba(255,255,255,0.04)',
  },
  logoSection: { padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  logoText: { fontSize: 20, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', color: '#ffffff' },
  portalLabel: { fontSize: 10, color: '#5C5C60', textTransform: 'uppercase', letterSpacing: 2.5, marginTop: 5 },
  nav: { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 },
  navLink: { display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderRadius: 8, color: '#8E8E92', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'all 220ms ease', position: 'relative' },
  navLinkActive: { backgroundColor: 'rgba(200,16,46,0.1)', color: '#ffffff' },
  badge: { marginLeft: 'auto', backgroundColor: '#c8102e', color: '#fff', fontSize: 10, fontWeight: 700, minWidth: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', animation: 'badgePulse 2s infinite' },
  storeName: { padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 11, color: '#5C5C60' },
  storeNameValue: { color: '#8E8E92', fontWeight: 600, fontSize: 12 },
  logoutButton: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', border: 'none', backgroundColor: 'transparent', color: '#8E8E92', cursor: 'pointer', fontSize: 13, fontWeight: 500, width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', transition: 'color 220ms ease' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [awaitingCount, setAwaitingCount] = useState(0);
  const [returnCount, setReturnCount] = useState(0);

  const fetchCounts = useCallback(async () => {
    try {
      const [awaitingData, returnData] = await Promise.all([
        orderService.getOrders('AWAITING_STORE_ACCEPTANCE', 1, 1, { allStores: true }),
        orderService.getOrders('RETURN_REQUESTED', 1, 1, { allStores: true }).catch(() => ({ pagination: { total: 0 } })),
      ]);
      setAwaitingCount(awaitingData.pagination?.total || awaitingData.orders?.length || 0);
      setReturnCount(returnData.pagination?.total || returnData.orders?.length || 0);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCounts();
      const interval = setInterval(fetchCounts, POLL_INTERVAL);
      const onRefresh = () => fetchCounts();
      window.addEventListener('order-action', onRefresh);
      window.addEventListener('new-order-received', onRefresh);
      return () => {
        clearInterval(interval);
        window.removeEventListener('order-action', onRefresh);
        window.removeEventListener('new-order-received', onRefresh);
      };
    }
  }, [user, fetchCounts]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: FiGrid, label: 'Dashboard', end: true },
    { to: '/orders', icon: FiShoppingBag, label: 'Orders', badge: awaitingCount },
    { to: '/returns', icon: FiRotateCcw, label: 'Returns', badge: returnCount },
    { to: '/inventory', icon: FiPackage, label: 'Inventory' },
    { to: '/in-store-sales', icon: FiDollarSign, label: 'In-Store Sales' },
  ];

  return (
    <div style={styles.sidebar}>
      <style>{`
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
      <div style={styles.logoSection}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={styles.logoText}>CONVERSE</div>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" style={{ display: 'inline-block' }}>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </div>
        <div style={styles.portalLabel}>Store Portal</div>
      </div>

      <nav style={styles.nav}>
        {navItems.map(({ to, icon: Icon, label, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
            })}
          >
            <Icon size={18} />
            {label}
            {badge > 0 && <span style={styles.badge}>{badge}</span>}
          </NavLink>
        ))}
      </nav>

      {user?.store && (
        <div style={styles.storeName}>
          <div>Store</div>
          <div style={styles.storeNameValue}>{user.store.name || user.store}</div>
        </div>
      )}

      <button style={styles.logoutButton} onClick={handleLogout}>
        <FiLogOut size={18} />
        Sign Out
      </button>
    </div>
  );
}
