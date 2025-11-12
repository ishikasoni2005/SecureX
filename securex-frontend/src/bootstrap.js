import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Performance monitoring
if (process.env.NODE_ENV === 'production') {
  const { getCLS, getFID, getFCP, getLCP, getTTFB } = require('web-vitals');
  
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<App />);