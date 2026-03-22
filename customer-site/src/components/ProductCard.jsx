import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

const ProductCard = ({ product }) => {
  const mainImage = product.images?.[0] || product.image || 'https://via.placeholder.com/400x400?text=Converse';

  return (
    <Link to={`/product/${product._id || product.id}`} style={styles.card}>
      <div style={styles.imageWrap}>
        <img
          src={mainImage}
          alt={product.name}
          style={styles.image}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=Converse'; }}
        />
        {product.isNew && <span style={styles.badge}>NEW</span>}
        {product.salePrice && (
          <span style={{ ...styles.badge, ...styles.saleBadge }}>SALE</span>
        )}
      </div>
      <div style={styles.info}>
        <h3 style={styles.name}>{product.name}</h3>
        <p style={styles.category}>{product.category || 'Shoes'}</p>
        <div style={styles.priceRow}>
          <span style={styles.price}>
            {formatCurrency(product.salePrice || product.basePrice || product.price)}
          </span>
          {product.salePrice && (
            <span style={styles.origPrice}>{formatCurrency(product.basePrice || product.price)}</span>
          )}
        </div>
        <div style={styles.colors}>
          {(product.colors || []).slice(0, 4).map((color, i) => (
            <span
              key={i}
              style={{
                ...styles.colorDot,
                backgroundColor: color.hex || color.toLowerCase(),
              }}
            />
          ))}
          {(product.colors || []).length > 4 && (
            <span style={styles.moreColors}>+{product.colors.length - 4}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

const styles = {
  card: {
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
    borderRadius: 10,
    overflow: 'hidden',
    transition: 'transform 220ms ease, box-shadow 220ms ease',
    backgroundColor: '#1b1b1f',
    border: '1px solid rgba(255,255,255,0.05)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.12)',
  },
  imageWrap: {
    position: 'relative',
    backgroundColor: '#161619',
    paddingTop: '110%',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
    objectFit: 'cover',
    transition: 'transform 400ms ease',
  },
  badge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(232,232,232,0.92)', color: '#101014',
    fontSize: 9, fontWeight: 700, letterSpacing: 1.2,
    padding: '3px 8px', borderRadius: 3,
  },
  saleBadge: {
    backgroundColor: '#c8102e', color: '#fff',
    top: 12, left: 'auto', right: 12,
  },
  info: { padding: '16px 14px 18px' },
  name: { fontSize: 13, fontWeight: 500, marginBottom: 3, lineHeight: 1.4, color: '#E8E8E8', letterSpacing: 0.1 },
  category: { fontSize: 11, color: '#5C5C60', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  priceRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  price: { fontSize: 14, fontWeight: 600, color: '#E8E8E8' },
  origPrice: { fontSize: 12, color: '#5C5C60', textDecoration: 'line-through' },
  colors: { display: 'flex', alignItems: 'center', gap: 5 },
  colorDot: { width: 12, height: 12, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' },
  moreColors: { fontSize: 10, color: '#5C5C60' },
};

export default ProductCard;
