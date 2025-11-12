import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ComposedChart 
} from 'recharts';
import { format } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import './Dashboard.css';

function Dashboard({ data }) {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [animatedStats, setAnimatedStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useTheme();

  const [securityMetrics, setSecurityMetrics] = useState({
    criticalThreats: 12,
    activeAlerts: 47,
    protectedSystems: 156,
    networkTraffic: '2.4',
    systemHealth: 98.7,
    responseTime: 2.3,
    threatLevel: 'medium'
  });

  // Mock data for charts
  const threatTimeline = [
    { time: '00:00', threats: 12, blocked: 10, severity: 'low' },
    { time: '04:00', threats: 8, blocked: 7, severity: 'low' },
    { time: '08:00', threats: 45, blocked: 42, severity: 'high' },
    { time: '12:00', threats: 23, blocked: 21, severity: 'medium' },
    { time: '16:00', threats: 34, blocked: 32, severity: 'high' },
    { time: '20:00', threats: 18, blocked: 17, severity: 'medium' },
    { time: '24:00', threats: 15, blocked: 14, severity: 'low' }
  ];

  const threatDistribution = [
    { name: 'Malware', value: 45, color: '#ff6b6b' },
    { name: 'Phishing', value: 32, color: '#4dabf7' },
    { name: 'DDoS', value: 18, color: '#ffd93d' },
    { name: 'Brute Force', value: 23, color: '#6bcf7f' },
    { name: 'SQL Injection', value: 12, color: '#8884d8' }
  ];

  const systemMetrics = [
    { name: 'CPU', usage: 75, capacity: 100, status: 'optimal' },
    { name: 'Memory', usage: 62, capacity: 100, status: 'good' },
    { name: 'Storage', usage: 45, capacity: 100, status: 'good' },
    { name: 'Network', usage: 88, capacity: 100, status: 'high' }
  ];

  const recentEvents = [
    {
      id: 1,
      type: 'threat_detected',
      severity: 'high',
      title: 'Suspicious Login Pattern',
      description: 'Multiple failed login attempts from unknown IP',
      timestamp: new Date(),
      source: '192.168.1.100'
    },
    {
      id: 2,
      type: 'system_alert',
      severity: 'medium',
      title: 'High Memory Usage',
      description: 'Memory usage above 85% threshold',
      timestamp: new Date(Date.now() - 300000),
      source: 'Server-02'
    },
    {
      id: 3,
      type: 'threat_blocked',
      severity: 'low',
      title: 'Malware Blocked',
      description: 'Potential malware signature detected and blocked',
      timestamp: new Date(Date.now() - 600000),
      source: '192.168.1.150'
    },
    {
      id: 4,
      type: 'maintenance',
      severity: 'low',
      title: 'System Backup Completed',
      description: 'Regular system backup completed successfully',
      timestamp: new Date(Date.now() - 900000),
      source: 'Backup-System'
    }
  ];

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      animateNumbers(securityMetrics);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const animateNumbers = (metrics) => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    Object.keys(metrics).forEach(key => {
      if (typeof metrics[key] === 'number') {
        let current = 0;
        const target = metrics[key];
        const increment = target / steps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setAnimatedStats(prev => ({
            ...prev,
            [key]: Math.floor(current)
          }));
        }, stepDuration);
      }
    });
  };

  const COLORS = ['#ff6b6b', '#4dabf7', '#ffd93d', '#6bcf7f', '#8884d8'];

  if (isLoading) {
    return (
      <div className="dashboard-enhanced loading">
        <div className="loading-content">
          <div className="loading-spinner-large"></div>
          <h2>Initializing Security Dashboard</h2>
          <p>Loading threat intelligence and system metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-enhanced">
      {/* Animated Background */}
      <div className="dashboard-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      {/* Header Section */}
      <div className="dashboard-header-enhanced">
        <div className="header-content">
          <div className="title-section">
            <h1 className="dashboard-title">
              Security <span className="gradient-text">Operations</span> Center
            </h1>
            <p className="dashboard-subtitle">
              Real-time threat monitoring and security analytics
            </p>
          </div>
          <div className="header-stats">
            <div className="live-indicator">
              <div className="pulse-dot"></div>
              <span>LIVE</span>
            </div>
            <div className="last-updated">
              Last updated: {format(lastUpdated, 'PPpp')}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="overview-grid">
        <OverviewCard 
          title="Critical Threats"
          value={animatedStats.criticalThreats || securityMetrics.criticalThreats}
          change="+12%"
          trend="up"
          icon="🚨"
          color="var(--accent-primary)"
          delay="0s"
        />
        <OverviewCard 
          title="Active Alerts"
          value={animatedStats.activeAlerts || securityMetrics.activeAlerts}
          change="-5%"
          trend="down"
          icon="⚠️"
          color="var(--warning)"
          delay="0.1s"
        />
        <OverviewCard 
          title="Protected Systems"
          value={animatedStats.protectedSystems || securityMetrics.protectedSystems}
          change="+3%"
          trend="up"
          icon="✅"
          color="var(--success)"
          delay="0.2s"
        />
        <OverviewCard 
          title="Network Traffic"
          value={securityMetrics.networkTraffic}
          suffix=" GB"
          change="+0.3"
          trend="up"
          icon="📡"
          color="var(--info)"
          delay="0.3s"
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* Left Column */}
        <div className="content-column left">
          <ThreatActivityChart 
            data={threatTimeline}
            isDarkMode={isDarkMode}
          />
          <SystemHealthMetrics 
            metrics={systemMetrics}
          />
        </div>

        {/* Middle Column */}
        <div className="content-column middle">
          <ThreatRadar 
            data={threatDistribution}
          />
          <RecentEvents 
            events={recentEvents}
          />
        </div>

        {/* Right Column */}
        <div className="content-column right">
          <SecurityScore 
            score={securityMetrics.systemHealth}
            threatLevel={securityMetrics.threatLevel}
          />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

// Enhanced Overview Card Component
const OverviewCard = ({ title, value, suffix = '', change, trend, icon, color, delay }) => (
  <div 
    className="overview-card"
    style={{ 
      '--card-color': color,
      '--animation-delay': delay
    }}
  >

    
    <div className="card-glow"></div>
    <div className="card-content">
      <div className="card-header">
        <div className="card-icon">{icon}</div>
        <div className="card-trend">
          <span className={`trend ${trend}`}>
            {trend === 'up' ? '↗' : '↘'} {change}
          </span>
        </div>
      </div>
      <div className="card-value">
        {value}{suffix}
      </div>
      <div className="card-title">{title}</div>
    </div>
    <div className="card-wave"></div>
  </div>
);

// Threat Activity Chart with Enhanced Visuals
const ThreatActivityChart = ({ data, isDarkMode }) => (
  <div className="chart-card enhanced">
    <div className="chart-header">
      <h3>Threat Activity Timeline</h3>
      <span className="chart-badge">24H Overview</span>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <defs>
          <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6bcf7f" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#6bcf7f" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={isDarkMode ? '#2a2f3e' : '#f0f0f0'} 
        />
        <XAxis 
          dataKey="time" 
          tick={{ fill: isDarkMode ? '#a0a0a0' : '#666' }}
        />
        <YAxis 
          tick={{ fill: isDarkMode ? '#a0a0a0' : '#666' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: isDarkMode ? '#1e2435' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#2a2f3e' : '#e0e0e0'}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        />
        <Area 
          type="monotone" 
          dataKey="threats" 
          stroke="#ff6b6b"
          fill="url(#threatGradient)"
          strokeWidth={2}
          name="Total Threats"
        />
        <Area 
          type="monotone" 
          dataKey="blocked" 
          stroke="#6bcf7f"
          fill="url(#blockedGradient)"
          strokeWidth={2}
          name="Blocked Threats"
        />
        <Line 
          type="monotone" 
          dataKey="threats" 
          stroke="#ff6b6b"
          strokeWidth={2}
          dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  </div>
);

// Threat Radar Visualization
const ThreatRadar = ({ data }) => (
  <div className="chart-card enhanced radar-card">
    <div className="chart-header">
      <h3>Threat Distribution</h3>
      <span className="chart-badge">Real-time</span>
    </div>
    <div className="radar-container">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            animationBegin={0}
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke={entry.color}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="radar-legend">
        {data.map((threat, index) => (
          <div key={index} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: threat.color }}
            ></div>
            <span className="legend-label">{threat.name}</span>
            <span className="legend-value">{threat.value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// System Health Metrics with Progress Bars
const SystemHealthMetrics = ({ metrics }) => (
  <div className="chart-card enhanced">
    <div className="chart-header">
      <h3>System Health Metrics</h3>
      <span className="chart-badge">Live</span>
    </div>
    <div className="metrics-list">
      {metrics.map((metric, index) => (
        <div key={metric.name} className="metric-item">
          <div className="metric-info">
            <span className="metric-name">{metric.name}</span>
            <span className="metric-value">{metric.usage}%</span>
          </div>
          <div className="metric-bar">
            <div 
              className={`metric-fill ${metric.status}`}
              style={{ width: `${metric.usage}%` }}
            ></div>
          </div>
          <div className="metric-status">
            <span className={`status-dot ${metric.status}`}></span>
            {metric.status}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Security Score with Gauge
const SecurityScore = ({ score, threatLevel }) => (
  <div className="chart-card enhanced score-card">
    <div className="chart-header">
      <h3>Security Score</h3>
      <span className={`threat-level ${threatLevel}`}>{threatLevel}</span>
    </div>
    <div className="score-gauge">
      <div className="gauge-container">
        <div className="gauge">
          <div 
            className="gauge-fill"
            style={{ transform: `rotate(${(score / 100) * 180}deg)` }}
          ></div>
          <div className="gauge-center">
            <span className="score-value">{score}</span>
            <span className="score-label">Score</span>
          </div>
        </div>
      </div>
      <div className="score-breakdown">
        <div className="breakdown-item">
          <span className="breakdown-label">Threat Prevention</span>
          <span className="breakdown-value">95%</span>
        </div>
        <div className="breakdown-item">
          <span className="breakdown-label">System Uptime</span>
          <span className="breakdown-value">99.9%</span>
        </div>
        <div className="breakdown-item">
          <span className="breakdown-label">Response Time</span>
          <span className="breakdown-value">2.3s</span>
        </div>
      </div>
    </div>
  </div>
);

// Recent Events with Animations
const RecentEvents = ({ events }) => (
  <div className="chart-card enhanced events-card">
    <div className="chart-header">
      <h3>Recent Security Events</h3>
      <button className="view-all-btn">View All</button>
    </div>
    <div className="events-list">
      {events.map((event, index) => (
        <div 
          key={event.id} 
          className={`event-item ${event.severity}`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="event-icon">
            {event.severity === 'high' ? '🚨' : 
             event.severity === 'medium' ? '⚠️' : 'ℹ️'}
          </div>
          <div className="event-content">
            <div className="event-title">{event.title}</div>
            <div className="event-description">{event.description}</div>
            <div className="event-meta">
              <span className="event-source">{event.source}</span>
              <span className="event-time">
                {format(event.timestamp, 'HH:mm')}
              </span>
            </div>
          </div>
          <div className="event-indicator"></div>
        </div>
      ))}
    </div>
  </div>
);

// Quick Actions Panel
const QuickActions = () => (
  <div className="chart-card enhanced actions-card">
    <div className="chart-header">
      <h3>Quick Actions</h3>
    </div>
    <div className="actions-grid">
      <button className="action-btn primary">
        <span className="action-icon">🛡️</span>
        <span className="action-label">Run Security Scan</span>
      </button>
      <button className="action-btn secondary">
        <span className="action-icon">📊</span>
        <span className="action-label">Generate Report</span>
      </button>
      <button className="action-btn secondary">
        <span className="action-icon">🔍</span>
        <span className="action-label">Threat Hunt</span>
      </button>
      <button className="action-btn secondary">
        <span className="action-icon">⚙️</span>
        <span className="action-label">System Settings</span>
      </button>
    </div>
  </div>
);

export default Dashboard;