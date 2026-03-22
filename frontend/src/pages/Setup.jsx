import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupApp } from '../api';

export default function Setup() {
  const [form, setForm]   = useState({ shop_name: '', shop_address: '', shop_phone: '', name: '', username: '', pin: '', confirm_pin: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (form.pin !== form.confirm_pin) { setError('PINs do not match'); return; }
    setLoading(true); setError('');
    try {
      await setupApp(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="setup-page">
      <div className="setup-card" style={{ maxWidth: 540 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, background: 'white', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', overflow: 'hidden', border: '2px solid #e0e0e0' }}>
            <img src="/logo.png" alt="C-Care" style={{ width: '90%', height: '90%', objectFit: 'contain' }} onError={e => e.target.style.display='none'} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#1a1a1a', margin: '0 0 6px', letterSpacing: '-.5px' }}>Welcome to C-Care</h2>
          <p style={{ color: '#666', fontSize: 14, margin: 0 }}>Set up your drug shop and create the admin account</p>
        </div>

        {error && <div className="alert alert-danger"><i className="fas fa-exclamation-circle" />{error}</div>}

        <form onSubmit={submit}>
          <div style={{ background: '#f8f8f8', borderRadius: 12, padding: 20, marginBottom: 24, border: '1px solid #e0e0e0' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 16 }}>
              <i className="fas fa-store" style={{ marginRight: 6, color: '#4a4a4a' }} /> Drug Shop / Institution
            </div>
            <div className="form-group">
              <label className="form-label">Shop Name <span style={{ color: '#333' }}>*</span></label>
              <input className="form-control" type="text" placeholder="e.g. Kylian's Drug Shop" value={form.shop_name} onChange={set('shop_name')} required />
              <div className="form-text">This is what employees search for when joining.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-control" type="text" placeholder="e.g. 123 Main St, Kampala" value={form.shop_address} onChange={set('shop_address')} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone</label>
              <input className="form-control" type="text" placeholder="e.g. +256700000000" value={form.shop_phone} onChange={set('shop_phone')} />
            </div>
          </div>

          <div style={{ background: '#f8f8f8', borderRadius: 12, padding: 20, marginBottom: 24, border: '1px solid #e0e0e0' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 16 }}>
              <i className="fas fa-user-shield" style={{ marginRight: 6, color: '#666' }} /> Admin Account
            </div>
            <div className="form-group">
              <label className="form-label">Full Name <span style={{ color: '#333' }}>*</span></label>
              <input className="form-control" type="text" placeholder="Your full name" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Username <span style={{ color: '#333' }}>*</span></label>
              <input className="form-control" type="text" placeholder="Choose a username" value={form.username} onChange={set('username')} required />
            </div>
            <div className="form-group">
              <label className="form-label">PIN <span style={{ color: '#333' }}>*</span></label>
              <input className="form-control" type="password" placeholder="Create a secure PIN" maxLength={10} value={form.pin} onChange={set('pin')} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm PIN <span style={{ color: '#333' }}>*</span></label>
              <input className="form-control" type="password" placeholder="Confirm your PIN" maxLength={10} value={form.confirm_pin} onChange={set('confirm_pin')} required />
            </div>
          </div>

          <button className="btn btn-primary w-100 btn-lg" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : <><i className="fas fa-rocket" /> Initialize C-Care</>}
          </button>
        </form>
      </div>
    </div>
  );
}
