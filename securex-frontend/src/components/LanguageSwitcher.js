import React from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
    
    // Update document language for accessibility
    document.documentElement.lang = languageCode;
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="language-switcher" style={{ position: 'relative' }}>
      <button 
        className="language-current"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          background: '#fff',
          color: '#111',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
      >
        <span className="flag" style={{ fontSize: 16 }}>{currentLanguage.flag}</span>
        <span className="code" style={{ textTransform: 'uppercase', fontWeight: 600 }}>{currentLanguage.code}</span>
      </button>
      
      {isOpen && (
        <div 
          className="language-dropdown"
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: 8,
            width: 220,
            maxHeight: 360,
            overflow: 'auto',
            background: '#fff',
            color: '#111',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 10,
            boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
            zIndex: 1000,
            padding: 6
          }}
        >
          {languages.map(language => {
            const active = i18n.language === language.code;
            return (
              <button
                key={language.code}
                className={`language-option ${active ? 'active' : ''}`}
                onClick={() => handleLanguageChange(language.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: active ? 'rgba(0,0,0,0.06)' : 'transparent',
                  color: '#111',
                  cursor: 'pointer'
                }}
              >
                <span className="flag" style={{ fontSize: 18 }}>{language.flag}</span>
                <span className="name" style={{ flex: 1 }}>{language.name}</span>
                {active && <span style={{ fontSize: 14, color: '#0c7', fontWeight: 600 }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;