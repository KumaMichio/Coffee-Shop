// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import MapView from '../components/MapView';
import SearchBar from '../components/SearchBar';
import apiService from '../services/apiService';

function Home() {
  const [center, setCenter] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sort, setSort] = useState('rating');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('nearby'); // 'nearby' | 'search'

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
        setCafes(list);
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
  }, []);

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
      setCafes(list);
      if (list.length > 0) {
        setCenter({ lat: list[0].lat, lng: list[0].lng });
      }
      setMode('search');
      setSearchKeyword(trimmed);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tìm kiếm quán cà phê');
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
        radius: 2000,
        sort: s
      });

      setCafes(list);
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
      // không bắt buộc reload, nhưng có thể show toast sau này
    } catch (err) {
      console.error(err);
      setError('Không thể lưu quán yêu thích.');
    }
  };

  return (
    <>
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
                {mode === 'search' ? 'Search' : 'Nearby 2km'}
              </span>
            </div>
            <SearchBar
              onSearch={handleSearch}
              onChangeKeyword={handleKeywordChange}
              loading={loading}
              sort={sort}
              onChangeSort={handleSortChange}
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="gps-button"
                onClick={() => handleLocateMe()}
              >
                📍 Vị trí của tôi (2km)
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
                        📍 {(cafe.distance / 1000).toFixed(2)} km
                      </span>
                    )}
                    <span className="meta-pill">
                      {cafe.provider === 'google' ? 'Google' : 'Goong'}
                    </span>
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
