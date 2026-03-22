import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../landing.css';

const FEATURES = [
  { icon: 'fa-shield-alt',    title: 'PIN-Secured Access',       desc: 'Every staff member gets a unique PIN. Role-based access keeps sensitive data locked down.' },
  { icon: 'fa-chart-line',    title: 'Real-Time Analytics',      desc: 'Live sales dashboards, top-selling drugs, and employee performance — all in one view.' },
  { icon: 'fa-pills',         title: 'Smart Drug Inventory',     desc: 'Track stock levels, get low-stock alerts, and manage expiry dates effortlessly.' },
  { icon: 'fa-file-invoice',  title: 'Instant PDF Receipts',     desc: 'Professional receipts generated on every sale. Print or share in seconds.' },
  { icon: 'fa-users',         title: 'Multi-Staff Platform',     desc: 'Admins, pharmacists, cashiers — each with their own dashboard and permissions.' },
  { icon: 'fa-bell',          title: 'Smart Notifications',      desc: 'Admins get instant alerts on sales, low stock, and new join requests.' },
];

const STATS = [
  { value: '99.9%', label: 'Uptime' },
  { value: '<1s',   label: 'Response Time' },
  { value: '256-bit', label: 'Encryption' },
  { value: '24/7',  label: 'Monitoring' },
];

