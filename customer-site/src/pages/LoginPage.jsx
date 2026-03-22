import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import { validateEmail } from '../utils/validators';

function getLoginErrorMessage(err) {
  if (!err.response) {
    return 'Unable to connect to the server. Please check your connection and try again.';
  }
  const msg = err.response.data?.message;
  if (err.response.status === 400 && msg) return msg;
  if (err.response.status === 429) return 'Too many login attempts. Please wait a moment and try again.';
  if (err.response.status >= 500) return 'Something went wrong on our end. Please try again later.';
  return msg || 'Login failed. Please check your credentials and try again.';
}

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>SIGN IN</h1>
        {error && <div style={styles.errorBox}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="login-email" style={styles.label}>Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              style={styles.input}
              placeholder="your@email.com"
              required
            />
          </div>
          <div style={styles.field}>
            <div style={styles.labelRow}>
              <label htmlFor="login-password" style={styles.label}>Password</label>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              style={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
        <p style={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', backgroundColor: 'transparent' },
  card: { width: '100%', maxWidth: 400, backgroundColor: 'transparent', padding: '8px 0 0' },
  title: { fontSize: 26, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#E8E8E8', textAlign: 'center', margin: '0 0 40px', lineHeight: 1.2 },
  errorBox: { color: '#f87171', fontSize: 13, textAlign: 'center', padding: '10px 14px', marginBottom: 20, backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 6, lineHeight: 1.4 },
  form: { display: 'flex', flexDirection: 'column', gap: 28 },
  field: { display: 'flex', flexDirection: 'column', gap: 10 },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  label: { fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#8E8E92' },
  forgotLink: { fontSize: 12, color: '#8E8E92', textDecoration: 'underline', textUnderlineOffset: 3, fontWeight: 500, whiteSpace: 'nowrap' },
  input: { width: '100%', boxSizing: 'border-box', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 15, outline: 'none', backgroundColor: '#19191d', color: '#E8E8E8', transition: 'border-color 220ms ease' },
  btn: { width: '100%', boxSizing: 'border-box', backgroundColor: '#c8102e', color: '#fff', padding: '16px 20px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', cursor: 'pointer', marginTop: 8, textTransform: 'uppercase', transition: 'opacity 220ms ease' },
  footer: { textAlign: 'center', marginTop: 32, fontSize: 14, color: '#5C5C60', lineHeight: 1.5 },
  link: { color: '#E8E8E8', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3 },
};

export default LoginPage;
