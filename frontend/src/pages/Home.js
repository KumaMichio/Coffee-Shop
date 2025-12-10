// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { LogoutOutlined, HeartOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import apiService from '../services/apiService';
import authService from '../services/authService';


// Configure message globally


function Home() {
  const navigate = useNavigate();
  const [center, setCenter] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sort, setSort] = useState('rating');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('nearby'); // 'nearby' | 'search'
  const [messageApi, contextHolder] = message.useMessage();
  const [filters, setFilters] = useState({
    minRating: null,
    maxDistance: null,
    isOpen: null // null = tất cả, true = đang mở, false = đã đóng
  });
  const [allCafes, setAllCafes] = useState([]); // Lưu tất cả quán trước khi filter

  const handleLogout = () => {
    authService.logout();
    message.success('Đã đăng xuất');
    navigate('/auth');
  };

  const handleGoToFavorites = () => {
    navigate('/favorites');
  };

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

  // load initial: thử lấy vị trí hiện tại → nearby 2km
  useEffect(() => {
    const init = async () => {
      try {
        setError('');
        // fallback center: Hà Nội
        let centerLat = 21.028511;
        let centerLng = 105.804817;

        if (navigator.geolocation) {
          await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const { latitude, longitude } = pos.coords;
                centerLat = latitude;
                centerLng = longitude;
                setCurrentLocation({ lat: latitude, lng: longitude });
                resolve();
              },
              () => resolve(),
              { enableHighAccuracy: true, timeout: 7000 }
            );
          });
        }

        setCenter({ lat: centerLat, lng: centerLng });
        setLoading(true);
        const list = await apiService.getNearbyCafes({
          lat: centerLat,
          lng: centerLng,
          radius: 2000,
          sort: 'distance'
        });
        
        console.log('Initial load results:', list.length, 'cafes found');
        
        if (!Array.isArray(list)) {
          console.error('Invalid response format:', list);
          setError('Dữ liệu trả về không đúng định dạng');
          setCafes([]);
          setAllCafes([]);
          return;
        }
        
        setAllCafes(list);
        // Apply filters with current filters state
        const filtered = applyFilters(list, filters);
        setCafes(filtered);
        console.log('After filter:', filtered.length, 'cafes');
        setMode('nearby');
        setSort('distance');
      } catch (err) {
        console.error(err);
        setError('Không thể tải dữ liệu ban đầu.');
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount, filters sẽ được apply sau khi load xong

  // Khi user bấm Tìm kiếm
  const handleSearch = async (keyword) => {
    const q = keyword ?? searchKeyword;
    const trimmed = q.trim();

    if (!trimmed) {
      // ô rỗng → quay lại nearby (nếu có currentLocation)
      if (currentLocation) {
        await handleLocateMe();
      }
      return;
    }

    try {
      setLoading(true);
      setError('');
      const list = await apiService.searchCafes({
        query: trimmed,
        lat: currentLocation?.lat,
        lng: currentLocation?.lng,
        sort
      });
      
      console.log('Search results:', list.length, 'cafes found');
      
      if (!Array.isArray(list)) {
        console.error('Invalid response format:', list);
        setError('Dữ liệu trả về không đúng định dạng');
        setCafes([]);
        setAllCafes([]);
        return;
      }
      
      setAllCafes(list);
      const filtered = applyFilters(list, filters);
      setCafes(filtered);
      
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
      setError(`Lỗi khi tìm kiếm quán cà phê: ${err.message}`);
      setCafes([]);
      setAllCafes([]);
    } finally {
      setLoading(false);
    }
  };

  // Khi user gõ trong ô search
  const handleKeywordChange = async (value) => {
    setSearchKeyword(value);
    if (value.trim() === '') {
      // reset: quay lại nearby (nếu có vị trí)
      if (currentLocation) {
        await handleLocateMe();
      }
    }
  };

  // Khi user đổi sort
  const handleSortChange = async (value) => {
    setSort(value);
    // re-run search/nearby với sort mới
    if (mode === 'search' && searchKeyword.trim()) {
      await handleSearch(searchKeyword);
    } else if (mode === 'nearby' && currentLocation) {
      await handleLocateMe(value);
    }
  };

  // Lấy quán gần "vị trí của tôi" trong 2km
  const handleLocateMe = async (sortOverride) => {
    if (!navigator.geolocation && !currentLocation) {
      setError('Trình duyệt của bạn không hỗ trợ GPS.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let loc = currentLocation;

      if (!loc && navigator.geolocation) {
        loc = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) =>
              resolve({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              }),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });
        setCurrentLocation(loc);
      }

      const s = sortOverride || 'distance';
      const list = await apiService.getNearbyCafes({
        lat: loc.lat,
        lng: loc.lng,
        radius: 10000,
        sort: s
      });

      console.log('Nearby results:', list.length, 'cafes found');
      console.log('Nearby results details:', list.map(c => ({ name: c.name, distance: c.distance, rating: c.rating })));

      if (!Array.isArray(list)) {
        console.error('Invalid response format:', list);
        setError('Dữ liệu trả về không đúng định dạng');
        setCafes([]);
        setAllCafes([]);
        return;
      }

      if (list.length === 0) {
        console.warn('No cafes found nearby');
        setError('Không tìm thấy quán cà phê nào gần đây');
        setCafes([]);
        setAllCafes([]);
        return;
      }

      setAllCafes(list);
      const filtered = applyFilters(list, filters);
      setCafes(filtered);
      
      console.log('After filter:', filtered.length, 'cafes');
      if (filtered.length === 0 && list.length > 0) {
        console.warn('All cafes filtered out! Filters:', filters);
        setError('Không có quán nào phù hợp với bộ lọc đã chọn. Hãy thử điều chỉnh bộ lọc.');
      }
      
      setCenter({ lat: loc.lat, lng: loc.lng });
      setMode('nearby');
      setSort(s);
    } catch (err) {
      console.error('Locate me error', err);
      setError('Không thể lấy vị trí hiện tại hoặc dữ liệu quán gần bạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCafe = (cafe) => {
    setCenter({ lat: cafe.lat, lng: cafe.lng });
  };

  // Tạo link Google Maps Directions
  const getGoogleMapsDirectionsUrl = (cafe) => {
    const destination = `${cafe.lat},${cafe.lng}`;
    const origin = currentLocation 
      ? `${currentLocation.lat},${currentLocation.lng}` 
      : '';
    
    if (origin) {
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    } else {
      return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    }
  };

  const handleOpenDirections = (e, cafe) => {
    e.stopPropagation();
    const url = getGoogleMapsDirectionsUrl(cafe);
    window.open(url, '_blank');
  };

  const handleFilterChange = (newFilters) => {
    console.log('Filter changed:', newFilters);
    console.log('All cafes before filter:', allCafes.length, allCafes.map(c => ({ name: c.name, distance: c.distance })));
    setFilters(newFilters);
    // Apply filters to all cafes
    if (allCafes.length > 0) {
      const filtered = applyFilters(allCafes, newFilters);
      console.log('Cafes after filter:', filtered.length, filtered.map(c => ({ name: c.name, distance: c.distance })));
      setCafes(filtered);
      // Update center to first filtered cafe if available
      if (filtered.length > 0 && currentLocation) {
        // Keep current center, don't change it when filtering
      }
    } else {
      console.warn('No cafes to filter! allCafes is empty');
      setCafes([]);
    }
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

  return (
    <>
      {contextHolder}
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo">CF</div>
          <div className="app-title-block">
            <div className="app-title">Coffee Finder – Hanoi</div>
            <div className="app-subtitle">
              Tìm quán cà phê quanh bạn từ Goong & Google Maps
            </div>
          </div>
        </div>
      </header>

      <main className="app-layout">
        <section className="app-sidebar">
          <div className="app-panel">
            <div className="app-panel-header">
              <span className="app-panel-title">Tìm kiếm quán cà phê</span>
              <span className="app-badge">
                {mode === 'search' ? 'Search' : 'Nearby 10km'}
              </span>
            </div>
            <SearchBar
              onSearch={handleSearch}
              onChangeKeyword={handleKeywordChange}
              loading={loading}
              sort={sort}
              onChangeSort={handleSortChange}
            />
            <div style={{ marginTop: 12 }}>
              <FilterBar filters={filters} onFilterChange={handleFilterChange} />
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="gps-button"
                onClick={() => handleLocateMe()}
              >
                📍 Vị trí của tôi (10km)
              </button>
            </div>
            {error && <p className="error-text">{error}</p>}
          </div>

          <div className="app-panel">
            <div className="app-panel-header">
              <span className="app-panel-title">Danh sách quán</span>
              <span className="app-badge">{cafes.length} địa điểm</span>
            </div>
            <ul className="cafe-list">
              {cafes.map((cafe) => (
                <li
                  key={`${cafe.provider}:${cafe.provider_place_id}`}
                  className="cafe-item"
                  onClick={() => handleSelectCafe(cafe)}
                >
                  <div className="cafe-name-row">
                    <div className="cafe-name">{cafe.name}</div>
                    <button
                      type="button"
                      className="favorite-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveFavorite(cafe);
                      }}
                    >
                      ♥
                    </button>
                  </div>
                  <div className="cafe-address">{cafe.address}</div>
                  <div className="cafe-meta-row">
                    {cafe.rating && (
                      <span className="meta-pill">⭐ {cafe.rating}</span>
                    )}
                    {cafe.user_rating_count && (
                      <span className="meta-pill">
                        👥 {cafe.user_rating_count} đánh giá
                      </span>
                    )}
                    {cafe.distance != null && (
                      <span className="meta-pill">
                        📍 {cafe.distance.toFixed(2)} km
                      </span>
                    )}
                    <span className="meta-pill">
                      {cafe.provider === 'google' ? 'Google' : 'Goong'}
                    </span>
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="directions-btn"
                      onClick={(e) => handleOpenDirections(e, cafe)}
                      title="Chỉ đường trên Google Maps"
                    >
                      <EnvironmentOutlined /> Chỉ đường
                    </button>
                  </div>
                </li>
              ))}
              {cafes.length === 0 && (
                <li className="cafe-item">
                  Không có quán nào phù hợp điều kiện tìm kiếm.
                </li>
              )}
            </ul>
          </div>
        </section>

        <section className="map-panel">
          <div className="map-header">
            <div className="map-header-left">
              <span className="map-title">Bản đồ quán cà phê</span>
              <span className="map-subtitle">
                Marker màu xanh là vị trí của bạn, marker xám là các quán.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button 
                type="primary" 
                icon={<HeartOutlined />}
                onClick={handleGoToFavorites}
              >
                Yêu thích
              </Button>
              <Button 
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </div>
          </div>
          <MapView
            center={center}
            cafes={cafes}
            currentLocation={currentLocation}
            onSelectCafe={handleSelectCafe}
          />
        </section>
      </main>
    </>
  );
}

export default Home;
