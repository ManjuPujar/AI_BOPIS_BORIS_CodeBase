import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiArrowRight, FiMapPin } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import * as productService from '../services/productService';
import { motion } from 'framer-motion';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category) params.category = category;
        if (search) params.search = search;
        const data = await productService.getProducts(params);
        setProducts(data.products || data || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, search]);

  return (
    <div>
      {!category && !search && <HeroWithCategories />}
      {!category && !search && <FeatureStrip />}

      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              {category
                ? category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                : search
                ? `Results for "${search}"`
                : 'Shop All Shoes'}
            </h2>
            {!category && !search && (
              <Link to="/products" style={styles.viewAll}>
                View All <FiArrowRight />
              </Link>
            )}
          </div>

          {loading ? (
            <div style={styles.loadingGrid}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={styles.skeleton}>
                  <div style={styles.skeletonImg} />
                  <div style={{ ...styles.skeletonLine, width: '70%' }} />
                  <div style={{ ...styles.skeletonLine, width: '40%' }} />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyText}>No products found.</p>
              <Link to="/products" style={styles.emptyBtn}>Browse All Shoes</Link>
            </div>
          ) : (
            <div style={styles.grid}>
              {products.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {!category && !search && <PickupBanner />}
    </div>
  );
};

const HeroWithCategories = () => (
  <section style={heroStyles.hero}>
    <div style={heroStyles.overlay} />
    <div style={heroStyles.heroInner}>
      <div style={heroStyles.content}>
        <span style={heroStyles.tag}>NEW ARRIVALS</span>
        <h1 style={heroStyles.title}>CHUCK TAYLOR ALL STAR</h1>
        <p style={heroStyles.subtitle}>
          The icon that started it all. Now available for in-store pickup.
        </p>
        <div style={heroStyles.actions}>
          <Link to="/products" style={heroStyles.primaryBtn}>Shop Now</Link>
          <Link to="/products?category=chuck-taylor" style={heroStyles.secondaryBtn}>
            Explore Collection
          </Link>
        </div>
      </div>
      <div style={heroStyles.catArea}>
        <h2 style={heroStyles.catHeading}>Shop By Category</h2>
        <div style={heroStyles.catGrid}>
          {CATEGORIES.map((cat) => (
            <CategoryTile key={cat.param} {...cat} />
          ))}
        </div>
      </div>
    </div>
  </section>
);

const FeatureStrip = () => (
  <div style={stripStyles.strip}>
    <div style={stripStyles.feature}>
      <FiMapPin size={20} />
      <div>
        <strong>Buy Online, Pick Up In Store</strong>
        <span style={stripStyles.featureSub}>Ready in 2 hours</span>
      </div>
    </div>
    <div style={stripStyles.feature}>
      <span style={stripStyles.icon}>&#9733;</span>
      <div>
        <strong>Free Shipping</strong>
        <span style={stripStyles.featureSub}>On orders over $75</span>
      </div>
    </div>
    <div style={stripStyles.feature}>
      <span style={stripStyles.icon}>&#8634;</span>
      <div>
        <strong>Easy Returns</strong>
        <span style={stripStyles.featureSub}>30-day return policy</span>
      </div>
    </div>
  </div>
);

const CATEGORIES = [
  {
    label: 'CHUCK TAYLOR',
    sub: 'The Original Icon',
    param: 'chuck-taylor',
    bg: 'linear-gradient(150deg, #140e18 0%, #1e1428 100%)',
    accent: '#c8102e',
    icon: '★',
  },
  {
    label: 'ONE STAR',
    sub: 'Street Heritage',
    param: 'one-star',
    bg: 'linear-gradient(150deg, #12101c 0%, #1c1830 100%)',
    accent: '#e2b93b',
    icon: '✦',
  },
  {
    label: 'RUN STAR',
    sub: 'Bold & Elevated',
    param: 'run-star',
    bg: 'linear-gradient(150deg, #14101a 0%, #241434 100%)',
    accent: '#ee5a24',
    icon: '⚡',
  },
  {
    label: 'SALE',
    sub: 'Limited Time Deals',
    param: 'sale',
    bg: 'linear-gradient(150deg, #1e0a12 0%, #180810 100%)',
    accent: '#fbbf24',
    icon: '%',
  },
];

const CategoryTile = ({ label, sub, param, bg, accent, icon }) => (
  <motion.div
    whileHover={{ y: -3 }}
    whileFocus={{ y: -3 }}
    transition={{ duration: 0.22, ease: 'easeOut' }}
    tabIndex={0}
    style={{ outline: 'none' }}
  >
    <Link
      to={`/products?category=${param}`}
      style={{ ...catStyles.tile, background: bg }}
    >
      <span style={{ ...catStyles.tileIcon, color: accent }}>{icon}</span>
      <span style={catStyles.tileLabel}>{label}</span>
      <span style={catStyles.tileSub}>{sub}</span>
      <span style={{ ...catStyles.tileShop, color: accent }}>
        SHOP NOW <FiArrowRight size={13} />
      </span>
    </Link>
  </motion.div>
);

const catStyles = {
  tile: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    minHeight: 220,
    borderRadius: 12,
    padding: '28px 24px',
    textDecoration: 'none',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)',
    transition: 'box-shadow 220ms ease',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  tileIcon: {
    fontSize: 32,
    marginBottom: 12,
    opacity: 0.85,
  },
  tileLabel: {
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: 2.5,
    marginBottom: 4,
    textTransform: 'uppercase',
    color: '#fff',
  },
  tileSub: {
    fontSize: 12,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  tileShop: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    textTransform: 'uppercase',
  },
};

