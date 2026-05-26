import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState({
    eligibleCompanies: 0,
    applications: 0,
    selected: 0,
    notifications: 0
  });
  const [upcomingDrives, setUpcomingDrives] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    if (socket) {
      socket.on('newCompanyAdded', (data) => {
        setUpcomingDrives(prev => [data, ...prev].slice(0, 5));
        setStats(prev => ({ ...prev, eligibleCompanies: prev.eligibleCompanies + 1 }));
      });

      socket.on('applicationStatusChanged', () => {
        fetchDashboardData();
      });
    }

    return () => {
      if (socket) {
        socket.off('newCompanyAdded');
        socket.off('applicationStatusChanged');
      }
    };
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      const [eligibleRes, appsRes, notifRes, companiesRes] = await Promise.all([
        api.get('/eligibility/my-eligible-companies'),
        api.get('/applications/my-applications'),
        api.get('/students/notifications'),
        api.get('/companies/all')
      ]);

      setStats({
        eligibleCompanies: eligibleRes.data.count,
        applications: appsRes.data.data.length,
        selected: appsRes.data.data.filter(a => a.status === 'Selected').length,
        notifications: notifRes.data.data.filter(n => !n.is_read).length
      });

      setUpcomingDrives(companiesRes.data.data.slice(0, 5));
      setRecentNotifications(notifRes.data.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="app-layout">
      <Sidebar notificationCount={stats.notifications} />
      <main className="main-content">
        <Navbar title="Student Dashboard" />
        
        <div className="page-content">
          <div className="page-header" style={{ paddingTop: '0' }}>
            <h1 className="page-title">Welcome back, {user?.name}!</h1>
            <p className="page-subtitle">Here's what's happening with your placements today.</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">🏢</div>
              <div className="stat-info">
                <div className="stat-value">{stats.eligibleCompanies}</div>
                <div className="stat-label">Eligible Companies</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">📄</div>
              <div className="stat-info">
                <div className="stat-value">{stats.applications}</div>
                <div className="stat-label">Applications</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">🎉</div>
              <div className="stat-info">
                <div className="stat-value">{stats.selected}</div>
                <div className="stat-label">Offers Received</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red">🔔</div>
              <div className="stat-info">
                <div className="stat-value">{stats.notifications}</div>
                <div className="stat-label">Unread Updates</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
            {/* Upcoming Drives */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Upcoming Placement Drives</h2>
                <Link to="/student/companies" className="btn btn-ghost btn-sm">View All</Link>
              </div>
              <div className="card-body" style={{ padding: '0' }}>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Role</th>
                        <th>Package</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingDrives.length > 0 ? upcomingDrives.map(drive => (
                        <tr key={drive.id}>
                          <td>
                            <div style={{ fontWeight: '600' }}>{drive.company_name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{drive.job_location}</div>
                          </td>
                          <td>{drive.job_role}</td>
                          <td><span className="badge badge-success">{drive.package_lpa} LPA</span></td>
                          <td>{new Date(drive.drive_date).toLocaleDateString()}</td>
                          <td>
                            <Link to={`/student/companies/${drive.id}`} className="btn btn-outline btn-sm">Details</Link>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5" className="empty-state">No upcoming drives found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Recent Notifications</h2>
                <Link to="/student/notifications" className="btn btn-ghost btn-sm">All</Link>
              </div>
              <div className="card-body" style={{ padding: '0' }}>
                {recentNotifications.length > 0 ? recentNotifications.map(notif => (
                  <div className={`notification-item ${!notif.is_read ? 'unread' : ''}`} key={notif.id}>
                    {!notif.is_read && <div className="notification-dot" />}
                    <div className="notification-info">
                      <div className="notification-title">{notif.title}</div>
                      <div className="notification-message">{notif.message}</div>
                      <div className="notification-time">{new Date(notif.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                )) : (
                  <div className="empty-state">No notifications.</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions / Tips */}
          <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-body" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{
                background: 'var(--primary-light)', color: 'var(--primary)',
                padding: '16px', borderRadius: '12px', fontSize: '24px'
              }}>💡</div>
              <div>
                <h3 style={{ fontWeight: '700', color: 'var(--gray-800)' }}>Pro Tip: Keep your profile updated!</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '13px' }}>
                  Companies often filter students based on CGPA and skills. Make sure your latest academic details and projects are updated in your profile.
                </p>
              </div>
              <Link to="/student/profile" className="btn btn-primary" style={{ marginLeft: 'auto' }}>Update Profile</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
