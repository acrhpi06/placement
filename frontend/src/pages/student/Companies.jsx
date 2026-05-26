import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import { Link } from 'react-router-dom';

export default function StudentCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await api.get('/eligibility/my-companies');
      setCompanies(data.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.job_role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar title="Placement Drives" />
        
        <div className="page-content">
          <div className="page-header-row" style={{ marginBottom: '24px' }}>
            <div>
              <h1 className="page-title">Explore Companies</h1>
              <p className="page-subtitle">View your eligibility status for active placement drives.</p>
            </div>
          </div>

          <div className="search-bar">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search company or role..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ width: '150px' }}
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="company-grid">
            {filteredCompanies.map(company => (
              <div
                key={company.id}
                className={`company-card ${!company.isEligible ? 'ineligible' : ''}`}
                onClick={() => window.location.href = `/student/companies/${company.id}`}
              >
                <div className="company-card-header">
                  <div className="company-logo-placeholder">
                    {company.company_name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="company-name">{company.company_name}</div>
                    <div className="company-role">{company.job_role}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span className={`badge ${
                      company.status === 'Active' ? 'badge-success' : 
                      company.status === 'Upcoming' ? 'badge-primary' : 'badge-gray'
                    }`}>
                      {company.status}
                    </span>
                  </div>
                </div>
                <div className="company-card-body">
                  <div className="company-meta">
                    <div className="company-meta-item">📍 {company.job_location}</div>
                    <div className="company-meta-item">📅 {new Date(company.drive_date).toLocaleDateString()}</div>
                    <div className="company-meta-item">⏳ Apply by: {new Date(company.last_apply_date).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="company-package">₹{company.package_lpa} LPA</div>
                    {company.isEligible ? (
                      <div className="eligibility-tag eligible">✅ Match Found</div>
                    ) : (
                      <div className="eligibility-tag ineligible">❌ {company.ineligibilityReason}</div>
                    )}
                  </div>
                </div>
                <div className="company-card-footer">
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                    {company.total_applications || 0} Applicants
                  </div>
                  <Link to={`/student/companies/${company.id}`} className="btn btn-outline btn-sm">View Details</Link>
                </div>
              </div>
            ))}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="empty-state">
              <span className="empty-state-icon">🏢</span>
              <div className="empty-state-title">No companies found</div>
              <p className="empty-state-text">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
