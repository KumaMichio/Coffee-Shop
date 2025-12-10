// frontend/src/components/FavoritesList.js
import React, { useState, useEffect } from 'react';
import { List, Card, Button, message, Empty, Spin, Rate } from 'antd';
import { HeartFilled, EnvironmentOutlined } from '@ant-design/icons';
import favoriteService from '../services/favoriteService';

// Helper function để tạo Google Maps Directions URL
const getGoogleMapsDirectionsUrl = (cafe) => {
  const destination = `${cafe.lat},${cafe.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
};

const FavoritesList = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await favoriteService.getFavorites();
      setFavorites(data);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (cafeId) => {
    try {
      await favoriteService.removeFavorite(cafeId);
      message.success('Đã xóa khỏi danh sách yêu thích');
      setFavorites(favorites.filter(fav => fav.id !== cafeId));
    } catch (error) {
      message.error(error.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <Empty
        description="Chưa có quán yêu thích nào"
        style={{ margin: '50px 0' }}
      />
    );
  }

  return (
    <List
      grid={{
        gutter: [16, 16],
        xs: 1,
        sm: 1,
        md: 2,
        lg: 3,
        xl: 3,
        xxl: 4,
      }}
      dataSource={favorites}
      renderItem={(cafe) => (
        <List.Item style={{ display: 'flex' }}>
          <Card
            hoverable
            style={{ 
              width: '100%',
              display: 'flex', 
              flexDirection: 'column',
              minHeight: '280px'
            }}
            bodyStyle={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            actions={[
              <Button
                type="link"
                icon={<EnvironmentOutlined />}
                onClick={() => window.open(getGoogleMapsDirectionsUrl(cafe), '_blank')}
                key="directions"
              >
                Chỉ đường
              </Button>,
              <Button
                type="text"
                danger
                icon={<HeartFilled />}
                onClick={() => handleRemoveFavorite(cafe.id)}
                key="delete"
              >
                Xóa yêu thích
              </Button>,
            ]}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                {cafe.name}
              </div>
              <div style={{ marginBottom: 8, color: '#666' }}>
                <EnvironmentOutlined /> {cafe.address || 'Chưa có địa chỉ'}
              </div>
              {cafe.rating && (
                <div style={{ marginBottom: 8 }}>
                  <Rate disabled defaultValue={cafe.rating} allowHalf style={{ fontSize: 14 }} />
                  <span style={{ marginLeft: 8, color: '#666' }}>
                    {cafe.rating} ({cafe.user_rating_count || 0} đánh giá)
                  </span>
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 12 }}>
              Nguồn: {cafe.provider}
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
};

export default FavoritesList;
