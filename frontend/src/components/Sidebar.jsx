import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const StudentNav = [
  { to: '/student/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/student/profile', icon: '👤', label: 'My Profile' },
  { to: '/student/companies', icon: '🏢', label: 'Companies' },
  { to: '/student/applications', icon: '📄', label: 'My Applications' },
  { to: '/student/notifications', icon: '🔔', label: 'Notifications' }
];

const AdminNav = [
  { to: '/admin/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/admin/students', icon: '👥', label: 'All Students' },
  { to: '/admin/companies', icon: '🏢', label: 'Companies' },
  { to: '/admin/applications', icon: '📋', label: 'Applications' }
];

export default function Sidebar({ notificationCount = 0 }) {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navItems = user?.role === 'admin' ? AdminNav : StudentNav;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">P</div>
        <div>
          <div className="sidebar-logo-text">PlacePro</div>
          <div className="sidebar-logo-sub">Placement System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">
          {user?.role === 'admin' ? 'Administration' : 'Navigation'}
        </div>

        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            {item.label}
            {item.label === 'Notifications' && notificationCount > 0 && (
              <span className="sidebar-badge">{notificationCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="connection-status" style={{ marginBottom: '8px' }}>
          <div className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          <span style={{ color: '#a0a0a0', fontSize: '11px' }}>
            {isConnected ? 'Live Connected' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-role">
            {user?.role === 'admin' ? 'Administrator' : user?.department}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            color: '#a0a0a0',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '4px'
          }}
          title="Logout"
        >
          ⎋
        </button>
      </div>
    </aside>
  );
}
