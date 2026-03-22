import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';

const styles = {
  container: {
    width: '100%',
    maxWidth: 420,
    padding: 40,
    borderRadius: 12,
    backgroundColor: '#16213e',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  },
  logo: {
    textAlign: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  subtitle: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 32,
    fontWeight: 400,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.08)',
    backgroundColor: '#19191d',
    color: '#E8E8E8',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 220ms ease',
  },
  button: {
    marginTop: 8,
    padding: '14px 24px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#c8102e',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: 1,
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#7f1d2a',
    cursor: 'not-allowed',
  },
  error: {
    color: '#f87171',
    fontSize: 13,
    textAlign: 'center',
    padding: '8px 12px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 6,
  },
};

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.logo}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <svg width="24" height="24" viewBox="0 0 100 100">
            <polygon points="50,8 58,36 88,36 64,54 72,82 50,64 28,82 36,54 12,36 42,36" fill="#111" />
            <polygon points="62,30 90,50 62,70 70,50" fill="#111" />
          </svg>
          <span style={styles.logoText}>CONVERSE</span>
        </div>
      </div>
      <p style={styles.subtitle}>Store Employee Portal</p>

      <form style={styles.form} onSubmit={handleSubmit}>
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="employee@converse.com"
            required
            autoFocus
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
