import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, title, subtitle, flash, setFlash }) {
  const { user, institution, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="app-wrapper">
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <img src="/logo.png" alt="C-Care" onError={e => e.target.style.display='none'} />
          </div>
          <div className="brand-text">
            <div className="brand-name">C-Care</div>
            <div className="brand-tagline">{institution?.name || 'Drug Shop'}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>
          <NavLink to="/dashboard" onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon"><i className="fas fa-th-large" /></span> Dashboard
          </NavLink>
          <NavLink to="/sale" onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon"><i className="fas fa-cash-register" /></span> New Sale
          </NavLink>
          <NavLink to="/sales" onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon"><i className="fas fa-receipt" /></span> Sales History
          </NavLink>
          <NavLink to="/drugs" onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon"><i className="fas fa-capsules" /></span> Inventory
          </NavLink>

          {isAdmin && <>
            <div className="sidebar-section-label">Admin</div>
            <NavLink to="/reports" onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon"><i className="fas fa-chart-line" /></span> Reports
            </NavLink>
            <NavLink to="/users" onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon"><i className="fas fa-users" /></span> Users
            </NavLink>
            <NavLink to="/join-requests" onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon"><i className="fas fa-user-clock" /></span> Join Requests
            </NavLink>
            <NavLink to="/customers" onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon"><i className="fas fa-user-friends" /></span> Customers
            </NavLink>
            <NavLink to="/notifications" onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon"><i className="fas fa-bell" /></span> Notifications
            </NavLink>
            <NavLink to="/audit-logs" onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon"><i className="fas fa-shield-alt" /></span> Audit Logs
            </NavLink>
            <NavLink to="/settings" onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon"><i className="fas fa-cog" /></span> Settings
            </NavLink>
          </>}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-info" style={{ marginBottom: 12 }}>
            <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role} · {institution?.name}</div>
            </div>
          </div>
          <a href="#" className="sidebar-nav sidebar-logout" onClick={e => { e.preventDefault(); handleLogout(); }}
             style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: '#999', fontSize: 13, fontWeight: 600 }}>
            <i className="fas fa-sign-out-alt" /> Sign Out
          </a>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
              <i className="fas fa-bars" />
            </button>
            <div>
              <div className="topbar-title">{title || 'Dashboard'}</div>
              <div className="topbar-subtitle">{subtitle || 'C-Care — Secure Care. Trusted Medicine.'}</div>
            </div>
          </div>
          <div className="topbar-right">
            {isAdmin && (
              <NavLink to="/notifications" className="topbar-icon-btn" title="Notifications">
                <i className="fas fa-bell" />
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/join-requests" className="topbar-icon-btn" title="Join Requests">
                <i className="fas fa-user-clock" />
              </NavLink>
            )}
            <NavLink to="/drugs" className="topbar-icon-btn" title="Inventory">
              <i className="fas fa-capsules" />
            </NavLink>
          </div>
        </header>

        {flash && (
          <div style={{ padding: '0 32px', marginTop: 16 }}>
            <div className={`alert alert-${flash.type}`}>
              <i className={`fas fa-${flash.type === 'success' ? 'check-circle' : flash.type === 'danger' ? 'exclamation-circle' : 'info-circle'}`} />
              <span>{flash.message}</span>
              <button onClick={() => setFlash(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', opacity: .5, fontSize: 16 }}>×</button>
            </div>
          </div>
        )}

        <main className="page-content">{children}</main>

        <footer className="app-footer">
          © 2025 C-Care — by Convergence &nbsp;·&nbsp; <em>Secure Care. Trusted Medicine.</em>
        </footer>
      </div>
    </div>
  );
}
