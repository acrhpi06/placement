import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');

    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin-login', { email, password });
      if (data.success) {
        login(data.user, data.token);
        toast.success('Admin access granted');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ background: 'var(--gray-800)' }}>
      <div className="auth-card">
        <div className="auth-header" style={{ background: 'var(--gray-700)' }}>
          <div className="auth-logo" style={{ background: 'var(--primary)' }}>👤</div>
          <h1 className="auth-title">Admin Console</h1>
          <p className="auth-subtitle">Authorized personnel only</p>
        </div>
        <div className="auth-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ background: 'var(--gray-800)' }}
            >
              {loading ? <div className="spinner" style={{ width: '18px', height: '18px', borderTopColor: 'white' }} /> : 'Authenticate'}
            </button>
          </form>
          <div className="auth-footer">
            <Link to="/student-login" style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
              ← Back to Student Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
