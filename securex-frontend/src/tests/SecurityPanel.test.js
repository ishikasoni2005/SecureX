import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SecurityPanel from '../pages/SecurityPanel';

describe('SecurityPanel Component', () => {
  test('renders security panel with tabs', () => {
    render(
      <BrowserRouter>
        <SecurityPanel />
      </BrowserRouter>
    );

    expect(screen.getByText('Security Operations Center')).toBeInTheDocument();
    expect(screen.getByText('🛡️ Firewall')).toBeInTheDocument();
    expect(screen.getByText('🔍 Intrusion Detection')).toBeInTheDocument();
  });

  test('switches between tabs', () => {
    render(
      <BrowserRouter>
        <SecurityPanel />
      </BrowserRouter>
    );

    // Initially should show firewall section
    expect(screen.getByText('Firewall Rules Management')).toBeInTheDocument();

    // Click IDS tab
    fireEvent.click(screen.getByText('🔍 Intrusion Detection'));
    
    // Should show IDS section
    expect(screen.getByText('Intrusion Detection System')).toBeInTheDocument();
  });

  test('displays firewall rules table', () => {
    render(
      <BrowserRouter>
        <SecurityPanel />
      </BrowserRouter>
    );

    expect(screen.getByText('HTTP Traffic')).toBeInTheDocument();
    expect(screen.getByText('SSH Access')).toBeInTheDocument();
    expect(screen.getByText('ALLOW')).toBeInTheDocument();
    expect(screen.getByText('DENY')).toBeInTheDocument();
  });
});