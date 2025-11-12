import React, { useState, useEffect } from 'react';
import RealTimeMonitor from '../services/realTimeMonitor';
import socketService from '../services/socketService';

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    RealTimeMonitor.subscribe('security_event', (event) => {
      const notification = {
        id: Date.now(),
        type: 'security',
        title: 'Security Event Detected',
        message: `${event.description} from ${event.source}`,
        severity: event.severity,
        timestamp: new Date(),
        read: false
      };
      
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('SecureX Alert', {
          body: notification.message,
          icon: '/logo192.png'
        });
      }
    });

    // Also listen to backend-emitted threat alerts over Socket.IO
    const socket = socketService.connect();
    const onThreatAlert = (payload) => {
      const notification = {
        id: Date.now(),
        type: 'security',
        title: payload.title || 'Threat Alert',
        message: payload.message || 'New threat detected',
        severity: payload.severity || 'medium',
        timestamp: new Date(),
        read: false
      };
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);
      setUnreadCount(prev => prev + 1);
    };
    socket.on('threat_alert', onThreatAlert);

    return () => {
      RealTimeMonitor.unsubscribe('security_event');
      socket.off('threat_alert', onThreatAlert);
    };
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="notification-center">
      <button 
        className="notification-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div 
          className="notification-panel"
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: 8,
            width: 360,
            maxHeight: 480,
            overflow: 'auto',
            background: '#fff',
            color: '#111',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 10,
            boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
            zIndex: 1000,
            padding: 8
          }}
        >
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              <button onClick={markAllAsRead}>Mark all read</button>
              <button onClick={clearAll}>Clear all</button>
            </div>
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications" style={{ color: '#555' }}>No notifications</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.severity} ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {notification.type === 'security' && '🛡️'}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title" style={{ color: '#111', fontWeight: 600 }}>{notification.title}</div>
                    <div className="notification-message" style={{ color: '#444' }}>{notification.message}</div>
                    <div className="notification-time" style={{ color: '#666' }}>
                      {notification.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  {!notification.read && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;