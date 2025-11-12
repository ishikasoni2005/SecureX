import React, { useState } from 'react';
import { usePerformance } from '../hooks/usePerformance';

function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const metrics = usePerformance();

  if (!isVisible) {
    return (
      <button 
        className="performance-toggle"
        onClick={() => setIsVisible(true)}
        title="Show Performance Monitor"
      >
        ⚡
      </button>
    );
  }

  return (
    <div className="performance-monitor">
      <div className="performance-header">
        <h4>Performance Monitor</h4>
        <button 
          onClick={() => setIsVisible(false)}
          className="close-btn"
        >
          ✕
        </button>
      </div>
      
      <div className="performance-metrics">
        <div className="metric">
          <span className="metric-label">FPS:</span>
          <span className={`metric-value ${metrics.fps < 30 ? 'warning' : ''}`}>
            {metrics.fps}
          </span>
        </div>
        
        {metrics.memory && (
          <>
            <div className="metric">
              <span className="metric-label">Memory Used:</span>
              <span className="metric-value">
                {metrics.memory.used}MB
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Memory Total:</span>
              <span className="metric-value">
                {metrics.memory.total}MB
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Memory Limit:</span>
              <span className="metric-value">
                {metrics.memory.limit}MB
              </span>
            </div>
          </>
        )}
        
        <div className="metric">
          <span className="metric-label">Load Time:</span>
          <span className="metric-value">
            {metrics.loadTime}ms
          </span>
        </div>
      </div>
    </div>
  );
}

export default PerformanceMonitor;