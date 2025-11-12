import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function AIThreatPredictor() {
  const [predictions, setPredictions] = useState([]);
  const [modelStatus, setModelStatus] = useState('training');
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    loadPredictions();
    simulateModelTraining();
  }, []);

  const loadPredictions = () => {
    // Mock prediction data
    const mockPredictions = [
      { hour: '00:00', actual: 12, predicted: 15, confidence: 85 },
      { hour: '04:00', actual: 8, predicted: 9, confidence: 78 },
      { hour: '08:00', actual: 45, predicted: 42, confidence: 92 },
      { hour: '12:00', actual: 38, predicted: 35, confidence: 88 },
      { hour: '16:00', actual: 52, predicted: 55, confidence: 91 },
      { hour: '20:00', actual: 28, predicted: 30, confidence: 79 },
      { hour: '24:00', actual: null, predicted: 25, confidence: 82 }
    ];

    setPredictions(mockPredictions);
  };

  const simulateModelTraining = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        setModelStatus('active');
        clearInterval(interval);
      }
      setConfidence(Math.min(progress, 100));
    }, 500);
  };

  const predictedThreats = [
    {
      type: 'DDoS Attack',
      probability: '85%',
      expectedTime: 'Next 2-4 hours',
      recommendedAction: 'Scale up DDoS protection',
      impact: 'High'
    },
    {
      type: 'Credential Stuffing',
      probability: '72%',
      expectedTime: 'Next 6-8 hours',
      recommendedAction: 'Enable CAPTCHA and rate limiting',
      impact: 'Medium'
    }
  ];

  return (
    <div className="ai-threat-predictor">
      <div className="predictor-header">
        <h2>AI Threat Prediction Engine</h2>
        <div className="model-status">
          <span className={`status-indicator ${modelStatus}`}></span>
          Model Status: <strong>{modelStatus.toUpperCase()}</strong>
          <span className="confidence">({Math.round(confidence)}% confidence)</span>
        </div>
      </div>

      <div className="prediction-content">
        <div className="prediction-chart">
          <h3>Threat Prediction vs Actual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#4dabf7" 
                strokeWidth={2}
                name="Actual Threats"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#ff6b6b" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Predicted Threats"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="threat-predictions">
          <h3>Predicted Threats</h3>
          <div className="predictions-list">
            {predictedThreats.map((threat, index) => (
              <div key={index} className={`threat-prediction ${threat.impact.toLowerCase()}`}>
                <div className="prediction-header">
                  <h4>{threat.type}</h4>
                  <span className={`probability ${threat.probability > '80%' ? 'high' : 'medium'}`}>
                    {threat.probability}
                  </span>
                </div>
                <div className="prediction-details">
                  <p><strong>Expected:</strong> {threat.expectedTime}</p>
                  <p><strong>Impact:</strong> 
                    <span className={`impact-${threat.impact.toLowerCase()}`}>
                      {threat.impact}
                    </span>
                  </p>
                  <p><strong>Action:</strong> {threat.recommendedAction}</p>
                </div>
                <div className="prediction-actions">
                  <button className="btn-primary btn-sm">Mitigate</button>
                  <button className="btn-outline btn-sm">Investigate</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="model-insights">
        <h3>AI Model Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <h4>Prediction Accuracy</h4>
              <p>87% accurate over last 30 days</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">⚡</div>
            <div className="insight-content">
              <h4>Response Time</h4>
              <p>Threats detected 2.3 hours earlier</p>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">🛡️</div>
            <div className="insight-content">
              <h4>Prevention Rate</h4>
              <p>62% of predicted attacks prevented</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIThreatPredictor;