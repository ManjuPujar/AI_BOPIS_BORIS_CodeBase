import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={styles.footer}>
    <div style={styles.inner}>
      <div style={styles.grid}>
        <div style={styles.col}>
          <h3 style={styles.heading}>CONVERSE</h3>
          <p style={styles.desc}>
            Iconic footwear since 1908. Express yourself from the ground up.
          </p>
        </div>
        <div style={styles.col}>
          <h4 style={styles.colTitle}>Shop</h4>
          <Link to="/products" style={styles.link}>All Shoes</Link>
          <Link to="/products?category=chuck-taylor" style={styles.link}>Chuck Taylor</Link>
          <Link to="/products?category=one-star" style={styles.link}>One Star</Link>
          <Link to="/products?category=run-star" style={styles.link}>Run Star</Link>
        </div>
        <div style={styles.col}>
          <h4 style={styles.colTitle}>Help</h4>
          <Link to="/orders" style={styles.link}>Order Status</Link>
          <Link to="/" style={styles.link}>Shipping & Returns</Link>
          <Link to="/" style={styles.link}>Size Guide</Link>
          <Link to="/" style={styles.link}>Contact Us</Link>
        </div>
        <div style={styles.col}>
          <h4 style={styles.colTitle}>Account</h4>
          <Link to="/login" style={styles.link}>Sign In</Link>
          <Link to="/register" style={styles.link}>Create Account</Link>
          <Link to="/account" style={styles.link}>My Profile</Link>
          <Link to="/orders" style={styles.link}>My Orders</Link>
        </div>
      </div>
      <div style={styles.bottom}>
        <span>&copy; {new Date().getFullYear()} Converse. All Rights Reserved.</span>
        <span style={styles.bottomLinks}>
          <Link to="/" style={styles.bottomLink}>Privacy</Link>
          <Link to="/" style={styles.bottomLink}>Terms</Link>
          <Link to="/" style={styles.bottomLink}>Accessibility</Link>
        </span>
      </div>
    </div>
  </footer>
);

const styles = {
  footer: {
    backgroundColor: 'rgba(8,6,12,0.95)',
    color: '#E8E8E8',
    padding: '72px 32px 36px',
    marginTop: 96,
    borderTop: '1px solid rgba(255,255,255,0.04)',
  },
  inner: { maxWidth: 1280, margin: '0 auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 56 },
  col: { display: 'flex', flexDirection: 'column', gap: 10 },
  heading: { fontSize: 20, fontWeight: 800, letterSpacing: 5, marginBottom: 10 },
  desc: { fontSize: 13, color: '#5C5C60', lineHeight: 1.7 },
  colTitle: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, color: 'rgba(255,255,255,0.4)' },
  link: { color: '#5C5C60', textDecoration: 'none', fontSize: 13, padding: '4px 0', transition: 'color 220ms ease' },
  bottom: { borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, fontSize: 12, color: '#3E3E42' },
  bottomLinks: { display: 'flex', gap: 28 },
  bottomLink: { color: '#3E3E42', textDecoration: 'none', fontSize: 12, transition: 'color 220ms ease' },
};

export default Footer;
