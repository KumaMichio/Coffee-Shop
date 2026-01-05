// frontend/src/components/LanguageSelector.js
import React from 'react';
import { Select, Card } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '../contexts/LanguageContext';

const { Option } = Select;

const LanguageSelector = () => {
  const { language, changeLanguage, t } = useLanguage();

  const languages = [
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const handleChange = (value) => {
    changeLanguage(value);
  };

  return (
    <Card className="language-selector-card">
      <div className="language-selector-header">
        <GlobalOutlined style={{ fontSize: '20px', marginRight: '8px' }} />
        <h3>{t('profile.language')}</h3>
      </div>
      <div className="language-selector-content">
        <p style={{ marginBottom: '12px', color: '#666' }}>
          {t('profile.selectLanguage')}
        </p>
        <Select
          value={language}
          onChange={handleChange}
          style={{ width: '100%' }}
          size="large"
        >
          {languages.map((lang) => (
            <Option key={lang.code} value={lang.code}>
              <span style={{ marginRight: '8px' }}>{lang.flag}</span>
              {lang.name}
            </Option>
          ))}
        </Select>
        <p style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
          {t('common.settings')} • {t('profile.language')}
        </p>
      </div>
    </Card>
  );
};

export default LanguageSelector;

