import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to monitoring service
    if (window.monitoringService) {
      window.monitoringService.trackError(error, {
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }

    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">🚨</div>
            <h1>Something went wrong</h1>
            <p>We apologize for the inconvenience. Our team has been notified.</p>
            
            <div className="error-details">
              <details>
                <summary>Error Details (Technical)</summary>
                <div className="error-stack">
                  <strong>{this.state.error?.toString()}</strong>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </div>
              </details>
            </div>

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-primary">
                Try Again
              </button>
              <button onClick={this.handleReload} className="btn-secondary">
                Reload Page
              </button>
              <button onClick={this.handleGoHome} className="btn-outline">
                Go Home
              </button>
            </div>

            <div className="error-support">
              <p>If the problem persists, please contact our support team.</p>
              <div className="support-contact">
                <a href="mailto:support@securex.com">support@securex.com</a>
                <span>•</span>
                <a href="tel:+1-555-SECUREX">+1-555-SECUREX</a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Router error boundary for React Router v6
export function RouterErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error('Router error:', error);

  return (
    <div className="error-boundary">
      <div className="error-content">
        <div className="error-icon">🔍</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        
        <div className="error-actions">
          <button onClick={() => navigate(-1)} className="btn-primary">
            Go Back
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

export { ErrorBoundary };