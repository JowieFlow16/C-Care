import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import { getDashboard, getSalesChart } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [chart, setChart]     = useState(null);
  const [chartDays, setChartDays] = useState(30);
  const [flash, setFlash]     = useState(null);

  useEffect(() => {
    getDashboard().then(r => setData(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.role === 'Admin') {
      getSalesChart(chartDays).then(r => setChart(r.data)).catch(() => {});
    }
  }, [chartDays, user]);

  if (!data) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <span style={{ color: '#666' }}>Loading dashboard...</span>
    </div>
  );

  if (user?.role !== 'Admin') {
    return (
      <Layout title="Dashboard" subtitle={`Welcome back, ${user?.name}`} flash={flash} setFlash={setFlash}>
        <div className="page-header">
          <div className="page-header-left">
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.name}</p>
          </div>
          <Link to="/sale" className="btn btn-primary"><i className="fas fa-cash-register" /> New Sale</Link>
        </div>
        <div className="card">
          <div className="card-header"><h5><i className="fas fa-capsules" style={{ color: '#4a4a4a' }} /> Available Drugs</h5></div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>Drug</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {data.drugs?.map(d => (
                  <tr key={d.drug_id}>
                    <td><strong>{d.drug_name}</strong></td>
                    <td>{d.category || '—'}</td>
                    <td>${d.price.toFixed(2)}</td>
                    <td>
                      <span className={`stock-badge ${d.stock_quantity < 10 ? 'low-stock' : 'in-stock'}`}>
                        {d.stock_quantity} units
                      </span>
                    </td>
                    <td><Link to={`/sale?drug_id=${d.drug_id}`} className="btn btn-sm btn-primary"><i className="fas fa-cart-plus" /> Sell</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    );
  }

  const chartData = chart?.labels?.map((l, i) => ({ date: l, revenue: chart.values[i] })) || [];

  return (
    <Layout title="Dashboard" subtitle={`Welcome back, ${user?.name}`} flash={flash} setFlash={setFlash}>
      <div className="stats-grid">
        <div className="stat-card black">
          <div className="stat-card-icon"><i className="fas fa-shopping-cart" /></div>
          <div className="stat-card-value">{data.daily?.total_sales}</div>
          <div className="stat-card-label">Units Sold Today</div>
          <div className="stat-card-trend">{data.daily?.transactions} transactions</div>
        </div>
        <div className="stat-card grey">
          <div className="stat-card-icon"><i className="fas fa-dollar-sign" /></div>
          <div className="stat-card-value">${data.daily?.total_revenue?.toFixed(2)}</div>
          <div className="stat-card-label">Today's Revenue</div>
          <div className="stat-card-trend">Top: <strong>{data.daily?.top_drug}</strong></div>
        </div>
        <div className="stat-card gray">
          <div className="stat-card-icon"><i className="fas fa-calendar-alt" /></div>
          <div className="stat-card-value">${data.monthly?.total_revenue?.toFixed(2)}</div>
          <div className="stat-card-label">Monthly Revenue</div>
          <div className="stat-card-trend">{data.monthly?.transactions} transactions</div>
        </div>
        <div className="stat-card dark">
          <div className="stat-card-icon"><i className="fas fa-exclamation-triangle" /></div>
          <div className="stat-card-value">{data.low_stock?.length}</div>
          <div className="stat-card-label">Low Stock Items</div>
          <div className="stat-card-trend">Needs restocking</div>
        </div>
      </div>

      {data.low_stock?.length > 0 && (
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle" />
          <div>
            <strong>Low Stock Alert: </strong>
            {data.low_stock.map(d => (
              <span key={d.drug_id} style={{ display: 'inline-block', background: 'rgba(153,153,153,.15)', borderRadius: 6, padding: '2px 8px', margin: 2, fontSize: 12 }}>
                {d.drug_name} ({d.stock_quantity} left)
              </span>
            ))}
            <Link to="/drugs" style={{ fontSize: 12, color: 'inherit', marginLeft: 8, textDecoration: 'underline' }}>Manage Inventory →</Link>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, marginBottom: 24 }} className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h5><i className="fas fa-chart-line" style={{ color: '#4a4a4a' }} /> Sales Trend</h5>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={`btn btn-sm ${chartDays === 7 ? 'btn-primary' : 'btn-outline'}`} onClick={() => setChartDays(7)}>7 Days</button>
              <button className={`btn btn-sm ${chartDays === 30 ? 'btn-primary' : 'btn-outline'}`} onClick={() => setChartDays(30)}>30 Days</button>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-container">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={v => [`$${v.toFixed(2)}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#1a1a1a" strokeWidth={2.5} dot={{ fill: '#1a1a1a', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state"><i className="fas fa-chart-line" /><p>No sales data yet</p></div>
              )}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h5><i className="fas fa-bell" style={{ color: '#666' }} /> Notifications</h5>
            <Link to="/notifications" style={{ fontSize: 12, color: '#4a4a4a', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {data.notifications?.length > 0 ? data.notifications.map(n => (
              <div key={n.notification_id} className="notification-item">
                <div className={`notification-icon ${n.notification_type}`}>
                  <i className={`fas ${n.notification_type === 'sale' ? 'fa-receipt' : n.notification_type === 'alert' ? 'fa-exclamation-triangle' : 'fa-info-circle'}`} />
                </div>
                <div className="notification-content">
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-msg">{n.message}</div>
                  <div className="notif-time"><i className="fas fa-clock" style={{ marginRight: 4 }} />{new Date(n.created_at).toLocaleString()}</div>
                </div>
              </div>
            )) : (
              <div className="empty-state"><i className="fas fa-bell-slash" /><p>No notifications yet</p></div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header"><h5><i className="fas fa-chart-pie" style={{ color: '#666' }} /> Monthly Summary</h5></div>
          <div className="card-body">
            {[
              { label: 'Total Revenue', value: `$${data.monthly?.total_revenue?.toFixed(2)}`, pct: 75 },
              { label: 'Avg Transaction', value: `$${data.monthly?.avg_transaction?.toFixed(2)}`, pct: 55 },
              { label: 'Total Units Sold', value: data.monthly?.total_sales, pct: 60 },
            ].map(({ label, value, pct }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#666', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontWeight: 700 }}>{value}</span>
                </div>
                <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="card-footer" style={{ display: 'flex', gap: 12 }}>
            <Link to="/reports" className="btn btn-primary btn-sm"><i className="fas fa-chart-bar" /> Full Reports</Link>
            <Link to="/sales" className="btn btn-outline btn-sm"><i className="fas fa-receipt" /> Sales History</Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h5><i className="fas fa-bolt" style={{ color: '#999' }} /> Quick Actions</h5></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { to: '/drugs/add', icon: 'fa-plus-circle', label: 'Add Drug', cls: 'btn-primary' },
                { to: '/users/add', icon: 'fa-user-plus', label: 'Add User', cls: 'btn-success' },
                { to: '/sale', icon: 'fa-cash-register', label: 'New Sale', cls: 'btn-warning' },
                { to: '/audit-logs', icon: 'fa-shield-alt', label: 'Audit Logs', cls: 'btn-outline' },
              ].map(({ to, icon, label, cls }) => (
                <Link key={to} to={to} className={`btn ${cls}`} style={{ justifyContent: 'center', padding: 14 }}>
                  <div style={{ textAlign: 'center' }}>
                    <i className={`fas ${icon}`} style={{ fontSize: 20, display: 'block', marginBottom: 6 }} />
                    <span style={{ fontSize: 12 }}>{label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
