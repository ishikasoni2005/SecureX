import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

function MobileHeader({ user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/security', label: 'Security', icon: '🛡️' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="mobile-header">
      <div className="mobile-header-top">
        <button 
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
        
        <div className="mobile-logo">
          <img src="/logo192.png" alt="SecureX" />
          <span>SecureX</span>
        </div>

        <div className="mobile-user">
          <span className="user-avatar">👤</span>
        </div>
      </div>

      {isMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mobile-user-info">
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button 
              className="logout-btn"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileHeader;