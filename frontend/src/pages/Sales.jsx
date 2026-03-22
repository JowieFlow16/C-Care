// Sales.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getSales, getReceiptPdfUrl } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Sales() {
  const { user } = useAuth();
  const [sales, setSales]   = useState([]);
  const [search, setSearch] = useState('');
  const [flash, setFlash]   = useState(null);

  useEffect(() => { getSales().then(r => setSales(r.data)).catch(() => {}); }, []);

  const filtered = sales.filter(s =>
    s.drug_name.toLowerCase().includes(search.toLowerCase()) ||
    s.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
    s.employee_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Sales History" subtitle="All transactions" flash={flash} setFlash={setFlash}>
      <div className="page-header">
        <div className="page-header-left"><h1>Sales History</h1><p>{sales.length} transaction{sales.length !== 1 ? 's' : ''}</p></div>
        <Link to="/sale" className="btn btn-primary"><i className="fas fa-plus" /> New Sale</Link>
      </div>
      <div className="card">
        <div className="card-header">
          <h5><i className="fas fa-receipt" style={{ color: '#4a4a4a' }} /> Transactions</h5>
          <div className="search-bar" style={{ width: 220 }}>
            <i className="fas fa-search search-icon" />
            <input className="form-control" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead><tr><th>TXN ID</th><th>Drug</th><th>Qty</th><th>Total</th><th>Employee</th><th>Customer</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><i className="fas fa-receipt" /><p>No sales found</p></div></td></tr>
              ) : filtered.map(s => (
                <tr key={s.sale_id}>
                  <td><code style={{ fontSize: 11, background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>{s.transaction_id}</code></td>
                  <td><strong>{s.drug_name}</strong></td>
                  <td>{s.quantity}</td>
                  <td><strong>${s.total_price.toFixed(2)}</strong></td>
                  <td>{s.employee_name}</td>
                  <td>{s.customer_name || '—'}</td>
                  <td style={{ fontSize: 12, color: '#666' }}>{new Date(s.date_time).toLocaleString()}</td>
                  <td>
                    <a href={getReceiptPdfUrl(s.sale_id)} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" title="Download Receipt">
                      <i className="fas fa-file-pdf" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
