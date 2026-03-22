import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Layout from '../components/Layout';
import { getSalesChart, getTopDrugs, getEmployeePerformance } from '../api';

export default function Reports() {
  const [chart, setChart]   = useState(null);
  const [topDrugs, setTopDrugs] = useState({});
  const [empPerf, setEmpPerf]   = useState({});
  const [days, setDays]     = useState(30);
  const [flash, setFlash]   = useState(null);

  useEffect(() => {
    getSalesChart(days).then(r => setChart(r.data)).catch(() => {});
    getTopDrugs().then(r => setTopDrugs(r.data)).catch(() => {});
    getEmployeePerformance().then(r => setEmpPerf(r.data)).catch(() => {});
  }, [days]);

  const chartData = chart?.labels?.map((l, i) => ({ date: l, revenue: chart.values[i] })) || [];
  const topDrugsData = Object.entries(topDrugs).map(([name, v]) => ({ name, quantity: v.quantity, revenue: v.total_price }));
  const empData = Object.entries(empPerf).map(([name, v]) => ({ name, transactions: v.transactions, revenue: v.total_price }));

  return (
    <Layout title="Reports" subtitle="Analytics and performance" flash={flash} setFlash={setFlash}>
      <div className="page-header">
        <div className="page-header-left"><h1>Reports</h1><p>Sales analytics and performance metrics</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[7, 30, 90].map(d => (
            <button key={d} className={`btn btn-sm ${days === d ? 'btn-primary' : 'btn-outline'}`} onClick={() => setDays(d)}>{d} Days</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h5><i className="fas fa-chart-line" style={{ color: '#4a4a4a' }} /> Sales Trend — Last {days} Days</h5></div>
        <div className="card-body">
          <div className="chart-container">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={v => [`$${v.toFixed(2)}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#1a1a1a" strokeWidth={2.5} dot={{ fill: '#1a1a1a', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="empty-state"><i className="fas fa-chart-line" /><p>No data for this period</p></div>}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header"><h5><i className="fas fa-capsules" style={{ color: '#666' }} /> Top Selling Drugs</h5></div>
          <div className="card-body">
            <div style={{ height: 250 }}>
              {topDrugsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topDrugsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#4a4a4a" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="empty-state"><i className="fas fa-capsules" /><p>No data yet</p></div>}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h5><i className="fas fa-users" style={{ color: '#666' }} /> Employee Performance</h5></div>
          <div className="card-body">
            {empData.length > 0 ? (
              <table className="table">
                <thead><tr><th>Employee</th><th>Transactions</th><th>Revenue</th></tr></thead>
                <tbody>
                  {empData.map(e => (
                    <tr key={e.name}>
                      <td><strong>{e.name}</strong></td>
                      <td><span className="badge badge-info">{e.transactions}</span></td>
                      <td><strong>${e.revenue.toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-state"><i className="fas fa-users" /><p>No data yet</p></div>}
          </div>
        </div>
      </div>
    </Layout>
  );
}
