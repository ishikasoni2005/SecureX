class RealTimeService {
  constructor() {
    this.listeners = new Map();
    this.connection = null;
  }

  connect() {
    // Simulate WebSocket connection
    this.connection = {
      send: (data) => console.log('Sending:', data),
      close: () => console.log('Connection closed')
    };

    // Simulate real-time updates
    this.startMockUpdates();
  }

  startMockUpdates() {
    setInterval(() => {
      this.notifyListeners('threatUpdate', {
        type: 'new_threat',
        data: {
          id: Date.now(),
          type: ['malware', 'phishing', 'ddos', 'bruteForce'][Math.floor(Math.random() * 4)],
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
          timestamp: new Date().toISOString()
        }
      });
    }, 10000); // Every 10 seconds

    setInterval(() => {
      this.notifyListeners('statsUpdate', {
        criticalThreats: Math.floor(Math.random() * 20),
        activeAlerts: Math.floor(Math.random() * 50),
        networkTraffic: (Math.random() * 5).toFixed(1)
      });
    }, 15000); // Every 15 seconds
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  unsubscribe(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        callback(data);
      });
    }
  }
}

export default new RealTimeService();