import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import CafeList from './components/CafeList';
import MapView from './components/MapView';
import useGeolocation from './hooks/useGeolocation';
import { searchCafes } from './api/cafeApi';
import MapViewGoong from './components/MapViewGoong';
function App() {
  const [cafes, setCafes] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const defaultCenter = { lat: 21.0278, lng: 105.8342 };
  const { position: userLocation, loading: gpsLoading, error: gpsError } =
    useGeolocation();

  // 1. Tìm kiếm → call BE
  const handleSearch = async ({ keyword, radiusKm }) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        keyword,
        radiusKm,
      };

      // nếu có GPS → gửi lên để filter khoảng cách
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }

      const res = await searchCafes(params);
      setCafes(res.data || []);
      setSelectedCafe(null);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  // 2. Click list → focus marker
  const handleSelectCafe = (cafe) => {
    setSelectedCafe(cafe);
  };

  // 3. Click marker → popup
  const handleMarkerClick = (cafeOrNull) => {
    setSelectedCafe(cafeOrNull);
  };

  // markers = [{lat, lng, name, ...}, ...] từ Place Detail hoặc DB
  const [markers, setMarkers] = useState([]);


  return (
    <div style={{ padding: 16, display: 'flex', gap: 16 }}>
      <div style={{ flex: 1, maxWidth: 360 }}>
        <h1>Tìm quán cà phê</h1>

        <SearchBar onSearch={handleSearch} />

        {gpsLoading && <div>Đang lấy vị trí hiện tại...</div>}
        {gpsError && (
          <div style={{ color: 'red' }}>
            Không lấy được vị trí: {gpsError}
          </div>
        )}

        {loading && <div>Đang tìm kiếm...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}

        <CafeList
          cafes={cafes}
          selectedId={selectedCafe?.id}
          onSelect={handleSelectCafe}
        />
      </div>
      <div>
        {/* ...Search, List... */}
        <MapViewGoong center={defaultCenter} markers={markers} />
      </div>
      <div style={{ flex: 2 }}>
        <MapView
          cafes={cafes}
          selectedCafe={selectedCafe}
          onMarkerClick={handleMarkerClick}
          userLocation={userLocation}
        />
      </div>
    </div>
  );
}

export default App;
