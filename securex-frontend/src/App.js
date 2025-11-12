import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MonitoringProvider } from './contexts/MonitoringContext';
import Header from './components/Header';
import MobileHeader from './components/MobileHeader';
import LoadingSpinner from './components/LoadingSpinner';
import PerformanceMonitor from './components/PerformanceMonitor';
import AISecurityAssistant from './components/AISecurityAssistant';
import NotificationCenter from './components/NotificationCenter';
import './i18n';
import './App.css';
import socketService from './services/socketService';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SecurityPanel = lazy(() => import('./pages/SecurityPanel'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const ZeroTrustPanel = lazy(() => import('./components/ZeroTrustPanel'));
const ComplianceDashboard = lazy(() => import('./components/ComplianceDashboard'));
const IncidentResponse = lazy(() => import('./components/IncidentResponse'));
const AIThreatPredictor = lazy(() => import('./components/AIThreatPredictor'));
const DevRealtime = lazy(() => import('./pages/DevRealtime'));
const DevSpam = lazy(() => import('./pages/DevSpam'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./components/NotFound'));

// Route protection component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Main app content
function AppContent() {
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const socket = socketService.connect();
      // Example: join a user-specific room
      socketService.join('global');
      return () => socketService.disconnect();
    }
  }, [isAuthenticated]);

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && (
          isMobile ? <MobileHeader /> : <Header />
        )}
        
        <main className={`main-content ${isAuthenticated ? 'authenticated' : 'unauthenticated'}`}>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/security" element={
                <ProtectedRoute>
                  <SecurityPanel />
                </ProtectedRoute>
              } />
              
              <Route path="/reports" element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/dev/realtime" element={
                <ProtectedRoute>
                  <DevRealtime />
                </ProtectedRoute>
              } />
              <Route path="/dev/spam" element={
                <ProtectedRoute>
                  <DevSpam />
                </ProtectedRoute>
              } />
              
              <Route path="/zero-trust" element={
                <ProtectedRoute>
                  <ZeroTrustPanel />
                </ProtectedRoute>
              } />
              
              <Route path="/compliance" element={
                <ProtectedRoute>
                  <ComplianceDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/incidents" element={
                <ProtectedRoute>
                  <IncidentResponse />
                </ProtectedRoute>
              } />
              
              <Route path="/threat-prediction" element={
                <ProtectedRoute>
                  <AIThreatPredictor />
                </ProtectedRoute>
              } />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        {/* Global Components */}
        {isAuthenticated && (
          <>
            <PerformanceMonitor />
            <AISecurityAssistant />
            <NotificationCenter />
          </>
        )}
      </div>
    </Router>
  );
}

// Main App component
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <MonitoringProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </MonitoringProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;