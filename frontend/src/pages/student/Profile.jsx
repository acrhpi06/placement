import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function StudentProfile() {
  const [profile, setProfile] = useState({});
  const [academics, setAcademics] = useState({});
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/students/profile');
      const data = res.data.data;
      setProfile({
        name: data.name || '',
        phone: data.phone || '',
        gender: data.gender || '',
        date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : '',
        address: data.address || ''
      });
      setAcademics({
        tenth_percentage: data.tenth_percentage || '',
        twelfth_percentage: data.twelfth_percentage || '',
        cgpa: data.cgpa || '',
        active_backlogs: data.active_backlogs || 0,
        total_backlogs: data.total_backlogs || 0,
        gap_years: data.gap_years || 0,
        skills: data.skills || '',
        certifications: data.certifications || '',
        projects: data.projects || '',
        internships: data.internships || ''
      });
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/students/update-profile', profile);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAcademics = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/students/update-academics', academics);
      toast.success('Academic details updated successfully');
    } catch (err) {
      toast.error('Failed to update academics');
    } finally {
      setSaving(false);
    }
  };

  const setProfile_ = (key, val) => setProfile(p => ({ ...p, [key]: val }));
  const setAcademics_ = (key, val) => setAcademics(a => ({ ...a, [key]: val }));

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <div className="loading-container"><div className="spinner" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Profile" />
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">My Profile</h1>
            <p className="page-subtitle">Keep your information up to date</p>
          </div>

          <div className="card">
            <div className="card-header" style={{ justifyContent: 'flex-start', gap: '8px' }}>
              {[
                { id: 'personal', label: '👤 Personal Info' },
                { id: 'academics', label: '📚 Academic Details' },
                { id: 'extras', label: '💼 Skills & Experience' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {activeTab === 'personal' && (
              <form onSubmit={handleSavePersonal}>
                <div className="card-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label required">Full Name</label>
                      <input className="form-input" type="text" value={profile.name}
                        onChange={e => setProfile_('name', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" type="tel" value={profile.phone}
                        onChange={e => setProfile_('phone', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select className="form-select" value={profile.gender}
                        onChange={e => setProfile_('gender', e.target.value)}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date of Birth</label>
                      <input className="form-input" type="date" value={profile.date_of_birth}
                        onChange={e => setProfile_('date_of_birth', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea className="form-textarea" rows="3" value={profile.address}
                      onChange={e => setProfile_('address', e.target.value)}
                      placeholder="Full address including city, state, pincode" />
                  </div>
                </div>
                <div style={{ padding: '0 20px 20px' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Personal Info'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'academics' && (
              <form onSubmit={handleSaveAcademics}>
                <div className="card-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label required">10th Percentage</label>
                      <input className="form-input" type="number" step="0.01" min="0" max="100"
                        value={academics.tenth_percentage}
                        onChange={e => setAcademics_('tenth_percentage', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label required">12th Percentage</label>
                      <input className="form-input" type="number" step="0.01" min="0" max="100"
                        value={academics.twelfth_percentage}
                        onChange={e => setAcademics_('twelfth_percentage', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label required">CGPA</label>
                      <input className="form-input" type="number" step="0.01" min="0" max="10"
                        value={academics.cgpa}
                        onChange={e => setAcademics_('cgpa', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Active Backlogs</label>
                      <input className="form-input" type="number" min="0"
                        value={academics.active_backlogs}
                        onChange={e => setAcademics_('active_backlogs', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Total Backlogs</label>
                      <input className="form-input" type="number" min="0"
                        value={academics.total_backlogs}
                        onChange={e => setAcademics_('total_backlogs', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gap Years</label>
                      <input className="form-input" type="number" min="0" max="5"
                        value={academics.gap_years}
                        onChange={e => setAcademics_('gap_years', e.target.value)} />
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0 20px 20px' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Academic Details'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'extras' && (
              <form onSubmit={handleSaveAcademics}>
                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">Skills</label>
                    <textarea className="form-textarea" rows="3" value={academics.skills}
                      onChange={e => setAcademics_('skills', e.target.value)}
                      placeholder="JavaScript, React, Node.js, Python, etc." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Certifications</label>
                    <textarea className="form-textarea" rows="3" value={academics.certifications}
                      onChange={e => setAcademics_('certifications', e.target.value)}
                      placeholder="AWS Certified, Google Cloud, etc." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Projects</label>
                    <textarea className="form-textarea" rows="4" value={academics.projects}
                      onChange={e => setAcademics_('projects', e.target.value)}
                      placeholder="List your major projects with brief descriptions" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Internships</label>
                    <textarea className="form-textarea" rows="3" value={academics.internships}
                      onChange={e => setAcademics_('internships', e.target.value)}
                      placeholder="Internship experience details" />
                  </div>
                </div>
                <div style={{ padding: '0 20px 20px' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Skills & Experience'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
