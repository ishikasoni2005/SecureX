import React, { useState, useEffect } from 'react';

function ZeroTrustPanel() {
  const [zeroTrustStatus, setZeroTrustStatus] = useState({
    identityVerification: true,
    deviceCompliance: true,
    networkSecurity: true,
    dataProtection: true,
    workloadSecurity: true,
    automation: true
  });

  const [accessRequests, setAccessRequests] = useState([]);

  useEffect(() => {
    // Mock zero trust data
    const mockRequests = [
      {
        id: 1,
        user: 'john.doe@company.com',
        resource: 'Sensitive Database',
        location: 'New York, US',
        device: 'Corporate Laptop',
        risk: 'low',
        timestamp: new Date(),
        status: 'pending'
      },
      {
        id: 2,
        user: 'jane.smith@company.com',
        resource: 'Admin Panel',
        location: 'London, UK',
        device: 'Personal Mobile',
        risk: 'medium',
        timestamp: new Date(Date.now() - 300000),
        status: 'pending'
      }
    ];

    setAccessRequests(mockRequests);
  }, []);

  const handleAccessDecision = (requestId, approved) => {
    setAccessRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: approved ? 'approved' : 'denied' }
          : req
      )
    );
  };

  const zeroTrustPolicies = [
    {
      id: 1,
      name: 'Identity Verification',
      description: 'Multi-factor authentication for all users',
      status: 'enforced',
      compliance: '100%'
    },
    {
      id: 2,
      name: 'Device Compliance',
      description: 'Only compliant devices can access resources',
      status: 'enforced',
      compliance: '98%'
    },
    {
      id: 3,
      name: 'Least Privilege Access',
      description: 'Users only have access to necessary resources',
      status: 'enforced',
      compliance: '95%'
    },
    {
      id: 4,
      name: 'Micro-segmentation',
      description: 'Network segmentation for critical assets',
      status: 'partial',
      compliance: '85%'
    }
  ];

  return (
    <div className="zero-trust-panel">
      <div className="panel-header">
        <h2>Zero Trust Security Framework</h2>
        <div className="compliance-score">
          <div className="score-circle">
            <span className="score">96%</span>
          </div>
          <span>Compliance Score</span>
        </div>
      </div>

      <div className="zt-pillars">
        <h3>Security Pillars</h3>
        <div className="pillars-grid">
          {Object.entries(zeroTrustStatus).map(([pillar, status]) => (
            <div key={pillar} className={`pillar-card ${status ? 'active' : 'inactive'}`}>
              <div className="pillar-icon">
                {status ? '✅' : '❌'}
              </div>
              <div className="pillar-name">
                {pillar.split(/(?=[A-Z])/).join(' ')}
              </div>
              <div className="pillar-status">
                {status ? 'Enforced' : 'Disabled'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="access-requests">
        <h3>Pending Access Requests</h3>
        <div className="requests-list">
          {accessRequests.filter(req => req.status === 'pending').map(request => (
            <div key={request.id} className={`access-request risk-${request.risk}`}>
              <div className="request-info">
                <div className="user-info">
                  <strong>{request.user}</strong>
                  <span>requesting access to {request.resource}</span>
                </div>
                <div className="request-meta">
                  <span>📍 {request.location}</span>
                  <span>📱 {request.device}</span>
                  <span>🕒 {request.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="request-actions">
                <button 
                  className="btn-success btn-sm"
                  onClick={() => handleAccessDecision(request.id, true)}
                >
                  Approve
                </button>
                <button 
                  className="btn-danger btn-sm"
                  onClick={() => handleAccessDecision(request.id, false)}
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="zt-policies">
        <h3>Zero Trust Policies</h3>
        <div className="policies-grid">
          {zeroTrustPolicies.map(policy => (
            <div key={policy.id} className="policy-card">
              <div className="policy-header">
                <h4>{policy.name}</h4>
                <span className={`status-badge status-${policy.status}`}>
                  {policy.status}
                </span>
              </div>
              <p className="policy-description">{policy.description}</p>
              <div className="policy-compliance">
                <div className="compliance-bar">
                  <div 
                    className="compliance-fill"
                    style={{ width: `${policy.compliance}` }}
                  ></div>
                </div>
                <span className="compliance-text">{policy.compliance} compliant</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ZeroTrustPanel;