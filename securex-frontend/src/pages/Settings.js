import React, { useState } from 'react';

function Settings() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    companyName: 'SecureX Corp',
    timezone: 'UTC-5',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
    
    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordPolicy: 'strong',
    autoLogout: true,
    
    // Notification Settings
    emailAlerts: true,
    pushNotifications: false,
    smsAlerts: true,
    alertLevel: 'medium',
    
    // System Settings
    autoUpdates: true,
    backupFrequency: 'daily',
    logRetention: 90,
    performanceMode: 'balanced'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    // In a real app, this would save to backend
    alert('Settings saved successfully!');
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      // Reset to default settings
      setSettings({
        companyName: 'SecureX Corp',
        timezone: 'UTC-5',
        dateFormat: 'MM/DD/YYYY',
        language: 'en',
        twoFactorAuth: true,
        sessionTimeout: 30,
        passwordPolicy: 'strong',
        autoLogout: true,
        emailAlerts: true,
        pushNotifications: false,
        smsAlerts: true,
        alertLevel: 'medium',
        autoUpdates: true,
        backupFrequency: 'daily',
        logRetention: 90,
        performanceMode: 'balanced'
      });
    }
  };

  return (
    <div className="settings" style={{ paddingTop: '80px' }}> {/* Add this line */}
      <div className="settings-header">
        <h1>System Settings</h1>
        <div className="settings-actions">
          <button className="btn-secondary" onClick={resetSettings}>
            Reset to Defaults
          </button>
          <button className="btn-primary" onClick={saveSettings}>
            Save Changes
          </button>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-sidebar">
          <button 
            className={`sidebar-btn ${activeSection === 'general' ? 'active' : ''}`}
            onClick={() => setActiveSection('general')}
          >
            ⚙️ General
          </button>
          <button 
            className={`sidebar-btn ${activeSection === 'security' ? 'active' : ''}`}
            onClick={() => setActiveSection('security')}
          >
            🛡️ Security
          </button>
          <button 
            className={`sidebar-btn ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            🔔 Notifications
          </button>
          <button 
            className={`sidebar-btn ${activeSection === 'system' ? 'active' : ''}`}
            onClick={() => setActiveSection('system')}
          >
            💻 System
          </button>
          <button 
            className={`sidebar-btn ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            👥 Users
          </button>
          <button 
            className={`sidebar-btn ${activeSection === 'api' ? 'active' : ''}`}
            onClick={() => setActiveSection('api')}
          >
            🔌 API
          </button>
        </div>

        <div className="settings-content">
          {activeSection === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => handleSettingChange('companyName', e.target.value)}
                  />
                </div>
                <div className="setting-item">
                  <label>Timezone</label>
                  <select 
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  >
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC-6">Central Time (UTC-6)</option>
                    <option value="UTC-7">Mountain Time (UTC-7)</option>
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Date Format</label>
                  <select 
                    value={settings.dateFormat}
                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Language</label>
                  <select 
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <div className="settings-grid">
                <div className="setting-item toggle">
                  <label>Two-Factor Authentication</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="setting-item">
                  <label>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    min="5"
                    max="120"
                  />
                </div>
                <div className="setting-item">
                  <label>Password Policy</label>
                  <select 
                    value={settings.passwordPolicy}
                    onChange={(e) => handleSettingChange('passwordPolicy', e.target.value)}
                  >
                    <option value="basic">Basic (6+ characters)</option>
                    <option value="medium">Medium (8+ characters, mixed case)</option>
                    <option value="strong">Strong (12+ characters, special chars)</option>
                  </select>
                </div>
                <div className="setting-item toggle">
                  <label>Auto Logout on Inactivity</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.autoLogout}
                      onChange={(e) => handleSettingChange('autoLogout', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <div className="settings-grid">
                <div className="setting-item toggle">
                  <label>Email Alerts</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.emailAlerts}
                      onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="setting-item toggle">
                  <label>Push Notifications</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="setting-item toggle">
                  <label>SMS Alerts</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.smsAlerts}
                      onChange={(e) => handleSettingChange('smsAlerts', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="setting-item">
                  <label>Alert Level</label>
                  <select 
                    value={settings.alertLevel}
                    onChange={(e) => handleSettingChange('alertLevel', e.target.value)}
                  >
                    <option value="low">Low (Critical only)</option>
                    <option value="medium">Medium (High + Critical)</option>
                    <option value="high">High (All alerts)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'system' && (
            <div className="settings-section">
              <h2>System Settings</h2>
              <div className="settings-grid">
                <div className="setting-item toggle">
                  <label>Automatic Updates</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.autoUpdates}
                      onChange={(e) => handleSettingChange('autoUpdates', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="setting-item">
                  <label>Backup Frequency</label>
                  <select 
                    value={settings.backupFrequency}
                    onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Log Retention (days)</label>
                  <input
                    type="number"
                    value={settings.logRetention}
                    onChange={(e) => handleSettingChange('logRetention', parseInt(e.target.value))}
                    min="7"
                    max="365"
                  />
                </div>
                <div className="setting-item">
                  <label>Performance Mode</label>
                  <select 
                    value={settings.performanceMode}
                    onChange={(e) => handleSettingChange('performanceMode', e.target.value)}
                  >
                    <option value="power-saver">Power Saver</option>
                    <option value="balanced">Balanced</option>
                    <option value="performance">Performance</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="settings-section">
              <h2>User Management</h2>
              <p>User management features will be implemented here.</p>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="settings-section">
              <h2>API Configuration</h2>
              <p>API configuration and integration settings will be implemented here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;