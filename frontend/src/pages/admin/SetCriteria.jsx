import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function SetCriteria() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    min_cgpa: 6.0,
    min_tenth: 60,
    min_twelfth: 60,
    max_active_backlogs: 0,
    max_total_backlogs: 0,
    max_gap_years: 0,
    allowed_departments: '',
    allowed_year_of_passing: '2024',
    required_skills: ''
  });

  const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];

  useEffect(() => {
    fetchCriteria();
  }, [companyId]);

  const fetchCriteria = async () => {
    try {
      const [compRes, eligRes] = await Promise.all([
        api.get(`/companies/${companyId}`),
        api.get(`/eligibility/check/1`) // Just to see if criteria exists, ignoring error
      ]);
      setCompany(compRes.data.data);
      if (compRes.data.data.min_cgpa !== undefined) {
        setFormData(compRes.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeptToggle = (dept) => {
    const current = formData.allowed_departments.split(',').map(d => d.trim()).filter(d => d);
    let updated;
    if (current.includes(dept)) {
      updated = current.filter(d => d !== dept);
    } else {
      updated = [...current, dept];
    }
    setFormData({ ...formData, allowed_departments: updated.join(', ') });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/eligibility/set-criteria', { ...formData, company_id: companyId });
      toast.success('Eligibility criteria saved successfully!');
      navigate('/admin/companies');
    } catch (error) {
      toast.error('Failed to save criteria');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar title={`Set Criteria: ${company?.company_name}`} />
        
        <div className="page-content" style={{ maxWidth: '800px' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Eligibility Prerequisites</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">Min CGPA</label>
                    <input type="number" step="0.1" className="form-input" value={formData.min_cgpa} onChange={e => setFormData({...formData, min_cgpa: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Min 10th %</label>
                    <input type="number" className="form-input" value={formData.min_tenth} onChange={e => setFormData({...formData, min_tenth: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Min 12th %</label>
                    <input type="number" className="form-input" value={formData.min_twelfth} onChange={e => setFormData({...formData, min_twelfth: e.target.value})} required />
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">Max Active Backlogs</label>
                    <input type="number" className="form-input" value={formData.max_active_backlogs} onChange={e => setFormData({...formData, max_active_backlogs: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Total Backlogs</label>
                    <input type="number" className="form-input" value={formData.max_total_backlogs} onChange={e => setFormData({...formData, max_total_backlogs: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Gap Years</label>
                    <input type="number" className="form-input" value={formData.max_gap_years} onChange={e => setFormData({...formData, max_gap_years: e.target.value})} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Allowed Departments</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {departments.map(dept => (
                      <button
                        key={dept}
                        type="button"
                        className={`btn btn-sm ${formData.allowed_departments.includes(dept) ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleDeptToggle(dept)}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Skills</label>
                  <input className="form-input" placeholder="e.g. Node.js, AWS, React" value={formData.required_skills} onChange={e => setFormData({...formData, required_skills: e.target.value})} />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Criteria'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/companies')}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
