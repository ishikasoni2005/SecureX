import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      'dashboard.title': 'Security Dashboard',
      'dashboard.lastUpdated': 'Last updated',
      'security.threats': 'Threats',
      'security.alerts': 'Alerts',
      'security.protected': 'Protected Systems',
      'security.network': 'Network Traffic',
      
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.security': 'Security',
      'nav.reports': 'Reports',
      'nav.settings': 'Settings',
      'nav.incidents': 'Incidents',
      'nav.compliance': 'Compliance',
      
      // Threats
      'threats.critical': 'Critical Threats',
      'threats.high': 'High Severity',
      'threats.medium': 'Medium Severity',
      'threats.low': 'Low Severity',
      'threats.malware': 'Malware',
      'threats.phishing': 'Phishing',
      'threats.ddos': 'DDoS',
      'threats.bruteForce': 'Brute Force',
      
      // Actions
      'actions.viewDetails': 'View Details',
      'actions.export': 'Export',
      'actions.generateReport': 'Generate Report',
      'actions.runScan': 'Run Security Scan',
      'actions.mitigate': 'Mitigate',
      'actions.investigate': 'Investigate',
      
      // Status
      'status.active': 'Active',
      'status.inactive': 'Inactive',
      'status.healthy': 'Healthy',
      'status.warning': 'Warning',
      'status.critical': 'Critical',
      'status.compliant': 'Compliant',
      'status.nonCompliant': 'Non-Compliant',
      
      // Compliance
      'compliance.pcidss': 'PCI DSS',
      'compliance.hipaa': 'HIPAA',
      'compliance.gdpr': 'GDPR',
      'compliance.iso27001': 'ISO 27001',
      
      // AI Assistant
      'ai.welcome': 'Hello! I\'m your SecureX AI Assistant. How can I help you today?',
      'ai.analyzeThreats': 'Analyze recent threats',
      'ai.generateReport': 'Generate security report',
      'ai.performanceCheck': 'System performance check',
      'ai.securityRecommendations': 'Security recommendations'
    }
  },
  es: {
    translation: {
      'dashboard.title': 'Panel de Seguridad',
      'dashboard.lastUpdated': 'Última actualización',
      'security.threats': 'Amenazas',
      'security.alerts': 'Alertas',
      // ... more Spanish translations
    }
  },
  fr: {
    translation: {
      'dashboard.title': 'Tableau de Bord de Sécurité',
      'dashboard.lastUpdated': 'Dernière mise à jour',
      'security.threats': 'Menaces',
      'security.alerts': 'Alertes',
      // ... more French translations
    }
  }
  ,
  hi: {
    translation: {
      'dashboard.title': 'सुरक्षा डैशबोर्ड',
      'dashboard.lastUpdated': 'अंतिम अपडेट',
      'security.threats': 'खतरे',
      'security.alerts': 'अलर्ट'
    }
  },
  pa: {
    translation: {
      'dashboard.title': 'ਸੁਰੱਖਿਆ ਡੈਸ਼ਬੋਰਡ',
      'dashboard.lastUpdated': 'ਆਖਰੀ ਅਪਡੇਟ',
      'security.threats': 'ਖਤਰੇ',
      'security.alerts': 'ਚੇਤਾਵਨੀ'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;