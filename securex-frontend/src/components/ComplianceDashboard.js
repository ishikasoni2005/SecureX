import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area 
} from 'recharts';

function ComplianceDashboard() {
  const [complianceData, setComplianceData] = useState({});
  const [selectedFramework, setSelectedFramework] = useState('all');

  useEffect(() => {
    loadComplianceData();
  }, [selectedFramework]);

  const loadComplianceData = () => {
    // Mock compliance data for different frameworks
    const frameworks = {
      pcidss: {
        name: 'PCI DSS',
        version: '4.0',
        status: 'compliant',
        score: 98,
        requirements: 12,
        met: 12,
        lastAudit: '2024-01-15',
        controls: [
          { id: 1, name: 'Network Security', status: 'compliant', evidence: 'Firewall logs' },
          { id: 2, name: 'Data Protection', status: 'compliant', evidence: 'Encryption audit' },
          { id: 3, name: 'Access Control', status: 'compliant', evidence: 'IAM review' }
        ]
      },
      hipaa: {
        name: 'HIPAA',
        version: '2023',
        status: 'mostly_compliant',
        score: 92,
        requirements: 8,
        met: 7,
        lastAudit: '2024-01-10',
        controls: [
          { id: 1, name: 'Patient Data Access', status: 'compliant', evidence: 'Access logs' },
          { id: 2, name: 'Data Encryption', status: 'non_compliant', evidence: 'Missing encryption' }
        ]
      },
      gdpr: {
        name: 'GDPR',
        version: '2018',
        status: 'compliant',
        score: 95,
        requirements: 10,
        met: 10,
        lastAudit: '2024-01-20',
        controls: [
          { id: 1, name: 'Data Subject Rights', status: 'compliant', evidence: 'Process documentation' },
          { id: 2, name: 'Data Breach Notification', status: 'compliant', evidence: 'Incident response plan' }
        ]
      }
    };

    const complianceTrend = [
      { month: 'Jan', pcidss: 95, hipaa: 88, gdpr: 92 },
      { month: 'Feb', pcidss: 96, hipaa: 90, gdpr: 93 },
      { month: 'Mar', pcidss: 98, hipaa: 92, gdpr: 95 },
      { month: 'Apr', pcidss: 97, hipaa: 91, gdpr: 94 },
      { month: 'May', pcidss: 98, hipaa: 92, gdpr: 95 }
    ];

    const controlCoverage = [
      { category: 'Technical', covered: 45, total: 50 },
      { category: 'Administrative', covered: 38, total: 45 },
      { category: 'Physical', covered: 20, total: 25 },
      { category: 'Organizational', covered: 28, total: 30 }
    ];

    setComplianceData({
      frameworks,
      complianceTrend,
      controlCoverage
    });
  };

  const generateComplianceReport = (framework) => {
    // In real implementation, this would generate a PDF report
    alert(`Generating ${framework} compliance report...`);
  };

  const exportComplianceData = (format) => {
    alert(`Exporting compliance data as ${format}...`);
  };

  return (
    <div className="compliance-dashboard">
      <div className="dashboard-header">
        <h1>Compliance & Regulatory Dashboard</h1>
        <div className="header-actions">
          <select 
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="control-select"
          >
            <option value="all">All Frameworks</option>
            <option value="pcidss">PCI DSS</option>
            <option value="hipaa">HIPAA</option>
            <option value="gdpr">GDPR</option>
          </select>
          <button className="btn-primary" onClick={() => exportComplianceData('pdf')}>
            📊 Generate Report
          </button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="compliance-overview">
        <h2>Compliance Overview</h2>
        <div className="framework-cards">
          {Object.entries(complianceData.frameworks || {}).map(([key, framework]) => (
            <div key={key} className={`framework-card status-${framework.status}`}>
              <div className="framework-header">
                <h3>{framework.name}</h3>
                <span className="version">v{framework.version}</span>
              </div>
              <div className="compliance-score">
                <div className="score-circle">
                  <span className="score">{framework.score}%</span>
                </div>
                <div className="score-details">
                  <span className="status">{framework.status.replace('_', ' ')}</span>
                  <span className="requirements">
                    {framework.met}/{framework.requirements} requirements met
                  </span>
                </div>
              </div>
              <div className="framework-actions">
                <button 
                  className="btn-outline btn-sm"
                  onClick={() => generateComplianceReport(key)}
                >
                  View Details
                </button>
                <button className="btn-primary btn-sm">
                  Export Evidence
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Trends */}
      <div className="compliance-trends">
        <h2>Compliance Trend Analysis</h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={complianceData.complianceTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[80, 100]} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="pcidss" stackId="1" stroke="#ff6b6b" fill="#ff6b6b" fillOpacity={0.6} name="PCI DSS" />
            <Area type="monotone" dataKey="hipaa" stackId="1" stroke="#4dabf7" fill="#4dabf7" fillOpacity={0.6} name="HIPAA" />
            <Area type="monotone" dataKey="gdpr" stackId="1" stroke="#6bcf7f" fill="#6bcf7f" fillOpacity={0.6} name="GDPR" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Control Coverage */}
      <div className="control-coverage">
        <h2>Security Control Coverage</h2>
        <div className="coverage-grid">
          <div className="coverage-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={complianceData.controlCoverage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="covered" fill="#4dabf7" name="Covered Controls" />
                <Bar dataKey="total" fill="#e9ecef" name="Total Controls" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="coverage-stats">
            <h3>Coverage Statistics</h3>
            {complianceData.controlCoverage?.map(category => {
              const percentage = Math.round((category.covered / category.total) * 100);
              return (
                <div key={category.category} className="coverage-item">
                  <span className="category-name">{category.category}</span>
                  <div className="coverage-bar">
                    <div 
                      className="coverage-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="coverage-percentage">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="audit-trail">
        <h2>Recent Compliance Activities</h2>
        <div className="audit-table">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Framework</th>
                <th>Activity</th>
                <th>User</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2024-01-20 14:30</td>
                <td>PCI DSS</td>
                <td>Control 1.2.3 - Firewall Rule Review</td>
                <td>admin@securex.com</td>
                <td><span className="status-compliant">Compliant</span></td>
              </tr>
              <tr>
                <td>2024-01-20 13:15</td>
                <td>HIPAA</td>
                <td>Patient Data Access Audit</td>
                <td>auditor@securex.com</td>
                <td><span className="status-non-compliant">Non-Compliant</span></td>
              </tr>
              <tr>
                <td>2024-01-20 11:45</td>
                <td>GDPR</td>
                <td>Data Subject Request Processing</td>
                <td>privacy@securex.com</td>
                <td><span className="status-compliant">Compliant</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ComplianceDashboard;