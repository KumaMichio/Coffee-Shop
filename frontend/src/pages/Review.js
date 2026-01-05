// frontend/src/pages/Review.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Spin, message } from 'antd';
import { ArrowLeftOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import ReviewForm from '../components/ReviewForm';
import LanguageDropdown from '../components/LanguageDropdown';
import reviewService from '../services/reviewService';
import apiService from '../services/apiService';
import { useTranslation } from '../hooks/useTranslation';

function Review() {
  const { cafeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);

  // Lấy thông tin cafe từ location state hoặc từ API
  useEffect(() => {
    const loadCafe = async () => {
      try {
        setLoading(true);
        
        // Nếu có cafe data từ navigation state, dùng luôn
        if (location.state?.cafe) {
          setCafe(location.state.cafe);
        } else if (cafeId) {
          // Nếu không có, cần tìm cafe từ ID
          // Tạm thời dùng cafeId để tìm, hoặc có thể cần API mới
          // Ở đây giả sử cafe được truyền qua state
          console.warn('Cafe data not found in state');
        }

        // Load reviews
        if (cafeId) {
          const reviewData = await reviewService.getCafeReviews(cafeId);
          setReviews(reviewData.reviews || []);
          setAvgRating(reviewData.average_rating);
        }
      } catch (err) {
        console.error('Load cafe error:', err);
        message.error('Không thể tải thông tin quán');
      } finally {
        setLoading(false);
      }
    };

    loadCafe();
  }, [cafeId, location.state]);

  const handleReviewSuccess = async () => {
    // Reload reviews sau khi submit thành công để cập nhật average rating
    try {
      const reviewData = await reviewService.getCafeReviews(cafeId);
      setReviews(reviewData.reviews || []);
      setAvgRating(reviewData.average_rating);
      
      // Cập nhật cafe object với rating mới
      if (reviewData.average_rating != null || reviewData.review_count !== undefined) {
        setCafe(prev => ({
          ...prev,
          user_rating: reviewData.average_rating,
          review_count: reviewData.review_count || 0
        }));
      }
      
      // Reload my review để cập nhật form
      if (cafeId) {
        try {
          const myReviewResponse = await reviewService.getMyReview(cafeId);
          if (myReviewResponse.review) {
            // Form sẽ tự động cập nhật khi existingReview thay đổi
          }
        } catch (err) {
          console.log('Reload my review:', err.message);
        }
      }
    } catch (err) {
      console.error('Reload reviews error:', err);
    }
  };

  if (loading) {
    return (
      <div className="review-page-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="review-page-error">
        <p>Không tìm thấy thông tin quán</p>
        <Button onClick={() => navigate('/')}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="review-page">
      <div className="review-page-header">
        <div className="review-page-nav">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="review-back-btn"
          >
            {t('common.back')}
          </Button>
          <div className="review-page-icons" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button 
              icon={<HomeOutlined />} 
              className="review-icon-btn"
              onClick={() => navigate('/')}
            >
              {t('home.title')}
            </Button>
            <Button 
              icon={<UserOutlined />} 
              className="review-icon-btn"
              onClick={() => navigate('/profile')}
            >
              <span className="notification-dot"></span>
            </Button>
            <LanguageDropdown textColor="#1f2937" />
          </div>
        </div>
      </div>

      <div className="review-page-content">
        <div className="review-page-left">
          <ReviewForm cafe={cafe} onSuccess={handleReviewSuccess} />
        </div>

        <div className="review-page-right">
          <Card className="reviews-list-card">
            <div className="reviews-summary">
              <h3>レビュー一覧</h3>
              {avgRating !== null && avgRating !== undefined ? (
                <div className="avg-rating-display">
                  <div className="avg-rating-stars">
                    {'★'.repeat(Math.floor(avgRating))}
                    {avgRating % 1 >= 0.5 ? '½' : ''}
                    {'☆'.repeat(5 - Math.ceil(avgRating))}
                  </div>
                  <div className="avg-rating-text">
                    <span className="avg-rating-number">{avgRating.toFixed(1)}</span>
                    <span className="avg-rating-label">平均評価</span>
                    {reviews.length > 0 && (
                      <span className="review-count-label">({reviews.length}件のレビュー)</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-rating-yet">
                  <span>まだ評価がありません</span>
                </div>
              )}
            </div>
            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id || review.user_id} className="review-item">
                    <div className="review-item-header">
                      <span className="review-username">{review.username || '匿名ユーザー'}</span>
                      <span className="review-rating">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="review-comment">{review.comment}</p>
                    )}
                    <div className="review-item-footer">
                      {review.is_child_friendly && (
                        <span className="review-tag">子育て対応</span>
                      )}
                      <div className="review-date">
                        {new Date(review.created_at || review.updated_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reviews-message">
                <p>まだレビューがありません。最初のレビューを投稿してみませんか？</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Review;

