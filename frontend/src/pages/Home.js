// src/pages/Home.js
import React, { useEffect, useState, useCallback } from 'react';
import { message, Avatar } from 'antd';
import { LogoutOutlined, HeartOutlined, EnvironmentOutlined, SearchOutlined, UserOutlined, StarOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import DirectionsModal from '../components/DirectionsModal';
import PromotionNotification from '../components/PromotionNotification';
import apiService from '../services/apiService';
import authService from '../services/authService';
import profileService from '../services/profileService';
import { useTranslation } from '../hooks/useTranslation';


// Configure message globally


function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [center, setCenter] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sort, setSort] = useState('rating');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('nearby'); // 'nearby' | 'search'
  const [messageApi, contextHolder] = message.useMessage();
  const [filters, setFilters] = useState({
    minRating: null,
    maxDistance: null,
    isOpen: null // null = tất cả, true = đang mở, false = đã đóng
  });
  const [allCafes, setAllCafes] = useState([]); // Lưu tất cả quán trước khi filter
  const [shouldZoomToLocation, setShouldZoomToLocation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [showCafesOnMap, setShowCafesOnMap] = useState(true);
  const [directionsModalVisible, setDirectionsModalVisible] = useState(false);
  const [selectedCafeForDirections, setSelectedCafeForDirections] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);

  const handleLogout = () => {
    authService.logout();
    message.success(t('common.logout'));
    navigate('/auth');
  };

  const handleGoToFavorites = () => {
    navigate('/favorites');
  };

  // Load user avatar khi component mount
  useEffect(() => {
    const loadUserAvatar = async () => {
      try {
        const data = await profileService.getProfile(1, 1);
        if (data.user && data.user.avatar_url) {
          setUserAvatar(data.user.avatar_url);
        }
      } catch (err) {
        // Không hiển thị error nếu không load được avatar, chỉ log
        console.log('Could not load user avatar:', err);
      }
    };
    loadUserAvatar();
  }, []);

  // Hàm áp dụng filters
  const applyFilters = (cafes, filterOptions) => {
    let filtered = [...cafes];

    // Filter theo rating
    if (filterOptions.minRating) {
      const minRatingValue = parseFloat(filterOptions.minRating);
      filtered = filtered.filter(cafe => cafe.rating && cafe.rating >= minRatingValue);
    }

    // Filter theo khoảng cách
    if (filterOptions.maxDistance) {
      const maxDistanceValue = parseFloat(filterOptions.maxDistance);
      console.log('Filtering by max distance:', maxDistanceValue, 'km');
      const beforeCount = filtered.length;
      filtered = filtered.filter(cafe => {
        // Nếu cafe không có distance (null), chỉ loại bỏ nếu user đã set filter
        // Nhưng để user-friendly, nếu distance là null thì giữ lại (có thể là search result không có location)
        if (cafe.distance === null || cafe.distance === undefined) {
          console.log('Cafe without distance:', cafe.name);
          return false; // Loại bỏ cafes không có distance khi filter theo distance
        }
        const keep = cafe.distance <= maxDistanceValue;
        if (!keep) {
          console.log(`Cafe ${cafe.name} filtered out: distance ${cafe.distance}km > ${maxDistanceValue}km`);
        }
        return keep;
      });
      console.log(`Distance filter: ${beforeCount} -> ${filtered.length} cafes`);
    }

    // Filter theo trạng thái mở cửa
    // Lưu ý: API hiện tại chưa trả về opening_hours, nên phần này sẽ được implement sau
    // khi có dữ liệu từ Google/Goong Places API
    if (filterOptions.isOpen !== null) {
      // Tạm thời bỏ qua vì chưa có dữ liệu opening_hours
      // filtered = filtered.filter(cafe => {
      //   if (!cafe.opening_hours) return filterOptions.isOpen === false;
      //   return cafe.opening_hours.open_now === filterOptions.isOpen;
      // });
    }

    return filtered;
  };

  // Lấy quán gần "vị trí của tôi" trong 2km
  const handleLocateMe = useCallback(async (sortOverride) => {
    if (!navigator.geolocation && !currentLocation) {
      messageApi.warning('Trình duyệt của bạn không hỗ trợ GPS.');
      return;
    }

    try {
      setLoading(true);

      let loc = currentLocation;

      if (!loc && navigator.geolocation) {
        try {
          loc = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const location = {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude
                };
                console.log('GPS Location obtained:', {
                  lat: location.lat,
                  lng: location.lng,
                  accuracy: pos.coords.accuracy,
                  altitude: pos.coords.altitude,
                  altitudeAccuracy: pos.coords.altitudeAccuracy
                });
                resolve(location);
              },
              (err) => {
                console.warn('Geolocation error:', err.code, err.message);
                // Nếu timeout hoặc lỗi, fallback về Hà Nội
                const fallback = {
                  lat: 21.028511,
                  lng: 105.804817
                };
                console.log('Using fallback location:', fallback);
                resolve(fallback);
              },
              { 
                enableHighAccuracy: true, 
                timeout: 10000, 
                maximumAge: 0  // Không sử dụng cache, luôn lấy vị trí mới
              }
            );
          });
          setCurrentLocation(loc);
          console.log('Current location set:', loc);
        } catch (err) {
          console.error('Error getting location:', err);
          // Fallback về Hà Nội nếu có lỗi
          loc = { lat: 21.028511, lng: 105.804817 };
          setCurrentLocation(loc);
        }
      } else if (loc) {
        console.log('Using existing location:', loc);
      }

      // Đưa vị trí lên giữa bản đồ ngay lập tức và trigger zoom
      if (loc) {
        // Reset zoom trigger trước để có thể trigger lại
        setShouldZoomToLocation(false);
        // Tạo object mới với timestamp để force update center
        const newCenter = { lat: loc.lat, lng: loc.lng, _timestamp: Date.now() };
        setCenter(newCenter);
        // Trigger zoom to location ngay sau khi set center
        setTimeout(() => {
          setShouldZoomToLocation(true);
        }, 50);
      }

      const s = sortOverride || sort || 'distance';
      const list = await apiService.getNearbyCafes({
        lat: loc.lat,
        lng: loc.lng,
        radius: 2000,
        sort: s
      });

      console.log('Nearby results:', list.length, 'cafes found');
      console.log('Nearby results details:', list.map(c => ({ name: c.name, distance: c.distance, rating: c.rating })));

      if (!Array.isArray(list)) {
        console.error('Invalid response format:', list);
        messageApi.error('Dữ liệu trả về không đúng định dạng');
        setCafes([]);
        setAllCafes([]);
        return;
      }

      if (list.length === 0) {
        console.warn('No cafes found nearby');
        messageApi.info('Không tìm thấy quán cà phê nào gần đây');
        setCafes([]);
        setAllCafes([]);
        return;
      }

      setAllCafes(list);
      const filtered = applyFilters(list, filters);
      setCafes(filtered);
      setCurrentPage(1); // Reset to page 1 when loading new cafes
      
      console.log('After filter:', filtered.length, 'cafes');
      if (filtered.length === 0 && list.length > 0) {
        console.warn('All cafes filtered out! Filters:', filters);
        messageApi.warning('Không có quán nào phù hợp với bộ lọc đã chọn. Hãy thử điều chỉnh bộ lọc.');
      }
      
      setMode('nearby');
      setSort(s);
      
      // Reset zoom trigger after delay để có thể trigger lại lần sau
      setTimeout(() => setShouldZoomToLocation(false), 2000);
    } catch (err) {
      console.error('Locate me error', err);
      messageApi.error('Không thể lấy vị trí hiện tại hoặc dữ liệu quán gần bạn.');
    } finally {
      setLoading(false);
    }
  }, [currentLocation, sort, filters]);

  // Khi user bấm Tìm kiếm
  const handleSearch = useCallback(async (keyword) => {
    const q = keyword ?? searchKeyword;
    const trimmed = q.trim();

    if (!trimmed) {
      // ô rỗng → không làm gì, yêu cầu user nhập từ khóa
      messageApi.warning('検索キーワードを入力してください');
      return;
    }

    try {
      setLoading(true);
      const list = await apiService.searchCafes({
        query: trimmed,
        lat: currentLocation?.lat,
        lng: currentLocation?.lng,
        sort
      });
      
      console.log('Search results:', list.length, 'cafes found');
      
      if (!Array.isArray(list)) {
        console.error('Invalid response format:', list);
        messageApi.error('Dữ liệu trả về không đúng định dạng');
        setCafes([]);
        setAllCafes([]);
        return;
      }
      
      setAllCafes(list);
      const filtered = applyFilters(list, filters);
      setCafes(filtered);
      setCurrentPage(1); // Reset to page 1 when loading new cafes
      
      console.log('After filter:', filtered.length, 'cafes');
      
      if (filtered.length > 0) {
        setCenter({ lat: filtered[0].lat, lng: filtered[0].lng });
      } else if (list.length > 0) {
        // If all filtered out, still center on first result
        setCenter({ lat: list[0].lat, lng: list[0].lng });
      }
      setMode('search');
      setSearchKeyword(trimmed);
    } catch (err) {
      console.error('Search error:', err);
      messageApi.error(`Lỗi khi tìm kiếm quán cà phê: ${err.message}`);
      setCafes([]);
      setAllCafes([]);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, currentLocation, sort, filters, messageApi]);

  // Listen for review submission to refresh cafe list
  useEffect(() => {
    const handleReviewSubmitted = async (event) => {
      // Refresh cafe list khi có review mới được submit
      console.log('Review submitted, refreshing cafe list...', event.detail);
      if (mode === 'nearby' && currentLocation) {
        await handleLocateMe(sort);
        messageApi.success('Đã cập nhật rating của quán!');
      } else if (mode === 'search' && searchKeyword.trim()) {
        await handleSearch(searchKeyword);
        messageApi.success('Đã cập nhật rating của quán!');
      }
    };

    window.addEventListener('reviewSubmitted', handleReviewSubmitted);
    return () => {
      window.removeEventListener('reviewSubmitted', handleReviewSubmitted);
    };
  }, [mode, currentLocation, searchKeyword, sort, messageApi, handleLocateMe, handleSearch]);

  // Chỉ set center mặc định cho map, KHÔNG auto load cafes
  useEffect(() => {
    // Set center mặc định là Hà Nội để map có vị trí hiển thị
    // Không tự động load cafes - chỉ load khi user tương tác
    setCenter({ lat: 21.028511, lng: 105.804817 });
    
    // Không tự động lấy GPS location - chỉ lấy khi user click "Vị trí của tôi"
    // Không tự động load cafes - chỉ load khi user search hoặc click "Vị trí của tôi"
  }, []); // Chỉ chạy 1 lần khi mount

  // Khi user gõ trong ô search
  const handleKeywordChange = (value) => {
    setSearchKeyword(value);
    // Không tự động load khi xóa search keyword
    // User phải click "Vị trí của tôi" hoặc search lại
  };

  const handleSelectCafe = (cafe) => {
    setCenter({ lat: cafe.lat, lng: cafe.lng });
  };

  // Mở modal chọn ứng dụng bản đồ
  const handleOpenDirections = (e, cafe) => {
    e.stopPropagation();
    setSelectedCafeForDirections(cafe);
    setDirectionsModalVisible(true);
  };

  const handleCloseDirectionsModal = () => {
    setDirectionsModalVisible(false);
    setSelectedCafeForDirections(null);
  };

  const handleSaveFavorite = async (cafe) => {
    try {
      await apiService.saveFavoriteCafe({
        provider: cafe.provider,
        provider_place_id: cafe.provider_place_id,
        name: cafe.name,
        address: cafe.address,
        lat: cafe.lat,
        lng: cafe.lng,
        rating: cafe.rating,
        user_rating_count: cafe.user_rating_count
      });
      messageApi.success({
        content: `✅ Đã thêm "${cafe.name}" vào danh sách yêu thích`,
        duration: 5,
        style: {
          marginTop: '2vh',
          fontSize: '16px',
        },
      });
    } catch (err) {
      console.error(err);
      if (err.message === 'Not authenticated') {
        messageApi.error({
          content: '🔒 Vui lòng đăng nhập để lưu yêu thích',
          duration: 5,
          style: {
            marginTop: '20vh',
            fontSize: '16px',
          },
        });
        navigate('/auth');
      } else {
        messageApi.error({
          content: '❌ Không thể lưu quán yêu thích',
          duration: 5,
          style: {
            marginTop: '20vh',
            fontSize: '16px',
          },
        });
      }
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(cafes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCafes = cafes.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      {contextHolder}
      <header className="app-header-new">
        <div className="app-header-content">
          <div className="app-header-left-new">
            <div className="app-logo-new">
              <span className="coffee-icon">☕</span>
              <span className="app-logo-text">{t('home.title')}</span>
            </div>
            <div className="app-search-bar-new">
              <SearchOutlined className="search-icon" />
              <input
                type="text"
                className="header-search-input"
                placeholder={t('home.searchPlaceholder')}
                value={searchKeyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchKeyword);
                  }
                }}
              />
            </div>
          </div>
          <nav className="app-header-nav">
            <button 
              className="nav-link"
              onClick={() => handleLocateMe()}
            >
              {t('home.locateMe')}
            </button>
            <button 
              className="nav-link"
              onClick={handleGoToFavorites}
            >
              <HeartOutlined /> {t('home.favorites')}
            </button>
            <button 
              className="nav-link"
              onClick={() => navigate('/admin')}
              title="Admin Dashboard"
            >
              <SettingOutlined /> Admin
            </button>
            <div 
              className="nav-link nav-link-avatar"
              onClick={() => navigate('/profile')}
            >
              <Avatar 
                src={userAvatar} 
                icon={<UserOutlined />}
                size={32}
                className="header-avatar"
              />
            </div>
            <button 
              className="nav-link nav-link-logout"
              onClick={handleLogout}
            >
              <LogoutOutlined /> {t('home.logout')}
            </button>
          </nav>
        </div>
      </header>

      <main className="app-layout-new">
        <section className="app-sidebar-new">
          <div className="cafe-list-panel">
            <h2 className="cafe-list-title">{t('home.cafeList')}</h2>
            <div className="cafe-cards-container">
              {loading ? (
                <div className="cafe-empty">{t('common.loading')}</div>
              ) : currentCafes.length > 0 ? (
                currentCafes.map((cafe) => (
                  <div
                    key={`${cafe.provider}:${cafe.provider_place_id}`}
                    className="cafe-card-image"
                    onClick={() => handleSelectCafe(cafe)}
                  >
                    <div className="cafe-image-container">
                      <img 
                        src={cafe.photo_url || `https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=120&h=120&fit=crop&q=80`}
                        alt={cafe.name}
                        className="cafe-image"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=120&h=120&fit=crop&q=80';
                        }}
                      />
                    </div>
                    <div className="cafe-info-section">
                      <div className="cafe-info-header">
                        <h3 className="cafe-name-text">{cafe.name || 'カフエ名A'}</h3>
                        <button
                          type="button"
                          className="cafe-favorite-btn-image"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveFavorite(cafe);
                          }}
                          title="Thêm vào yêu thích"
                        >
                          ❤
                        </button>
                      </div>
                      <div className="cafe-rating-display">
                        {cafe.user_rating != null ? (
                          <>
                            <span className="cafe-stars">
                              {'★'.repeat(Math.floor(cafe.user_rating))}
                              {cafe.user_rating % 1 >= 0.5 ? '½' : ''}
                              {'☆'.repeat(5 - Math.ceil(cafe.user_rating))}
                            </span>
                            <span className="cafe-rating-number">{cafe.user_rating.toFixed(1)}</span>
                            {cafe.review_count > 0 && (
                              <span className="cafe-review-count">({cafe.review_count} {t('home.reviews')})</span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="cafe-stars">☆☆☆☆☆</span>
                            <span className="cafe-rating-number">N/A</span>
                          </>
                        )}
                        <span className="cafe-distance-text">
                          {cafe.distance !== null && cafe.distance !== undefined 
                            ? `${cafe.distance.toFixed(1)} km` 
                            : t('home.distanceUnknown')}
                        </span>
                      </div>
                      <p className="cafe-address-text">{cafe.address || '新昕総 倦涉万'}</p>
                      <div className="cafe-action-buttons">
                        <button
                          type="button"
                          className="cafe-directions-btn-image"
                          onClick={(e) => handleOpenDirections(e, cafe)}
                          title={t('home.directions')}
                        >
                          <EnvironmentOutlined />
                        </button>
                        <button
                          type="button"
                          className="cafe-rating-btn-image"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!cafe.id) {
                              navigate(`/review/${cafe.provider}_${cafe.provider_place_id}`, {
                                state: { cafe }
                              });
                            } else {
                              navigate(`/review/${cafe.id}`, {
                                state: { cafe }
                              });
                            }
                          }}
                          title={t('home.reviews')}
                        >
                          <StarOutlined />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : allCafes.length === 0 ? (
                <div className="cafe-empty">
                  <p>{t('home.noCafes')}</p>
                  <ul style={{ textAlign: 'left', marginTop: '12px', paddingLeft: '20px' }}>
                    <li>{t('home.noCafesHint1')}</li>
                    <li>{t('home.noCafesHint2')}</li>
                  </ul>
                </div>
              ) : (
                <div className="cafe-empty">{t('home.noFilteredCafes')}</div>
              )}
            </div>
            {totalPages > 0 && (
              <div className="cafe-pagination">
                <div className="pagination-info">
                  <span>
                    {cafes.length > 0 
                      ? `${t('home.page')} ${currentPage} ${t('home.of')} ${totalPages} (${t('home.total')} ${cafes.length} ${t('home.items')})`
                      : t('home.noCafesNearby')
                    }
                  </span>
                </div>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      {t('common.previous')}
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      className="pagination-btn"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      {t('common.next')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="map-panel-new">
          <div className="map-header-new">
            <h2 className="map-title-new">{t('home.mapDisplay')}</h2>
            <div className="map-controls">
              <label className="map-checkbox-label">
                <input
                  type="checkbox"
                  checked={showCafesOnMap}
                  onChange={(e) => setShowCafesOnMap(e.target.checked)}
                />
                <span>{t('home.showCafesOnMap')}</span>
              </label>
            </div>
          </div>
          <MapView
            center={center}
            cafes={showCafesOnMap ? cafes : []}
            currentLocation={currentLocation}
            onSelectCafe={handleSelectCafe}
            zoomToLocation={shouldZoomToLocation && currentLocation ? currentLocation : null}
          />
        </section>
      </main>

      {/* Directions Modal */}
      <DirectionsModal
        visible={directionsModalVisible}
        onCancel={handleCloseDirectionsModal}
        cafe={selectedCafeForDirections}
        currentLocation={currentLocation}
      />

      {/* Promotion Notifications */}
      <PromotionNotification
        currentLocation={currentLocation}
        onPromotionClick={(promotion) => {
          // Tìm cafe tương ứng và center vào đó
          const cafe = cafes.find(
            (c) => c.id === promotion.cafe_id ||
            (c.provider && c.provider_place_id && 
             `${c.provider}_${c.provider_place_id}` === `${promotion.cafe_id}`)
          );
          if (cafe) {
            setCenter({ lat: cafe.lat, lng: cafe.lng });
            handleSelectCafe(cafe);
          } else if (promotion.cafe_lat && promotion.cafe_lng) {
            setCenter({ lat: promotion.cafe_lat, lng: promotion.cafe_lng });
          }
        }}
      />
    </>
  );
}

export default Home;
