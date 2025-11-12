class EnvironmentConfig {
  constructor() {
    this.config = {
      // API Configuration
      api: {
        baseURL: process.env.REACT_APP_API_BASE_URL || '/api/v1',
        timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
        retryAttempts: parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS) || 3,
      },
      
      // Authentication
      auth: {
        enabled: process.env.REACT_APP_AUTH_ENABLED !== 'false',
        providers: {
          cognito: {
            enabled: process.env.REACT_APP_COGNITO_ENABLED === 'true',
            userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
            clientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
            domain: process.env.REACT_APP_COGNITO_DOMAIN,
          },
          okta: {
            enabled: process.env.REACT_APP_OKTA_ENABLED === 'true',
            issuer: process.env.REACT_APP_OKTA_ISSUER,
            clientId: process.env.REACT_APP_OKTA_CLIENT_ID,
          },
          azure: {
            enabled: process.env.REACT_APP_AZURE_ENABLED === 'true',
            tenantId: process.env.REACT_APP_AZURE_TENANT_ID,
            clientId: process.env.REACT_APP_AZURE_CLIENT_ID,
          }
        }
      },
      
      // Feature Flags
      features: {
        aiAssistant: process.env.REACT_APP_AI_ASSISTANT_ENABLED === 'true',
        zeroTrust: process.env.REACT_APP_ZERO_TRUST_ENABLED === 'true',
        threatPrediction: process.env.REACT_APP_THREAT_PREDICTION_ENABLED === 'true',
        complianceDashboard: process.env.REACT_APP_COMPLIANCE_DASHBOARD_ENABLED === 'true',
        incidentResponse: process.env.REACT_APP_INCIDENT_RESPONSE_ENABLED === 'true',
        realTimeMonitoring: process.env.REACT_APP_REAL_TIME_MONITORING_ENABLED === 'true',
      },
      
      // Monitoring & Analytics
      monitoring: {
        sentry: {
          enabled: process.env.REACT_APP_SENTRY_ENABLED === 'true',
          dsn: process.env.REACT_APP_SENTRY_DSN,
        },
        googleAnalytics: {
          enabled: process.env.REACT_APP_GA_ENABLED === 'true',
          trackingId: process.env.REACT_APP_GA_TRACKING_ID,
        },
        hotjar: {
          enabled: process.env.REACT_APP_HOTJAR_ENABLED === 'true',
          id: process.env.REACT_APP_HOTJAR_ID,
        }
      },
      
      // Performance
      performance: {
        lazyLoad: process.env.REACT_APP_LAZY_LOAD_ENABLED !== 'false',
        prefetch: process.env.REACT_APP_PREFETCH_ENABLED === 'true',
        cacheTTL: parseInt(process.env.REACT_APP_CACHE_TTL) || 300000,
        compression: process.env.REACT_APP_COMPRESSION_ENABLED === 'true',
      },
      
      // Security
      security: {
        encryptionKey: process.env.REACT_APP_ENCRYPTION_KEY,
        cspNonce: process.env.REACT_APP_CSP_NONCE,
        httpsOnly: process.env.REACT_APP_HTTPS_ONLY === 'true',
        corsOrigins: process.env.REACT_APP_CORS_ORIGINS?.split(',') || [],
      },
      
      // Internationalization
      i18n: {
        defaultLanguage: process.env.REACT_APP_DEFAULT_LANGUAGE || 'en',
        supportedLanguages: process.env.REACT_APP_SUPPORTED_LANGUAGES?.split(',') || ['en'],
        fallbackLanguage: process.env.REACT_APP_FALLBACK_LANGUAGE || 'en',
      },
      
      // Theme
      theme: {
        default: process.env.REACT_APP_DEFAULT_THEME || 'light',
        supported: process.env.REACT_APP_SUPPORTED_THEMES?.split(',') || ['light', 'dark'],
      }
    };
  }

  get(key, defaultValue = null) {
    return this._getNestedValue(this.config, key) ?? defaultValue;
  }

  set(key, value) {
    this._setNestedValue(this.config, key, value);
  }

  getAll() {
    return { ...this.config };
  }

  isFeatureEnabled(feature) {
    return this.get(`features.${feature}`) === true;
  }

  getApiConfig() {
    return this.get('api');
  }

  getAuthConfig() {
    return this.get('auth');
  }

  getMonitoringConfig() {
    return this.get('monitoring');
  }

  _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  _setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }

  // Environment detection
  isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }

  isStaging() {
    return process.env.REACT_APP_ENVIRONMENT === 'staging';
  }

  isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  getEnvironment() {
    return process.env.REACT_APP_ENVIRONMENT || 'development';
  }

  // Feature toggles at runtime
  enableFeature(feature) {
    this.set(`features.${feature}`, true);
  }

  disableFeature(feature) {
    this.set(`features.${feature}`, false);
  }

  // Configuration validation
  validate() {
    const errors = [];

    // Validate required production configuration
    if (this.isProduction()) {
      if (!this.get('security.encryptionKey')) {
        errors.push('REACT_APP_ENCRYPTION_KEY is required in production');
      }

      if (!this.get('api.baseURL')) {
        errors.push('REACT_APP_API_BASE_URL is required in production');
      }

      if (this.get('auth.enabled') && !this.getAuthConfig().providers.cognito.enabled) {
        errors.push('Authentication provider configuration is required');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }

    return true;
  }
}

export default new EnvironmentConfig();