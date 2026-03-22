import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiBell, FiUser, FiX } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import useNotifications from '../../hooks/useNotifications';
import { formatRelativeTime } from '../../utils/formatDate';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/orders': 'Orders',
  '/returns': 'Returns',
  '/inventory': 'Inventory',
};

const styles = {
  header: {
    height: 64,
    backgroundColor: 'rgba(16,16,20,0.92)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px', position: 'sticky', top: 0, zIndex: 50,
  },
  title: { fontSize: 18, fontWeight: 600, color: '#E8E8E8', letterSpacing: 0.2 },
  rightSection: { display: 'flex', alignItems: 'center', gap: 20 },
  bellContainer: { position: 'relative', cursor: 'pointer' },
  bellIcon: { color: '#8E8E92', transition: 'color 220ms ease' },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#c8102e', color: '#ffffff', fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userInfo: { display: 'flex', alignItems: 'center', gap: 8, color: '#8E8E92', fontSize: 13, fontWeight: 500 },
  dropdown: { position: 'absolute', top: 36, right: 0, width: 320, backgroundColor: '#1b1b1f', borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.06)', zIndex: 200, overflow: 'hidden' },
  dropdownHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.12)' },
  dropdownTitle: { fontSize: 13, fontWeight: 600, color: '#E8E8E8' },
  clearButton: { fontSize: 11, color: '#c8102e', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 500 },
  notificationItem: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background-color 150ms ease' },
  notificationTitle: { fontSize: 12, fontWeight: 600, color: '#E8E8E8' },
  notificationMessage: { fontSize: 11, color: '#8E8E92', marginTop: 2 },
  notificationTime: { fontSize: 10, color: '#5C5C60', marginTop: 4 },
  emptyNotifications: { padding: 24, textAlign: 'center', color: '#5C5C60', fontSize: 12 },
};

export default function Header() {
  const location = useLocation();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  const getTitle = () => {
    if (location.pathname.startsWith('/orders/')) return 'Order Details';
    return PAGE_TITLES[location.pathname] || 'Converse Store Portal';
  };

  return (
    <div style={styles.header}>
      <h1 style={styles.title}>{getTitle()}</h1>

      <div style={styles.rightSection}>
        <div style={styles.bellContainer} onClick={() => setShowDropdown(!showDropdown)}>
          <FiBell size={20} style={styles.bellIcon} />
          {unreadCount > 0 && <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}

          {showDropdown && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <span style={styles.dropdownTitle}>Notifications</span>
                {notifications.length > 0 && (
                  <button style={styles.clearButton} onClick={(e) => { e.stopPropagation(); clearAll(); }}>
                    Clear All
                  </button>
                )}
                <FiX
                  size={16}
                  style={{ cursor: 'pointer', color: '#5C5C60' }}
                  onClick={(e) => { e.stopPropagation(); setShowDropdown(false); }}
                />
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={styles.emptyNotifications}>No notifications</div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      style={{
                        ...styles.notificationItem,
                        backgroundColor: n.read ? 'transparent' : 'rgba(200,16,46,0.03)',
                      }}
                      onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                    >
                      <div style={styles.notificationTitle}>{n.title}</div>
                      <div style={styles.notificationMessage}>{n.message}</div>
                      <div style={styles.notificationTime}>{formatRelativeTime(n.timestamp)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div style={styles.userInfo}>
          <FiUser size={16} />
          {user?.firstName || user?.name || 'Employee'}
        </div>
      </div>
    </div>
  );
}
