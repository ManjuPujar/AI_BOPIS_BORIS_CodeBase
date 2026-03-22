import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import useAuth from '../hooks/useAuth';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0008 0%, #110a18 30%, #0e0612 60%, #0a0008 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage:
      'radial-gradient(ellipse 70% 60% at 15% 50%, rgba(140,20,40,0.14) 0%, transparent 70%), radial-gradient(ellipse 60% 70% at 85% 40%, rgba(80,30,120,0.12) 0%, transparent 65%)',
  },
};

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div style={styles.page}>
      <LoginForm />
    </div>
  );
}