const PickupBanner = () => (
  <section style={pickupStyles.section}>
    <div style={pickupStyles.inner}>
      <div style={pickupStyles.text}>
        <h2 style={pickupStyles.title}>Buy Online, Pick Up In Store</h2>
        <p style={pickupStyles.desc}>
          Order your favorite Converse shoes online and pick them up at your nearest store.
          It's fast, free, and convenient.
        </p>
        <Link to="/products" style={pickupStyles.btn}>Find Your Style</Link>
      </div>
      <div style={pickupStyles.graphic}>
        <div style={pickupStyles.circle}>
          <FiMapPin size={64} color="#c8102e" />
        </div>
      </div>
    </div>
  </section>
);

const styles = {
  section: { padding: '48px 24px', backgroundColor: 'transparent' },
  container: { maxWidth: 1280, margin: '0 auto' },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: -0.5,
    color: '#E8E8E8',
  },
  viewAll: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    fontWeight: 600,
    color: '#8E8E92',
    textDecoration: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 24,
  },
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 24,
  },
  skeleton: { borderRadius: 12, overflow: 'hidden' },
  skeletonImg: {
    backgroundColor: '#161619',
    paddingTop: '100%',
    borderRadius: 12,
    marginBottom: 12,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: '#161619',
    borderRadius: 4,
    marginBottom: 8,
  },
  empty: { textAlign: 'center', padding: '60px 0' },
  emptyText: { fontSize: 16, color: '#8E8E92', marginBottom: 16 },
  emptyBtn: {
    display: 'inline-block',
    backgroundColor: '#c8102e',
    color: '#fff',
    padding: '12px 32px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    textDecoration: 'none',
    transition: 'opacity 220ms ease',
  },
};

const heroStyles = {
  hero: {
    position: 'relative',
    background: 'linear-gradient(135deg, #0a0008 0%, #110a18 30%, #0e0612 60%, #0a0008 100%)',
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: [
      'radial-gradient(ellipse 70% 60% at 15% 50%, rgba(140,20,40,0.18) 0%, transparent 70%)',
      'radial-gradient(ellipse 60% 70% at 85% 40%, rgba(80,30,120,0.16) 0%, transparent 65%)',
      'radial-gradient(ellipse 40% 40% at 50% 80%, rgba(60,15,80,0.08) 0%, transparent 60%)',
    ].join(', '),
    pointerEvents: 'none',
  },
  heroInner: {
    position: 'relative',
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 24px',
  },
  content: {
    textAlign: 'center',
    color: '#E8E8E8',
    padding: '64px 0 40px',
    maxWidth: 680,
    margin: '0 auto',
  },
  catArea: {
    paddingBottom: 52,
  },
  catHeading: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 3,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    marginBottom: 22,
  },
  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
  },
  tag: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 3,
    color: '#c8102e',
    marginBottom: 16,
    display: 'block',
  },
  title: {
    fontSize: 56,
    fontWeight: 900,
    letterSpacing: -1,
    lineHeight: 1.05,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E92',
    marginBottom: 32,
    lineHeight: 1.6,
  },
  actions: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    backgroundColor: '#c8102e',
    color: '#fff',
    padding: '14px 36px',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textDecoration: 'none',
    transition: 'opacity 220ms ease',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: '#E8E8E8',
    padding: '14px 36px',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,0.12)',
    transition: 'opacity 220ms ease',
  },
};

const stripStyles = {
  strip: {
    display: 'flex',
    justifyContent: 'center',
    gap: 48,
    padding: '24px',
    backgroundColor: 'rgba(16,12,20,0.6)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    flexWrap: 'wrap',
    color: '#E8E8E8',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 13,
  },
  featureSub: {
    display: 'block',
    fontSize: 12,
    color: '#5C5C60',
  },
  icon: { fontSize: 20 },
};

const pickupStyles = {
  section: {
    padding: '80px 24px',
    backgroundColor: 'rgba(16,12,20,0.6)',
  },
  inner: {
    maxWidth: 1280,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: 60,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  text: { flex: 1, minWidth: 300 },
  title: {
    fontSize: 36,
    fontWeight: 800,
    marginBottom: 16,
    letterSpacing: -0.5,
    color: '#E8E8E8',
  },
  desc: {
    fontSize: 16,
    color: '#8E8E92',
    lineHeight: 1.7,
    marginBottom: 24,
    maxWidth: 460,
  },
  btn: {
    display: 'inline-block',
    backgroundColor: '#c8102e',
    color: '#fff',
    padding: '14px 36px',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textDecoration: 'none',
    transition: 'opacity 220ms ease',
  },
  graphic: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: '50%',
    backgroundColor: '#1b1b1f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.18)',
  },
};

export default HomePage;
