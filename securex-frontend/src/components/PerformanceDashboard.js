import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { usePerformance } from '../hooks/usePerformance';
import { formatBytes, formatNumber } from '../utils/helpers';

function PerformanceDashboard() {
  const [performanceData, setPerformanceData] = useState([]);
  const [resourceTiming, setResourceTiming] = useState([]);
  const [webVitals, setWebVitals] = useState({});
  const currentMetrics = usePerformance();

  useEffect(() => {
    loadPerformanceData();
    loadResourceTiming();
    setupWebVitals();
  }, []);

  const loadPerformanceData = () => {
    // Mock performance data over time
    const data = [];
    const now = Date.now();
    
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now - i * 3600000);
      data.push({
        time: time.getHours() + ':00',
        fps: Math.floor(Math.random() * 20) + 50,
        memory: Math.floor(Math.random() * 200) + 400,
        responseTime: Math.floor(Math.random() * 500) + 100,
        requests: Math.floor(Math.random() * 1000) + 500
      });
    }
    
    setPerformanceData(data);
  };

  const loadResourceTiming = () => {
    const resources = performance.getEntriesByType('resource');
    const resourceData = resources
      .filter(resource => 
        resource.name.includes('/static/') || 
        resource.name.includes('/api/')
      )
      .map(resource => ({
        name: resource.name.split('/').pop(),
        duration: resource.duration,
        size: resource.transferSize || 0,
        type: resource.initiatorType
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    setResourceTiming(resourceData);
  };

  const setupWebVitals = () => {
    // In a real app, this would come from your monitoring service
    setWebVitals({
      LCP: 2450,
      FID: 120,
      CLS: 0.15,
      FCP: 1800,
      TTFB: 800
    });
  };

  const performanceScore = calculatePerformanceScore(webVitals);

  return (
    <div className="performance-dashboard">
      <div className="dashboard-header">
        <h1>Performance Monitoring</h1>
        <div className="performance-score">
          <div className={`score-circle ${getScoreClass(performanceScore)}`}>
            <span className="score">{performanceScore}</span>
          </div>
          <span>Overall Performance Score</span>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="current-metrics">
        <h2>Current System Metrics</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{currentMetrics.fps}</div>
            <div className="metric-label">FPS</div>
            <div className="metric-trend">
              {currentMetrics.fps > 55 ? '🟢 Good' : currentMetrics.fps > 45 ? '🟡 Fair' : '🔴 Poor'}
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">
              {currentMetrics.memory ? formatBytes(currentMetrics.memory.used * 1024 * 1024) : 'N/A'}
            </div>
            <div className="metric-label">Memory Used</div>
            <div className="metric-trend">
              {currentMetrics.memory && currentMetrics.memory.used < 500 ? '🟢 Good' : '🟡 Watch'}
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">{webVitals.LCP || 0}ms</div>
            <div className="metric-label">Largest Contentful Paint</div>
            <div className="metric-trend">
              {webVitals.LCP < 2500 ? '🟢 Good' : webVitals.LCP < 4000 ? '🟡 Needs Improvement' : '🔴 Poor'}
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-value">{webVitals.CLS || 0}</div>
            <div className="metric-label">Cumulative Layout Shift</div>
            <div className="metric-trend">
              {webVitals.CLS < 0.1 ? '🟢 Good' : webVitals.CLS < 0.25 ? '🟡 Needs Improvement' : '🔴 Poor'}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="performance-trends">
        <h2>Performance Trends (24h)</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <h3>FPS & Memory Usage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="fps" stroke="#8884d8" name="FPS" />
                <Line yAxisId="right" type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory (MB)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-card">
            <h3>Response Times & Requests</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="responseTime" stroke="#ff7300" name="Response Time (ms)" />
                <Line yAxisId="right" type="monotone" dataKey="requests" stroke="#387908" name="Requests" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Resource Timing */}
      <div className="resource-timing">
        <h2>Slowest Resources</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={resourceTiming}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip formatter={(value) => [`${value}ms`, 'Duration']} />
            <Bar dataKey="duration" fill="#8884d8" name="Duration (ms)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Recommendations */}
      <div className="performance-recommendations">
        <h2>Optimization Recommendations</h2>
        <div className="recommendations-list">
          {generateRecommendations(webVitals, currentMetrics).map((rec, index) => (
            <div key={index} className={`recommendation ${rec.priority}`}>
              <div className="recommendation-icon">
                {rec.priority === 'high' ? '🚨' : rec.priority === 'medium' ? '⚠️' : '💡'}
              </div>
              <div className="recommendation-content">
                <h4>{rec.title}</h4>
                <p>{rec.description}</p>
                <span className="recommendation-impact">Impact: {rec.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function calculatePerformanceScore(webVitals) {
  let score = 100;
  
  // Deduct points based on Web Vitals thresholds
  if (webVitals.LCP > 2500) score -= 20;
  if (webVitals.FID > 100) score -= 15;
  if (webVitals.CLS > 0.1) score -= 15;
  if (webVitals.FCP > 2000) score -= 10;
  if (webVitals.TTFB > 600) score -= 10;
  
  return Math.max(0, score);
}

function getScoreClass(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

function generateRecommendations(webVitals, currentMetrics) {
  const recommendations = [];

  if (webVitals.LCP > 2500) {
    recommendations.push({
      priority: 'high',
      title: 'Optimize Largest Contentful Paint',
      description: 'LCP is above 2.5 seconds. Consider optimizing images, implementing lazy loading, and reducing render-blocking resources.',
      impact: 'High'
    });
  }

  if (webVitals.CLS > 0.1) {
    recommendations.push({
      priority: 'high',
      title: 'Reduce Layout Shifts',
      description: 'Cumulative Layout Shift is affecting user experience. Reserve space for images and dynamic content.',
      impact: 'High'
    });
  }

  if (currentMetrics.fps < 50) {
    recommendations.push({
      priority: 'medium',
      title: 'Improve Frame Rate',
      description: 'Frame rate is below 50 FPS. Optimize JavaScript execution and reduce DOM complexity.',
      impact: 'Medium'
    });
  }

  if (currentMetrics.memory && currentMetrics.memory.used > 500) {
    recommendations.push({
      priority: 'medium',
      title: 'Reduce Memory Usage',
      description: 'Memory usage is high. Check for memory leaks and optimize data structures.',
      impact: 'Medium'
    });
  }

  // Always include general recommendations
  recommendations.push({
    priority: 'low',
    title: 'Implement Caching Strategy',
    description: 'Use service workers and browser caching to improve load times for repeat visitors.',
    impact: 'Medium'
  });

  return recommendations;
}

export default PerformanceDashboard;