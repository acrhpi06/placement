import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AddCompany() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    company_code: '',
    job_role: '',
    job_description: '',
    package_lpa: '',
    job_location: '',
    job_type: 'Full-Time',
    bond_years: 0,
    drive_date: '',
    last_apply_date: '',
    status: 'Upcoming',
    total_openings: 0
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/companies/add', formData);
      if (data.success) {
        toast.success('Company added! Now set the eligibility criteria.');
        navigate(`/admin/criteria/${data.companyId}`);
      }
    } catch (error) {
      toast.error('Failed to add company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar title="Add New Company" />
        
        <div className="page-content" style={{ maxWidth: '800px' }}>
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Company Name</label>
                    <input name="company_name" className="form-input" placeholder="Google" onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Code (Internal)</label>
                    <input name="company_code" className="form-input" placeholder="GOOG-2024" onChange={handleChange} />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Job Role</label>
                    <input name="job_role" className="form-input" placeholder="Software Engineer" onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Package (LPA)</label>
                    <input name="package_lpa" type="number" step="0.1" className="form-input" placeholder="12.0" onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">Job Description</label>
                  <textarea name="job_description" className="form-textarea" style={{ minHeight: '120px' }} placeholder="Requirements, responsibilities, etc." onChange={handleChange} required />
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input name="job_location" className="form-input" placeholder="Bangalore" onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Job Type</label>
                    <select name="job_type" className="form-select" onChange={handleChange}>
                      <option value="Full-Time">Full-Time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bond Years</label>
                    <input name="bond_years" type="number" className="form-input" defaultValue="0" onChange={handleChange} />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Drive Date</label>
                    <input name="drive_date" type="date" className="form-input" onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Last Date to Apply</label>
                    <input name="last_apply_date" type="date" className="form-input" onChange={handleChange} required />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Company Drive'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
