class RealTimeMonitor {
  constructor() {
    this.subscribers = new Map();
    this.connections = new Map();
    this.isConnected = false;
  }

  connect() {
    this.isConnected = true;
    console.log('RealTimeMonitor: Connected to security feed');
    
    // Simulate real-time security events
    this.startEventSimulation();
    this.startMetricsUpdate();
    this.startThreatFeed();
  }

  startEventSimulation() {
    setInterval(() => {
      const events = [
        {
          id: Date.now(),
          type: 'network_scan',
          severity: 'medium',
          source: `192.168.1.${Math.floor(Math.random() * 255)}`,
          description: 'Port scanning detected',
          timestamp: new Date()
        },
        {
          id: Date.now() + 1,
          type: 'malware_detected',
          severity: 'high',
          source: `10.0.0.${Math.floor(Math.random() * 255)}`,
          description: 'Suspicious file execution',
          timestamp: new Date()
        },
        {
          id: Date.now() + 2,
          type: 'brute_force',
          severity: 'critical',
          source: `172.16.0.${Math.floor(Math.random() * 255)}`,
          description: 'Multiple failed login attempts',
          timestamp: new Date()
        }
      ];

      const randomEvent = events[Math.floor(Math.random() * events.length)];
      this.notify('security_event', randomEvent);
    }, 8000); // Every 8 seconds
  }

  startMetricsUpdate() {
    setInterval(() => {
      const metrics = {
        cpu_usage: Math.floor(Math.random() * 30) + 40,
        memory_usage: Math.floor(Math.random() * 25) + 50,
        network_traffic: (Math.random() * 2 + 1).toFixed(1),
        active_threats: Math.floor(Math.random() * 10) + 5,
        blocked_attacks: Math.floor(Math.random() * 50) + 100
      };
      this.notify('metrics_update', metrics);
    }, 5000); // Every 5 seconds
  }

  startThreatFeed() {
    setInterval(() => {
      const threats = [
        {
          id: Date.now(),
          ioc: '94.140.114.1',
          type: 'C2 Server',
          confidence: 'high',
          first_seen: new Date(Date.now() - 86400000),
          description: 'Known command and control server'
        },
        {
          id: Date.now() + 1,
          ioc: 'malware.exe|md5:abc123',
          type: 'Malware',
          confidence: 'critical',
          first_seen: new Date(),
          description: 'New ransomware variant detected'
        }
      ];

      const randomThreat = threats[Math.floor(Math.random() * threats.length)];
      this.notify('threat_intel', randomThreat);
    }, 15000); // Every 15 seconds
  }

  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event).add(callback);
  }

  unsubscribe(event, callback) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).delete(callback);
    }
  }

  notify(event, data) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(callback => {
        callback(data);
      });
    }
  }

  disconnect() {
    this.isConnected = false;
    this.subscribers.clear();
    console.log('RealTimeMonitor: Disconnected');
  }
}

export default new RealTimeMonitor();