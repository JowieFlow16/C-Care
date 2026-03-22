import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createShop } from '../api';
import '../landing.css';

const STEPS = [
  { n: '01', icon: 'fa-store',       label: 'Shop Details',   sub: 'Name, address, contact' },
  { n: '02', icon: 'fa-user-shield', label: 'Admin Account',  sub: 'Your login credentials' },
  { n: '03', icon: 'fa-rocket',      label: 'Go Live',        sub: 'Start managing your shop' },
];

export default function CreateShop() {
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({ shop_name: '', shop_address: '', shop_phone: '', name: '', username: '', pin: '', confirm_pin: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const nextStep = e => {
    e.preventDefault();
    if (!form.shop_name.trim()) { setError('Shop name is required'); return; }
    setError('');
    setStep(2);
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.username.trim()) { setError('Name and username are required'); return; }
    if (form.pin.length < 4) { setError('PIN must be at least 4 digits'); return; }
    if (form.pin !== form.confirm_pin) { setError('PINs do not match'); return; }
    setLoading(true); setError('');
    try {
      await createShop(form);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create shop');
    } finally { setLoading(false); }
  };

  return (
    <div className="cs-root">
      {/* bg orbs */}
      <div className="cs-bg">
        <div className="land-orb land-orb-1" style={{ position: 'absolute' }} />
        <div className="land-orb land-orb-2" style={{ position: 'absolute' }} />
        <div className="land-grid-overlay" style={{ position: 'absolute' }} />
      </div>

      {/* nav */}
      <nav className="land-nav">
        <div className="land-nav-inner">
          <Link to="/" className="land-logo" style={{ textDecoration: 'none' }}>
            <div className="land-logo-mark"><i className="fas fa-capsules" /></div>
            <span className="land-logo-text">C-Care</span>
            <span className="land-logo-by">by Convergence</span>
          </Link>
          <div className="land-nav-cta">
            <Link to="/login"    className="land-btn-ghost">Sign In</Link>
            <Link to="/register" className="land-btn-solid">Join a Shop</Link>
          </div>
        </div>
      </nav>

      <div className="cs-body">
        {/* left panel */}
        <div className="cs-left">
          <div className="cs-left-inner">
            <div className="cs-left-badge">
              <i className="fas fa-store" /> Register your pharmacy
            </div>
            <h1 className="cs-left-title">
              Your pharmacy,<br />
              <span className="land-hero-gradient">fully digital.</span>
            </h1>
            <p className="cs-left-sub">
              Create your drug shop on C-Care in under 2 minutes. You'll be the admin —
              invite your team, manage stock, and track every sale from day one.
            </p>

            <div className="cs-steps-list">
              {STEPS.map((s, i) => (
                <div className={`cs-step-item${step > i ? ' done' : step === i + 1 ? ' active' : ''}`} key={s.n}>
                  <div className="cs-step-circle">
                    {step > i + 1
                      ? <i className="fas fa-check" />
                      : <span>{s.n}</span>
                    }
                  </div>
                  <div className="cs-step-line" />
                  <div className="cs-step-icon-wrap">
                    <i className={`fas ${s.icon}`} />
                  </div>
                  <div>
                    <div className="cs-step-label">{s.label}</div>
                    <div className="cs-step-sub">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cs-left-note">
              <i className="fas fa-users" />
              After setup, your staff can search for your shop and request to join.
            </div>
          </div>
        </div>

        {/* right panel */}
        <div className="cs-right">
          <div className="cs-form-card">

            {step === 3 ? (
              /* ── SUCCESS ── */
              <div className="cs-success">
                <div className="cs-success-icon">
                  <i className="fas fa-check-circle" />
                </div>
                <h2>Shop Created!</h2>
                <p>
                  <strong>{form.shop_name}</strong> is live on C-Care.<br />
                  Sign in with your admin credentials to get started.
                </p>
                <Link to="/login" className="land-cta-primary" style={{ marginTop: 8, justifyContent: 'center' }}>
                  <i className="fas fa-sign-in-alt" /> Sign In Now
                </Link>
                <div className="cs-success-note">
                  Share your shop name with your staff so they can search and request to join.
                </div>
              </div>
            ) : (
              <>
                <div className="cs-form-header">
                  <div className="cs-form-step-badge">Step {step} of 2</div>
                  <h2 className="cs-form-title">
                    {step === 1 ? 'Your Drug Shop' : 'Admin Account'}
                  </h2>
                  <p className="cs-form-sub">
                    {step === 1
                      ? 'This is what your staff will search for when joining.'
                      : 'This account will have full admin access to the shop.'}
                  </p>
                </div>

                {error && (
                  <div className="cs-error">
                    <i className="fas fa-exclamation-circle" /> {error}
                  </div>
                )}

                {step === 1 ? (
                  <form onSubmit={nextStep}>
                    <div className="cs-field">
                      <label>Shop / Pharmacy Name <span>*</span></label>
                      <div className="cs-input-wrap">
                        <i className="fas fa-store" />
                        <input type="text" placeholder="e.g. Kylian's Drug Shop" value={form.shop_name} onChange={set('shop_name')} required autoFocus />
                      </div>
                    </div>
                    <div className="cs-field">
                      <label>Address <span className="cs-opt">(optional)</span></label>
                      <div className="cs-input-wrap">
                        <i className="fas fa-map-marker-alt" />
                        <input type="text" placeholder="e.g. 12 Kampala Road, Kampala" value={form.shop_address} onChange={set('shop_address')} />
                      </div>
                    </div>
                    <div className="cs-field">
                      <label>Phone <span className="cs-opt">(optional)</span></label>
                      <div className="cs-input-wrap">
                        <i className="fas fa-phone" />
                        <input type="text" placeholder="e.g. +256 700 000 000" value={form.shop_phone} onChange={set('shop_phone')} />
                      </div>
                    </div>
                    <button type="submit" className="cs-btn-primary">
                      Continue <i className="fas fa-arrow-right" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={submit}>
                    <div className="cs-field">
                      <label>Your Full Name <span>*</span></label>
                      <div className="cs-input-wrap">
                        <i className="fas fa-user" />
                        <input type="text" placeholder="Your full name" value={form.name} onChange={set('name')} required autoFocus />
                      </div>
                    </div>
                    <div className="cs-field">
                      <label>Username <span>*</span></label>
                      <div className="cs-input-wrap">
                        <i className="fas fa-at" />
                        <input type="text" placeholder="Choose a unique username" value={form.username} onChange={set('username')} required />
                      </div>
                    </div>
                    <div className="cs-field-row">
                      <div className="cs-field">
                        <label>PIN <span>*</span></label>
                        <div className="cs-input-wrap">
                          <i className="fas fa-lock" />
                          <input type="password" placeholder="Min 4 digits" maxLength={10} value={form.pin} onChange={set('pin')} required />
                        </div>
                      </div>
                      <div className="cs-field">
                        <label>Confirm PIN <span>*</span></label>
                        <div className="cs-input-wrap">
                          <i className="fas fa-lock" />
                          <input type="password" placeholder="Repeat PIN" maxLength={10} value={form.confirm_pin} onChange={set('confirm_pin')} required />
                        </div>
                      </div>
                    </div>
                    <div className="cs-btn-row">
                      <button type="button" className="cs-btn-back" onClick={() => { setStep(1); setError(''); }}>
                        <i className="fas fa-arrow-left" /> Back
                      </button>
                      <button type="submit" className="cs-btn-primary" disabled={loading}>
                        {loading ? <span className="cs-spinner" /> : <><i className="fas fa-rocket" /> Create Shop</>}
                      </button>
                    </div>
                  </form>
                )}

                <div className="cs-divider"><span>or</span></div>
                <Link to="/register" className="cs-join-link">
                  <i className="fas fa-user-plus" /> Request to join an existing shop instead
                </Link>
              </>
            )}

          </div>

          <div className="cs-bottom-note">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
