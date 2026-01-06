// frontend/src/components/ReviewForm.js
import React, { useState, useEffect } from 'react';
import { Rate, Input, Switch, Checkbox, Button, message, Upload } from 'antd';
import { StarOutlined, PictureOutlined, DeleteOutlined } from '@ant-design/icons';
import reviewService from '../services/reviewService';

const { TextArea } = Input;

function ReviewForm({ cafe, onSuccess, onCancel }) {
  const [cafeId, setCafeId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isChildFriendly, setIsChildFriendly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load existing review nếu có
  useEffect(() => {
    const loadMyReview = async () => {
      if (!cafe) return;
      
      // Xác định cafeId
      const id = cafe.id || (cafe.provider && cafe.provider_place_id ? `${cafe.provider}_${cafe.provider_place_id}` : null);
      if (!id) return;
      
      setCafeId(id);
      
      try {
        const response = await reviewService.getMyReview(id);
        if (response.review) {
          setExistingReview(response.review);
          setRating(response.review.rating);
          setComment(response.review.comment || '');
          setIsPublic(response.review.is_public);
          setIsChildFriendly(response.review.is_child_friendly);
          setImages(response.review.images || []);
        }
      } catch (err) {
        console.log('No existing review:', err.message);
      }
    };
    loadMyReview();
  }, [cafe]);

  // Compress and convert image to data URL
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize nếu quá lớn (max 800px)
          const maxSize = 800;
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Nén với chất lượng 0.7 (70%)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          // Kiểm tra kích thước (max 100KB để tránh lỗi index)
          const sizeInKB = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
          if (sizeInKB > 100) {
            // Nén thêm nếu vẫn quá lớn
            const veryCompressed = canvas.toDataURL('image/jpeg', 0.5);
            resolve(veryCompressed);
          } else {
            resolve(compressedDataUrl);
          }
        };
        
        img.onerror = reject;
      };
      
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (file) => {
    if (images.length >= 5) {
      message.warning('Tối đa 5 ảnh');
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      message.error('Ảnh không được vượt quá 5MB');
      return false;
    }

    try {
      setUploadingImage(true);
      
      // Nén ảnh
      const compressedImage = await compressImage(file);
      setImages(prev => [...prev, compressedImage]);
      message.success('Đã thêm ảnh');
      
    } catch (err) {
      console.error('Image processing error:', err);
      message.error('Lỗi xử lý ảnh. Vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
    }
    
    return false; // Prevent default upload
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      message.warning('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!cafeId || !cafe) {
      message.error('Không tìm thấy thông tin quán');
      return;
    }

    try {
      setLoading(true);
      const response = await reviewService.submitReview(cafeId, {
        rating,
        comment: comment.trim() || null,
        is_public: isPublic,
        is_child_friendly: isChildFriendly,
        images: images
      }, cafe);

      // Hiển thị thông báo thành công với rating
      message.success({
        content: existingReview 
          ? `Đánh giá đã được cập nhật thành công! Rating: ${rating} sao ⭐` 
          : `Đánh giá đã được gửi thành công! Rating: ${rating} sao ⭐`,
        duration: 3
      });
      
      // Trigger event để Home page refresh cafe list
      window.dispatchEvent(new CustomEvent('reviewSubmitted', { 
        detail: { cafeId: cafe.id || cafeId, rating } 
      }));
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Submit review error:', err);
      message.error(err.message || 'Không thể gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h2 className="review-form-title">レビュー投稿画面</h2>
        <div className="review-form-cafe-name">{cafe?.name || 'カフェ名A'}</div>
      </div>

      <div className="review-form-content">
        <div className="review-form-section">
          <label className="review-form-label">
            <StarOutlined style={{ marginRight: 8, color: '#fbbf24' }} />
            評価 (1-5星)
          </label>
          <div className="review-rating-section">
            <Rate
              value={rating}
              onChange={setRating}
              allowClear={false}
              style={{ fontSize: 32 }}
              character={<StarOutlined />}
            />
            {rating > 0 && (
              <p className="review-rating-selected">
                選択: {rating} {rating === 1 ? '星' : '星'}
              </p>
            )}
            {rating === 0 && (
              <p className="review-rating-hint">タップして評価を選択してください</p>
            )}
          </div>
        </div>

        <div className="review-form-section">
          <label className="review-form-label">評巾</label>
          <TextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="レビューを詰訓なくだざさい..."
            rows={6}
            maxLength={1000}
            showCount
            className="review-comment-input"
          />
        </div>

        <div className="review-form-section">
          <label className="review-form-label">
            <PictureOutlined style={{ marginRight: 8 }} />
            Hình ảnh (tối đa 5 ảnh)
          </label>
          <Upload
            beforeUpload={handleImageUpload}
            showUploadList={false}
            accept="image/*"
            disabled={uploadingImage || images.length >= 5}
          >
            <Button 
              icon={<PictureOutlined />} 
              loading={uploadingImage}
              disabled={images.length >= 5}
            >
              {uploadingImage ? 'Đang tải...' : 'Thêm ảnh'}
            </Button>
          </Upload>
          {images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              {images.map((img, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img 
                    src={img} 
                    alt={`Review ${index + 1}`} 
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      objectFit: 'cover', 
                      borderRadius: '4px',
                      border: '1px solid #d9d9d9'
                    }} 
                  />
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveImage(index)}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      padding: '2px 6px',
                      minWidth: 'auto',
                      height: 'auto'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="review-form-section">
          <div className="review-form-row">
            <label className="review-form-label">公觥/非配</label>
            <Switch
              checked={isPublic}
              onChange={setIsPublic}
              checkedChildren="公開"
              unCheckedChildren="非公開"
            />
          </div>
        </div>

        <div className="review-form-section">
          <Checkbox
            checked={isChildFriendly}
            onChange={(e) => setIsChildFriendly(e.target.checked)}
            className="review-checkbox"
          >
            ✔ 子育を是付
          </Checkbox>
        </div>

        <div className="review-form-actions">
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            className="review-submit-btn"
          >
            可培
          </Button>
          {onCancel && (
            <Button onClick={onCancel} className="review-cancel-btn">
              キャンセル
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewForm;

