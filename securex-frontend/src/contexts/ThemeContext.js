import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check user preference or system preference
    const savedTheme = localStorage.getItem('securex-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('securex-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('securex-theme', 'light');
    }
  }, [isDarkMode]);

  // In your ThemeContext.js, add RGB values
const lightTheme = {
  '--accent-primary': '#667eea',
  '--accent-primary-rgb': '102, 126, 234',
  '--accent-secondary': '#764ba2', 
  '--accent-secondary-rgb': '118, 75, 162',
  // ... other colors
};

const darkTheme = {
  '--accent-primary': '#7688ea',
  '--accent-primary-rgb': '118, 136, 234',
  '--accent-secondary': '#8a5bc2',
  '--accent-secondary-rgb': '138, 91, 194',
  // ... other colors
};

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};