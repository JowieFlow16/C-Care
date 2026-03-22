import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getDrugs, addDrug, updateDrug } from '../api';

export default function DrugForm() {
  const { id } = useParams();
  const isEdit  = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm]   = useState({ drug_name: '', category: '', price: '', stock_quantity: '', expiry_date: '', supplier: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (isEdit) {
      getDrugs().then(r => {
        const drug = r.data.find(d => d.drug_id === parseInt(id));
        if (drug) setForm({ drug_name: drug.drug_name, category: drug.category || '', price: drug.price, stock_quantity: drug.stock_quantity, expiry_date: drug.expiry_date || '', supplier: drug.supplier || '', description: drug.description || '' });
      });
    }
  }, [id]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (isEdit) await updateDrug(id, form);
      else await addDrug(form);
      navigate('/drugs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save drug');
    } finally { setLoading(false); }
  };

  return (
    <Layout title={isEdit ? 'Edit Drug' : 'Add Drug'} subtitle={isEdit ? 'Update drug details' : 'Add a new drug to inventory'} flash={flash} setFlash={setFlash}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card">
          <div className="card-header">
            <h5><i className="fas fa-capsules" style={{ color: '#4a4a4a' }} /> {isEdit ? 'Edit Drug' : 'New Drug'}</h5>
            <Link to="/drugs" className="btn btn-outline btn-sm"><i className="fas fa-arrow-left" /> Back</Link>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger"><i className="fas fa-exclamation-circle" />{error}</div>}
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Drug Name <span style={{ color: '#333' }}>*</span></label>
                <input className="form-control" type="text" placeholder="e.g. Paracetamol 500mg" value={form.drug_name} onChange={set('drug_name')} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input className="form-control" type="text" placeholder="e.g. Analgesic" value={form.category} onChange={set('category')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Price ($) <span style={{ color: '#333' }}>*</span></label>
                  <input className="form-control" type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={set('price')} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Stock Quantity <span style={{ color: '#333' }}>*</span></label>
                  <input className="form-control" type="number" min="0" placeholder="0" value={form.stock_quantity} onChange={set('stock_quantity')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input className="form-control" type="date" value={form.expiry_date} onChange={set('expiry_date')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <input className="form-control" type="text" placeholder="Supplier name" value={form.supplier} onChange={set('supplier')} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} placeholder="Optional notes..." value={form.description} onChange={set('description')} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                  {loading ? <span className="spinner" /> : <><i className={`fas ${isEdit ? 'fa-save' : 'fa-plus'}`} /> {isEdit ? 'Save Changes' : 'Add Drug'}</>}
                </button>
                <Link to="/drugs" className="btn btn-outline btn-lg">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
