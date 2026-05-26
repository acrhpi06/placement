import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchNotifications();

    if (socket) {
      socket.on('applicationStatusChanged', () => fetchNotifications());
      socket.on('broadcastNotification', () => fetchNotifications());
      socket.on('movedToNextRound', () => fetchNotifications());
    }

    return () => {
      if (socket) {
        socket.off('applicationStatusChanged');
        socket.off('broadcastNotification');
        socket.off('movedToNextRound');
      }
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/students/notifications');
      setNotifications(data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/students/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="app-layout">
      <Sidebar notificationCount={notifications.filter(n => !n.is_read).length} />
      <main className="main-content">
        <Navbar title="Notifications" actions={
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all as read</button>
        } />

        <div className="page-content">
          <div className="card">
            <div className="card-body" style={{ padding: '0' }}>
              {notifications.length > 0 ? (
                notifications.map(notif => (
                  <div className={`notification-item ${!notif.is_read ? 'unread' : ''}`} key={notif.id}>
                    <div className="notification-icon" style={{ 
                      background: notif.type === 'selected' ? 'var(--secondary-light)' : 'var(--primary-light)',
                      color: notif.type === 'selected' ? 'var(--secondary)' : 'var(--primary)'
                    }}>
                      {notif.type === 'selected' ? '🎉' : '🔔'}
                    </div>
                    <div className="notification-info">
                      <div className="notification-title">{notif.title}</div>
                      <div className="notification-message">{notif.message}</div>
                      <div className="notification-time">{new Date(notif.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-state-icon">🔔</span>
                  <div className="empty-state-title">All caught up!</div>
                  <p className="empty-state-text">You have no new notifications.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
