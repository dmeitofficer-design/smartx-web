'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setup, setSetup] = useState({ username: '', password: '', confirm: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }
      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    if (setup.password !== setup.confirm) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: setup.username, password: setup.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Setup failed'); setLoading(false); return; }
      setShowSetup(false);
      setForm({ username: setup.username, password: '' });
      setLoading(false);
    } catch {
      setError('Network error.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
      </div>

      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚕</span>
          <span className={styles.logoText}>SmartX Admin</span>
        </div>
        <p className={styles.subtitle}>
          {showSetup ? 'Create your admin account' : 'Sign in to the CMS dashboard'}
        </p>

        {error && (
          <div className={styles.errorBox}>
            <i className="fa-solid fa-triangle-exclamation" /> {error}
          </div>
        )}

        {!showSetup ? (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className="form-group">
              <label>Username</label>
              <input className="form-input" placeholder="admin" required autoComplete="username"
                value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-input" type="password" placeholder="••••••••" required autoComplete="current-password"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading
                ? <><span className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in…</>
                : 'Sign In'}
            </button>
         
          </form>
        ) : (
          <form onSubmit={handleSetup} className={styles.form}>
            <div className="form-group">
              <label>Username</label>
              <input className="form-input" placeholder="admin" required
                value={setup.username} onChange={e => setSetup(f => ({ ...f, username: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-input" type="password" placeholder="••••••••" required
                value={setup.password} onChange={e => setSetup(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input className="form-input" type="password" placeholder="••••••••" required
                value={setup.confirm} onChange={e => setSetup(f => ({ ...f, confirm: e.target.value }))} />
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Creating…' : 'Create Account'}
            </button>
            <button type="button" className={styles.setupLink} onClick={() => { setShowSetup(false); setError(''); }}>
              ← Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
