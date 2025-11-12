// Mock data service for development
export const getSecurityStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        criticalThreats: 12,
        activeAlerts: 47,
        protectedSystems: 156,
        networkTraffic: '2.4'
      });
    }, 500);
  });
};

export const getThreatFeed = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        malware: 45,
        phishing: 32,
        ddos: 18,
        bruteForce: 23,
        recentEvents: [
          {
            time: '10:23 AM',
            description: 'Suspicious login attempt from unknown IP',
            severity: 'high'
          },
          {
            time: '09:45 AM',
            description: 'Malware detected in user downloads',
            severity: 'critical'
          },
          {
            time: '08:12 AM',
            description: 'Multiple failed login attempts',
            severity: 'medium'
          },
          {
            time: '07:30 AM',
            description: 'System backup completed successfully',
            severity: 'low'
          }
        ]
      });
    }, 500);
  });
};

export const getSystemHealth = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        metrics: [
          { name: 'CPU', value: 75 },
          { name: 'Memory', value: 62 },
          { name: 'Storage', value: 45 },
          { name: 'Network', value: 88 }
        ],
        status: 'healthy',
        lastScan: new Date().toISOString()
      });
    }, 500);
  });
};

export const getNetworkActivity = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        timeline: [
          { time: '00:00', threats: 12 },
          { time: '04:00', threats: 8 },
          { time: '08:00', threats: 45 },
          { time: '12:00', threats: 23 },
          { time: '16:00', threats: 34 },
          { time: '20:00', threats: 18 }
        ],
        totalConnections: 1247,
        blockedConnections: 89
      });
    }, 500);
  });
};