import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm]   = useState({ username: '', pin: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setInstitution } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await login(form);
      setUser(r.data.user);
      setInstitution(r.data.institution);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
          <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,.15)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', overflow: 'hidden', border: '2px solid rgba(255,255,255,.3)' }}>
            <img src="/logo.png" alt="C-Care" style={{ width: '90%', height: '90%', objectFit: 'contain' }} onError={e => e.target.style.display='none'} />
          </div>
          <div className="login-brand-name">C-Care</div>
          <div className="login-brand-full">by Convergence — Secure Care. Trusted Medicine.</div>
          <ul className="login-features" style={{ maxWidth: 280, margin: '0 auto', textAlign: 'left' }}>
            <li><i className="fas fa-shield-alt" /> PIN-secured drug dispensing</li>
            <li><i className="fas fa-chart-line" /> Real-time sales analytics</li>
            <li><i className="fas fa-bell" /> Instant admin notifications</li>
            <li><i className="fas fa-file-pdf" /> Professional PDF receipts</li>
            <li><i className="fas fa-users" /> Multi-staff platform</li>
          </ul>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="login-form-title">Welcome back</div>
          <div className="login-form-subtitle">Sign in to your C-Care account</div>

          {error && <div className="alert alert-danger"><i className="fas fa-exclamation-circle" />{error}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fas fa-user" /></span>
                <input className="form-control" type="text" placeholder="Enter your username"
                  value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required autoFocus />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">PIN</label>
              <div className="input-group">
                <span className="input-group-text"><i className="fas fa-lock" /></span>
                <input className="form-control" type="password" placeholder="Enter your PIN" maxLength={10}
                  value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value }))} required />
              </div>
            </div>
            <button className="btn btn-primary w-100 btn-lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <span className="spinner" /> : <><i className="fas fa-sign-in-alt" /> Sign In</>}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: 18, background: '#f8f8f8', borderRadius: 12, border: '1px solid #e0e0e0', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>
              <i className="fas fa-user-plus" style={{ marginRight: 6, color: '#4a4a4a' }} />
              New employee? Request to join your drug shop.
            </div>
            <Link to="/register" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
              <i className="fas fa-store" /> Find My Drug Shop & Register
            </Link>
          </div>

          <div style={{ marginTop: 20, textAlign: 'center', color: '#999', fontSize: 12 }}>
            <i className="fas fa-lock" style={{ marginRight: 6 }} />
            All sessions are encrypted and securely monitored
          </div>
        </div>
      </div>
    </div>
  );
}
