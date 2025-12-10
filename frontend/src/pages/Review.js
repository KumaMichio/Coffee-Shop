// frontend/src/pages/Review.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Spin, message } from 'antd';
import { ArrowLeftOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import ReviewForm from '../components/ReviewForm';
import reviewService from '../services/reviewService';
import apiService from '../services/apiService';

function Review() {
  const { cafeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
      if (reviewData.average_rating != null) {
        setCafe(prev => ({
          ...prev,
          user_rating: reviewData.average_rating,
          review_count: reviewData.review_count || 0
        }));
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
            戻る
          </Button>
          <div className="review-page-icons">
            <Button icon={<HomeOutlined />} className="review-icon-btn">
              カフェナビ
            </Button>
            <Button icon={<UserOutlined />} className="review-icon-btn">
              <span className="notification-dot"></span>
            </Button>
          </div>
        </div>
      </div>

      <div className="review-page-content">
        <div className="review-page-left">
          <ReviewForm cafe={cafe} onSuccess={handleReviewSuccess} />
        </div>

        <div className="review-page-right">
          {reviews.length > 0 && (
            <Card className="reviews-list-card">
              <h3>他のレビュー ({reviews.length})</h3>
              {avgRating && (
                <div className="avg-rating-display">
                  平均評価: {avgRating.toFixed(1)} ⭐
                </div>
              )}
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-item-header">
                      <span className="review-username">{review.username}</span>
                      <span className="review-rating">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="review-comment">{review.comment}</p>
                    )}
                    {review.is_child_friendly && (
                      <span className="review-tag">子育を是付</span>
                    )}
                    <div className="review-date">
                      {new Date(review.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Review;

