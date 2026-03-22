import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getSettings, updateSettings } from '../api';

export default function Settings() {
  const [form, setForm]   = useState({ name: '', address: '', phone: '' });
  const [info, setInfo]   = useState(null);
  const [flash, setFlash] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSettings().then(r => { setInfo(r.data); setForm({ name: r.data.name, address: r.data.address || '', phone: r.data.phone || '' }); }).catch(() => {});
  }, []);

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await updateSettings(form);
      setInfo(r.data);
      setFlash({ type: 'success', message: 'Settings updated' });
    } catch { setFlash({ type: 'danger', message: 'Update failed' }); }
    finally { setLoading(false); }
  };

  return (
    <Layout title="Settings" subtitle="Manage your drug shop settings" flash={flash} setFlash={setFlash}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="card">
          <div className="card-header"><h5><i className="fas fa-store" style={{ color: '#4a4a4a' }} /> Institution Settings</h5></div>
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Shop Name *</label>
                <input className="form-control" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                <div className="form-text">This is what employees search for when joining.</div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-control" type="text" placeholder="e.g. 123 Main St, Kampala" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" type="text" placeholder="e.g. +256700000000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              {info && (
                <div className="form-group">
                  <label className="form-label">Shop ID (slug)</label>
                  <input className="form-control" value={info.slug} readOnly style={{ background: '#fafafa', color: '#999' }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                  {loading ? <span className="spinner" /> : <><i className="fas fa-save" /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {info && (
          <div className="card">
            <div className="card-header"><h5><i className="fas fa-info-circle" style={{ color: '#666' }} /> Institution Info</h5></div>
            <div className="card-body">
              {[
                { label: 'Institution ID', value: `#${info.institution_id}` },
                { label: 'Created', value: new Date(info.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                { label: 'Total Staff', value: info.total_staff },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#666', fontSize: 13 }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
