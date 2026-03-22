import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiCheckCircle, FiPackage, FiRotateCcw } from 'react-icons/fi';
import orderService from '../services/orderService';
import returnService from '../services/returnService';
import Loader from '../components/common/Loader';

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 },
  card: { backgroundColor: '#1b1b1f', borderRadius: 12, padding: 24, cursor: 'pointer', transition: 'transform 220ms ease, box-shadow 220ms ease', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  iconWrapper: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardCount: { fontSize: 32, fontWeight: 700, color: '#E8E8E8', lineHeight: 1 },
  cardLabel: { fontSize: 13, color: '#8E8E92', marginTop: 4, fontWeight: 500 },
  section: { backgroundColor: '#1b1b1f', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.05)' },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: '#E8E8E8', marginBottom: 16 },
  welcomeText: { fontSize: 13, color: '#8E8E92', lineHeight: 1.7 },
};

const dashboardCards = [
  {
    key: 'awaiting',
    label: 'Awaiting Acceptance',
    icon: FiClock,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    link: '/orders?status=AWAITING_STORE_ACCEPTANCE',
  },
  {
    key: 'accepted',
    label: 'Accepted Orders',
    icon: FiCheckCircle,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    link: '/orders?status=ACCEPTED',
  },
  {
    key: 'ready',
    label: 'Ready for Pickup',
    icon: FiPackage,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    link: '/orders?status=READY_FOR_PICKUP',
  },
  {
    key: 'returns',
    label: 'Pending Returns',
    icon: FiRotateCcw,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    link: '/returns',
  },
];

export default function DashboardPage() {
  const [counts, setCounts] = useState({ awaiting: 0, accepted: 0, ready: 0, returns: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCounts = useCallback(async () => {
    try {
      const [awaitingRes, acceptedRes, readyRes, returnsRes] = await Promise.allSettled([
        orderService.getOrders('AWAITING_STORE_ACCEPTANCE', 1, 1),
        orderService.getOrders('ACCEPTED', 1, 1),
        orderService.getOrders('READY_FOR_PICKUP', 1, 1),
        returnService.getReturns('RETURN_REQUESTED'),
      ]);

      const extractCount = (res) => {
        if (res.status !== 'fulfilled') return 0;
        const v = res.value;
        return v.pagination?.total ?? v.total ?? v.orders?.length ?? v.returns?.length ?? 0;
      };
      setCounts({
        awaiting: extractCount(awaitingRes),
        accepted: extractCount(acceptedRes),
        ready: extractCount(readyRes),
        returns: extractCount(returnsRes),
      });
    } catch {
      // Counts stay at 0
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    const refresh = () => fetchCounts();
    window.addEventListener('new-order-received', refresh);
    window.addEventListener('order-action', refresh);
    return () => {
      window.removeEventListener('new-order-received', refresh);
      window.removeEventListener('order-action', refresh);
    };
  }, [fetchCounts]);

  if (loading) return <Loader />;

  return (
    <div>
      <div style={styles.grid}>
        {dashboardCards.map(({ key, label, icon: Icon, color, bg, link }) => (
          <div
            key={key}
            style={styles.card}
            onClick={() => navigate(link)}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.cardCount}>{counts[key]}</div>
                <div style={styles.cardLabel}>{label}</div>
              </div>
              <div style={{ ...styles.iconWrapper, backgroundColor: bg }}>
                <Icon size={22} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Store Operations Overview</h2>
        <p style={styles.welcomeText}>
          Welcome to the Converse BOPIS Store Portal. Use the sidebar navigation to manage
          incoming orders, process returns, and update inventory levels. New orders awaiting
          acceptance will trigger notifications automatically.
        </p>
      </div>
    </div>
  );
}
