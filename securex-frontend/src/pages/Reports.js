import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, AreaChart, Area 
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

function Reports({ data }) {
  const [dateRange, setDateRange] = useState('7d');
  const [reportType, setReportType] = useState('security');
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = () => {
    // Mock analytics data based on date range
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    
    const securityIncidents = generateTimeSeriesData(days, ['malware', 'phishing', 'ddos', 'bruteForce']);
    const systemPerformance = generatePerformanceData();
    const threatDistribution = generateThreatDistribution();
    const complianceData = generateComplianceData();

    setAnalyticsData({
      securityIncidents,
      systemPerformance,
      threatDistribution,
      complianceData
    });
  };

  const generateTimeSeriesData = (days, types) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const entry = {
        date: format(date, 'MMM dd'),
        total: 0
      };
      
      types.forEach(type => {
        const count = Math.floor(Math.random() * 20) + 5;
        entry[type] = count;
        entry.total += count;
      });
      
      data.push(entry);
    }
    return data;
  };

  const generatePerformanceData = () => [
    { metric: 'Threat Detection Rate', current: 94, target: 95, trend: 'up' },
    { metric: 'False Positive Rate', current: 2.3, target: 3, trend: 'down' },
    { metric: 'Mean Time to Detect', current: 45, target: 60, trend: 'up' },
    { metric: 'Mean Time to Respond', current: 120, target: 180, trend: 'up' },
    { metric: 'System Availability', current: 99.8, target: 99.5, trend: 'up' }
  ];

  const generateThreatDistribution = () => [
    { name: 'Malware', value: 45, blocked: 42 },
    { name: 'Phishing', value: 32, blocked: 30 },
    { name: 'DDoS', value: 18, blocked: 15 },
    { name: 'Brute Force', value: 23, blocked: 22 },
    { name: 'SQL Injection', value: 12, blocked: 11 }
  ];

  const generateComplianceData = () => [
    { standard: 'PCI DSS', compliance: 98, requirements: 12 },
    { standard: 'HIPAA', compliance: 95, requirements: 8 },
    { standard: 'GDPR', compliance: 92, requirements: 10 },
    { standard: 'ISO 27001', compliance: 96, requirements: 14 }
  ];

  const COLORS = ['#ff6b6b', '#4dabf7', '#ffd93d', '#6bcf7f', '#8884d8'];

  const exportReport = (format) => {
    alert(`Exporting ${reportType} report as ${format.toUpperCase()}`);
  };

  return (
    <div className="reports">
      <div className="reports-header">
        <div className="header-content">
          <h1>Security Analytics & Reporting</h1>
          <p>Comprehensive security insights and compliance reporting</p>
        </div>
        <div className="report-controls">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="control-select">
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="control-select">
            <option value="security">Security Overview</option>
            <option value="performance">Performance</option>
            <option value="compliance">Compliance</option>
            <option value="threats">Threat Analysis</option>
          </select>
          
          <button className="btn-primary" onClick={() => exportReport('pdf')}>
            📊 Generate Report
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="kpi-summary">
        <div className="kpi-card">
          <div className="kpi-value">1,247</div>
          <div className="kpi-label">Total Incidents</div>
          <div className="kpi-trend positive">+12%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">94.2%</div>
          <div className="kpi-label">Block Rate</div>
          <div className="kpi-trend positive">+2.1%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">45s</div>
          <div className="kpi-label">Avg Response Time</div>
          <div className="kpi-trend negative">-5s</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">98.7%</div>
          <div className="kpi-label">Compliance Score</div>
          <div className="kpi-trend positive">+1.2%</div>
        </div>
      </div>

      {/* Security Incidents Timeline */}
      <div className="report-section">
        <h2>Security Incidents Timeline</h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={analyticsData.securityIncidents}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="malware" stackId="1" stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.6} />
            <Area type="monotone" dataKey="phishing" stackId="1" stroke="#4dabf7" fill="#4dabf7" fillOpacity={0.6} />
            <Area type="monotone" dataKey="ddos" stackId="1" stroke="#ffd93d" fill="#ffd93d" fillOpacity={0.6} />
            <Area type="monotone" dataKey="bruteForce" stackId="1" stroke="#6bcf7f" fill="#6bcf7f" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="charts-grid">
        {/* Threat Distribution */}
        <div className="chart-card">
          <h3>Threat Distribution & Block Rates</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.threatDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Total Threats" />
              <Bar dataKey="blocked" fill="#82ca9d" name="Blocked Threats" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Metrics */}
        <div className="chart-card">
          <h3>Security Performance Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.systemPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="current" fill="#4dabf7" name="Current" />
              <Bar dataKey="target" fill="#e9ecef" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Status */}
        <div className="chart-card">
          <h3>Compliance Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.complianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="standard" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="compliance" fill="#6bcf7f" name="Compliance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Response Times */}
        <div className="chart-card">
          <h3>Incident Response Times</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.securityIncidents}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#ff6b6b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Options */}
      <div className="export-section">
        <h3>Export Reports</h3>
        <div className="export-options">
          <button className="export-btn" onClick={() => exportReport('pdf')}>
            <span className="export-icon">📄</span>
            PDF Report
          </button>
          <button className="export-btn" onClick={() => exportReport('excel')}>
            <span className="export-icon">📊</span>
            Excel Data
          </button>
          <button className="export-btn" onClick={() => exportReport('csv')}>
            <span className="export-icon">📋</span>
            CSV Export
          </button>
          <button className="export-btn" onClick={() => exportReport('json')}>
            <span className="export-icon">🔗</span>
            JSON API
          </button>
        </div>
      </div>
    </div>
  );
}

export default Reports;