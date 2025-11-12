class ErrorRecoveryService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelays = [1000, 3000, 5000]; // Exponential backoff
    this.circuitBreakerStates = new Map();
  }

  async withRetry(operation, context = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Check circuit breaker
        if (this.isCircuitOpen(context.operationName)) {
          throw new Error(`Circuit breaker open for ${context.operationName}`);
        }

        const result = await operation();
        
        // Success - reset circuit breaker
        this.recordSuccess(context.operationName);
        return result;
        
      } catch (error) {
        lastError = error;
        
        // Record failure for circuit breaker
        this.recordFailure(context.operationName);
        
        // Check if we should retry
        if (!this.shouldRetry(error, attempt)) {
          break;
        }
        
        // Wait before retry
        const delay = this.retryDelays[attempt - 1] || this.retryDelays[this.retryDelays.length - 1];
        await this.delay(delay);
        
        console.warn(`Retry attempt ${attempt} for ${context.operationName} after ${delay}ms`);
      }
    }
    
    throw lastError;
  }

  shouldRetry(error, attempt) {
    // Don't retry on certain error types
    if (error.name === 'TypeError' || error.name === 'SyntaxError') {
      return false;
    }
    
    // Don't retry authentication errors
    if (error.status === 401 || error.status === 403) {
      return false;
    }
    
    // Only retry on network errors or server errors
    const retryableStatuses = [0, 502, 503, 504]; // 0 typically indicates network failure
    if (error.status && !retryableStatuses.includes(error.status)) {
      return false;
    }
    
    return attempt < this.maxRetries;
  }

  // Circuit Breaker Pattern
  recordSuccess(operationName) {
    if (!operationName) return;
    
    const state = this.getCircuitState(operationName);
    state.failures = 0;
    state.state = 'CLOSED';
    this.circuitBreakerStates.set(operationName, state);
  }

  recordFailure(operationName) {
    if (!operationName) return;
    
    const state = this.getCircuitState(operationName);
    state.failures++;
    
    if (state.failures >= 5) { // Threshold for opening circuit
      state.state = 'OPEN';
      state.lastFailureTime = Date.now();
      
      // Set timeout to half-open state
      setTimeout(() => {
        state.state = 'HALF_OPEN';
      }, 30000); // 30 seconds
    }
    
    this.circuitBreakerStates.set(operationName, state);
  }

  isCircuitOpen(operationName) {
    if (!operationName) return false;
    
    const state = this.getCircuitState(operationName);
    return state.state === 'OPEN';
  }

  getCircuitState(operationName) {
    if (!this.circuitBreakerStates.has(operationName)) {
      this.circuitBreakerStates.set(operationName, {
        state: 'CLOSED',
        failures: 0,
        lastFailureTime: 0
      });
    }
    
    return this.circuitBreakerStates.get(operationName);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Graceful degradation
  getFallbackData(operationName) {
    const fallbacks = {
      'getSecurityStats': () => ({
        criticalThreats: 0,
        activeAlerts: 0,
        protectedSystems: 0,
        networkTraffic: '0.0',
        isFallback: true
      }),
      'getThreatFeed': () => ({
        recentEvents: [],
        isFallback: true
      }),
      'getSystemHealth': () => ({
        status: 'unknown',
        metrics: [],
        isFallback: true
      })
    };
    
    return fallbacks[operationName] ? fallbacks[operationName]() : null;
  }

  // Recovery strategies
  async executeWithFallback(operation, context = {}) {
    try {
      return await this.withRetry(operation, context);
    } catch (error) {
      console.error(`Operation ${context.operationName} failed:`, error);
      
      // Try to get fallback data
      const fallbackData = this.getFallbackData(context.operationName);
      if (fallbackData) {
        console.warn(`Using fallback data for ${context.operationName}`);
        return fallbackData;
      }
      
      // If no fallback, rethrow the error
      throw error;
    }
  }

  // Cache recovery
  async getCachedWithFallback(cacheKey, operation, ttl = 300000) {
    try {
      // Try to get from cache first
      const cached = this.getFromCache(cacheKey);
      if (cached && !this.isCacheExpired(cached)) {
        return cached.data;
      }
      
      // Fetch fresh data
      const data = await this.executeWithFallback(operation, {
        operationName: `cache_${cacheKey}`
      });
      
      // Update cache
      this.setCache(cacheKey, data, ttl);
      return data;
      
    } catch (error) {
      // Try to return stale cache data if available
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.warn(`Returning stale cache data for ${cacheKey}`);
        return cached.data;
      }
      
      throw error;
    }
  }

  getFromCache(key) {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  setCache(key, data, ttl) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to set cache:', error);
    }
  }

  isCacheExpired(cacheItem) {
    return Date.now() - cacheItem.timestamp > cacheItem.ttl;
  }
}

export default new ErrorRecoveryService();