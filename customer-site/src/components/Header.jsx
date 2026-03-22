import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header style={styles.header}>
      <div style={styles.topBar}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes headerMarquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .header-marquee {
            display: inline-flex;
            gap: 56px;
            white-space: nowrap;
            width: max-content;
            will-change: transform;
            animation: headerMarquee 35s linear infinite !important;
          }
        `}} />
        <div style={styles.marqueeTrack}>
          <div className="header-marquee">
            <span style={styles.topBarText}>Free shipping on orders over $75</span>
            <span style={styles.topBarText}>Buy Online, Pick Up In Store — Ready in 2 Hours</span>
            <span style={styles.topBarText}>Easy 30-Day Returns</span>
            <span style={styles.topBarText}>New Arrivals Just Dropped</span>
            <span style={styles.topBarText}>Free shipping on orders over $75</span>
            <span style={styles.topBarText}>Buy Online, Pick Up In Store — Ready in 2 Hours</span>
            <span style={styles.topBarText}>Easy 30-Day Returns</span>
            <span style={styles.topBarText}>New Arrivals Just Dropped</span>
          </div>
        </div>
      </div>
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <button
            style={styles.menuBtn}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <Link to="/" style={styles.logo}>
            <span style={styles.logoText}>CONVERSE</span>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 5, display: 'inline-block', verticalAlign: 'middle' }}>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </Link>

          <div style={{ ...styles.navLinks, ...(mobileOpen ? styles.navLinksOpen : {}) }}>
            <Link to="/products" style={styles.navLink} onClick={() => setMobileOpen(false)}>
              All Shoes
            </Link>
            <Link to="/products?category=chuck-taylor" style={styles.navLink} onClick={() => setMobileOpen(false)}>
              Chuck Taylor
            </Link>
            <Link to="/products?category=one-star" style={styles.navLink} onClick={() => setMobileOpen(false)}>
              One Star
            </Link>
            <Link to="/products?category=run-star" style={styles.navLink} onClick={() => setMobileOpen(false)}>
              Run Star
            </Link>
          </div>

          <div style={styles.navActions}>
            <Link to="/products" style={styles.iconBtn} aria-label="Search">
              <FiSearch size={20} />
            </Link>
            <Link to="/track-order" style={styles.navLink}>Track Order</Link>
            {isAuthenticated ? (
              <div
                style={styles.userMenu}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <Link to="/account" style={styles.iconBtn} aria-label="Account" onClick={(e) => { e.preventDefault(); setDropdownOpen((v) => !v); }}>
                  <FiUser size={20} />
                </Link>
                {dropdownOpen && (
                  <div style={{ ...styles.dropdown, display: 'block' }}>
                    <span style={styles.dropdownName}>Hi, {user?.firstName || 'User'}</span>
                    <Link to="/account" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>My Account</Link>
                    <Link to="/orders" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>My Orders</Link>
                    <button onClick={() => { setDropdownOpen(false); handleLogout(); }} style={styles.dropdownBtn}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" style={styles.iconBtn} aria-label="Login">
                <FiUser size={20} />
              </Link>
            )}
            <Link to="/cart" style={styles.cartBtn} aria-label="Cart">
              <FiShoppingCart size={20} />
              {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(16, 16, 20, 0.92)',
    backdropFilter: 'blur(20px)',
    color: '#E8E8E8',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  topBar: {
    backgroundColor: 'rgba(8,6,12,0.9)',
    padding: '7px 0',
    overflow: 'hidden',
    position: 'relative',
  },
  marqueeTrack: { overflow: 'hidden', width: '100%' },
  topBarText: { fontSize: 10, fontWeight: 500, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', flexShrink: 0 },
  nav: { padding: '0 32px' },
  navInner: { maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, gap: 32 },
  menuBtn: { display: 'none', background: 'none', border: 'none', color: '#E8E8E8', padding: 4 },
  logo: { textDecoration: 'none', color: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center' },
  logoText: { fontSize: 22, fontWeight: 800, letterSpacing: 5 },
  navLinks: { display: 'flex', gap: 36, flex: 1, justifyContent: 'center' },
  navLinksOpen: {},
  navLink: { color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 12, fontWeight: 500, letterSpacing: 1.2, textTransform: 'uppercase', padding: '8px 0', borderBottom: '1px solid transparent', transition: 'color 220ms ease' },
  navActions: { display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 },
  iconBtn: { color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 4, cursor: 'pointer', transition: 'color 220ms ease' },
  cartBtn: { color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'flex', alignItems: 'center', position: 'relative', padding: 4, transition: 'color 220ms ease' },
  cartBadge: { position: 'absolute', top: -5, right: -9, backgroundColor: '#c8102e', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 17, height: 17, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userMenu: { position: 'relative' },
  dropdown: { display: 'none', position: 'absolute', top: '100%', right: 0, backgroundColor: '#1b1b1f', color: '#E8E8E8', borderRadius: 10, boxShadow: '0 8px 40px rgba(0,0,0,0.5)', padding: '6px 0', minWidth: 180, zIndex: 100, border: '1px solid rgba(255,255,255,0.06)' },
  dropdownName: { display: 'block', padding: '10px 16px', fontWeight: 600, fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#E8E8E8' },
  dropdownItem: { display: 'block', padding: '10px 16px', fontSize: 13, color: '#8E8E92', textDecoration: 'none', transition: 'color 220ms ease' },
  dropdownBtn: { display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, color: '#c8102e', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.05)' },
};

export default Header;
