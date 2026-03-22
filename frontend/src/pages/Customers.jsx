import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getCustomers } from '../api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch]       = useState('');
  const [flash, setFlash]         = useState(null);

  useEffect(() => { getCustomers().then(r => setCustomers(r.data)).catch(() => {}); }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  return (
    <Layout title="Customers" subtitle="Customer records" flash={flash} setFlash={setFlash}>
      <div className="page-header">
        <div className="page-header-left"><h1>Customers</h1><p>{customers.length} registered customer{customers.length !== 1 ? 's' : ''}</p></div>
      </div>
      <div className="card">
        <div className="card-header">
          <h5><i className="fas fa-user-friends" style={{ color: '#4a4a4a' }} /> All Customers</h5>
          <div className="search-bar" style={{ width: 220 }}>
            <i className="fas fa-search search-icon" />
            <input className="form-control" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead><tr><th>Customer</th><th>Phone</th><th>Email</th><th>Purchases</th><th>Total Spent</th><th>Registered</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><i className="fas fa-user-friends" /><p>No customers yet</p></div></td></tr>
              ) : filtered.map(c => (
                <tr key={c.customer_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#4a4a4a', flexShrink: 0 }}>{c.name[0].toUpperCase()}</div>
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td><span className="badge badge-info">{c.total_purchases}</span></td>
                  <td><strong>${c.total_spent.toFixed(2)}</strong></td>
                  <td style={{ fontSize: 12, color: '#666' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
