class MonitoringService {
  constructor() {
    this.sentryEnabled = !!process.env.REACT_APP_SENTRY_DSN;
    this.gaEnabled = !!process.env.REACT_APP_GA_TRACKING_ID;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    try {
      if (this.sentryEnabled) {
        this.initSentry();
      }
      
      if (this.gaEnabled) {
        this.initGoogleAnalytics();
      }

      this.initPerformanceMonitoring();
      this.initialized = true;
      
      console.log('MonitoringService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MonitoringService:', error);
    }
  }

  initSentry() {
    // Mock Sentry initialization - in real implementation, you'd use @sentry/react
    console.log('Sentry monitoring initialized (mock)');
    
    // Real implementation would look like:
    /*
    import * as Sentry from '@sentry/react';
    
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: ['localhost', 'yourdomain.com'],
        }),
        new Sentry.Replay(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
    */
  }

  initGoogleAnalytics() {
    // Mock Google Analytics initialization
    console.log('Google Analytics initialized (mock)');
    
    // Real implementation would look like:
    /*
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', process.env.REACT_APP_GA_TRACKING_ID);
    */
  }

  initPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vitals' in window) {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = window['web-vitals'];
      
      getCLS(this.handleWebVital);
      getFID(this.handleWebVital);
      getFCP(this.handleWebVital);
      getLCP(this.handleWebVital);
      getTTFB(this.handleWebVital);
    }
  }

  handleWebVital = (metric) => {
    console.log('Web Vital:', metric);
    this.trackPerformance(metric);
  };

  trackEvent(category, action, label = null, value = null) {
    const eventData = {
      category,
      action,
      label,
      value,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    console.log('Tracking event:', eventData);

    // Send to analytics backend
    this.sendToBackend({
      type: 'event',
      ...eventData
    });

    // Send to Google Analytics if enabled
    if (this.gaEnabled && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }

    // Send to Sentry if enabled
    if (this.sentryEnabled && window.Sentry) {
      window.Sentry.addBreadcrumb({
        category: category,
        message: `${action}: ${label}`,
        level: 'info',
        data: { value }
      });
    }
  }

  trackError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    console.error('Application Error:', errorData);

    // Send to error reporting service
    this.sendToBackend({
      type: 'error',
      ...errorData
    });

    // Send to Sentry if enabled
    if (this.sentryEnabled && window.Sentry) {
      window.Sentry.captureException(error, {
        extra: context
      });
    }
  }

  trackPerformance(metric) {
    const performanceData = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    console.log('Performance metric:', performanceData);

    this.sendToBackend({
      type: 'performance',
      ...performanceData
    });

    // Send to Google Analytics if enabled
    if (this.gaEnabled && window.gtag) {
      window.gtag('event', 'performance_metric', {
        event_category: 'Performance',
        event_label: metric.name,
        value: Math.round(metric.value),
        non_interaction: true
      });
    }
  }

  trackPageView(path) {
    const pageViewData = {
      path,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      title: document.title
    };

    console.log('Page view:', pageViewData);

    this.sendToBackend({
      type: 'pageview',
      ...pageViewData
    });

    // Send to Google Analytics if enabled
    if (this.gaEnabled && window.gtag) {
      window.gtag('config', process.env.REACT_APP_GA_TRACKING_ID, {
        page_path: path,
        page_title: document.title
      });
    }
  }

  trackUserInteraction(element, action) {
    this.trackEvent('user_interaction', action, element);
  }

  trackApiCall(endpoint, method, status, duration) {
    this.trackEvent('api_call', method, endpoint, duration);
    
    if (status >= 400) {
      this.trackError(new Error(`API Error: ${endpoint} - ${status}`), {
        endpoint,
        method,
        status,
        duration
      });
    }
  }

  setUser(user) {
    this.user = user;
    
    // Set user in Sentry
    if (this.sentryEnabled && window.Sentry) {
      window.Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name
      });
    }

    // Set user in Google Analytics
    if (this.gaEnabled && window.gtag) {
      window.gtag('set', 'user_properties', {
        user_id: user.id,
        user_role: user.role
      });
    }
  }

  clearUser() {
    this.user = null;
    
    if (this.sentryEnabled && window.Sentry) {
      window.Sentry.setUser(null);
    }
  }

  sendToBackend(data) {
    // In a real implementation, this would send data to your monitoring backend
    try {
      // Example: Send to your analytics API
      fetch('/api/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        keepalive: true // Ensure request completes even if page unloads
      }).catch(error => {
        console.warn('Failed to send monitoring data:', error);
      });
    } catch (error) {
      console.warn('Error sending monitoring data:', error);
    }
  }

  // Performance monitoring helpers
  startTimer(name) {
    this.timers = this.timers || {};
    this.timers[name] = performance.now();
  }

  endTimer(name) {
    if (!this.timers || !this.timers[name]) {
      console.warn(`Timer '${name}' not found`);
      return null;
    }

    const duration = performance.now() - this.timers[name];
    this.trackPerformance({
      name: `timer_${name}`,
      value: duration,
      rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor'
    });

    delete this.timers[name];
    return duration;
  }

  // Resource monitoring
  monitorResources() {
    if ('performance' in window) {
      const resources = performance.getEntriesByType('resource');
      resources.forEach(resource => {
        this.trackPerformance({
          name: 'resource_load',
          value: resource.duration,
          rating: resource.duration < 500 ? 'good' : 'needs-improvement'
        });
      });
    }
  }

  // Memory monitoring (if supported)
  monitorMemory() {
    if (performance.memory) {
      const memory = performance.memory;
      this.trackPerformance({
        name: 'memory_usage',
        value: memory.usedJSHeapSize / 1048576, // Convert to MB
        rating: memory.usedJSHeapSize / memory.totalJSHeapSize < 0.7 ? 'good' : 'poor'
      });
    }
  }
}

// Create a singleton instance
const monitoringService = new MonitoringService();

// Make it available globally for debugging
if (process.env.NODE_ENV === 'development') {
  window.monitoringService = monitoringService;
}

export default monitoringService;