import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [compRes, eligRes, appsRes] = await Promise.all([
        api.get(`/companies/${id}`),
        api.get(`/eligibility/check/${id}`),
        api.get('/applications/my-applications')
      ]);

      setCompany(compRes.data.data);
      setEligibility(eligRes.data);
      
      const applied = appsRes.data.data.some(app => app.company_id === parseInt(id));
      setHasApplied(applied);
    } catch (error) {
      toast.error('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!eligibility.isEligible) {
      return toast.error('You are not eligible for this company');
    }

    setApplying(true);
    try {
      await api.post('/applications/apply', { company_id: id });
      toast.success('Application submitted successfully!');
      setHasApplied(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar title={company?.company_name} />
        
        <div className="page-content">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '16px' }}>
            ← Back
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Job Description</h2>
                <span className="badge badge-success">₹ {company?.package_lpa} LPA</span>
              </div>
              <div className="card-body">
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Role: {company?.job_role}</h3>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--gray-500)', fontSize: '13px' }}>
                    <span>📍 {company?.job_location}</span>
                    <span>🕒 {company?.job_type}</span>
                    <span>⏱️ Drive Date: {new Date(company?.drive_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: 'var(--gray-700)' }}>
                  {company?.job_description}
                </div>

                {company?.bond_years > 0 && (
                  <div className="alert alert-warning" style={{ marginTop: '24px' }}>
                    <span>⚠️</span>
                    <div>
                      <strong>Employment Bond:</strong> This role requires a {company.bond_years}-year service bond agreement.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Eligibility Card */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Eligibility Status</h2>
                  {eligibility.isEligible ? (
                    <span className="badge badge-success">Eligible</span>
                  ) : (
                    <span className="badge badge-danger">Not Eligible</span>
                  )}
                </div>
                <div className="card-body">
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>Qualification Progress</span>
                      <span style={{ fontSize: '13px', fontWeight: '700' }}>{Math.round((eligibility.passedCount / eligibility.totalCount) * 100)}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div 
                        className={`progress-bar ${eligibility.isEligible ? 'green' : 'orange'}`}
                        style={{ width: `${(eligibility.passedCount / eligibility.totalCount) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {eligibility.criteria.map((c, i) => (
                      <div key={i} className={`eligibility-item ${c.passed ? 'passed' : 'failed'}`}>
                        <div className={`eligibility-icon ${c.passed ? 'passed' : 'failed'}`}>
                          {c.passed ? '✓' : '✕'}
                        </div>
                        <div className="eligibility-info">
                          <div className="eligibility-param">{c.parameter}</div>
                          <div className="eligibility-message">{c.message}</div>
                          <div className="eligibility-values">
                            <span className="eligibility-required">Needed: {c.required}</span>
                            <span className={`eligibility-yours ${c.passed ? 'passed' : 'failed'}`}>
                              Yours: {c.studentValue}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    {hasApplied ? (
                      <button className="btn btn-success btn-full btn-lg" disabled>
                        ✓ Application Submitted
                      </button>
                    ) : (
                      <>
                        {!eligibility.isEligible && (
                          <p style={{ color: 'var(--danger)', fontSize: '11px', marginBottom: '8px' }}>
                            You don't meet all requirements to apply.
                          </p>
                        )}
                        <button
                          className="btn btn-primary btn-full btn-lg"
                          disabled={!eligibility.isEligible || applying}
                          onClick={handleApply}
                        >
                          {applying ? 'Submitting...' : 'Apply Now'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h2 className="card-title">Placement Contacts</h2></div>
                <div className="card-body">
                  <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                    For any queries regarding this drive, contact your department placement coordinator.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
