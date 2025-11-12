import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

class SecureAPIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL || '/api/v1';
    this.retryAttempts = 3;
    this.timeout = 30000;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0'
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor for authentication and tracing
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('securex_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracing
        config.headers['X-Request-ID'] = uuidv4();
        config.headers['X-Client-Timestamp'] = new Date().toISOString();

        // Log request for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and retry logic
    this.client.interceptors.response.use(
      (response) => {
        // Log successful responses
        if (process.env.NODE_ENV === 'development') {
          console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Retry logic for network errors
        if (this.shouldRetry(error) && !originalRequest._retry) {
          originalRequest._retry = true;
          return this.retryRequest(originalRequest);
        }

        // Handle specific error cases
        await this.handleError(error);

        return Promise.reject(error);
      }
    );
  }

  shouldRetry(error) {
    return (
      error.code === 'ECONNABORTED' ||
      error.response?.status >= 500 ||
      !error.response
    );
  }

  async retryRequest(originalRequest) {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        return this.client(originalRequest);
      } catch (retryError) {
        if (attempt === this.retryAttempts) {
          throw retryError;
        }
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async handleError(error) {
    const errorContext = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      timestamp: new Date().toISOString()
    };

    // Log error for monitoring
    console.error('API Error:', errorContext);

    // Handle specific status codes
    switch (error.response?.status) {
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem('securex_token');
        window.location.href = '/login';
        break;
      case 403:
        // Forbidden - show access denied
        this.showNotification('Access denied. Insufficient permissions.', 'error');
        break;
      case 429:
        // Rate limited
        this.showNotification('Too many requests. Please try again later.', 'warning');
        break;
      case 500:
        // Server error
        this.showNotification('Server error. Please try again later.', 'error');
        break;
      default:
        this.showNotification('An unexpected error occurred.', 'error');
    }

    // Send error to monitoring service
    this.reportError(error);
  }

  showNotification(message, type = 'info') {
    // Implementation for showing user notifications
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  reportError(error) {
    // Send error to error reporting service (Sentry, etc.)
    if (window.monitoringService) {
      window.monitoringService.trackError(error);
    }
  }

  // Secure API methods with enhanced features
  async secureGet(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return this.transformResponse(response);
    } catch (error) {
      throw this.transformError(error);
    }
  }

  async securePost(endpoint, data = {}) {
    try {
      const response = await this.client.post(endpoint, data);
      return this.transformResponse(response);
    } catch (error) {
      throw this.transformError(error);
    }
  }

  async securePut(endpoint, data = {}) {
    try {
      const response = await this.client.put(endpoint, data);
      return this.transformResponse(response);
    } catch (error) {
      throw this.transformError(error);
    }
  }

  async secureDelete(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return this.transformResponse(response);
    } catch (error) {
      throw this.transformError(error);
    }
  }

  // Real-time data with WebSocket fallback
  async subscribeToRealtimeData(channel, callback) {
    if (this.supportsWebSockets()) {
      return this.setupWebSocket(channel, callback);
    } else {
      return this.setupPolling(channel, callback);
    }
  }

  supportsWebSockets() {
    return 'WebSocket' in window || 'MozWebSocket' in window;
  }

  setupWebSocket(channel, callback) {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsBase = process.env.REACT_APP_WS_BASE_URL || `${protocol}://${window.location.host}`;
    const wsUrl = `${wsBase}/api/v1/realtime/${channel}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`WebSocket connected to ${channel}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        callback(data);
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    ws.onclose = () => {
      console.log(`WebSocket disconnected from ${channel}`);
      // Attempt reconnection
      setTimeout(() => this.setupWebSocket(channel, callback), 5000);
    };

    return ws;
  }

  setupPolling(channel, callback) {
    const interval = setInterval(async () => {
      try {
        const data = await this.secureGet(`/realtime/${channel}`);
        callback(data);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }

  transformResponse(response) {
    return {
      data: response.data,
      status: response.status,
      headers: response.headers,
      requestId: response.config.headers['X-Request-ID']
    };
  }

  transformError(error) {
    return {
      message: error.response?.data?.message || error.message,
      code: error.response?.status || error.code,
      requestId: error.config?.headers['X-Request-ID'],
      timestamp: new Date().toISOString()
    };
  }

  // Batch requests for efficiency
  async batchRequests(requests) {
    const batchId = uuidv4();
    const batchPromises = requests.map((request, index) => 
      this.client(request).then(response => ({
        id: index,
        status: 'fulfilled',
        data: response.data
      })).catch(error => ({
        id: index,
        status: 'rejected',
        error: this.transformError(error)
      }))
    );

    const results = await Promise.allSettled(batchPromises);
    
    return {
      batchId,
      timestamp: new Date().toISOString(),
      results: results.map(result => result.value)
    };
  }

  // Cache management
  setCache(key, data, ttl = 300000) { // 5 minutes default
    const cacheItem = {
      data,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
  }

  getCache(key) {
    const cached = localStorage.getItem(`cache_${key}`);
    if (!cached) return null;

    const cacheItem = JSON.parse(cached);
    const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl;

    if (isExpired) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }

    return cacheItem.data;
  }

  clearCache(pattern = '') {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_') && key.includes(pattern)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export default new SecureAPIService();