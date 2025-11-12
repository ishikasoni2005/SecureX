import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';

function SecurityAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = () => {
    // Mock advanced analytics data
    const threatCorrelation = [
      { source: 'External IP', malware: 45, phishing: 32, ddos: 18, bruteForce: 23 },
      { source: 'Internal Network', malware: 12, phishing: 8, ddos: 5, bruteForce: 15 },
      { source: 'VPN Users', malware: 8, phishing: 15, ddos: 3, bruteForce: 12 },
      { source: 'Third Party', malware: 22, phishing: 18, ddos: 8, bruteForce: 10 }
    ];

    const riskAssessment = [
      { subject: 'Network', score: 85, fullMark: 100 },
      { subject: 'Applications', score: 72, fullMark: 100 },
      { subject: 'Data', score: 68, fullMark: 100 },
      { subject: 'Users', score: 78, fullMark: 100 },
      { subject: 'Infrastructure', score: 90, fullMark: 100 }
    ];

    const attackPatterns = [
      { hour: '00:00', attacks: 12, blocked: 11 },
      { hour: '04:00', attacks: 8, blocked: 7 },
      { hour: '08:00', attacks: 45, blocked: 42 },
      { hour: '12:00', attacks: 38, blocked: 36 },
      { hour: '16:00', attacks: 52, blocked: 49 },
      { hour: '20:00', attacks: 28, blocked: 26 }
    ];

    const complianceMetrics = [
      { standard: 'PCI DSS', current: 98, required: 95 },
      { standard: 'HIPAA', current: 92, required: 90 },
      { standard: 'GDPR', current: 95, required: 90 },
      { standard: 'ISO 27001', current: 96, required: 85 }
    ];

    setAnalyticsData({
      threatCorrelation,
      riskAssessment,
      attackPatterns,
      complianceMetrics
    });
  };

  const COLORS = ['#ff6b6b', '#4dabf7', '#ffd93d', '#6bcf7f'];

  return (
    <div className="security-analytics">
      <div className="analytics-header">
        <h2>Advanced Security Analytics</h2>
        <div className="analytics-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="control-select"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Threat Correlation Analysis */}
        <div className="analytics-card">
          <h3>Threat Correlation Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.threatCorrelation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="malware" fill="#ff6b6b" name="Malware" />
              <Bar dataKey="phishing" fill="#4dabf7" name="Phishing" />
              <Bar dataKey="ddos" fill="#ffd93d" name="DDoS" />
              <Bar dataKey="bruteForce" fill="#6bcf7f" name="Brute Force" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Assessment Radar */}
        <div className="analytics-card">
          <h3>Security Risk Assessment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={analyticsData.riskAssessment}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar 
                name="Risk Score" 
                dataKey="score" 
                stroke="#667eea" 
                fill="#667eea" 
                fillOpacity={0.6} 
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Attack Patterns Timeline */}
        <div className="analytics-card">
          <h3>24-Hour Attack Patterns</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.attackPatterns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="attacks" 
                stroke="#ff6b6b" 
                fill="#ff6b6b" 
                fillOpacity={0.3} 
                name="Total Attacks"
              />
              <Area 
                type="monotone" 
                dataKey="blocked" 
                stroke="#6bcf7f" 
                fill="#6bcf7f" 
                fillOpacity={0.3} 
                name="Blocked Attacks"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Progress */}
        <div className="analytics-card">
          <h3>Compliance Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.complianceMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="standard" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="current" fill="#4dabf7" name="Current Score" />
              <Bar dataKey="required" fill="#e9ecef" name="Required Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Security Insights */}
      <div className="insights-section">
        <h3>AI Security Insights</h3>
        <div className="insights-grid">
          <div className="insight-card critical">
            <div className="insight-icon">🚨</div>
            <div className="insight-content">
              <h4>Elevated Brute Force Activity</h4>
              <p>23% increase in brute force attacks from Eastern European IP ranges</p>
              <div className="insight-actions">
                <button className="btn-sm btn-primary">Block Region</button>
                <button className="btn-sm btn-outline">Investigate</button>
              </div>
            </div>
          </div>
          
          <div className="insight-card warning">
            <div className="insight-icon">⚠️</div>
            <div className="insight-content">
              <h4>System Performance Impact</h4>
              <p>High CPU usage detected during peak attack hours</p>
              <div className="insight-actions">
                <button className="btn-sm btn-primary">Optimize</button>
                <button className="btn-sm btn-outline">View Details</button>
              </div>
            </div>
          </div>
          
          <div className="insight-card info">
            <div className="insight-icon">💡</div>
            <div className="insight-content">
              <h4>Security Optimization</h4>
              <p>Opportunity to improve firewall rule efficiency by 15%</p>
              <div className="insight-actions">
                <button className="btn-sm btn-primary">Optimize Rules</button>
                <button className="btn-sm btn-outline">Learn More</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecurityAnalytics;