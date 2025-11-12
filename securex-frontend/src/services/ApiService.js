import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || '/api/v1';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add auth token to requests
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('securex_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Handle responses
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('securex_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials) {
    const response = await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async logout() {
    await this.client.post('/auth/logout');
    localStorage.removeItem('securex_token');
  }

  // Security Data
  async getSecurityStats() {
    const response = await this.client.get('/security/stats');
    return response.data;
  }

  async getThreatFeed() {
    const response = await this.client.get('/threats/feed');
    return response.data;
  }

  async getSystemHealth() {
    const response = await this.client.get('/system/health');
    return response.data;
  }

  // Firewall Management
  async getFirewallRules() {
    const response = await this.client.get('/firewall/rules');
    return response.data;
  }

  async createFirewallRule(rule) {
    const response = await this.client.post('/firewall/rules', rule);
    return response.data;
  }

  async updateFirewallRule(id, rule) {
    const response = await this.client.put(`/firewall/rules/${id}`, rule);
    return response.data;
  }

  async deleteFirewallRule(id) {
    const response = await this.client.delete(`/firewall/rules/${id}`);
    return response.data;
  }

  // Reports
  async generateReport(params) {
    const response = await this.client.post('/reports/generate', params);
    return response.data;
  }

  async getReportHistory() {
    const response = await this.client.get('/reports/history');
    return response.data;
  }

  // Real-time Events (WebSocket)
  connectWebSocket() {
    const token = localStorage.getItem('securex_token');
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsBase = process.env.REACT_APP_WS_BASE_URL || `${protocol}://${window.location.host}`;
    const wsUrl = `${wsBase}/api/v1/events?token=${token}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Handle real-time events
      this.handleRealTimeEvent(data);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect
      setTimeout(() => this.connectWebSocket(), 5000);
    };
    
    return ws;
  }

  handleRealTimeEvent(event) {
    // Dispatch custom events for components to listen to
    const customEvent = new CustomEvent('securex-realtime', { detail: event });
    window.dispatchEvent(customEvent);
  }
}

export default new ApiService();