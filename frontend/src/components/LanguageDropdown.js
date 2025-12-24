// frontend/src/components/LanguageDropdown.js
import React, { useState } from 'react';
import { Dropdown, Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageDropdown = ({ textColor = '#4b5563' }) => {
  const { language, changeLanguage } = useLanguage();
  const [visible, setVisible] = useState(false);

  const languages = [
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const handleMenuClick = ({ key }) => {
    changeLanguage(key);
    setVisible(false);
  };

  const menuItems = languages.map((lang) => ({
    key: lang.code,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '18px' }}>{lang.flag}</span>
        <span>{lang.name}</span>
        {language === lang.code && (
          <span style={{ marginLeft: 'auto', color: '#1890ff' }}>✓</span>
        )}
      </div>
    ),
    onClick: handleMenuClick
  }));

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      open={visible}
      onOpenChange={setVisible}
      placement="bottomRight"
    >
      <Button
        type="text"
        icon={<GlobalOutlined />}
        className="language-dropdown-btn"
        style={{
          color: textColor,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          height: 'auto'
        }}
      >
        <span style={{ fontSize: '16px' }}>{currentLanguage.flag}</span>
        <span style={{ fontSize: '14px' }}>{currentLanguage.name}</span>
      </Button>
    </Dropdown>
  );
};

export default LanguageDropdown;

