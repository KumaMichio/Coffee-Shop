// frontend/src/components/PromotionNotification.js
import React, { useState, useEffect } from 'react';
import { notification, Card, Tag, Button, Modal } from 'antd';
import { GiftOutlined, CloseOutlined, EnvironmentOutlined } from '@ant-design/icons';
import promotionService from '../services/promotionService';
import './PromotionNotification.css';

const PromotionNotification = ({ currentLocation, onPromotionClick }) => {
  const [promotions, setPromotions] = useState([]);
  const [shownPromotions, setShownPromotions] = useState(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  useEffect(() => {
    if (currentLocation && currentLocation.lat && currentLocation.lng) {
      loadPromotions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation]);

  const loadPromotions = async () => {
    try {
      const nearbyPromotions = await promotionService.getPromotionsNearby({
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        radius: 5000 // 5km
      });

      // Lọc các promotions chưa được hiển thị
      setPromotions((prevPromotions) => {
        const existingIds = new Set(prevPromotions.map(p => p.id));
        const newPromotions = nearbyPromotions.filter(
          (promo) => !existingIds.has(promo.id) && !shownPromotions.has(promo.id)
        );
        
        if (newPromotions.length > 0) {
          // Hiển thị notification cho promotion đầu tiên
          setTimeout(() => {
            showPromotionNotification(newPromotions[0]);
          }, 100);
        }
        
        return [...prevPromotions, ...newPromotions];
      });

    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  };

  const showPromotionNotification = (promotion) => {
    const discountText = formatDiscount(promotion);
    
    notification.open({
      message: (
        <div className="promotion-notification-header">
          <GiftOutlined style={{ color: '#ff4d4f', fontSize: '20px', marginRight: '8px' }} />
          <span style={{ fontWeight: 'bold' }}>🎉 Khuyến mãi mới!</span>
        </div>
      ),
      description: (
        <div className="promotion-notification-content">
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {promotion.title}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {promotion.cafe_name} • {discountText}
          </div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            {formatDistance(promotion.distance)} • Còn {formatTimeRemaining(promotion.end_date)}
          </div>
        </div>
      ),
      duration: 8,
      placement: 'topRight',
      icon: <GiftOutlined style={{ color: '#ff4d4f' }} />,
      onClick: () => {
        handlePromotionClick(promotion);
      },
      key: `promotion-${promotion.id}`,
      onClose: () => {
        // Đánh dấu đã hiển thị
        setShownPromotions((prev) => new Set([...prev, promotion.id]));
      }
    });

    // Đánh dấu đã hiển thị sau khi đóng
    setTimeout(() => {
      setShownPromotions((prev) => new Set([...prev, promotion.id]));
    }, 8000);
  };

  const formatDiscount = (promotion) => {
    if (promotion.discount_type === 'percentage') {
      return `Giảm ${promotion.discount_value}%`;
    } else if (promotion.discount_type === 'fixed_amount') {
      return `Giảm ${promotion.discount_value.toLocaleString('vi-VN')}đ`;
    } else if (promotion.discount_type === 'free_item') {
      return `Tặng ${promotion.discount_value} món`;
    }
    return 'Khuyến mãi đặc biệt';
  };

  const formatDistance = (distance) => {
    if (!distance) return '';
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const formatTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff < 0) return 'Đã hết hạn';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} ngày`;
    if (hours > 0) return `${hours} giờ`;
    return `${minutes} phút`;
  };

  const handlePromotionClick = (promotion) => {
    setSelectedPromotion(promotion);
    setModalVisible(true);
    if (onPromotionClick) {
      onPromotionClick(promotion);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedPromotion(null);
  };

  return (
    <>
      {selectedPromotion && (
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GiftOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
              <span>Chi tiết khuyến mãi</span>
            </div>
          }
          open={modalVisible}
          onCancel={handleCloseModal}
          footer={[
            <Button key="close" onClick={handleCloseModal}>
              Đóng
            </Button>
          ]}
          width={500}
        >
      <Card className="promotion-detail-card">
        <div className="promotion-detail-header">
          <h2>{selectedPromotion.title}</h2>
          <Tag color="red" style={{ fontSize: '14px', padding: '4px 12px' }}>
            {formatDiscount(selectedPromotion)}
          </Tag>
        </div>

        <div className="promotion-detail-cafe">
          <EnvironmentOutlined style={{ marginRight: '6px' }} />
          <strong>{selectedPromotion.cafe_name}</strong>
          {selectedPromotion.distance && (
            <span style={{ marginLeft: '8px', color: '#666' }}>
              ({formatDistance(selectedPromotion.distance)})
            </span>
          )}
        </div>

        {selectedPromotion.description && (
          <div className="promotion-detail-description">
            <p>{selectedPromotion.description}</p>
          </div>
        )}

        <div className="promotion-detail-info">
          <div className="promotion-info-item">
            <strong>Thời gian:</strong>
            <span>
              {new Date(selectedPromotion.start_date).toLocaleString('vi-VN')} -{' '}
              {new Date(selectedPromotion.end_date).toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="promotion-info-item">
            <strong>Còn lại:</strong>
            <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
              {formatTimeRemaining(selectedPromotion.end_date)}
            </span>
          </div>
        </div>
      </Card>
    </Modal>
      )}
    </>
  );
};

export default PromotionNotification;

