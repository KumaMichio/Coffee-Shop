// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import MapView from '../components/MapView';
import SearchBar from '../components/SearchBar';
import apiService from '../services/apiService';

function Home() {
  const [center, setCenter] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');      // NEW
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState('');

  // load dữ liệu ban đầu
  useEffect(() => {
    const loadInitial = async () => {
      try {
        setError('');
        const [loc, list] = await Promise.all([
          apiService.getCurrentLocation(),
          apiService.getCafes()
        ]);
        setCenter({ lat: loc.lat, lng: loc.lng });
        setCafes(list);
      } catch (err) {
        console.error(err);
        setError('Không thể tải dữ liệu ban đầu');
      }
    };
    loadInitial();
  }, []);

  // 🔍 Xử lý khi user bấm nút Tìm kiếm
  const handleSearch = async (keywordFromInput) => {
    const keyword = (keywordFromInput ?? searchKeyword).trim();

    // Nếu ô tìm kiếm trống → reset danh sách quán
    if (!keyword) {
      try {
        setLoadingSearch(true);
        setError('');
        const list = await apiService.getCafes();
        setCafes(list);
        // không đổi center, giữ nguyên map đang xem
      } catch (err) {
        console.error(err);
        setError('Không thể tải lại danh sách quán cà phê');
      } finally {
        setLoadingSearch(false);
      }
      return;
    }

    // Normal search
    try {
      setLoadingSearch(true);
      setError('');
      const result = await apiService.searchCafes(keyword);
      setCafes(result);
      if (result.length > 0) {
        setCenter({ lat: result[0].lat, lng: result[0].lng });
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tìm kiếm quán cà phê');
    } finally {
      setLoadingSearch(false);
    }
  };

  // 📝 Ghi nhận từ khóa mỗi khi user gõ, và nếu xoá hết → tự reset danh sách
  const handleKeywordChange = async (value) => {
    setSearchKeyword(value);

    if (value.trim() === '') {
      // ô tìm kiếm vừa bị xóa hết → load lại list
      try {
        setError('');
        const list = await apiService.getCafes();
        setCafes(list);
      } catch (err) {
        console.error(err);
        setError('Không thể tải lại danh sách quán cà phê');
      }
    }
  };

  const handleSelectCafe = (cafe) => {
    setCenter({ lat: cafe.lat, lng: cafe.lng });
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError('Trình duyệt của bạn không hỗ trợ chức năng GPS.');
      return;
    }
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = { lat: latitude, lng: longitude };
        setCurrentLocation(loc);
        setCenter(loc);
      },
      (err) => {
        console.error('Geolocation error:', err);
        let message = 'Không thể lấy vị trí hiện tại.';
        if (err.code === err.PERMISSION_DENIED) {
          message = 'Bạn đã từ chối quyền truy cập vị trí (GPS).';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = 'Thông tin vị trí hiện không khả dụng.';
        } else if (err.code === err.TIMEOUT) {
          message = 'Hết thời gian chờ khi lấy vị trí.';
        }
        setError(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <>
      {/* header + layout giống bản trước của mình */}
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo">CF</div>
          <div className="app-title-block">
            <div className="app-title">Coffee Finder – Hanoi</div>
            <div className="app-subtitle">
              Tìm quán cà phê quanh bạn & xem trên bản đồ Goong
            </div>
          </div>
        </div>
      </header>

      <main className="app-layout">
        <section className="app-sidebar">
          <div className="app-panel">
            <div className="app-panel-header">
              <span className="app-panel-title">Tìm kiếm quán cà phê</span>
              <span className="app-badge">Search</span>
            </div>
            <SearchBar
              onSearch={handleSearch}
              onChangeKeyword={handleKeywordChange}   // NEW
              loading={loadingSearch}
            />
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="gps-button"
                onClick={handleLocateMe}
              >
                📍 Vị trí của tôi
              </button>
            </div>
            {error && <p className="error-text">{error}</p>}
          </div>

          {/* danh sách quán giữ nguyên như trước */}
          <div className="app-panel">
            <div className="app-panel-header">
              <span className="app-panel-title">Danh sách quán</span>
              <span className="app-badge">{cafes.length} địa điểm</span>
            </div>
            <ul className="cafe-list">
              {cafes.map((cafe) => (
                <li
                  key={cafe.id}
                  className="cafe-item"
                  onClick={() => handleSelectCafe(cafe)}
                >
                  <div className="cafe-name-row">
                    <div className="cafe-name">{cafe.name}</div>
                  </div>
                  <div className="cafe-address">{cafe.address}</div>
                  <div className="cafe-meta-row">
                    {cafe.rating && (
                      <span className="meta-pill">⭐ {cafe.rating}</span>
                    )}
                    {cafe.open_time && cafe.close_time && (
                      <span className="meta-pill">
                        ⏰ {cafe.open_time}–{cafe.close_time}
                      </span>
                    )}
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
                Nhấp vào quán trong danh sách hoặc dùng “Vị trí của tôi”
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
