import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getJoinRequests, approveJoinRequest, rejectJoinRequest } from '../api';

export default function JoinRequests() {
  const [data, setData]   = useState({ pending: [], reviewed: [] });
  const [flash, setFlash] = useState(null);

  const load = () => getJoinRequests().then(r => setData(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const approve = async id => {
    try { await approveJoinRequest(id); load(); setFlash({ type: 'success', message: 'Approved!' }); }
    catch (err) { setFlash({ type: 'danger', message: err.response?.data?.error || 'Failed' }); }
  };
  const reject = async id => {
    try { await rejectJoinRequest(id); load(); setFlash({ type: 'warning', message: 'Rejected.' }); }
    catch { setFlash({ type: 'danger', message: 'Failed' }); }
  };

  return (
    <Layout title="Join Requests" subtitle="Review employee access requests" flash={flash} setFlash={setFlash}>
      <div className="page-header">
        <div className="page-header-left"><h1>Join Requests</h1><p>{data.pending.length} pending</p></div>
      </div>

      {data.pending.length > 0 ? (
        <div className="card" style={{ borderLeft: '4px solid #999' }}>
          <div className="card-header">
            <h5><i className="fas fa-user-clock" style={{ color: '#999' }} /> Pending Approval</h5>
            <span className="badge badge-warning">{data.pending.length} pending</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>Applicant</th><th>Username</th><th>Requested</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {data.pending.map(jr => (
                  <tr key={jr.request_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#999,#666)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{jr.name[0].toUpperCase()}</div>
                        <div><div style={{ fontWeight: 600 }}>{jr.name}</div><div style={{ fontSize: 12, color: '#666' }}>Wants to join as Employee</div></div>
                      </div>
                    </td>
                    <td><code style={{ fontSize: 12, background: '#f0f0f0', padding: '3px 8px', borderRadius: 5 }}>@{jr.username}</code></td>
                    <td style={{ fontSize: 12, color: '#666' }}>{new Date(jr.created_at).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button className="btn btn-success btn-sm" onClick={() => approve(jr.request_id)}><i className="fas fa-check" /> Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => reject(jr.request_id)}><i className="fas fa-times" /> Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card"><div className="card-body"><div className="empty-state"><i className="fas fa-user-check" /><p>No pending join requests</p></div></div></div>
      )}

      {data.reviewed.length > 0 && (
        <div className="card">
          <div className="card-header"><h5><i className="fas fa-history" style={{ color: '#666' }} /> Recently Reviewed</h5></div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>Applicant</th><th>Username</th><th>Status</th><th>Reviewed</th></tr></thead>
              <tbody>
                {data.reviewed.map(jr => (
                  <tr key={jr.request_id}>
                    <td><strong>{jr.name}</strong></td>
                    <td><code style={{ fontSize: 12, background: '#f0f0f0', padding: '3px 8px', borderRadius: 5 }}>@{jr.username}</code></td>
                    <td><span className={`badge ${jr.status === 'approved' ? 'badge-success' : 'badge-danger'}`}><i className={`fas ${jr.status === 'approved' ? 'fa-check-circle' : 'fa-times-circle'}`} />{jr.status}</span></td>
                    <td style={{ fontSize: 12, color: '#666' }}>{jr.reviewed_at ? new Date(jr.reviewed_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}
