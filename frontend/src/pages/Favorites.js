// frontend/src/pages/Favorites.js
import React from 'react';
import { Card, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import FavoritesList from '../components/FavoritesList';

const Favorites = () => {
  const navigate = useNavigate();

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
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')}
            size="large"
          >
            Quay lại
          </Button>
          <span style={{ 
            fontSize: 24, 
            fontWeight: 'bold',
            color: '#333'
          }}>
            ❤️ Danh sách quán yêu thích
          </span>
        </div>
        <FavoritesList />
      </Card>
    </div>
  );
};

export default Favorites;
