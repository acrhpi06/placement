import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    { icon: '✅', color: '#dff6dd', iconColor: '#107c10', title: 'Smart Eligibility Check', desc: 'Automatic real-time eligibility checking against company criteria. Know instantly if you qualify.' },
    { icon: '🏢', color: '#c7e0f4', iconColor: '#0078d4', title: 'Company Management', desc: 'Complete company drive management with criteria, dates, packages, and job descriptions.' },
    { icon: '🎯', color: '#e8d9f7', iconColor: '#5c2d91', title: 'Interview Pipeline', desc: 'Track students through each interview round. Move or eliminate with real-time board updates.' },
    { icon: '📊', color: '#fed9cc', iconColor: '#ca5010', title: 'Live Dashboard', desc: 'Real-time statistics and analytics for both students and administrators.' },
    { icon: '🔔', color: '#fde7e9', iconColor: '#d13438', title: 'Instant Notifications', desc: 'Real-time notifications for application updates, round clearances, and new drives.' },
    { icon: '⚡', color: '#dff6dd', iconColor: '#107c10', title: 'Zero Page Reloads', desc: 'Socket.IO powered live sync. Everything updates in real-time without any refresh.' }
  ];

  return (
    <div>
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div style={{
            width: '32px', height: '32px', background: '#0078d4',
            borderRadius: '6px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontWeight: '700'
          }}>P</div>
          PlacePro
        </div>
        <div className="landing-nav-links">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin-login')}>
            Admin Login
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/student-login')}>
            Student Login
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/student-register')}>
            Register
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div>
          <div style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.15)',
            padding: '4px 16px', borderRadius: '999px',
            fontSize: '13px', marginBottom: '24px', fontWeight: '600'
          }}>
            🚀 Campus Placement Management System
          </div>
          <h1 className="hero-title">
            Know Your Eligibility<br />
            Before You Apply
          </h1>
          <p className="hero-subtitle">
            Complete placement management system with real-time eligibility checking,
            interview pipeline tracking, and instant notifications.
          </p>
          <div className="hero-buttons">
            <button className="hero-btn hero-btn-white" onClick={() => navigate('/student-register')}>
              Get Started as Student
            </button>
            <button className="hero-btn hero-btn-outline" onClick={() => navigate('/admin-login')}>
              Admin Portal →
            </button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="stats-bar">
        {[
          { value: '500+', label: 'Students Placed' },
          { value: '50+', label: 'Companies Visited' },
          { value: '₹45 LPA', label: 'Highest Package' },
          { value: '100%', label: 'Real-time Sync' }
        ].map(s => (
          <div className="stats-bar-item" key={s.label}>
            <div className="stats-bar-value">{s.value}</div>
            <div className="stats-bar-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <section className="landing-section">
        <h2 className="section-title">Everything You Need</h2>
        <p className="section-subtitle">Powerful features for students and placement officers</p>
        <div className="features-grid">
          {features.map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon" style={{ background: f.color }}>
                <span style={{ color: f.iconColor }}>{f.icon}</span>
              </div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="landing-section gray">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Simple 3-step process for students</p>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { step: '01', title: 'Register & Fill Profile', desc: 'Create your account and fill in your academic details including CGPA, marks, backlogs.' },
            { step: '02', title: 'Check Eligibility', desc: 'Instantly see which companies you are eligible for with detailed criterion-wise breakdown.' },
            { step: '03', title: 'Apply & Track', desc: 'Apply to eligible companies and track your interview progress in real-time.' }
          ].map(s => (
            <div key={s.step} style={{
              background: 'white', borderRadius: '12px', padding: '32px',
              textAlign: 'center', flex: '1', minWidth: '250px',
              border: '1px solid var(--gray-200)'
            }}>
              <div style={{
                width: '56px', height: '56px', background: 'var(--primary)',
                borderRadius: '12px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px',
                color: 'white', fontSize: '20px', fontWeight: '700'
              }}>{s.step}</div>
              <h3 style={{ fontWeight: '700', marginBottom: '8px', color: 'var(--gray-800)' }}>{s.title}</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '13px', lineHeight: '1.6' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--primary)', padding: '64px 48px', textAlign: 'center' }}>
        <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
          Ready to Get Placed?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '32px', fontSize: '16px' }}>
          Join thousands of students managing their placement journey smarter.
        </p>
        <button className="hero-btn hero-btn-white" onClick={() => navigate('/student-register')}>
          Create Free Account
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--gray-800)', color: 'var(--gray-400)',
        padding: '24px 48px', textAlign: 'center', fontSize: '13px'
      }}>
        <p>© 2024 PlacePro — Placement Eligibility Management System | DBMS Project</p>
      </footer>
    </div>
  );
}
