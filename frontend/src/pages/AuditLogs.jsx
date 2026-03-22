import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getAuditLogs } from '../api';

export default function AuditLogs() {
  const [logs, setLogs]     = useState([]);
  const [search, setSearch] = useState('');
  const [flash, setFlash]   = useState(null);

  useEffect(() => { getAuditLogs().then(r => setLogs(r.data)).catch(() => {}); }, []);

  const filtered = logs.filter(l =>
    (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.details || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Audit Logs" subtitle="System activity trail" flash={flash} setFlash={setFlash}>
      <div className="page-header">
        <div className="page-header-left"><h1>Audit Logs</h1><p>Last {logs.length} entries</p></div>
      </div>
      <div className="card">
        <div className="card-header">
          <h5><i className="fas fa-shield-alt" style={{ color: '#4a4a4a' }} /> Activity Log</h5>
          <div className="search-bar" style={{ width: 220 }}>
            <i className="fas fa-search search-icon" />
            <input className="form-control" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead><tr><th>Action</th><th>Details</th><th>IP</th><th>Time</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4}><div className="empty-state"><i className="fas fa-shield-alt" /><p>No logs found</p></div></td></tr>
              ) : filtered.map(l => (
                <tr key={l.log_id}>
                  <td><span className="badge badge-primary">{l.action}</span></td>
                  <td style={{ fontSize: 12, color: '#666', maxWidth: 300 }}>{l.details}</td>
                  <td style={{ fontSize: 12, color: '#999' }}>{l.ip_address || '—'}</td>
                  <td style={{ fontSize: 12, color: '#666' }}>{new Date(l.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
