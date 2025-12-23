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
  const { t } = useTranslation();
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
    return date.toLocaleDateString('ja-JP', {
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
              <span className="profile-logo-text">カフェナブ</span>
            </div>
            <div className="profile-search-bar">
              <SearchOutlined className="search-icon" />
              <input
                type="text"
                className="header-search-input"
                placeholder="Each"
              />
              <button className="search-btn">오</button>
            </div>
          </div>
          <nav className="profile-header-nav">
            <button className="nav-link" onClick={() => navigate('/')}>
              <HomeOutlined /> ホーム
            </button>
            <button className="nav-link" onClick={() => navigate('/favorites')}>
              <HeartOutlined /> お外れり
            </button>
            <button className="nav-link active">
              <UserOutlined /> プロモール
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
            <h2 className="profile-title">プロモール</h2>
            
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
                <p className="profile-avatar-hint">クリックしてアバターを変更 (最大5MB)</p>
              )}
            </div>

            <div className="profile-form">
              <div className="profile-form-group">
                <label className="profile-label">ゲーボー各</label>
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
                  プロモールを編集
                </Button>
              )}

              {!editing && (
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() => setEditing(true)}
                  className="profile-edit-btn"
                >
                  プロモールを編集
                </Button>
              )}

              <div className="profile-form-group">
                <label className="profile-label">メールアリレス:</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editing}
                  className="profile-input"
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-label">パツサース:</label>
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
                    <label className="profile-label">現在のパスワード:</label>
                    <Input.Password
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="profile-input"
                      placeholder="現在のパスワードを入力"
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">新しいパスワード:</label>
                    <Input.Password
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="profile-input"
                      placeholder="新しいパスワードを入力"
                    />
                  </div>
                  <div className="profile-form-group">
                    <label className="profile-label">パスワード確認:</label>
                    <Input.Password
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="profile-input"
                      placeholder="パスワードを再入力"
                    />
                  </div>
                  <Button
                    type="default"
                    onClick={handleChangePassword}
                    className="profile-change-password-btn"
                  >
                    パスワードを変更
                  </Button>
                </div>
              )}

              <div className="profile-form-group">
                <label className="profile-label">咒紹日:</label>
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
            <h2 className="contribution-title">奇谱质层</h2>
            
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              items={[
                {
                  key: 'reviews',
                  label: `レビュー (${totalReviews})`,
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
                                <h3 className="review-cafe-name">{review.cafe_name || 'カフェ名'}</h3>
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
                          <div className="empty-reviews">レビューがありません</div>
                        )}
                      </div>

                      {totalReviews > 10 && (
                        <div className="pagination">
                          <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            前っ
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
                            次へ
                          </button>
                        </div>
                      )}
                    </>
                  )
                },
                {
                  key: 'photos',
                  label: '手真',
                  children: (
                    <div className="photos-list">
                      <div className="empty-photos">写真がありません</div>
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

