import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    fetchStats();

    if (socket) {
      socket.on('onlineStudentsCount', ({ count }) => setOnlineCount(count));
      socket.on('newApplication', () => fetchStats());
    }

    return () => {
      if (socket) {
        socket.off('onlineStudentsCount');
        socket.off('newApplication');
      }
    };
  }, [socket]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/dashboard-stats');
      setData(data.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  const barData = {
    labels: data.companyStats.map(c => c.company_name),
    datasets: [
      {
        label: 'Applications',
        data: data.companyStats.map(c => c.applications),
        backgroundColor: '#0078d4',
      },
      {
        label: 'Selected',
        data: data.companyStats.map(c => c.selected),
        backgroundColor: '#107c10',
      }
    ]
  };

  const pieData = {
    labels: data.deptStats.map(d => d.department),
    datasets: [{
      data: data.deptStats.map(d => d.count),
      backgroundColor: ['#0078d4', '#107c10', '#5c2d91', '#ca5010', '#d13438', '#005a9e'],
    }]
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar title="Admin Dashboard" />

        <div className="page-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">👥</div>
              <div className="stat-info">
                <div className="stat-value">{data.stats.totalStudents}</div>
                <div className="stat-label">Total Students</div>
                <div className="stat-change">{data.stats.completeProfiles} Profiles Ready</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">🏢</div>
              <div className="stat-info">
                <div className="stat-value">{data.stats.totalCompanies}</div>
                <div className="stat-label">Companies</div>
                <div className="stat-change">{data.stats.activeCompanies} Active Drives</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">📋</div>
              <div className="stat-info">
                <div className="stat-value">{data.stats.totalApplications}</div>
                <div className="stat-label">Applications</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">🌐</div>
              <div className="stat-info">
                <div className="stat-value">{onlineCount}</div>
                <div className="stat-label">Students Online</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px' }}>
            <div className="card">
              <div className="card-header"><h2 className="card-title">Application Trends</h2></div>
              <div className="card-body">
                <Bar data={barData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h2 className="card-title">Department Wise Split</h2></div>
              <div className="card-body">
                <Pie data={pieData} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-header"><h2 className="card-title">Recent Application Activities</h2></div>
            <div className="card-body" style={{ padding: '0' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentApplications.map(app => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: '600' }}>{app.name}</td>
                      <td>{app.company_name}</td>
                      <td>{app.job_role}</td>
                      <td>{new Date(app.applied_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${
                          app.status === 'Selected' ? 'badge-success' : 
                          app.status === 'Rejected' ? 'badge-danger' : 'badge-primary'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
