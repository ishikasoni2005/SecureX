import React, { createContext, useContext, useEffect } from 'react';
import MonitoringService from '../services/monitoringService';
import { usePerformance } from '../hooks/usePerformance';

const MonitoringContext = createContext();

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};

export const MonitoringProvider = ({ children }) => {
  const performanceMetrics = usePerformance();

  useEffect(() => {
    // Initialize monitoring service
    if (MonitoringService && typeof MonitoringService.init === 'function') {
      MonitoringService.init();
    } else {
      console.warn('MonitoringService not properly initialized');
    }

    // Track initial page view
    MonitoringService.trackPageView(window.location.pathname);

    // Set up performance monitoring
    const performanceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          MonitoringService.trackPerformance({
            name: 'page_load',
            value: entry.loadEventEnd - entry.fetchStart,
            rating: 'good'
          });
        }
        
        if (entry.entryType === 'resource') {
          MonitoringService.trackPerformance({
            name: 'resource_load',
            value: entry.duration,
            rating: entry.duration < 500 ? 'good' : 'needs-improvement'
          });
        }
      });
    });

    try {
      performanceObserver.observe({ entryTypes: ['navigation', 'resource'] });
    } catch (error) {
      console.warn('PerformanceObserver not supported:', error);
    }

    // Monitor memory usage periodically
    const memoryInterval = setInterval(() => {
      if (performance.memory) {
        MonitoringService.trackPerformance({
          name: 'memory_usage_mb',
          value: performance.memory.usedJSHeapSize / 1048576,
          rating: 'good'
        });
      }
    }, 30000);

    return () => {
      performanceObserver.disconnect();
      clearInterval(memoryInterval);
    };
  }, []);

  useEffect(() => {
    // Report performance metrics
    if (performanceMetrics.fps > 0) {
      MonitoringService.trackPerformance({
        name: 'fps',
        value: performanceMetrics.fps,
        rating: performanceMetrics.fps > 30 ? 'good' : 'poor'
      });
    }
  }, [performanceMetrics]);

  const trackEvent = (category, action, label, value) => {
    MonitoringService.trackEvent(category, action, label, value);
  };

  const trackError = (error, context) => {
    MonitoringService.trackError(error, context);
  };

  const trackPageView = (path) => {
    MonitoringService.trackPageView(path);
  };

  const value = {
    trackEvent,
    trackError,
    trackPageView,
    performanceMetrics
  };

  return (
    <MonitoringContext.Provider value={value}>
      {children}
    </MonitoringContext.Provider>
  );
};