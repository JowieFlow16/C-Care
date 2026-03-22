import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getDrugs, deleteDrug } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Drugs() {
  const { user } = useAuth();
  const [drugs, setDrugs]   = useState([]);
  const [search, setSearch] = useState('');
  const [flash, setFlash]   = useState(null);

  useEffect(() => {
    getDrugs().then(r => setDrugs(r.data)).catch(() => {});
  }, []);

  const handleDelete = async id => {
    if (!confirm('Delete this drug?')) return;
    try {
      await deleteDrug(id);
      setDrugs(d => d.filter(x => x.drug_id !== id));
      setFlash({ type: 'success', message: 'Drug deleted' });
    } catch { setFlash({ type: 'danger', message: 'Delete failed' }); }
  };

  const filtered = drugs.filter(d =>
    d.drug_name.toLowerCase().includes(search.toLowerCase()) ||
    (d.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Inventory" subtitle="Manage your drug stock" flash={flash} setFlash={setFlash}>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Inventory</h1>
          <p>{drugs.length} drug{drugs.length !== 1 ? 's' : ''} in stock</p>
        </div>
        {user?.role === 'Admin' && (
          <Link to="/drugs/add" className="btn btn-primary"><i className="fas fa-plus" /> Add Drug</Link>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h5><i className="fas fa-capsules" style={{ color: '#4a4a4a' }} /> All Drugs</h5>
          <div className="search-bar" style={{ width: 220 }}>
            <i className="fas fa-search search-icon" />
            <input className="form-control" placeholder="Search drugs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr><th>Drug</th><th>Category</th><th>Price</th><th>Stock</th><th>Expiry</th><th>Supplier</th>{user?.role === 'Admin' && <th>Actions</th>}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><i className="fas fa-capsules" /><p>No drugs found</p></div></td></tr>
              ) : filtered.map(d => (
                <tr key={d.drug_id}>
                  <td><strong>{d.drug_name}</strong>{d.description && <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{d.description}</div>}</td>
                  <td>{d.category ? <span className="badge badge-info">{d.category}</span> : '—'}</td>
                  <td><strong>${d.price.toFixed(2)}</strong></td>
                  <td>
                    <span className={`stock-badge ${d.stock_quantity === 0 ? 'out-of-stock' : d.stock_quantity < 10 ? 'low-stock' : 'in-stock'}`}>
                      {d.stock_quantity} units
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: '#666' }}>{d.expiry_date || '—'}</td>
                  <td style={{ fontSize: 12, color: '#666' }}>{d.supplier || '—'}</td>
                  {user?.role === 'Admin' && (
                    <td>
                      <div className="action-buttons">
                        <Link to={`/drugs/edit/${d.drug_id}`} className="action-btn edit" title="Edit"><i className="fas fa-edit" /></Link>
                        <button className="action-btn delete" title="Delete" onClick={() => handleDelete(d.drug_id)}><i className="fas fa-trash" /></button>
                        <Link to={`/sale?drug_id=${d.drug_id}`} className="action-btn" title="Sell"><i className="fas fa-cart-plus" /></Link>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
