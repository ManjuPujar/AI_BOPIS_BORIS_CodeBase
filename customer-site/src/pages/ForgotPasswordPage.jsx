import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { validateEmail } from '../utils/validators';
import * as authService from '../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Password reset email sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {sent ? (
          <div style={styles.sentBox}>
            <div style={styles.checkCircle}>&#10003;</div>
            <h2 style={styles.title}>Check Your Email</h2>
            <p style={styles.subtitle}>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <Link to="/login" style={styles.btn}>Back to Sign In</Link>
          </div>
        ) : (
          <>
            <div style={styles.header}>
              <h1 style={styles.title}>Forgot Password?</h1>
              <p style={styles.subtitle}>
                Enter your email and we'll send you a reset link
              </p>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <button type="submit" style={styles.btn} disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p style={styles.footer}>
              <Link to="/login" style={styles.link}>Back to Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', backgroundColor: 'transparent' },
  card: { width: '100%', maxWidth: 440, backgroundColor: '#1b1b1f', borderRadius: 12, padding: '40px 36px', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.05)' },
  header: { textAlign: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#E8E8E8' },
  subtitle: { fontSize: 15, color: '#5C5C60', lineHeight: 1.5 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#8E8E92' },
  input: { padding: '12px 16px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#19191d', color: '#E8E8E8', transition: 'border-color 220ms ease' },
  btn: { display: 'inline-block', backgroundColor: '#c8102e', color: '#fff', padding: '14px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', textAlign: 'center', transition: 'opacity 220ms ease' },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 14, color: '#5C5C60' },
  link: { color: '#E8E8E8', fontWeight: 600, textDecoration: 'underline' },
  sentBox: { textAlign: 'center' },
  checkCircle: { width: 60, height: 60, borderRadius: '50%', backgroundColor: 'rgba(52,211,153,0.08)', color: '#34d399', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
};

export default ForgotPasswordPage;
