import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getUsers, toggleUser, addUser } from '../api';

export default function Users() {
  const [users, setUsers]   = useState([]);
  const [search, setSearch] = useState('');
  const [flash, setFlash]   = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]     = useState({ name: '', username: '', role: 'Employee', pin: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => { getUsers().then(r => setUsers(r.data)).catch(() => {}); }, []);

  const handleToggle = async id => {
    try {
      const r = await toggleUser(id);
      setUsers(u => u.map(x => x.user_id === id ? r.data : x));
      setFlash({ type: 'success', message: 'User status updated' });
    } catch (err) { setFlash({ type: 'danger', message: err.response?.data?.error || 'Failed' }); }
  };

  const handleAdd = async e => {
    e.preventDefault(); setAdding(true);
    try {
      const r = await addUser(form);
      setUsers(u => [...u, r.data]);
      setShowAdd(false);
      setForm({ name: '', username: '', role: 'Employee', pin: '' });
      setFlash({ type: 'success', message: `User "${r.data.name}" created` });
    } catch (err) { setFlash({ type: 'danger', message: err.response?.data?.error || 'Failed' }); }
    finally { setAdding(false); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="User Management" subtitle="Manage system users" flash={flash} setFlash={setFlash}>
      <div className="page-header">
        <div className="page-header-left"><h1>Users</h1><p>{users.length} registered user{users.length !== 1 ? 's' : ''}</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/join-requests" className="btn btn-outline"><i className="fas fa-user-clock" /> Join Requests</Link>
          <button className="btn btn-primary" onClick={() => setShowAdd(s => !s)}><i className="fas fa-user-plus" /> Add User</button>
        </div>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h5><i className="fas fa-user-plus" style={{ color: '#4a4a4a' }} /> New User</h5><button className="btn btn-outline btn-sm" onClick={() => setShowAdd(false)}>Cancel</button></div>
          <div className="card-body">
            <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group"><label className="form-label">Full Name *</label><input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Username *</label><input className="form-control" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Role</label><select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}><option value="Employee">Employee</option><option value="Admin">Admin</option></select></div>
              <div className="form-group"><label className="form-label">PIN *</label><input className="form-control" type="password" maxLength={10} value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value }))} required /></div>
              <div style={{ gridColumn: '1/-1' }}><button className="btn btn-primary" type="submit" disabled={adding}>{adding ? <span className="spinner" /> : <><i className="fas fa-user-plus" /> Create User</>}</button></div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h5><i className="fas fa-users" style={{ color: '#4a4a4a' }} /> All Users</h5>
          <div className="search-bar" style={{ width: 220 }}>
            <i className="fas fa-search search-icon" />
            <input className="form-control" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead><tr><th>User</th><th>Username</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.user_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#333,#666)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{u.name[0].toUpperCase()}</div>
                      <strong>{u.name}</strong>
                    </div>
                  </td>
                  <td><code style={{ fontSize: 12, background: '#f0f0f0', padding: '3px 8px', borderRadius: 5, color: '#555' }}>@{u.username}</code></td>
                  <td><span className={`badge ${u.role === 'Admin' ? 'badge-danger' : 'badge-info'}`}><i className={`fas ${u.role === 'Admin' ? 'fa-crown' : 'fa-user'}`} />{u.role}</span></td>
                  <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-secondary'}`}><i className={`fas ${u.is_active ? 'fa-check-circle' : 'fa-times-circle'}`} />{u.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ fontSize: 12, color: '#666' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td><button className="btn btn-sm btn-outline" onClick={() => handleToggle(u.user_id)} title={u.is_active ? 'Deactivate' : 'Activate'}><i className={`fas ${u.is_active ? 'fa-ban' : 'fa-check'}`} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
