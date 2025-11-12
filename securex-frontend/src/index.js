import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import './index.css';
import environment from './config/environment';

// Performance monitoring
if (process.env.NODE_ENV === 'production') {
  const { getCLS, getFID, getFCP, getLCP, getTTFB } = require('web-vitals');
  
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}

// Validate frontend environment configuration early
try {
  environment.validate();
} catch (err) {
  // Surface configuration issues prominently in the console
  // eslint-disable-next-line no-console
  console.error(err.message);
}

// Helpful warnings in development for commonly-missed keys
if (process.env.NODE_ENV === 'development') {
  if (!process.env.REACT_APP_ENCRYPTION_KEY) {
    // eslint-disable-next-line no-console
    console.warn('[env] REACT_APP_ENCRYPTION_KEY is not set. Using fallback key reduces security.');
  }
  if (!process.env.REACT_APP_API_BASE_URL) {
    // eslint-disable-next-line no-console
    console.warn('[env] REACT_APP_API_BASE_URL is not set. Defaulting to /api/v1.');
  }
}

// Error boundary for initialization errors
class IndexErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application initialization error:', error, errorInfo);
    
    // Send to error reporting service
    if (window.monitoringService) {
      window.monitoringService.trackError(error, {
        componentStack: errorInfo.componentStack,
        phase: 'initialization'
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1>🚨 Application Error</h1>
          <p>Sorry, something went wrong during application initialization.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <IndexErrorBoundary>
      <App />
    </IndexErrorBoundary>
  </React.StrictMode>
);

// Register service worker for PWA features
serviceWorkerRegistration.register();

// Report web vitals for performance monitoring
reportWebVitals(console.log);