export default function Landing() {
  const heroRef = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = e => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = ((e.clientX - left) / width  - 0.5) * 18;
      const y = ((e.clientY - top)  / height - 0.5) * 18;
      el.style.setProperty('--rx', `${-y}deg`);
      el.style.setProperty('--ry', `${x}deg`);
    };
    const onLeave = () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);

  return (
    <div className="land-root">

      {/* ── NAV ── */}
      <nav className="land-nav">
        <div className="land-nav-inner">
          <div className="land-logo">
            <div className="land-logo-mark">
              <i className="fas fa-capsules" />
            </div>
            <span className="land-logo-text">C-Care</span>
            <span className="land-logo-by">by Convergence</span>
          </div>
          <div className="land-nav-links">
            <a href="#features">Features</a>
            <a href="#security">Security</a>
            <a href="#about">About</a>
          </div>
          <div className="land-nav-cta">
            <Link to="/login"    className="land-btn-ghost">Sign In</Link>
            <Link to="/create-shop" className="land-btn-solid">Register Shop</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="land-hero" ref={heroRef}>
        <div className="land-hero-bg">
          <div className="land-orb land-orb-1" />
          <div className="land-orb land-orb-2" />
          <div className="land-orb land-orb-3" />
          <div className="land-grid-overlay" />
        </div>

        <div className="land-hero-content">
          <div className="land-hero-badge">
            <i className="fas fa-circle-check" /> Trusted by pharmacies across Uganda
          </div>

          <h1 className="land-hero-title">
            The Modern Drug Shop<br />
            <span className="land-hero-gradient">Management Platform</span>
          </h1>

          <p className="land-hero-sub">
            C-Care gives your pharmacy a complete digital backbone — from inventory and sales
            to staff management and analytics. Built for Uganda's healthcare ecosystem.
          </p>

          <div className="land-hero-actions">
            <Link to="/create-shop" className="land-cta-primary">
              <i className="fas fa-store" /> Register Your Shop
            </Link>
            <Link to="/register" className="land-cta-secondary">
              <i className="fas fa-user-plus" /> Request to Join
            </Link>
          </div>

          <div className="land-hero-stats">
            {STATS.map(s => (
              <div className="land-stat" key={s.label}>
                <span className="land-stat-val">{s.value}</span>
                <span className="land-stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="land-hero-visual">
          <div className="land-mockup">
            <div className="land-mockup-bar">
              <span /><span /><span />
            </div>
            <div className="land-mockup-body">
              <div className="land-mock-sidebar">
                {['Dashboard','Drugs','Sales','Reports','Users'].map(n => (
                  <div className={`land-mock-nav-item${n==='Dashboard'?' active':''}`} key={n}>
                    <div className="land-mock-dot" />{n}
                  </div>
                ))}
              </div>
              <div className="land-mock-main">
                <div className="land-mock-topbar">
                  <div className="land-mock-title">Dashboard</div>
                  <div className="land-mock-avatar" />
                </div>
                <div className="land-mock-cards">
                  {[['UGX 2.4M','Today\'s Sales'],['148','Drugs in Stock'],['23','Transactions'],['3','Low Stock']].map(([v,l]) => (
                    <div className="land-mock-card" key={l}>
                      <div className="land-mock-card-val">{v}</div>
                      <div className="land-mock-card-lbl">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="land-mock-chart">
                  {[60,80,45,90,70,85,55,95,65,75,88,72].map((h,i) => (
                    <div className="land-mock-bar" key={i} style={{ height: `${h}%`, animationDelay: `${i*0.06}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="land-features" id="features">
        <div className="land-section-inner">
          <div className="land-section-label">What's inside</div>
          <h2 className="land-section-title">Everything your pharmacy needs</h2>
          <p className="land-section-sub">One platform. Zero paperwork. Total control.</p>

          <div className="land-features-grid">
            {FEATURES.map(f => (
              <div className="land-feature-card" key={f.title}>
                <div className="land-feature-icon">
                  <i className={`fas ${f.icon}`} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY STRIP ── */}
      <section className="land-security" id="security">
        <div className="land-section-inner land-security-inner">
          <div className="land-security-text">
            <div className="land-section-label light">Security first</div>
            <h2 className="land-section-title light">Built with enterprise-grade security</h2>
            <p className="land-section-sub light">
              Every session is encrypted. Every action is logged. Admins get a full audit trail
              of who did what and when — so nothing slips through the cracks.
            </p>
            <ul className="land-security-list">
              <li><i className="fas fa-check-circle" /> PIN-based authentication per staff member</li>
              <li><i className="fas fa-check-circle" /> Full audit log with timestamps</li>
              <li><i className="fas fa-check-circle" /> Role-based access control (Admin / Employee)</li>
              <li><i className="fas fa-check-circle" /> Encrypted PostgreSQL database (Neon)</li>
              <li><i className="fas fa-check-circle" /> Admin approval for all new staff</li>
            </ul>
          </div>
          <div className="land-security-visual">
            <div className="land-shield">
              <i className="fas fa-shield-halved" />
              <div className="land-shield-ring land-shield-ring-1" />
              <div className="land-shield-ring land-shield-ring-2" />
              <div className="land-shield-ring land-shield-ring-3" />
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="land-how" id="about">
        <div className="land-section-inner">
          <div className="land-section-label">Simple onboarding</div>
          <h2 className="land-section-title">Up and running in minutes</h2>
          <div className="land-steps">
            {[
              { n:'01', icon:'fa-store',       title:'Register Your Shop',   desc:'Admin creates the institution and sets up the first account.' },
              { n:'02', icon:'fa-user-plus',   title:'Invite Your Team',     desc:'Staff search for your shop and submit a join request.' },
              { n:'03', icon:'fa-check-double',title:'Approve & Go Live',    desc:'Admin approves requests. Everyone gets instant access.' },
              { n:'04', icon:'fa-chart-bar',   title:'Track Everything',     desc:'Sales, stock, reports — all live from day one.' },
            ].map(s => (
              <div className="land-step" key={s.n}>
                <div className="land-step-num">{s.n}</div>
                <div className="land-step-icon"><i className={`fas ${s.icon}`} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="land-cta-banner">
        <div className="land-cta-banner-bg">
          <div className="land-orb land-orb-4" />
          <div className="land-orb land-orb-5" />
        </div>
        <div className="land-cta-banner-content">
          <h2>Ready to modernise your pharmacy?</h2>
          <p>Join drug shops already running on C-Care. Setup takes under 5 minutes.</p>
          <div className="land-hero-actions">
            <Link to="/create-shop" className="land-cta-primary">
              <i className="fas fa-store" /> Register Your Shop
            </Link>
            <Link to="/register" className="land-cta-secondary light">
              <i className="fas fa-sign-in-alt" /> Sign In Instead
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="land-footer">
        <div className="land-footer-inner">
          <div className="land-logo">
            <div className="land-logo-mark sm"><i className="fas fa-capsules" /></div>
            <span className="land-logo-text sm">C-Care</span>
          </div>
          <p className="land-footer-copy">© {new Date().getFullYear()} Convergence. All rights reserved.</p>
          <p className="land-footer-tagline">Secure Care. Trusted Medicine.</p>
        </div>
      </footer>

    </div>
  );
}
