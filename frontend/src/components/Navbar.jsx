import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ title, actions }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-title">{title}</div>
      </div>
      <div className="navbar-right">
        {actions}
        {user?.role === 'student' && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/student/notifications')}
          >
            🔔
          </button>
        )}
        <div style={{
          fontSize: '13px',
          color: 'var(--gray-600)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '700'
          }}>
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          {user?.name}
        </div>
      </div>
    </header>
  );
}
