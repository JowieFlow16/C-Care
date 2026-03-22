import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getDrugs, makeSale, getReceiptPdfUrl } from '../api';

export default function Sale() {
  const [searchParams] = useSearchParams();
  const [drugs, setDrugs]     = useState([]);
  const [form, setForm]       = useState({ drug_id: searchParams.get('drug_id') || '', quantity: 1, auth_pin: '', customer_name: '', customer_phone: '' });
  const [receipt, setReceipt] = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [flash, setFlash]     = useState(null);

  useEffect(() => {
    getDrugs().then(r => setDrugs(r.data.filter(d => d.stock_quantity > 0))).catch(() => {});
  }, []);

  const selectedDrug = drugs.find(d => d.drug_id === parseInt(form.drug_id));
  const total = selectedDrug ? (selectedDrug.price * form.quantity).toFixed(2) : '0.00';

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await makeSale(form);
      setReceipt(r.data);
      setFlash({ type: 'success', message: `Sale completed! TXN: ${r.data.transaction_id}` });
      setForm({ drug_id: '', quantity: 1, auth_pin: '', customer_name: '', customer_phone: '' });
      getDrugs().then(r => setDrugs(r.data.filter(d => d.stock_quantity > 0)));
    } catch (err) {
      setError(err.response?.data?.error || 'Sale failed');
    } finally { setLoading(false); }
  };

  return (
    <Layout title="New Sale" subtitle="Process a drug sale" flash={flash} setFlash={setFlash}>
      <div style={{ display: 'grid', gridTemplateColumns: receipt ? '1fr 1fr' : '1fr', gap: 24, maxWidth: receipt ? '100%' : 640, margin: '0 auto' }}>
        <div className="card">
          <div className="card-header">
            <h5><i className="fas fa-cash-register" style={{ color: '#4a4a4a' }} /> Process Sale</h5>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger"><i className="fas fa-exclamation-circle" />{error}</div>}
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Drug <span style={{ color: '#333' }}>*</span></label>
                <select className="form-select" value={form.drug_id} onChange={set('drug_id')} required>
                  <option value="">Select a drug...</option>
                  {drugs.map(d => <option key={d.drug_id} value={d.drug_id}>{d.drug_name} — ${d.price.toFixed(2)} ({d.stock_quantity} left)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity <span style={{ color: '#333' }}>*</span></label>
                <input className="form-control" type="number" min={1} max={selectedDrug?.stock_quantity || 999}
                  value={form.quantity} onChange={set('quantity')} required />
                {selectedDrug && <div className="form-text">Available: {selectedDrug.stock_quantity} units</div>}
              </div>

              {selectedDrug && (
                <div style={{ background: '#f5f5f5', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666', fontWeight: 500 }}>Total Amount</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>${total}</span>
                </div>
              )}

              <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 14 }}>Customer (Optional)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Name</label>
                    <input className="form-control" type="text" placeholder="Customer name" value={form.customer_name} onChange={set('customer_name')} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone</label>
                    <input className="form-control" type="text" placeholder="Phone number" value={form.customer_phone} onChange={set('customer_phone')} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><i className="fas fa-lock" style={{ marginRight: 6 }} />Your PIN (Authentication) <span style={{ color: '#333' }}>*</span></label>
                <input className="form-control" type="password" placeholder="Enter your PIN to confirm" maxLength={10}
                  value={form.auth_pin} onChange={set('auth_pin')} required />
                <div className="form-text">Required to authorize this transaction</div>
              </div>

              <button className="btn btn-primary w-100 btn-lg" type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : <><i className="fas fa-check-circle" /> Complete Sale</>}
              </button>
            </form>
          </div>
        </div>

        {receipt && (
          <div className="receipt-card">
            <div className="receipt-header">
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>C-Care</div>
              <div style={{ fontSize: 13, opacity: .8 }}>Secure Care. Trusted Medicine.</div>
              <div style={{ marginTop: 12, fontSize: 12, opacity: .7 }}>RECEIPT</div>
            </div>
            <div className="receipt-body">
              <div className="receipt-row"><span style={{ color: '#666' }}>Transaction ID</span><span style={{ fontWeight: 600, fontSize: 12 }}>{receipt.transaction_id}</span></div>
              <div className="receipt-row"><span style={{ color: '#666' }}>Date</span><span>{new Date(receipt.date_time).toLocaleString()}</span></div>
              <div className="receipt-row"><span style={{ color: '#666' }}>Drug</span><span style={{ fontWeight: 600 }}>{receipt.drug_name}</span></div>
              <div className="receipt-row"><span style={{ color: '#666' }}>Quantity</span><span>{receipt.quantity}</span></div>
              <div className="receipt-row"><span style={{ color: '#666' }}>Served by</span><span>{receipt.employee_name}</span></div>
              {receipt.customer_name && <div className="receipt-row"><span style={{ color: '#666' }}>Customer</span><span>{receipt.customer_name}</span></div>}
              <div className="receipt-total">
                <span style={{ fontWeight: 600 }}>Total</span>
                <span className="receipt-total-amount">${receipt.total_price.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <a href={getReceiptPdfUrl(receipt.sale_id)} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  <i className="fas fa-file-pdf" /> Download PDF
                </a>
                <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setReceipt(null)}>
                  <i className="fas fa-plus" /> New Sale
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
