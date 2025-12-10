// frontend/src/components/DirectionsModal.js
import React from 'react';
import { Modal, Button, Space } from 'antd';
import { 
  EnvironmentOutlined, 
  AppleOutlined,
  GlobalOutlined,
  CarOutlined
} from '@ant-design/icons';
import './DirectionsModal.css';

function DirectionsModal({ visible, onCancel, cafe, currentLocation }) {
  if (!cafe) return null;

  // Tạo URL cho các ứng dụng bản đồ khác nhau
  const getDirectionsUrls = () => {
    const destination = `${cafe.lat},${cafe.lng}`;
    const destinationName = encodeURIComponent(cafe.name || '');
    const origin = currentLocation 
      ? `${currentLocation.lat},${currentLocation.lng}` 
      : null;

    const urls = {
      google: origin
        ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&destination_place_id=${cafe.provider_place_id || ''}`
        : `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
      
      apple: origin
        ? `https://maps.apple.com/?daddr=${destination}&dirflg=d`
        : `https://maps.apple.com/?daddr=${destination}`,
      
      waze: `https://waze.com/ul?ll=${destination}&navigate=yes`,
      
      goong: origin
        ? `https://goong.io/directions/${origin}/${destination}`
        : `https://goong.io/maps/place/${destination}`
    };

    return urls;
  };

  const handleOpenDirections = (app) => {
    const urls = getDirectionsUrls();
    const url = urls[app];
    
    if (url) {
      window.open(url, '_blank');
      onCancel();
    }
  };

  return (
    <Modal
      title="Chọn ứng dụng bản đồ"
      open={visible}
      onCancel={onCancel}
      footer={null}
      className="directions-modal"
      width={400}
    >
      <div className="directions-options">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Button
            type="default"
            size="large"
            icon={<GlobalOutlined />}
            onClick={() => handleOpenDirections('google')}
            className="directions-option-btn"
            block
          >
            <div className="directions-option-content">
              <span className="directions-option-name">Google Maps</span>
              <span className="directions-option-desc">Mở trong trình duyệt</span>
            </div>
          </Button>

          <Button
            type="default"
            size="large"
            icon={<AppleOutlined />}
            onClick={() => handleOpenDirections('apple')}
            className="directions-option-btn"
            block
          >
            <div className="directions-option-content">
              <span className="directions-option-name">Apple Maps</span>
              <span className="directions-option-desc">Mở trong ứng dụng (iOS/Mac)</span>
            </div>
          </Button>

          <Button
            type="default"
            size="large"
            icon={<CarOutlined />}
            onClick={() => handleOpenDirections('waze')}
            className="directions-option-btn"
            block
          >
            <div className="directions-option-content">
              <span className="directions-option-name">Waze</span>
              <span className="directions-option-desc">Điều hướng với Waze</span>
            </div>
          </Button>

          <Button
            type="default"
            size="large"
            icon={<EnvironmentOutlined />}
            onClick={() => handleOpenDirections('goong')}
            className="directions-option-btn"
            block
          >
            <div className="directions-option-content">
              <span className="directions-option-name">Goong Maps</span>
              <span className="directions-option-desc">Bản đồ Việt Nam</span>
            </div>
          </Button>
        </Space>

        <div className="directions-info">
          <p className="directions-cafe-name">
            <strong>Đến:</strong> {cafe.name}
          </p>
          {cafe.address && (
            <p className="directions-cafe-address">
              <strong>Địa chỉ:</strong> {cafe.address}
            </p>
          )}
          {currentLocation && (
            <p className="directions-note">
              <strong>Ghi chú:</strong> Đường đi từ vị trí hiện tại của bạn
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default DirectionsModal;

