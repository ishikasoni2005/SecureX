import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { getSecurityStats } from '../services/mockData';

// Mock the services
jest.mock('../services/mockData');

describe('Dashboard Component', () => {
  beforeEach(() => {
    getSecurityStats.mockResolvedValue({
      criticalThreats: 12,
      activeAlerts: 47,
      protectedSystems: 156,
      networkTraffic: '2.4'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard with security metrics', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Check if main elements are rendered
    expect(screen.getByText('SecureX')).toBeInTheDocument();
    expect(screen.getByText('Security Dashboard')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument(); // Critical Threats
      expect(screen.getByText('47')).toBeInTheDocument(); // Active Alerts
    });
  });

  test('displays loading state initially', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Last updated:')).toBeInTheDocument();
  });

  test('handles refresh button click', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const refreshButton = screen.getByText('Refresh Data');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(getSecurityStats).toHaveBeenCalledTimes(2);
    });
  });
});