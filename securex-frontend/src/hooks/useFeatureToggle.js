import { useContext, createContext, useState, useEffect } from 'react';
import EnvironmentConfig from '../config/environment';

const FeatureToggleContext = createContext();

export const FeatureToggleProvider = ({ children, overrides = {} }) => {
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeFeatures();
  }, []);

  const initializeFeatures = async () => {
    try {
      // Load feature toggles from environment and any remote config
      const environmentFeatures = EnvironmentConfig.getAll().features;
      
      // Merge with overrides (for testing)
      const mergedFeatures = { ...environmentFeatures, ...overrides };
      
      setFeatures(mergedFeatures);
      
      // In a real app, you might fetch feature toggles from a remote service
      await loadRemoteFeatureToggles();
    } catch (error) {
      console.error('Failed to initialize feature toggles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRemoteFeatureToggles = async () => {
    // Example: Fetch feature toggles from a remote service
    // const response = await fetch('/api/feature-toggles');
    // const remoteFeatures = await response.json();
    // setFeatures(prev => ({ ...prev, ...remoteFeatures }));
  };

  const isEnabled = (feature) => {
    return features[feature] === true;
  };

  const enable = (feature) => {
    setFeatures(prev => ({ ...prev, [feature]: true }));
  };

  const disable = (feature) => {
    setFeatures(prev => ({ ...prev, [feature]: false }));
  };

  const getFeatures = () => {
    return { ...features };
  };

  const value = {
    features,
    loading,
    isEnabled,
    enable,
    disable,
    getFeatures,
  };

  return (
    <FeatureToggleContext.Provider value={value}>
      {children}
    </FeatureToggleContext.Provider>
  );
};

export const useFeatureToggle = () => {
  const context = useContext(FeatureToggleContext);
  if (!context) {
    throw new Error('useFeatureToggle must be used within a FeatureToggleProvider');
  }
  return context;
};

// Higher-order component for feature gating
export const withFeature = (feature, FallbackComponent = null) => (Component) => {
  return function WithFeature(props) {
    const { isEnabled } = useFeatureToggle();

    if (!isEnabled(feature)) {
      return FallbackComponent ? <FallbackComponent {...props} /> : null;
    }

    return <Component {...props} />;
  };
};

// Hook for conditional rendering
export const useFeature = (feature) => {
  const { isEnabled } = useFeatureToggle();
  return isEnabled(feature);
};