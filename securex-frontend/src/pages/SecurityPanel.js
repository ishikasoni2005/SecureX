import React, { useState, useEffect } from 'react';
import RealTimeMonitor from '../services/realTimeMonitor';
import speechService from '../services/speechService';
import callService from '../services/callService';

function SecurityPanel({ data }) {
  const [activeTab, setActiveTab] = useState('firewall');
  const [realTimeEvents, setRealTimeEvents] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({});
  const [threatIntel, setThreatIntel] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    // Start real-time monitoring
    RealTimeMonitor.connect();
    setIsMonitoring(true);

    // Subscribe to real-time events
    RealTimeMonitor.subscribe('security_event', (event) => {
      setRealTimeEvents(prev => [event, ...prev.slice(0, 19)]); // Keep last 20 events
    });

    RealTimeMonitor.subscribe('metrics_update', (metrics) => {
      setSystemMetrics(metrics);
    });

    RealTimeMonitor.subscribe('threat_intel', (threat) => {
      setThreatIntel(prev => [threat, ...prev.slice(0, 9)]); // Keep last 10 threats
    });

    return () => {
      RealTimeMonitor.unsubscribe('security_event');
      RealTimeMonitor.unsubscribe('metrics_update');
      RealTimeMonitor.unsubscribe('threat_intel');
    };
  }, []);

  // Bind callService to auto start/stop STT on call events
  useEffect(() => {
    callService.connect('global');
    callService.setHandlers({
      onTranscript: (text) => setTranscript(text || ''),
      onStatus: ({ status }) => setTranscribing(status === 'recording' || status === 'transcribing')
    });
  }, []);

  // Keyboard shortcut: press 'm' to toggle recording
  useEffect(() => {
    const onKey = async (e) => {
      if (e.key.toLowerCase() === 'm') {
        if (!transcribing) {
          try {
            setTranscript('');
            setTranscribing(true);
            await speechService.startRecording();
          } catch (err) {
            console.error(err);
            setTranscribing(false);
          }
        } else {
          try {
            const text = await speechService.stopAndTranscribe();
            setTranscript(text || '');
          } catch (err) {
            console.error(err);
          } finally {
            setTranscribing(false);
          }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [transcribing]);

  const startMonitoring = () => {
    RealTimeMonitor.connect();
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    RealTimeMonitor.disconnect();
    setIsMonitoring(false);
  };

  const firewallRules = [
    { id: 1, name: 'HTTP Traffic', protocol: 'TCP', port: '80', action: 'ALLOW', status: 'active', source: 'Any', destination: 'Web Servers' },
    { id: 2, name: 'SSH Access', protocol: 'TCP', port: '22', action: 'ALLOW', status: 'active', source: 'Admin Network', destination: 'All Servers' },
    { id: 3, name: 'Database Block', protocol: 'TCP', port: '3306', action: 'DENY', status: 'active', source: 'Any', destination: 'Database' },
    { id: 4, name: 'FTP Block', protocol: 'TCP', port: '21', action: 'DENY', status: 'active', source: 'Any', destination: 'All' }
  ];

  const idsRules = [
    { id: 1, name: 'Brute Force Detection', severity: 'High', status: 'enabled', triggers: 47 },
    { id: 2, name: 'Port Scan Detection', severity: 'Medium', status: 'enabled', triggers: 23 },
    { id: 3, name: 'SQL Injection Prevention', severity: 'Critical', status: 'enabled', triggers: 12 },
    { id: 4, name: 'Malware Execution Block', severity: 'Critical', status: 'enabled', triggers: 8 }
  ];

  return (
    <div className="security-panel">
      <div className="panel-header">
        <div className="header-content">
          <h1>Security Operations Center</h1>
          <div className="monitoring-status">
            <div className={`status-indicator ${isMonitoring ? 'active' : 'inactive'}`}></div>
            Real-time Monitoring: <strong>{isMonitoring ? 'ACTIVE' : 'INACTIVE'}</strong>
            {isMonitoring ? (
              <button className="btn-warning btn-sm" onClick={stopMonitoring}>
                Stop Monitoring
              </button>
            ) : (
              <button className="btn-success btn-sm" onClick={startMonitoring}>
                Start Monitoring
              </button>
            )}
          </div>
          <div style={{ marginTop: '8px' }}>
            {!transcribing ? (
              <button className="btn-primary btn-sm" onClick={async () => {
                try {
                  setTranscript('');
                  setTranscribing(true);
                  await speechService.startRecording();
                } catch (e) {
                  console.error(e);
                  setTranscribing(false);
                }
              }}>
                🎙️ Start Recording
              </button>
            ) : (
              <button className="btn-warning btn-sm" onClick={async () => {
                try {
                  const text = await speechService.stopAndTranscribe();
                  setTranscript(text || '');
                } catch (e) {
                  console.error(e);
                } finally {
                  setTranscribing(false);
                }
              }}>
                ⏹️ Stop & Transcribe
              </button>
            )}
          </div>
        </div>
        <div className="header-metrics">
          <div className="metric-item">
            <span className="metric-label">CPU</span>
            <span className="metric-value">{systemMetrics.cpu_usage || 0}%</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Memory</span>
            <span className="metric-value">{systemMetrics.memory_usage || 0}%</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Threats</span>
            <span className="metric-value">{systemMetrics.active_threats || 0}</span>
          </div>
        </div>
      </div>

      <div className="security-tabs">
        <button className={`tab-btn ${activeTab === 'firewall' ? 'active' : ''}`} onClick={() => setActiveTab('firewall')}>
          🛡️ Firewall
        </button>
        <button className={`tab-btn ${activeTab === 'ids' ? 'active' : ''}`} onClick={() => setActiveTab('ids')}>
          🔍 Intrusion Detection
        </button>
        <button className={`tab-btn ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('monitoring')}>
          📡 Real-time Monitor
        </button>
        <button className={`tab-btn ${activeTab === 'threats' ? 'active' : ''}`} onClick={() => setActiveTab('threats')}>
          🚨 Threat Intelligence
        </button>
      </div>

      <div className="tab-content">
        {transcript && (
          <div className="section" style={{ marginBottom: '16px' }}>
            <div className="section-header">
              <h2>Transcription</h2>
            </div>
            <div className="card" style={{ padding: '12px' }}>
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{transcript}</pre>
            </div>
          </div>
        )}
        {activeTab === 'firewall' && (
          <FirewallSection rules={firewallRules} />
        )}

        {activeTab === 'ids' && (
          <IDSSection rules={idsRules} />
        )}

        {activeTab === 'monitoring' && (
          <MonitoringSection events={realTimeEvents} />
        )}

        {activeTab === 'threats' && (
          <ThreatIntelligenceSection threats={threatIntel} />
        )}
      </div>
    </div>
  );
}

// Firewall Section Component
const FirewallSection = ({ rules }) => (
  <div className="section">
    <div className="section-header">
      <h2>Firewall Rules Management</h2>
      <div className="section-actions">
        <button className="btn-primary">Add Rule</button>
        <button className="btn-secondary">Export Rules</button>
      </div>
    </div>
    
    <div className="table-container">
      <table className="security-table">
        <thead>
          <tr>
            <th>Rule Name</th>
            <th>Protocol</th>
            <th>Port</th>
            <th>Source</th>
            <th>Destination</th>
            <th>Action</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map(rule => (
            <tr key={rule.id}>
              <td>{rule.name}</td>
              <td><code>{rule.protocol}</code></td>
              <td><code>{rule.port}</code></td>
              <td>{rule.source}</td>
              <td>{rule.destination}</td>
              <td>
                <span className={`badge badge-${rule.action === 'ALLOW' ? 'success' : 'danger'}`}>
                  {rule.action}
                </span>
              </td>
              <td>
                <span className={`badge badge-${rule.status === 'active' ? 'success' : 'secondary'}`}>
                  {rule.status}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button className="btn-sm btn-outline">Edit</button>
                  <button className="btn-sm btn-danger">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// IDS Section Component
const IDSSection = ({ rules }) => (
  <div className="section">
    <div className="section-header">
      <h2>Intrusion Detection System</h2>
      <div className="section-actions">
        <button className="btn-primary">New Rule</button>
        <button className="btn-warning">Run Scan</button>
      </div>
    </div>

    <div className="cards-grid">
      {rules.map(rule => (
        <div key={rule.id} className="card">
          <div className="card-header">
            <h3>{rule.name}</h3>
            <span className={`severity-badge severity-${rule.severity.toLowerCase()}`}>
              {rule.severity}
            </span>
          </div>
          <div className="card-body">
            <div className="card-metrics">
              <div className="metric">
                <span className="metric-value">{rule.triggers}</span>
                <span className="metric-label">Triggers</span>
              </div>
              <div className="metric">
                <span className="metric-value">{rule.status}</span>
                <span className="metric-label">Status</span>
              </div>
            </div>
          </div>
          <div className="card-footer">
            <button className="btn-sm btn-outline">Configure</button>
            <button className={`btn-sm ${rule.status === 'enabled' ? 'btn-warning' : 'btn-success'}`}>
              {rule.status === 'enabled' ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Real-time Monitoring Section
const MonitoringSection = ({ events }) => (
  <div className="section">
    <div className="section-header">
      <h2>Real-time Security Monitoring</h2>
      <div className="live-indicator">
        <div className="pulse"></div>
        LIVE
      </div>
    </div>

    <div className="events-feed">
      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📡</div>
          <h3>No Security Events</h3>
          <p>Security events will appear here in real-time</p>
        </div>
      ) : (
        events.map(event => (
          <div key={event.id} className={`event-card severity-${event.severity}`}>
            <div className="event-header">
              <span className="event-type">{event.type.replace('_', ' ').toUpperCase()}</span>
              <span className="event-time">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="event-body">
              <p className="event-description">{event.description}</p>
              <div className="event-meta">
                <span className="event-source">
                  <strong>Source:</strong> {event.source}
                </span>
                <span className={`event-severity severity-${event.severity}`}>
                  {event.severity.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="event-actions">
              <button className="btn-sm btn-outline">Investigate</button>
              <button className="btn-sm btn-primary">Block Source</button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// Threat Intelligence Section
const ThreatIntelligenceSection = ({ threats }) => (
  <div className="section">
    <div className="section-header">
      <h2>Threat Intelligence Feed</h2>
      <div className="section-actions">
        <button className="btn-primary">Update Feed</button>
        <button className="btn-secondary">Export IOC</button>
      </div>
    </div>

    <div className="threats-grid">
      {threats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No Threat Intelligence</h3>
          <p>Threat indicators will appear here as they are detected</p>
        </div>
      ) : (
        threats.map(threat => (
          <div key={threat.id} className="threat-card">
            <div className="threat-header">
              <h3>{threat.type}</h3>
              <span className={`confidence-badge confidence-${threat.confidence}`}>
                {threat.confidence.toUpperCase()}
              </span>
            </div>
            <div className="threat-body">
              <div className="threat-ioc">
                <strong>IOC:</strong> <code>{threat.ioc}</code>
              </div>
              <p className="threat-description">{threat.description}</p>
              <div className="threat-meta">
                <span className="threat-first-seen">
                  First seen: {new Date(threat.first_seen).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="threat-actions">
              <button className="btn-sm btn-outline">Analyze</button>
              <button className="btn-sm btn-danger">Block IOC</button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default SecurityPanel;