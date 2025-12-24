// frontend/src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Card, Spin, message, Tabs, Upload, Avatar } from 'antd';
import { 
  HomeOutlined, 
  HeartOutlined, 
  UserOutlined, 
  SettingOutlined,
  EditOutlined,
  SearchOutlined,
  CameraOutlined
} from '@ant-design/icons';
import profileService from '../services/profileService';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('reviews');

  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [currentPage]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile(currentPage, 10);
      setUser(data.user);
      setReviews(data.reviews || []);
      setTotalReviews(data.total_reviews || 0);
      setUsername(data.user.username);
      setEmail(data.user.email);
      setAvatarUrl(data.user.avatar_url);
    } catch (err) {
      console.error('Load profile error:', err);
      message.error(err.message || 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async () => {
    try {
      await profileService.updateProfile({ username, email });
      message.success('Cập nhật profile thành công');
      setEditing(false);
      loadProfile();
    } catch (err) {
      message.error(err.message || 'Không thể cập nhật profile');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      message.error('Mật khẩu mới và xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      message.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await profileService.changePassword(currentPassword, newPassword);
      message.success('Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      message.error(err.message || 'Không thể đổi mật khẩu');
    }
  };

  const handleAvatarChange = async (info) => {
    const file = info.file;
    
    // Validate file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ có thể upload file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image is too big');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setUploading(true);
        const base64 = e.target.result;
        const result = await profileService.uploadAvatar(base64);
        setAvatarUrl(result.user.avatar_url);
        message.success('Cập nhật avatar thành công');
      } catch (err) {
        // Xử lý lỗi 413 (Payload Too Large)
        if (err.message && err.message.includes('413')) {
          message.error('Image is too big');
        } else {
          message.error(err.message || 'Không thể upload avatar');
        }
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      message.error('Lỗi khi đọc file');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Map language code to locale
    const localeMap = {
      'ja': 'ja-JP',
      'vi': 'vi-VN',
      'en': 'en-US'
    };
    const locale = localeMap[language] || 'ja-JP';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-page-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header Navigation */}
      <header className="profile-header">
        <div className="profile-header-content">
          <div className="profile-header-left">
            <div className="profile-logo">
              <span className="coffee-icon">☕</span>
              <span className="profile-logo-text">{t('home.title')}</span>
            </div>
            <div className="profile-search-bar">
              <SearchOutlined className="search-icon" />
              <input
                type="text"
                className="header-search-input"
                placeholder={t('home.searchPlaceholder')}
              />
              <button className="search-btn">오</button>
            </div>
          </div>
          <nav className="profile-header-nav">
            <button className="nav-link" onClick={() => navigate('/')}>
              <HomeOutlined /> {t('common.home')}
            </button>
            <button className="nav-link" onClick={() => navigate('/favorites')}>
              <HeartOutlined /> {t('common.favorites')}
            </button>
            <button className="nav-link active">
              <UserOutlined /> {t('common.profile')}
            </button>
            <button className="nav-link">
              <SettingOutlined />
            </button>
          </nav>
        </div>
      </header>

      <div className="profile-content">
        {/* Left Section - Profile Info */}
        <div className="profile-left">
          <Card className="profile-card">
            <h2 className="profile-title">{t('profile.title')}</h2>
            
            <div className="profile-avatar-section">
              <Upload
                name="avatar"
                showUploadList={false}
                beforeUpload={() => false} // Prevent auto upload
                onChange={handleAvatarChange}
                accept="image/*"
                disabled={uploading || !editing}
              >
                <div className="profile-avatar-wrapper">
                  {avatarUrl ? (
                    <Avatar
                      src={avatarUrl}
                      size={120}
                      className="profile-avatar-image"
                      icon={<UserOutlined />}
                    />
                  ) : (
                    <div className="profile-avatar">
                      <UserOutlined style={{ fontSize: 48, color: '#9ca3af' }} />
                    </div>
                  )}
                  {editing && (
                    <div className="profile-avatar-overlay">
                      <CameraOutlined style={{ fontSize: 24, color: '#fff' }} />
                    </div>
                  )}
                </div>
              </Upload>
              {editing && (
                <p className="profile-avatar-hint">{t('profile.avatarHint')}</p>
              )}
            </div>

            <div className="profile-form">
              <div className="profile-form-group">
                <label className="profile-label">{t('profile.username')}</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!editing}
                  className="profile-input"
                />
              </div>

              {editing && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEditProfile}
                  className="profile-edit-btn"
                >
                  {t('profile.editProfile')}
                </Button>
              )}

              {!editing && (
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() => setEditing(true)}
                  className="profile-edit-btn"
                >
                  {t('profile.editProfile')}
                </Button>
              )}

              <div className="profile-form-group">
                <label className="profile-label">{t('profile.email')}:</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editing}
                  className="profile-input"
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-label">{t('common.password')}:</label>
                <Input.Password
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled
                  className="profile-input"
                  placeholder="••••••••"
                />
              </div>

              {editing && (
                <div className="profile-password-section">
                  <div className="profile-form-group">
                    <label className="profile-label">{t('profile.currentPassword')}:</label>
                    <Input.Password
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="profile-input"
                      placeholder={t('profile.passwordPlaceholder')}
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">{t('profile.newPassword')}:</label>
                    <Input.Password
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="profile-input"
                      placeholder={t('profile.passwordPlaceholder')}
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">{t('profile.confirmPassword')}:</label>
                    <Input.Password
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="profile-input"
                      placeholder={t('profile.confirmPasswordPlaceholder')}
                    />
                  </div>
                  <Button
                    type="default"
                    onClick={handleChangePassword}
                    className="profile-change-password-btn"
                  >
                    {t('profile.changePasswordButton')}
                  </Button>
                </div>
              )}

              <div className="profile-form-group">
                <label className="profile-label">{t('profile.joinDate')}:</label>
                <Input
                  value={formatDate(user?.created_at)}
                  disabled
                  className="profile-input"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Section - Contribution History */}
        <div className="profile-right">
          <Card className="contribution-card">
            <h2 className="contribution-title">{t('profile.contributionHistory')}</h2>
            
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              items={[
                {
                  key: 'reviews',
                  label: `${t('profile.myReviews')} (${totalReviews})`,
                  children: (
                    <>
                      <div className="reviews-list">
                        {reviews.length > 0 ? (
                          reviews.map((review) => (
                            <div key={review.id} className="review-item">
                              <div className="review-thumbnail">
                                <span className="review-thumbnail-icon">☕</span>
                              </div>
                              <div className="review-content">
                                <h3 className="review-cafe-name">{review.cafe_name || t('common.cafes')}</h3>
                                <div className="review-rating">
                                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                                {review.comment && (
                                  <p className="review-text">{review.comment}</p>
                                )}
                                {review.cafe_address && (
                                  <p className="review-address">📍 {review.cafe_address}</p>
                                )}
                                <div className="review-date">
                                  {formatDate(review.created_at)}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="empty-reviews">{t('profile.noReviews')}</div>
                        )}
                      </div>

                      {totalReviews > 10 && (
                        <div className="pagination">
                          <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            {t('profile.previous')}
                          </button>
                          {Array.from({ length: Math.ceil(totalReviews / 10) }, (_, i) => i + 1)
                            .slice(0, 3)
                            .map((page) => (
                              <button
                                key={page}
                                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </button>
                            ))}
                          <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage >= Math.ceil(totalReviews / 10)}
                          >
                            {t('profile.next')}
                          </button>
                        </div>
                      )}
                    </>
                  )
                },
                {
                  key: 'photos',
                  label: t('profile.photos'),
                  children: (
                    <div className="photos-list">
                      <div className="empty-photos">{t('profile.noPhotos')}</div>
                    </div>
                  )
                },
                {
                  key: 'settings',
                  label: t('common.settings'),
                  children: (
                    <div className="settings-list">
                      <LanguageSelector />
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Profile;

