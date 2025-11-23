import React, { useMemo, useState } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = { lat: 21.0278, lng: 105.8342 }; // Hà Nội

function MapView({ cafes, selectedCafe, onMarkerClick, userLocation }) {
  const [mapRef, setMapRef] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // TODO: thay bằng key thật, dùng .env
  });

  const center = useMemo(() => {
    if (selectedCafe) return { lat: selectedCafe.lat, lng: selectedCafe.lng };
    if (userLocation) return userLocation;
    return defaultCenter;
  }, [selectedCafe, userLocation]);

  const handleMapLoad = (map) => {
    setMapRef(map);
  };

  // Khi chọn cafe → pan tới marker
  if (mapRef && selectedCafe) {
    mapRef.panTo({ lat: selectedCafe.lat, lng: selectedCafe.lng });
  }

  if (loadError) return <div>Lỗi load Google Maps</div>;
  if (!isLoaded) return <div>Đang tải bản đồ...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={14}
      center={center}
      onLoad={handleMapLoad}
    >
      {/* Vị trí hiện tại */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: '#4285f4',
            fillOpacity: 1,
            strokeWeight: 2,
          }}
        />
      )}

      {/* Marker quán cà phê */}
      {cafes.map((cafe) => (
        <Marker
          key={cafe.id}
          position={{ lat: cafe.lat, lng: cafe.lng }}
          onClick={() => onMarkerClick(cafe)}
        />
      ))}

      {/* Popup InfoWindow */}
      {selectedCafe && (
        <InfoWindow
          position={{ lat: selectedCafe.lat, lng: selectedCafe.lng }}
          onCloseClick={() => onMarkerClick(null)}
        >
          <div>
            <strong>{selectedCafe.name}</strong>
            <div>{selectedCafe.address}</div>
            {selectedCafe.distance != null && (
              <div>~ {selectedCafe.distance.toFixed(1)} km</div>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export default MapView;
