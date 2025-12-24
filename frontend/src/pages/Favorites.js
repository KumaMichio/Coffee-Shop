// frontend/src/pages/Favorites.js
import React from 'react';
import { Card, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import FavoritesList from '../components/FavoritesList';
import LanguageDropdown from '../components/LanguageDropdown';
import { useTranslation } from '../hooks/useTranslation';

const Favorites = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: 1400, 
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ 
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/')}
              size="large"
            >
              {t('common.back')}
            </Button>
            <span style={{ 
              fontSize: 24, 
              fontWeight: 'bold',
              color: '#333'
            }}>
              ❤️ {t('favorites.title')}
            </span>
          </div>
          <LanguageDropdown textColor="#1f2937" />
        </div>
        <FavoritesList />
      </Card>
    </div>
  );
};

export default Favorites;
