import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getNotifications } from '../api';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [flash, setFlash]   = useState(null);

  useEffect(() => { getNotifications().then(r => setNotifs(r.data)).catch(() => {}); }, []);

  const iconMap = { sale: 'fa-receipt', alert: 'fa-exclamation-triangle', join_request: 'fa-user-clock' };

  return (
    <Layout title="Notifications" subtitle="System alerts and updates" flash={flash} setFlash={setFlash}>
      <div className="page-header">
        <div className="page-header-left"><h1>Notifications</h1><p>{notifs.length} notification{notifs.length !== 1 ? 's' : ''}</p></div>
      </div>
      <div className="card">
        <div className="card-header"><h5><i className="fas fa-bell" style={{ color: '#666' }} /> All Notifications</h5></div>
        {notifs.length === 0 ? (
          <div className="card-body"><div className="empty-state"><i className="fas fa-bell-slash" /><p>No notifications</p></div></div>
        ) : notifs.map(n => (
          <div key={n.notification_id} className="notification-item">
            <div className={`notification-icon ${n.notification_type || 'info'}`}>
              <i className={`fas ${iconMap[n.notification_type] || 'fa-info-circle'}`} />
            </div>
            <div className="notification-content">
              <div className="notif-title">{n.title}</div>
              <div className="notif-msg">{n.message}</div>
              <div className="notif-time"><i className="fas fa-clock" style={{ marginRight: 4 }} />{new Date(n.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
