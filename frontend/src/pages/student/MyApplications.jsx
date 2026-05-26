import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchApplications();

    if (socket) {
      socket.on('applicationStatusChanged', () => {
        fetchApplications();
      });
    }

    return () => {
      if (socket) socket.off('applicationStatusChanged');
    };
  }, [socket]);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/applications/my-applications');
      setApplications(data.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Applied': return 'badge-primary';
      case 'Shortlisted': return 'badge-info';
      case 'Selected': return 'badge-success';
      case 'Rejected': return 'badge-danger';
      default: return 'badge-gray';
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar title="My Applications" />

        <div className="page-content">
          <div className="card">
            <div className="card-body" style={{ padding: '0' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Applied Date</th>
                    <th>Current Round</th>
                    <th>Status</th>
                    <th>Package</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length > 0 ? applications.map(app => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: '600' }}>{app.company_name}</td>
                      <td>{app.job_role}</td>
                      <td>{new Date(app.applied_date).toLocaleDateString()}</td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>
                          {app.current_round || 'Application Review'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>{app.package_lpa} LPA</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        <span className="empty-state-icon">📄</span>
                        <div className="empty-state-title">No applications yet</div>
                        <p className="empty-state-text">Explore active companies and start applying.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
