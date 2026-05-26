import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await api.get('/companies/all');
      setCompanies(data.data);
    } catch (error) {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company drive?')) return;
    try {
      await api.delete(`/companies/${id}`);
      toast.success('Company deleted');
      fetchCompanies();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/companies/${id}`, { status });
      toast.success('Status updated');
      fetchCompanies();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar title="Company Management" />

        <div className="page-content">
          <div className="page-header-row" style={{ marginBottom: '24px' }}>
            <div>
              <h1 className="page-title">Drive Management</h1>
              <p className="page-subtitle">Add companies, set criteria, and monitor applications.</p>
            </div>
            <Link to="/admin/companies/add" className="btn btn-primary">+ Add New Company</Link>
          </div>

          <div className="card">
            <div className="card-body" style={{ padding: '0' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Job Role</th>
                    <th>Criteria</th>
                    <th>Applications</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{c.company_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{c.job_location} | {c.package_lpa} LPA</div>
                      </td>
                      <td>{c.job_role}</td>
                      <td>
                        <Link to={`/admin/criteria/${c.id}`} className="btn btn-ghost btn-sm">
                          {c.min_cgpa ? '✓ Edit Criteria' : '+ Set Criteria'}
                        </Link>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600' }}>{c.total_applications} Applied</span>
                          <span style={{ fontSize: '11px', color: 'var(--secondary)' }}>{c.total_selected} Selected</span>
                        </div>
                      </td>
                      <td>
                        <select
                          className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-primary'}`}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none' }}
                          value={c.status}
                          onChange={(e) => updateStatus(c.id, e.target.value)}
                        >
                          <option value="Upcoming">Upcoming</option>
                          <option value="Active">Active</option>
                          <option value="Ongoing">Ongoing</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link to={`/admin/interview/${c.id}`} className="btn btn-primary btn-sm">Pipeline</Link>
                          <button onClick={() => handleDelete(c.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>🗑️</button>
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
