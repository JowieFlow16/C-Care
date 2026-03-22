import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchInstitutions, submitJoinRequest } from '../api';

export default function Register() {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [searching, setSearching]   = useState(false);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState({ name: '', username: '', pin: '', confirm_pin: '' });
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const navigate = useNavigate();
  const timer = useRef(null);

  const handleSearch = val => {
    setQuery(val);
    clearTimeout(timer.current);
    if (!val.trim()) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await searchInstitutions(val);
        setResults(r.data);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
  };

  const selectShop = inst => {
    setSelected(inst);
    setResults([]);
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!selected) { setError('Please select a drug shop'); return; }
    if (form.pin !== form.confirm_pin) { setError('PINs do not match'); return; }
    if (form.pin.length < 4) { setError('PIN must be at least 4 digits'); return; }
    setLoading(true); setError('');
    try {
      await submitJoinRequest({ ...form, institution_id: selected.id });
      navigate('/login', { state: { flash: { type: 'success', message: 'Request submitted! The admin will review your application.' } } });
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
          <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,.15)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', overflow: 'hidden', border: '2px solid rgba(255,255,255,.3)' }}>
            <img src="/logo.png" alt="C-Care" style={{ width: '90%', height: '90%', objectFit: 'contain' }} onError={e => e.target.style.display='none'} />
          </div>
          <div className="login-brand-name">Join C-Care</div>
          <div className="login-brand-full">Request to join your drug shop as an employee</div>
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 280, margin: '32px auto 0' }}>
            {[
              { icon: 'fa-search', color: '#aaa', title: 'Search Your Shop', sub: 'Find your drug shop by name' },
              { icon: 'fa-user-edit', color: '#888', title: 'Submit Your Details', sub: 'Create your username and PIN' },
              { icon: 'fa-user-check', color: '#999', title: 'Admin Approves', sub: 'The admin reviews and approves you' },
            ].map(({ icon, color, title, sub }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,.1)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                <i className={`fas ${icon}`} style={{ color, fontSize: 18, flexShrink: 0 }} />
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{title}</div>
                  <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 12 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right" style={{ width: 520, overflowY: 'auto' }}>
        <div className="login-form-container" style={{ maxWidth: 440, width: '100%' }}>
          <div className="login-form-title">Join Your Drug Shop</div>
          <div className="login-form-subtitle">Search for your workplace, select it, then fill in your details</div>

          {error && <div className="alert alert-danger"><i className="fas fa-exclamation-circle" />{error}</div>}

          <form onSubmit={submit}>
            {/* Step 1 */}
            <div style={{ background: '#f8f8f8', borderRadius: 12, padding: 18, marginBottom: 16, border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 12 }}>
                <i className="fas fa-search" style={{ marginRight: 6, color: '#4a4a4a' }} /> Step 1 — Find Your Shop
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-control" type="text" placeholder="Type drug shop name..."
                  value={query} onChange={e => handleSearch(e.target.value)} style={{ flex: 1 }} />
              </div>

              {searching && <div style={{ textAlign: 'center', padding: 12, color: '#999', fontSize: 13 }}><i className="fas fa-spinner fa-spin" /> Searching...</div>}

              {!searching && results.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{results.length} result{results.length !== 1 ? 's' : ''} — click to select:</div>
                  {results.map(inst => (
                    <div key={inst.id} className={`shop-option ${selected?.id === inst.id ? 'selected' : ''}`} onClick={() => selectShop(inst)}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1a1a1a' }}>
                        <i className="fas fa-store" style={{ color: '#4a4a4a', marginRight: 8 }} />{inst.name}
                      </div>
                      {inst.address && <div style={{ fontSize: 12, color: '#666', marginTop: 2, paddingLeft: 22 }}><i className="fas fa-map-marker-alt" style={{ marginRight: 4 }} />{inst.address}</div>}
                    </div>
                  ))}
                </div>
              )}

              {!searching && query && results.length === 0 && (
                <div style={{ textAlign: 'center', padding: 16, color: '#999', fontSize: 13 }}>
                  <i className="fas fa-store-slash" style={{ fontSize: 22, display: 'block', marginBottom: 8, opacity: .4 }} />
                  No shops found for "{query}"
                </div>
              )}

              {selected && (
                <div style={{ marginTop: 12, background: '#f0f0f0', borderRadius: 10, padding: '12px 14px', border: '1.5px solid #ccc', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className="fas fa-check-circle" style={{ color: '#4a4a4a', fontSize: 18, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Selected Shop</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{selected.name}</div>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>
              )}
            </div>

            {/* Step 2 */}
            {selected && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 14 }}>
                  <i className="fas fa-user-edit" style={{ marginRight: 6, color: '#666' }} /> Step 2 — Your Details
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name <span style={{ color: '#333' }}>*</span></label>
                  <input className="form-control" type="text" placeholder="Your full name" value={form.name} onChange={set('name')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Username <span style={{ color: '#333' }}>*</span></label>
                  <input className="form-control" type="text" placeholder="Choose a unique username" value={form.username} onChange={set('username')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">PIN <span style={{ color: '#333' }}>*</span></label>
                  <input className="form-control" type="password" placeholder="Create a PIN (4–10 digits)" maxLength={10} value={form.pin} onChange={set('pin')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm PIN <span style={{ color: '#333' }}>*</span></label>
                  <input className="form-control" type="password" placeholder="Confirm your PIN" maxLength={10} value={form.confirm_pin} onChange={set('confirm_pin')} required />
                </div>
                <button className="btn btn-success w-100 btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                  {loading ? <span className="spinner" /> : <><i className="fas fa-paper-plane" /> Submit Join Request</>}
                </button>
              </div>
            )}
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}>
              <i className="fas fa-arrow-left" style={{ marginRight: 6 }} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
