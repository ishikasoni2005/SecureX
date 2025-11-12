import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function IncidentResponse() {
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [responsePlaybooks, setResponsePlaybooks] = useState([]);
  const [teamStatus, setTeamStatus] = useState({});

  useEffect(() => {
    loadIncidentData();
    loadPlaybooks();
    loadTeamStatus();
  }, []);

  const loadIncidentData = () => {
    const mockIncidents = [
      {
        id: 'INC-2024-001',
        title: 'Suspected Data Exfiltration',
        severity: 'critical',
        status: 'investigating',
        assignedTo: 'John Doe',
        createdAt: new Date('2024-01-20T10:30:00'),
        lastUpdated: new Date('2024-01-20T14:45:00'),
        description: 'Unusual outbound traffic patterns detected',
        indicators: ['Large data transfers', 'Unknown external IPs', 'After-hours activity'],
        affectedSystems: ['Database Server', 'File Storage'],
        timeline: [
          { time: '10:30', action: 'Incident detected', user: 'System' },
          { time: '10:45', action: 'Initial assessment', user: 'John Doe' },
          { time: '11:30', action: 'Containment initiated', user: 'John Doe' }
        ]
      },
      {
        id: 'INC-2024-002',
        title: 'Phishing Campaign Targeting Employees',
        severity: 'high',
        status: 'contained',
        assignedTo: 'Jane Smith',
        createdAt: new Date('2024-01-20T08:15:00'),
        lastUpdated: new Date('2024-01-20T12:30:00'),
        description: 'Targeted phishing emails with malicious attachments',
        indicators: ['Spoofed sender addresses', 'Malicious attachments', 'Social engineering'],
        affectedSystems: ['Email System', 'User Workstations'],
        timeline: [
          { time: '08:15', action: 'First report received', user: 'User' },
          { time: '08:30', action: 'Email filtering updated', user: 'Jane Smith' },
          { time: '09:00', action: 'User awareness notification', user: 'Jane Smith' }
        ]
      }
    ];

    setActiveIncidents(mockIncidents);
  };

  const loadPlaybooks = () => {
    const playbooks = [
      {
        id: 1,
        name: 'Ransomware Response',
        category: 'Malware',
        lastDrill: '2024-01-15',
        effectiveness: 95,
        steps: [
          'Isolate affected systems',
          'Identify ransomware variant',
          'Activate backup recovery',
          'Notify law enforcement'
        ]
      },
      {
        id: 2,
        name: 'Data Breach Response',
        category: 'Data Loss',
        lastDrill: '2024-01-10',
        effectiveness: 92,
        steps: [
          'Contain the breach',
          'Assess data exposure',
          'Notify affected parties',
          'Regulatory reporting'
        ]
      },
      {
        id: 3,
        name: 'DDoS Mitigation',
        category: 'Availability',
        lastDrill: '2024-01-18',
        effectiveness: 98,
        steps: [
          'Activate DDoS protection',
          'Traffic analysis',
          'ISP coordination',
          'Service restoration'
        ]
      }
    ];

    setResponsePlaybooks(playbooks);
  };

  const loadTeamStatus = () => {
    setTeamStatus({
      available: 8,
      busy: 3,
      offline: 1,
      averageResponseTime: '12 minutes',
      slaCompliance: '98.7%'
    });
  };

  const startIncident = (playbook) => {
    const newIncident = {
      id: `INC-${new Date().getFullYear()}-${String(activeIncidents.length + 1).padStart(3, '0')}`,
      title: `New ${playbook.name} Incident`,
      severity: 'high',
      status: 'new',
      assignedTo: 'Unassigned',
      createdAt: new Date(),
      playbook: playbook.id
    };

    setActiveIncidents(prev => [newIncident, ...prev]);
  };

  const updateIncidentStatus = (incidentId, newStatus) => {
    setActiveIncidents(prev =>
      prev.map(incident =>
        incident.id === incidentId
          ? {
              ...incident,
              status: newStatus,
              lastUpdated: new Date()
            }
          : incident
      )
    );
  };

  const incidentMetrics = [
    { day: 'Mon', incidents: 12, resolved: 10 },
    { day: 'Tue', incidents: 8, resolved: 7 },
    { day: 'Wed', incidents: 15, resolved: 14 },
    { day: 'Thu', incidents: 10, resolved: 9 },
    { day: 'Fri', incidents: 5, resolved: 4 }
  ];

  return (
    <div className="incident-response">
      <div className="response-header">
        <h1>Incident Response Center</h1>
        <div className="team-status">
          <div className="status-item">
            <span className="label">Available:</span>
            <span className="value available">{teamStatus.available}</span>
          </div>
          <div className="status-item">
            <span className="label">Avg Response:</span>
            <span className="value">{teamStatus.averageResponseTime}</span>
          </div>
          <div className="status-item">
            <span className="label">SLA:</span>
            <span className="value compliant">{teamStatus.slaCompliance}</span>
          </div>
        </div>
      </div>

      <div className="response-grid">
        {/* Active Incidents */}
        <div className="incidents-section">
          <div className="section-header">
            <h2>Active Incidents</h2>
            <button className="btn-primary">New Incident</button>
          </div>

          <div className="incidents-list">
            {activeIncidents.map(incident => (
              <div key={incident.id} className={`incident-card severity-${incident.severity}`}>
                <div className="incident-header">
                  <div className="incident-info">
                    <h3>{incident.id}: {incident.title}</h3>
                    <div className="incident-meta">
                      <span className={`severity-badge severity-${incident.severity}`}>
                        {incident.severity}
                      </span>
                      <span className="status">{incident.status}</span>
                      <span className="assigned-to">Assigned to: {incident.assignedTo}</span>
                    </div>
                  </div>
                  <div className="incident-actions">
                    <button 
                      className="btn-outline btn-sm"
                      onClick={() => updateIncidentStatus(incident.id, 'in-progress')}
                    >
                      Take Action
                    </button>
                    <button className="btn-primary btn-sm">
                      View Details
                    </button>
                  </div>
                </div>
                <div className="incident-timeline">
                  <h4>Recent Activity</h4>
                  {incident.timeline?.slice(0, 3).map((event, index) => (
                    <div key={index} className="timeline-event">
                      <span className="time">{event.time}</span>
                      <span className="action">{event.action}</span>
                      <span className="user">by {event.user}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Playbooks */}
        <div className="playbooks-section">
          <h2>Response Playbooks</h2>
          <div className="playbooks-grid">
            {responsePlaybooks.map(playbook => (
              <div key={playbook.id} className="playbook-card">
                <div className="playbook-header">
                  <h3>{playbook.name}</h3>
                  <span className="category">{playbook.category}</span>
                </div>
                <div className="playbook-meta">
                  <span>Last Drill: {playbook.lastDrill}</span>
                  <span>Effectiveness: {playbook.effectiveness}%</span>
                </div>
                <div className="playbook-steps">
                  <h4>Response Steps:</h4>
                  <ol>
                    {playbook.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
                <button 
                  className="btn-primary"
                  onClick={() => startIncident(playbook)}
                >
                  Activate Playbook
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Incident Metrics */}
      <div className="metrics-section">
        <h2>Incident Metrics</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Incident Trends</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={incidentMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="incidents" stroke="#ff6b6b" />
                <Line type="monotone" dataKey="resolved" stroke="#6bcf7f" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="metric-card">
            <h3>Response Time Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { range: '< 15min', count: 25 },
                { range: '15-30min', count: 18 },
                { range: '30-60min', count: 8 },
                { range: '> 60min', count: 2 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4dabf7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* War Room */}
      <div className="war-room">
        <h2>Incident War Room</h2>
        <div className="war-room-content">
          <div className="chat-section">
            <div className="chat-messages">
              <div className="message system">
                <span className="time">14:30</span>
                <span className="content">Incident INC-2024-001 declared</span>
              </div>
              <div className="message user">
                <span className="time">14:32</span>
                <span className="content">I'm taking lead on this incident</span>
              </div>
              <div className="message user">
                <span className="time">14:35</span>
                <span className="content">Initial containment measures in place</span>
              </div>
            </div>
            <div className="chat-input">
              <input type="text" placeholder="Type your message..." />
              <button className="btn-primary">Send</button>
            </div>
          </div>

          <div className="resources-section">
            <h4>Response Resources</h4>
            <div className="resource-list">
              <button className="resource-btn">📋 Incident Report Template</button>
              <button className="resource-btn">📞 Emergency Contacts</button>
              <button className="resource-btn">🔧 Forensic Tools</button>
              <button className="resource-btn">📚 Knowledge Base</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncidentResponse;