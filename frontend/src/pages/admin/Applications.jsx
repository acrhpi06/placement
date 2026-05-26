import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCompany, setFilterCompany] = useState('');
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [compsRes, appsRes] = await Promise.all([
        api.get('/companies/all'),
        api.get('/admin/dashboard-stats') // Using this for quick all apps or we could use individual routes
      ]);
      setCompanies(compsRes.data.data);
      setApplications(appsRes.data.data.recentApplications); // In real app, we'd have a specific list all route
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/applications/update-status/${id}`, { status });
      toast.success(`Student ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar title="Manage Applications" />

        <div className="page-content">
          <div className="search-bar">
            <select className="form-select" style={{ width: '250px' }} value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
              <option value="">All Companies</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.company_name} - {c.job_role}</option>)}
            </select>
          </div>

          <div className="card">
            <div className="card-body" style={{ padding: '0' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student Details</th>
                    <th>CGPA</th>
                    <th>Company</th>
                    <th>Current Round</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{app.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{app.roll_number}</div>
                      </td>
                      <td>{app.cgpa || 'N/A'}</td>
                      <td>{app.company_name}</td>
                      <td>{app.current_round || 'Review'}</td>
                      <td>
                        <span className={`badge ${
                          app.status === 'Selected' ? 'badge-success' : 
                          app.status === 'Rejected' ? 'badge-danger' : 'badge-primary'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-success btn-sm" onClick={() => updateStatus(app.id, 'Shortlisted')}>Shortlist</button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(app.id, 'Rejected')}>Reject</button>
                        </div>
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
