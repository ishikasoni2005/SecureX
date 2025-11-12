import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

function Login() {
  const [credentials, setCredentials] = useState({ 
    username: '', 
    password: '',
    rememberMe: false 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simple validation
      if (!credentials.username || !credentials.password) {
        setError('Please enter both username and password');
        setIsLoading(false);
        return;
      }

      // Mock login - in real app, this would call your API
      const result = await login({
        username: credentials.username,
        password: credentials.password
      });

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const demoCredentials = {
      admin: { username: 'admin@securex.com', password: 'admin123' },
      analyst: { username: 'analyst@securex.com', password: 'analyst123' },
      viewer: { username: 'viewer@securex.com', password: 'viewer123' }
    };

    setCredentials(demoCredentials[role]);
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}></div>
          ))}
        </div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-section">
            <div className="logo-icon">🛡️</div>
            <h1>SecureX</h1>
          </div>
          <p className="login-subtitle">Enterprise Security Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Email Address
            </label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <div className="password-label-container">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <a href="#forgot" className="forgot-password">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              id="password"
              className="form-input"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={credentials.rememberMe}
                onChange={(e) => setCredentials({...credentials, rememberMe: e.target.checked})}
                disabled={isLoading}
              />
              <span className="checkmark"></span>
              Remember me
            </label>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Signing In...
              </>
            ) : (
              'Sign In to SecureX'
            )}
          </button>
        </form>

        <div className="demo-section">
          <div className="demo-divider">
            <span>Quick Demo Access</span>
          </div>
          
          <div className="demo-buttons">
            <button 
              type="button"
              className="demo-button admin"
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
            >
              <span className="demo-icon">👑</span>
              Admin Demo
            </button>
            
            <button 
              type="button"
              className="demo-button analyst"
              onClick={() => handleDemoLogin('analyst')}
              disabled={isLoading}
            >
              <span className="demo-icon">🔍</span>
              Analyst Demo
            </button>
            
            <button 
              type="button"
              className="demo-button viewer"
              onClick={() => handleDemoLogin('viewer')}
              disabled={isLoading}
            >
              <span className="demo-icon">👁️</span>
              Viewer Demo
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>
            New to SecureX?{' '}
            <a href="#signup" className="signup-link">
              Request access
            </a>
          </p>
          <div className="security-badge">
            <span className="lock-icon">🔒</span>
            Enterprise-grade security
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;