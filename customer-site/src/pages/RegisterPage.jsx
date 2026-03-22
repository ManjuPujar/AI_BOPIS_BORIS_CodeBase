import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import { validateEmail, validatePassword } from '../utils/validators';

function getRegisterErrorMessage(err) {
  if (!err.response) {
    return 'Unable to connect to the server. Please check your connection and try again.';
  }
  const msg = err.response.data?.message;
  if (err.response.status === 409 && msg) return msg;
  if (err.response.status === 400 && msg) return msg;
  if (err.response.status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (err.response.status >= 500) return 'Something went wrong on our end. Please try again later.';
  return msg || 'Registration failed. Please try again.';
}

const RegisterPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Please enter your first and last name.');
      return;
    }
    if (!validateEmail(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!validatePassword(form.password)) {
      setError('Password must be at least 8 characters with 1 uppercase letter and 1 number.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join the Converse community</p>
        </div>
        {error && <div style={styles.errorBox}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>First Name</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                style={styles.input}
                placeholder="First name"
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Last Name</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                style={styles.input}
                placeholder="Last name"
                required
              />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="your@email.com"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              placeholder="Confirm your password"
              required
            />
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', backgroundColor: 'transparent' },
  card: { width: '100%', maxWidth: 500, backgroundColor: '#1b1b1f', borderRadius: 12, padding: '40px 36px', boxShadow: '0 1px 2px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.05)' },
  errorBox: { color: '#f87171', fontSize: 13, textAlign: 'center', padding: '10px 14px', marginBottom: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 6, lineHeight: 1.4 },
  header: { textAlign: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#E8E8E8' },
  subtitle: { fontSize: 15, color: '#5C5C60' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  row: { display: 'flex', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  label: { fontSize: 13, fontWeight: 600, color: '#8E8E92' },
  input: { padding: '12px 16px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 14, outline: 'none', backgroundColor: '#19191d', color: '#E8E8E8', transition: 'border-color 220ms ease' },
  btn: { backgroundColor: '#c8102e', color: '#fff', padding: '14px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4, transition: 'opacity 220ms ease' },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 14, color: '#5C5C60' },
  link: { color: '#E8E8E8', fontWeight: 600, textDecoration: 'underline' },
};

export default RegisterPage;
