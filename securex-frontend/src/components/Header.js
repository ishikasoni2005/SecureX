import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';
import LanguageSwitcher from './LanguageSwitcher';

function Header({ user, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/security', label: 'Security', icon: '🛡️' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <header className="app-header">
      {/* Logo Section - Updated for smaller size and left alignment */}
      <div className="logo-section">
        <Link to="/" className="logo-link">
          <img 
            src="/logo192.png" 
            alt="SecureX Logo" 
            className="logo-small" // New class for smaller logo
          />
          {/* <h1 className="logo-text">SecureX</h1> */}
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="main-nav">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="user-section">
        <NotificationCenter />
        <LanguageSwitcher />
        <div className="user-info">
          <span className="username">{user?.name}</span>
          <span className="user-role">{user?.role}</span>
        </div>
        <div className="user-menu">
          <button 
            className="user-menu-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            👤
          </button>
          {showUserMenu && (
            <div className="user-dropdown">
              <button className="dropdown-item" onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;